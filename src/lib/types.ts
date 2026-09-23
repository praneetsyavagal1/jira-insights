export type Confidence = "high" | "medium" | "low";
export type InsightTone = "positive" | "risk" | "observation";

export interface SprintVelocity {
  id: number;
  name: string;
  state: string;
  startDate: string | null;
  endDate: string | null;
  completeDate: string | null;
  completedStoryPoints: number;
  completedIssueKeys: string[];
  reportUrl: string;
  source: "sprint-report" | "issue-fallback";
}

export interface IssueEvidence {
  key: string;
  summary: string;
  issueType: string;
  status: string;
  statusCategory: string;
  priority: string | null;
  storyPoints: number | null;
  aiTool: string | null;
  sprintNames: string[];
  epicKey: string | null;
  created: string | null;
  resolutionDate: string | null;
  cycleTimeDays: number | null;
  url: string;
}

export interface IssueComparison {
  label: string;
  baseline: IssueEvidence | null;
  assisted: IssueEvidence | null;
  cycleTimeChangePercent: number | null;
}

export interface EpicEvidence {
  key: string;
  summary: string;
  status: string;
  statusCategory: string;
  priority: string | null;
  storyPoints: number | null;
  childCount: number;
  completedChildCount: number;
  childStoryPoints: number;
  completedChildStoryPoints: number;
  aiAssistedChildCount: number;
  openCriticalChildren: string[];
  children: IssueEvidence[];
  url: string;
}

export interface VelocityChange {
  points: number;
  percentage: number | null;
}

export interface ScenarioValidation {
  expectedBaselinePoints: number;
  expectedComparisonPoints: number;
  expectedPercentageChange: number;
  matchesExpected: boolean;
}

export interface FlowVelocityEvidence {
  generatedAt: string;
  project: {
    key: string;
    issueCount: number;
    url: string;
  };
  board: {
    id: number;
    name: string;
    url: string;
  };
  sprintHistory: SprintVelocity[];
  baseline: SprintVelocity | null;
  comparison: SprintVelocity | null;
  change: VelocityChange | null;
  scenarioValidation: ScenarioValidation | null;
  aiAssistedIssues: IssueEvidence[];
  aiAssistedStoryPoints: number;
  comparablePairs: IssueComparison[];
  epics: EpicEvidence[];
  warnings: string[];
}

export interface AgentInsight {
  id: string;
  title: string;
  finding: string;
  evidence: string[];
  significance: string;
  confidence: Confidence;
  tone: InsightTone;
  caveat: string | null;
  issueKeys: string[];
}

export interface GeneratedInsights {
  source: "openai" | "deterministic";
  model: string | null;
  fallbackReason?: string;
  headline: string;
  summary: string;
  insights: AgentInsight[];
}

export interface FlowVelocityResponse {
  evidence: FlowVelocityEvidence;
  narrative: GeneratedInsights;
}
