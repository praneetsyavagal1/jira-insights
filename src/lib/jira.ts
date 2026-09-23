import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  buildEpicEvidence,
  computeVelocityChange,
  extractSprintNames,
  isAiAssisted,
  normalizeDisplayValue,
  sumStoryPoints,
  toNumber,
  validateScenario,
} from "@/lib/flow-velocity";
import type {
  FlowVelocityEvidence,
  IssueComparison,
  IssueEvidence,
  SprintVelocity,
} from "@/lib/types";

interface JiraConfig {
  baseUrl: string;
  projectKey: string;
  boardId: number;
  token: string;
}

interface JiraField {
  id: string;
  name: string;
}

interface FieldIds {
  storyPoints: string | null;
  aiTool: string | null;
  sprint: string | null;
  epicLink: string | null;
  parentLink: string | null;
}

interface JiraIssueRaw {
  key: string;
  fields: Record<string, unknown> & {
    summary?: string;
    issuetype?: { name?: string };
    status?: { name?: string; statusCategory?: { name?: string } };
    priority?: { name?: string } | null;
    created?: string;
    resolutiondate?: string | null;
  };
  changelog?: {
    histories?: Array<{
      created?: string;
      items?: Array<{
        field?: string;
        toString?: string;
      }>;
    }>;
  };
}

interface SearchResponse {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssueRaw[];
}

interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
}

interface SprintResponse {
  startAt: number;
  maxResults: number;
  total: number;
  isLast?: boolean;
  values: JiraSprint[];
}

interface SprintReport {
  contents?: {
    completedIssues?: Array<{ key?: string }>;
    completedIssuesEstimateSum?: { value?: number | string };
  };
}

const BASELINE_SPRINT = "Sprint 1";
const COMPARISON_SPRINT = "Sprint 7";
const COMPARABLE_KEYS = [
  ["DASH-5", "DASH-8"],
  ["DASH-4", "DASH-14"],
] as const;

async function getConfig(): Promise<JiraConfig> {
  const baseUrl = (
    process.env.JIRA_BASE_URL ??
    "https://proactionnppoc.ent.cgi.com/jira"
  ).replace(/\/$/, "");
  const projectKey = process.env.JIRA_PROJECT_KEY ?? "DASH";
  const boardId = Number(process.env.JIRA_BOARD_ID ?? "4174");

  let token = process.env.JIRA_PAT?.trim() ?? "";
  if (!token) {
    try {
      token = (
        await readFile(path.join(process.cwd(), "access-token.txt"), "utf8")
      ).trim();
    } catch {
      // The explicit error below is clearer than the filesystem error.
    }
  }

  if (!token) {
    throw new Error(
      "Jira credentials are missing. Set JIRA_PAT or add access-token.txt.",
    );
  }
  if (!Number.isFinite(boardId)) {
    throw new Error("JIRA_BOARD_ID must be numeric.");
  }

  return { baseUrl, projectKey, boardId, token };
}

async function jiraGet<T>(
  config: JiraConfig,
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(`${config.baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(
      `Jira request failed (${response.status}) for ${endpoint}.`,
    );
  }
  return (await response.json()) as T;
}

function resolveFieldIds(fields: JiraField[]): FieldIds {
  const byName = new Map(
    fields.map((field) => [field.name.trim().toLowerCase(), field.id]),
  );
  const find = (...names: string[]) => {
    for (const name of names) {
      const id = byName.get(name.toLowerCase());
      if (id) return id;
    }
    return null;
  };
  return {
    storyPoints: find("Story Points", "Story point estimate"),
    aiTool: find("AI Tool"),
    sprint: find("Sprint"),
    epicLink: find("Epic Link"),
    parentLink: find("Parent Link"),
  };
}

function requestedFields(fieldIds: FieldIds): string[] {
  return [
    "summary",
    "issuetype",
    "status",
    "priority",
    "created",
    "resolutiondate",
    ...Object.values(fieldIds).filter((id): id is string => Boolean(id)),
  ];
}

async function fetchAllIssues(
  config: JiraConfig,
  fieldIds: FieldIds,
): Promise<JiraIssueRaw[]> {
  const issues: JiraIssueRaw[] = [];
  let startAt = 0;
  let total = Number.POSITIVE_INFINITY;

  while (startAt < total) {
    const page = await jiraGet<SearchResponse>(config, "/rest/api/2/search", {
      jql: `project = ${config.projectKey} ORDER BY key ASC`,
      startAt,
      maxResults: 100,
      fields: requestedFields(fieldIds).join(","),
    });
    issues.push(...page.issues);
    total = page.total;
    if (!page.issues.length) break;
    startAt += page.issues.length;
  }
  return issues;
}

async function fetchClosedSprints(config: JiraConfig): Promise<JiraSprint[]> {
  const sprints: JiraSprint[] = [];
  let startAt = 0;
  let total = Number.POSITIVE_INFINITY;

  while (startAt < total) {
    const page = await jiraGet<SprintResponse>(
      config,
      `/rest/agile/1.0/board/${config.boardId}/sprint`,
      { state: "closed", startAt, maxResults: 50 },
    );
    sprints.push(...page.values);
    total = page.total;
    if (page.isLast || !page.values.length) break;
    startAt += page.values.length;
  }
  return sprints;
}

function customValue(issue: JiraIssueRaw, fieldId: string | null): unknown {
  return fieldId ? issue.fields[fieldId] : null;
}

function normalizeEpicKey(value: unknown): string | null {
  const normalized = normalizeDisplayValue(value);
  if (!normalized) return null;
  const match = normalized.match(/[A-Z][A-Z0-9_]+-\d+/i);
  return match?.[0]?.toUpperCase() ?? normalized;
}

function calculateCycleTimeDays(issue: JiraIssueRaw): number | null {
  const histories = issue.changelog?.histories ?? [];
  const statusTransitions = histories
    .flatMap((history) =>
      (history.items ?? [])
        .filter((item) => item.field?.toLowerCase() === "status")
        .map((item) => ({ created: history.created, to: item.toString ?? "" })),
    )
    .filter((item) => Boolean(item.created))
    .sort((a, b) => String(a.created).localeCompare(String(b.created)));

  const started = statusTransitions.find((item) =>
    /in progress|development|doing|active|build|implement/i.test(item.to),
  )?.created;
  const completed =
    statusTransitions.find((item) =>
      /done|closed|resolved|complete/i.test(item.to),
    )?.created ?? issue.fields.resolutiondate;

  if (!started || !completed) return null;
  const milliseconds = new Date(completed).getTime() - new Date(started).getTime();
  return milliseconds >= 0
    ? Math.round((milliseconds / 86_400_000) * 10) / 10
    : null;
}

function normalizeIssue(
  config: JiraConfig,
  issue: JiraIssueRaw,
  fieldIds: FieldIds,
): IssueEvidence {
  return {
    key: issue.key,
    summary: issue.fields.summary ?? "Untitled issue",
    issueType: issue.fields.issuetype?.name ?? "Unknown",
    status: issue.fields.status?.name ?? "Unknown",
    statusCategory: issue.fields.status?.statusCategory?.name ?? "Unknown",
    priority: issue.fields.priority?.name ?? null,
    storyPoints: toNumber(customValue(issue, fieldIds.storyPoints)),
    aiTool: normalizeDisplayValue(customValue(issue, fieldIds.aiTool)),
    sprintNames: extractSprintNames(customValue(issue, fieldIds.sprint)),
    epicKey: normalizeEpicKey(
      customValue(issue, fieldIds.epicLink) ??
        customValue(issue, fieldIds.parentLink),
    ),
    created: issue.fields.created ?? null,
    resolutionDate: issue.fields.resolutiondate ?? null,
    cycleTimeDays: calculateCycleTimeDays(issue),
    url: `${config.baseUrl}/browse/${issue.key}`,
  };
}

async function fetchSprintVelocity(
  config: JiraConfig,
  sprint: JiraSprint,
  issues: IssueEvidence[],
): Promise<SprintVelocity> {
  const reportUrl = `${config.baseUrl}/secure/RapidBoard.jspa?rapidView=${config.boardId}&view=reporting&chart=sprintRetrospective&sprint=${sprint.id}`;
  try {
    const report = await jiraGet<SprintReport>(
      config,
      "/rest/greenhopper/1.0/rapid/charts/sprintreport",
      { rapidViewId: config.boardId, sprintId: sprint.id },
    );
    const completedStoryPoints =
      toNumber(report.contents?.completedIssuesEstimateSum?.value) ?? 0;
    const completedIssueKeys = (report.contents?.completedIssues ?? [])
      .map((issue) => issue.key)
      .filter((key): key is string => Boolean(key));
    return {
      id: sprint.id,
      name: sprint.name,
      state: sprint.state,
      startDate: sprint.startDate ?? null,
      endDate: sprint.endDate ?? null,
      completeDate: sprint.completeDate ?? null,
      completedStoryPoints,
      completedIssueKeys,
      reportUrl,
      source: "sprint-report",
    };
  } catch {
    const completed = issues.filter(
      (issue) =>
        issue.sprintNames.some(
          (name) => name.toLowerCase() === sprint.name.toLowerCase(),
        ) && issue.statusCategory.toLowerCase() === "done",
    );
    return {
      id: sprint.id,
      name: sprint.name,
      state: sprint.state,
      startDate: sprint.startDate ?? null,
      endDate: sprint.endDate ?? null,
      completeDate: sprint.completeDate ?? null,
      completedStoryPoints: sumStoryPoints(completed),
      completedIssueKeys: completed.map((issue) => issue.key),
      reportUrl,
      source: "issue-fallback",
    };
  }
}

function findSprint(
  history: SprintVelocity[],
  expectedName: string,
): SprintVelocity | null {
  const normalized = expectedName.replace(/\s+/g, " ").trim().toLowerCase();
  const sprintNumber = expectedName.match(/\d+/)?.[0];
  return (
    history.find(
      (sprint) =>
        sprint.name.replace(/\s+/g, " ").trim().toLowerCase() === normalized,
    ) ??
    (sprintNumber
      ? history.find((sprint) =>
          new RegExp(`\\bsprint\\s*${sprintNumber}\\b`, "i").test(sprint.name),
        )
      : null) ??
    null
  );
}

async function fetchIssueWithChangelog(
  config: JiraConfig,
  key: string,
  fieldIds: FieldIds,
): Promise<IssueEvidence | null> {
  try {
    const issue = await jiraGet<JiraIssueRaw>(
      config,
      `/rest/api/2/issue/${encodeURIComponent(key)}`,
      { fields: requestedFields(fieldIds).join(","), expand: "changelog" },
    );
    return normalizeIssue(config, issue, fieldIds);
  } catch {
    return null;
  }
}

function compareCycleTime(
  baseline: IssueEvidence | null,
  assisted: IssueEvidence | null,
): number | null {
  if (
    baseline?.cycleTimeDays === null ||
    baseline?.cycleTimeDays === undefined ||
    assisted?.cycleTimeDays === null ||
    assisted?.cycleTimeDays === undefined ||
    baseline.cycleTimeDays === 0
  ) {
    return null;
  }
  return (
    Math.round(
      ((assisted.cycleTimeDays - baseline.cycleTimeDays) /
        baseline.cycleTimeDays) *
        1000,
    ) / 10
  );
}

async function buildComparisons(
  config: JiraConfig,
  fieldIds: FieldIds,
  issueMap: Map<string, IssueEvidence>,
): Promise<IssueComparison[]> {
  const detailed = new Map<string, IssueEvidence | null>();
  await Promise.all(
    COMPARABLE_KEYS.flat().map(async (key) => {
      detailed.set(
        key,
        (await fetchIssueWithChangelog(config, key, fieldIds)) ??
          issueMap.get(key) ??
          null,
      );
    }),
  );

  return COMPARABLE_KEYS.map(([baselineKey, assistedKey]) => {
    const baseline = detailed.get(baselineKey) ?? null;
    const assisted = detailed.get(assistedKey) ?? null;
    return {
      label: `${assistedKey} compared with ${baselineKey}`,
      baseline,
      assisted,
      cycleTimeChangePercent: compareCycleTime(baseline, assisted),
    };
  });
}

function sortSprints(sprints: SprintVelocity[]): SprintVelocity[] {
  return [...sprints].sort((a, b) => {
    if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
    const aNumber = Number(a.name.match(/\d+/)?.[0] ?? 0);
    const bNumber = Number(b.name.match(/\d+/)?.[0] ?? 0);
    return aNumber - bNumber;
  });
}

export async function loadFlowVelocityEvidence(): Promise<FlowVelocityEvidence> {
  const config = await getConfig();
  const fields = await jiraGet<JiraField[]>(config, "/rest/api/2/field");
  const fieldIds = resolveFieldIds(fields);
  const [rawIssues, sprints, board] = await Promise.all([
    fetchAllIssues(config, fieldIds),
    fetchClosedSprints(config),
    jiraGet<{ name?: string }>(
      config,
      `/rest/agile/1.0/board/${config.boardId}`,
    ).catch(() => ({ name: "Guardians PoC - Dashboard" })),
  ]);

  const issues = rawIssues.map((issue) =>
    normalizeIssue(config, issue, fieldIds),
  );
  const issueMap = new Map(issues.map((issue) => [issue.key, issue]));
  const sprintHistory = sortSprints(
    await Promise.all(
      sprints.map((sprint) =>
        fetchSprintVelocity(config, sprint, issues),
      ),
    ),
  );
  const baseline = findSprint(sprintHistory, BASELINE_SPRINT);
  const comparison = findSprint(sprintHistory, COMPARISON_SPRINT);
  const change =
    baseline && comparison
      ? computeVelocityChange(
          baseline.completedStoryPoints,
          comparison.completedStoryPoints,
        )
      : null;
  const completedInComparison = new Set(
    comparison?.completedIssueKeys ?? [],
  );
  const aiAssistedIssues = issues.filter(
    (issue) =>
      completedInComparison.has(issue.key) && isAiAssisted(issue.aiTool),
  );
  const comparablePairs = await buildComparisons(config, fieldIds, issueMap);
  const epics = buildEpicEvidence(issues);
  const warnings: string[] = [];

  if (!fieldIds.storyPoints) {
    warnings.push("The Jira Story Points field could not be resolved.");
  }
  if (!fieldIds.aiTool) {
    warnings.push("The Jira AI Tool field could not be resolved.");
  }
  if (!fieldIds.epicLink && !fieldIds.parentLink) {
    warnings.push("Epic relationships could not be resolved from Jira fields.");
  }
  if (!baseline) warnings.push(`${BASELINE_SPRINT} was not found among closed sprints.`);
  if (!comparison)
    warnings.push(`${COMPARISON_SPRINT} was not found among closed sprints.`);
  if (sprintHistory.some((sprint) => sprint.source === "issue-fallback")) {
    warnings.push(
      "At least one Jira Sprint Report was unavailable; its total was derived from currently completed sprint issues.",
    );
  }

  const scenarioValidation = validateScenario(baseline, comparison);
  if (scenarioValidation && !scenarioValidation.matchesExpected) {
    warnings.push(
      `Live Jira differs from the PoC target of 40 points in ${BASELINE_SPRINT} and 56 points in ${COMPARISON_SPRINT}.`,
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    project: {
      key: config.projectKey,
      issueCount: issues.length,
      url: `${config.baseUrl}/projects/${config.projectKey}`,
    },
    board: {
      id: config.boardId,
      name: board.name ?? "Guardians PoC - Dashboard",
      url: `${config.baseUrl}/secure/RapidBoard.jspa?rapidView=${config.boardId}&projectKey=${config.projectKey}`,
    },
    sprintHistory,
    baseline,
    comparison,
    change,
    scenarioValidation,
    aiAssistedIssues,
    aiAssistedStoryPoints: sumStoryPoints(aiAssistedIssues),
    comparablePairs,
    epics,
    warnings,
  };
}
