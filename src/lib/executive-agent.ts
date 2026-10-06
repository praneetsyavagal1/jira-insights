import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { createOpenAiConnection, openAiInsightsEnabled } from "@/lib/openai-config";
import { redactSecrets } from "@/lib/openai-target";

export type ExecutiveAgentScenario = "velocity" | "cost" | "unplanned" | "demand";

const promptFiles: Record<ExecutiveAgentScenario, string> = {
  velocity: "flow-velocity.md",
  cost: "cost-avoidance.md",
  unplanned: "unplanned-work-reduction.md",
  demand: "demand-vs-capacity.md",
};

const scenarioAssumptions: Record<ExecutiveAgentScenario, Record<string, unknown>> = {
  velocity: {
    evidenceBoundary: "AI use is an association signal and must not be presented as proven causation.",
  },
  cost: {
    falsePositiveClassification: "The supplied POC scenario classifies DASH-19 as a false positive with no external-customer business impact.",
    valueModel: "Use 800 affected customers multiplied by the DASH-15 $5,000 business-value assumption; label the result modeled value protected, not booked savings.",
  },
  unplanned: {
    finalPhaseStart: "October 1 is the supplied POC assumption for the beginning of the final project phase.",
    productDecision: "The stated Product Management decision is to remove DASH-21 from FixVersion 1.2.0. Live Jira may still show the assignment, so distinguish intended action from completed change.",
  },
  demand: {
    workTypeRule: "Stories represent business features; Tasks represent technical debt, vulnerability, or maintenance demand for this POC.",
    quarterlyTeamCost: 75000,
    highlyCriticalVulnerabilityExposure: 10000,
    mediumVulnerabilityExposure: 5000,
    evidenceBoundary: "Issue count is not effort allocation. Financial values are directional POC assumptions.",
  },
};

const narrativeSchema = z.object({
  executiveFinding: z.string().min(1).max(900),
  calculation: z.string().min(1).max(500),
  evidence: z.array(z.string().min(1).max(500)).min(2).max(8),
  interpretation: z.array(z.string().min(1).max(600)).min(2).max(6),
  actions: z.array(z.string().min(1).max(700)).min(3).max(6),
  caveat: z.string().min(1).max(600),
});

const narrativeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "executiveFinding",
    "calculation",
    "evidence",
    "interpretation",
    "actions",
    "caveat",
  ],
  properties: {
    executiveFinding: { type: "string" },
    calculation: { type: "string" },
    evidence: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: { type: "string" },
    },
    interpretation: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: { type: "string" },
    },
    actions: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string" },
    },
    caveat: { type: "string" },
  },
} as const;

export type ExecutiveAgentNarrative = z.infer<typeof narrativeSchema>;

export type ExecutiveAgentResult = {
  source: "openai" | "curated";
  model: string | null;
  narrative: ExecutiveAgentNarrative | null;
  fallbackReason?: string;
};

function supportedIssueKeys(evidence: unknown): Set<string> {
  return new Set(JSON.stringify(evidence).match(/\b[A-Z][A-Z0-9_]+-\d+\b/g) ?? []);
}

function ensureGroundedNarrative(narrative: ExecutiveAgentNarrative, evidence: unknown): void {
  const supported = supportedIssueKeys(evidence);
  const returned = JSON.stringify(narrative).match(/\b[A-Z][A-Z0-9_]+-\d+\b/g) ?? [];
  const unsupported = Array.from(new Set(returned.filter((key) => !supported.has(key))));
  if (unsupported.length) {
    throw new Error(`Model returned unsupported issue keys: ${unsupported.join(", ")}`);
  }
}

async function loadScenarioPrompt(scenario: ExecutiveAgentScenario): Promise<string> {
  const prompt = await readFile(
    path.join(process.cwd(), "prompts", promptFiles[scenario]),
    "utf8",
  );
  // Each prompt contains rich evidence and reasoning instructions. The API
  // supplies one shared structured-output contract below, so remove any
  // scenario-specific output section to avoid conflicting response shapes.
  return prompt.replace(/\n## Output(?: structure)?\b[\s\S]*$/i, "").trim();
}

export async function generateExecutiveNarrative(
  scenario: ExecutiveAgentScenario,
  jiraEvidence: unknown,
): Promise<ExecutiveAgentResult> {
  if (!openAiInsightsEnabled()) {
    return {
      source: "curated",
      model: null,
      narrative: null,
      fallbackReason: "OpenAI insights are disabled by configuration.",
    };
  }

  const connection = createOpenAiConnection();
  if (!connection.ok) {
    return {
      source: "curated",
      model: null,
      narrative: null,
      fallbackReason: connection.error,
    };
  }
  const { client, model } = connection;

  try {
    const prompt = await loadScenarioPrompt(scenario);
    const instructions = `${prompt}\n\n## Runtime output contract\nReturn only the structured JSON requested by the API schema. Base every factual claim on the supplied Jira evidence. Clearly label supplied assumptions and modeled calculations. Provide decision-ready executive actions.`;
    const response = await client.responses.create({
      model,
      instructions,
      input: JSON.stringify({
        scenario,
        jiraEvidence,
        suppliedPocAssumptions: scenarioAssumptions[scenario],
      }),
      text: {
        format: {
          type: "json_schema",
          name: `${scenario}_executive_insight`,
          strict: true,
          schema: narrativeJsonSchema,
        },
      },
    });
    const narrative = narrativeSchema.parse(JSON.parse(response.output_text));
    ensureGroundedNarrative(narrative, jiraEvidence);
    return { source: "openai", model, narrative };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Unknown OpenAI error.";
    const safeMessage = redactSecrets(rawMessage);
    console.error(`[OpenAI executive insight] ${scenario}/${model} failed: ${safeMessage}`);
    return {
      source: "curated",
      model: null,
      narrative: null,
      fallbackReason: `OpenAI narrative unavailable; curated content used. ${safeMessage}`,
    };
  }
}
