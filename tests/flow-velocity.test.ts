import { describe, expect, it } from "vitest";

import {
  buildDeterministicInsights,
  buildEpicEvidence,
  computeVelocityChange,
  extractSprintNames,
  validateScenario,
} from "@/lib/flow-velocity";
import type {
  FlowVelocityEvidence,
  IssueEvidence,
  SprintVelocity,
} from "@/lib/types";

function sprint(
  id: number,
  name: string,
  completedStoryPoints: number,
): SprintVelocity {
  return {
    id,
    name,
    state: "closed",
    startDate: null,
    endDate: null,
    completeDate: null,
    completedStoryPoints,
    completedIssueKeys: [],
    reportUrl: `https://jira.example/sprint/${id}`,
    source: "sprint-report",
  };
}

function issue(
  key: string,
  overrides: Partial<IssueEvidence> = {},
): IssueEvidence {
  return {
    key,
    summary: `Summary for ${key}`,
    issueType: "Story",
    status: "Closed",
    statusCategory: "Done",
    priority: "Medium",
    storyPoints: 8,
    aiTool: null,
    sprintNames: [],
    epicKey: null,
    created: null,
    resolutionDate: null,
    cycleTimeDays: null,
    url: `https://jira.example/browse/${key}`,
    ...overrides,
  };
}

function evidenceFixture(): FlowVelocityEvidence {
  const baseline = sprint(1, "Sprint 1", 40);
  const comparison = sprint(7, "Sprint 7", 56);
  return {
    generatedAt: "2026-09-22T12:00:00.000Z",
    project: {
      key: "DASH",
      issueCount: 4,
      url: "https://jira.example/projects/DASH",
    },
    board: {
      id: 4174,
      name: "Guardians PoC - Dashboard",
      url: "https://jira.example/board/4174",
    },
    sprintHistory: [baseline, comparison],
    baseline,
    comparison,
    change: computeVelocityChange(40, 56),
    scenarioValidation: validateScenario(baseline, comparison),
    aiAssistedIssues: [
      issue("DASH-8", {
        aiTool: "GitHub Copilot",
        storyPoints: 8,
        sprintNames: ["Sprint 7"],
      }),
    ],
    aiAssistedStoryPoints: 8,
    comparablePairs: [],
    epics: [],
    warnings: [],
  };
}

describe("Flow Velocity calculations", () => {
  it("calculates the expected 40 percent improvement", () => {
    expect(computeVelocityChange(40, 56)).toEqual({
      points: 16,
      percentage: 40,
    });
  });

  it("returns a null percentage when the baseline is zero", () => {
    expect(computeVelocityChange(0, 12)).toEqual({
      points: 12,
      percentage: null,
    });
  });

  it("validates the PoC target from live-derived sprint totals", () => {
    const baseline = sprint(1, "Sprint 1", 40);
    const comparison = sprint(7, "Sprint 7", 56);
    expect(validateScenario(baseline, comparison)?.matchesExpected).toBe(true);
  });
});

describe("Jira field normalization", () => {
  it("extracts names from Jira Server GreenHopper sprint strings", () => {
    expect(
      extractSprintNames([
        "com.atlassian.greenhopper.service.sprint.Sprint@1[id=7,rapidViewId=4174,state=CLOSED,name=Sprint 7,startDate=2026-07-01]",
      ]),
    ).toEqual(["Sprint 7"]);
  });
});

describe("Epic rollups", () => {
  it("rolls status, points, AI usage, and critical risks into the Epic", () => {
    const issues = [
      issue("DASH-15", {
        issueType: "Epic",
        summary: "ATM language preferences",
        status: "Open",
        statusCategory: "To Do",
        storyPoints: null,
      }),
      issue("DASH-16", { epicKey: "DASH-15", storyPoints: 8 }),
      issue("DASH-17", {
        epicKey: "DASH-15",
        status: "Open",
        statusCategory: "To Do",
        priority: "Critical",
        storyPoints: 13,
        aiTool: "GitHub Copilot",
      }),
    ];

    expect(buildEpicEvidence(issues)[0]).toMatchObject({
      key: "DASH-15",
      childCount: 2,
      completedChildCount: 1,
      childStoryPoints: 21,
      completedChildStoryPoints: 8,
      aiAssistedChildCount: 1,
      openCriticalChildren: ["DASH-17"],
    });
  });
});

describe("Deterministic insight fallback", () => {
  it("creates grounded velocity and AI insights without causal claims", () => {
    const result = buildDeterministicInsights(evidenceFixture());
    const claims = result.insights
      .map((item) => `${item.finding} ${item.significance}`)
      .join(" ")
      .toLowerCase();
    const aiInsight = result.insights.find(
      (item) => item.id === "ai-assisted-delivery",
    );

    expect(result.source).toBe("deterministic");
    expect(result.headline).toContain("40%");
    expect(result.insights.map((item) => item.id)).toContain("velocity-change");
    expect(result.insights.map((item) => item.id)).toContain(
      "ai-assisted-delivery",
    );
    expect(claims).not.toContain("ai caused");
    expect(aiInsight?.caveat?.toLowerCase()).toContain("does not prove");
  });
});
