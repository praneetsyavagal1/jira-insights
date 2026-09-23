import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import OpenAI from "openai";
import { z } from "zod";

import { buildDeterministicInsights } from "@/lib/flow-velocity";
import type {
  FlowVelocityEvidence,
  GeneratedInsights,
} from "@/lib/types";

const modelPayloadSchema = z.object({
  headline: z.string().min(1).max(180),
  summary: z.string().min(1).max(700),
  insights: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(180),
        finding: z.string().min(1).max(700),
        evidence: z.array(z.string().min(1).max(300)).min(1).max(6),
        significance: z.string().min(1).max(500),
        confidence: z.enum(["high", "medium", "low"]),
        tone: z.enum(["positive", "risk", "observation"]),
        caveat: z.string().max(400).nullable(),
        issueKeys: z.array(z.string().min(1).max(30)).max(12),
      }),
    )
    .min(3)
    .max(7),
});

const responseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "insights"],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    insights: {
      type: "array",
      minItems: 3,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "title",
          "finding",
          "evidence",
          "significance",
          "confidence",
          "tone",
          "caveat",
          "issueKeys",
        ],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          finding: { type: "string" },
          evidence: {
            type: "array",
            minItems: 1,
            maxItems: 6,
            items: { type: "string" },
          },
          significance: { type: "string" },
          confidence: {
            type: "string",
            enum: ["high", "medium", "low"],
          },
          tone: {
            type: "string",
            enum: ["positive", "risk", "observation"],
          },
          caveat: { type: ["string", "null"] },
          issueKeys: {
            type: "array",
            maxItems: 12,
            items: { type: "string" },
          },
        },
      },
    },
  },
} as const;

async function loadPrompt(): Promise<string> {
  return readFile(
    path.join(process.cwd(), "prompts", "flow-velocity.md"),
    "utf8",
  );
}

function validIssueKeys(evidence: FlowVelocityEvidence): Set<string> {
  const keys = new Set<string>();
  evidence.epics.forEach((epic) => {
    keys.add(epic.key);
    epic.children.forEach((issue) => keys.add(issue.key));
  });
  evidence.aiAssistedIssues.forEach((issue) => keys.add(issue.key));
  evidence.comparablePairs.forEach((pair) => {
    if (pair.baseline) keys.add(pair.baseline.key);
    if (pair.assisted) keys.add(pair.assisted.key);
  });
  evidence.sprintHistory.forEach((sprint) =>
    sprint.completedIssueKeys.forEach((key) => keys.add(key)),
  );
  return keys;
}

function ensureGroundedIssueKeys(
  result: z.infer<typeof modelPayloadSchema>,
  evidence: FlowVelocityEvidence,
): void {
  const valid = validIssueKeys(evidence);
  const unsupported = result.insights.flatMap((item) =>
    item.issueKeys.filter((key) => !valid.has(key)),
  );
  if (unsupported.length) {
    throw new Error(
      `Model returned unsupported issue keys: ${Array.from(new Set(unsupported)).join(", ")}`,
    );
  }
}

export async function generateInsights(
  evidence: FlowVelocityEvidence,
): Promise<GeneratedInsights> {
  const fallback = buildDeterministicInsights(evidence);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-sol";

  if (!apiKey) {
    return {
      ...fallback,
      fallbackReason: "OPENAI_API_KEY is not configured in the running server.",
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    const prompt = await loadPrompt();
    const response = await client.responses.create({
      model,
      instructions: prompt,
      input: JSON.stringify(evidence),
      text: {
        format: {
          type: "json_schema",
          name: "flow_velocity_insights",
          strict: true,
          schema: responseJsonSchema,
        },
      },
    });
    const parsed = modelPayloadSchema.parse(JSON.parse(response.output_text));
    ensureGroundedIssueKeys(parsed, evidence);
    return {
      source: "openai",
      model,
      ...parsed,
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Unknown OpenAI error.";
    const safeMessage = rawMessage
      .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
      .slice(0, 240);
    console.error(`[OpenAI] ${model} request failed: ${safeMessage}`);
    return {
      ...fallback,
      fallbackReason: `${model} request failed: ${safeMessage}`,
      summary: `${fallback.summary} The OpenAI narrative was unavailable, so these insights were produced by deterministic rules.`,
    };
  }
}
