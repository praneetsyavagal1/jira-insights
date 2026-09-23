import type {
  AgentInsight,
  EpicEvidence,
  FlowVelocityEvidence,
  GeneratedInsights,
  IssueEvidence,
  ScenarioValidation,
  SprintVelocity,
  VelocityChange,
} from "@/lib/types";

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === "object" && "value" in value) {
    return toNumber((value as { value: unknown }).value);
  }
  return null;
}

export function normalizeDisplayValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim() || null;
  }
  if (Array.isArray(value)) {
    const values = value
      .map(normalizeDisplayValue)
      .filter((item): item is string => Boolean(item));
    return values.length ? values.join(", ") : null;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["value", "name", "displayName", "key"]) {
      const normalized = normalizeDisplayValue(record[key]);
      if (normalized) return normalized;
    }
  }
  return null;
}

function extractSprintName(value: unknown): string | null {
  if (typeof value === "string") {
    const greenHopperName = value.match(/(?:^|,)name=([^,\]]+)/i)?.[1];
    return (greenHopperName ?? value).trim() || null;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return normalizeDisplayValue(record.name ?? record.value);
  }
  return null;
}

export function extractSprintNames(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(
    new Set(
      values
        .map(extractSprintName)
        .filter((name): name is string => Boolean(name)),
    ),
  );
}

export function computeVelocityChange(
  baselinePoints: number,
  comparisonPoints: number,
): VelocityChange {
  const points = comparisonPoints - baselinePoints;
  const percentage =
    baselinePoints === 0
      ? null
      : Math.round((points / baselinePoints) * 1000) / 10;
  return { points, percentage };
}

export function validateScenario(
  baseline: SprintVelocity | null,
  comparison: SprintVelocity | null,
): ScenarioValidation | null {
  if (!baseline || !comparison) return null;
  const change = computeVelocityChange(
    baseline.completedStoryPoints,
    comparison.completedStoryPoints,
  );
  return {
    expectedBaselinePoints: 40,
    expectedComparisonPoints: 56,
    expectedPercentageChange: 40,
    matchesExpected:
      baseline.completedStoryPoints === 40 &&
      comparison.completedStoryPoints === 56 &&
      change.percentage === 40,
  };
}

export function buildEpicEvidence(
  issues: IssueEvidence[],
): EpicEvidence[] {
  return issues
    .filter((issue) => issue.issueType.toLowerCase() === "epic")
    .map((epic) => {
      const children = issues.filter((issue) => issue.epicKey === epic.key);
      const completed = children.filter(
        (issue) => issue.statusCategory.toLowerCase() === "done",
      );
      return {
        key: epic.key,
        summary: epic.summary,
        status: epic.status,
        statusCategory: epic.statusCategory,
        priority: epic.priority,
        storyPoints: epic.storyPoints,
        childCount: children.length,
        completedChildCount: completed.length,
        childStoryPoints: sumStoryPoints(children),
        completedChildStoryPoints: sumStoryPoints(completed),
        aiAssistedChildCount: children.filter((issue) => isAiAssisted(issue.aiTool))
          .length,
        openCriticalChildren: children
          .filter(
            (issue) =>
              issue.statusCategory.toLowerCase() !== "done" &&
              issue.priority?.toLowerCase() === "critical",
          )
          .map((issue) => issue.key),
        children,
        url: epic.url,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
}

export function sumStoryPoints(issues: IssueEvidence[]): number {
  return issues.reduce((sum, issue) => sum + (issue.storyPoints ?? 0), 0);
}

export function isAiAssisted(aiTool: string | null): boolean {
  if (!aiTool) return false;
  return !/^(none|n\/a|not used|no)$/i.test(aiTool.trim());
}

function formatPercentage(value: number | null): string {
  return value === null ? "not calculable" : `${value}%`;
}

function insight(
  id: string,
  values: Omit<AgentInsight, "id">,
): AgentInsight {
  return { id, ...values };
}

export function buildDeterministicInsights(
  evidence: FlowVelocityEvidence,
): GeneratedInsights {
  const insights: AgentInsight[] = [];
  const { baseline, comparison, change } = evidence;

  if (baseline && comparison && change) {
    const direction = change.points >= 0 ? "increased" : "decreased";
    insights.push(
      insight("velocity-change", {
        title: `Velocity ${direction} ${formatPercentage(Math.abs(change.percentage ?? 0))}`,
        finding: `${comparison.name} completed ${comparison.completedStoryPoints} story points versus ${baseline.completedStoryPoints} in ${baseline.name}, a ${Math.abs(change.points)}-point ${direction === "increased" ? "gain" : "decline"}.`,
        evidence: [
          `${baseline.name}: ${baseline.completedStoryPoints} completed points`,
          `${comparison.name}: ${comparison.completedStoryPoints} completed points`,
        ],
        significance:
          direction === "increased"
            ? "The team demonstrated higher delivery capacity than the established baseline."
            : "The team delivered less scope than the baseline and should review capacity, scope, and blockers.",
        confidence:
          baseline.source === "sprint-report" && comparison.source === "sprint-report"
            ? "high"
            : "medium",
        tone: direction === "increased" ? "positive" : "risk",
        caveat:
          "Two sprint observations do not establish a sustained trend or identify a single cause.",
        issueKeys: [],
      }),
    );
  }

  if (comparison && evidence.aiAssistedIssues.length) {
    const keys = evidence.aiAssistedIssues.map((issue) => issue.key);
    const share =
      comparison.completedStoryPoints > 0
        ? Math.round(
            (evidence.aiAssistedStoryPoints /
              comparison.completedStoryPoints) *
              1000,
          ) / 10
        : null;
    insights.push(
      insight("ai-assisted-delivery", {
        title: "AI-assisted work contributed to the comparison sprint",
        finding: `${keys.join(" and ")} were completed with an AI Tool value. Their known estimates total ${evidence.aiAssistedStoryPoints} story points${share === null ? "" : `, or ${share}% of ${comparison.name}'s completed points`}.`,
        evidence: evidence.aiAssistedIssues.map(
          (issue) =>
            `${issue.key}: ${issue.aiTool ?? "AI tool recorded"}${issue.storyPoints === null ? "" : `, ${issue.storyPoints} points`}`,
        ),
        significance:
          "This identifies where AI-assisted work appears in delivered scope and provides a basis for comparable-story analysis.",
        confidence: evidence.aiAssistedIssues.every(
          (issue) => issue.storyPoints !== null,
        )
          ? "high"
          : "medium",
        tone: "observation",
        caveat:
          "AI Tool usage is associated evidence; it does not prove that AI caused the sprint-level velocity change.",
        issueKeys: keys,
      }),
    );
  }

  const usefulComparisons = evidence.comparablePairs.filter(
    (pair) => pair.baseline && pair.assisted,
  );
  if (usefulComparisons.length) {
    insights.push(
      insight("comparable-work", {
        title: "Comparable stories provide a stronger productivity signal",
        finding: usefulComparisons
          .map((pair) => {
            const changeText =
              pair.cycleTimeChangePercent === null
                ? "cycle time is incomplete"
                : `cycle time changed by ${pair.cycleTimeChangePercent}%`;
            return `${pair.assisted?.key} versus ${pair.baseline?.key}: ${changeText}`;
          })
          .join("; "),
        evidence: usefulComparisons.flatMap((pair) => [
          `${pair.baseline?.key}: ${pair.baseline?.storyPoints ?? "unknown"} points, ${pair.baseline?.cycleTimeDays ?? "unknown"} days`,
          `${pair.assisted?.key}: ${pair.assisted?.storyPoints ?? "unknown"} points, ${pair.assisted?.cycleTimeDays ?? "unknown"} days`,
        ]),
        significance:
          "Like-for-like comparisons reduce the risk of attributing a sprint-level change to differences in story size or work type.",
        confidence: usefulComparisons.every(
          (pair) => pair.cycleTimeChangePercent !== null,
        )
          ? "medium"
          : "low",
        tone: "observation",
        caveat:
          "Similarity in story titles does not guarantee equal technical complexity.",
        issueKeys: usefulComparisons.flatMap((pair) => [
          pair.baseline?.key ?? "",
          pair.assisted?.key ?? "",
        ]).filter(Boolean),
      }),
    );
  }

  const criticalEpicRisks = evidence.epics.flatMap((epic) =>
    epic.openCriticalChildren.map((key) => ({ epic, key })),
  );
  if (criticalEpicRisks.length) {
    insights.push(
      insight("epic-risk", {
        title: "Open critical work threatens active Epic outcomes",
        finding: criticalEpicRisks
          .map(({ epic, key }) => `${key} is an open critical item under ${epic.key}`)
          .join("; "),
        evidence: criticalEpicRisks.map(
          ({ epic, key }) => `${epic.key} — ${epic.summary}: ${key}`,
        ),
        significance:
          "Critical child work can prevent an Epic from delivering its intended business outcome even when other stories are complete.",
        confidence: "high",
        tone: "risk",
        caveat: null,
        issueKeys: criticalEpicRisks.map(({ key }) => key),
      }),
    );
  }

  if (!insights.length) {
    insights.push(
      insight("insufficient-data", {
        title: "More Jira evidence is needed",
        finding:
          "The required sprint, estimate, or Epic relationship data was not available for a grounded Flow Velocity conclusion.",
        evidence: evidence.warnings,
        significance:
          "Adding the missing structured fields will allow the agent to calculate and explain delivery signals.",
        confidence: "high",
        tone: "observation",
        caveat: null,
        issueKeys: [],
      }),
    );
  }

  const headline =
    baseline && comparison && change
      ? `${comparison.name} delivered ${formatPercentage(change.percentage)} ${change.points >= 0 ? "above" : "below"} the ${baseline.name} baseline`
      : "Flow Velocity evidence is incomplete";

  return {
    source: "deterministic",
    model: null,
    headline,
    summary: `${insights.length} grounded insight${insights.length === 1 ? "" : "s"} generated from live Jira evidence across ${evidence.epics.length} Epic${evidence.epics.length === 1 ? "" : "s"}.`,
    insights,
  };
}
