import { NextRequest, NextResponse } from "next/server";

import {
  generateExecutiveNarrative,
  type ExecutiveAgentScenario,
} from "@/lib/executive-agent";
import {
  loadExecutiveScenarioEvidence,
  loadFlowVelocityEvidence,
} from "@/lib/jira";
import { openAiInsightsEnabled } from "@/lib/openai-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supportedScenarios = new Set<ExecutiveAgentScenario>([
  "velocity",
  "cost",
  "unplanned",
  "demand",
]);

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("scenario") ?? "";
  if (!supportedScenarios.has(requested as ExecutiveAgentScenario)) {
    return NextResponse.json(
      { error: "Unsupported executive insight scenario." },
      { status: 400 },
    );
  }
  const scenario = requested as ExecutiveAgentScenario;

  try {
    // Disabled is the default. Return immediately without reading Jira or
    // creating an OpenAI client; the frontend keeps its curated narrative.
    if (!openAiInsightsEnabled()) {
      const result = await generateExecutiveNarrative(scenario, null);
      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    const evidence = scenario === "velocity"
      ? await loadFlowVelocityEvidence()
      : await loadExecutiveScenarioEvidence(scenario);
    const result = await generateExecutiveNarrative(scenario, evidence);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 240)
      : "Unable to generate the executive insight.";
    // A successful curated response keeps the dashboard resilient even when
    // Jira is temporarily unavailable before the OpenAI request can run.
    return NextResponse.json(
      {
        source: "curated",
        model: null,
        narrative: null,
        fallbackReason: `Curated content used. ${message}`,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
