import { NextResponse } from "next/server";

import { loadFlowVelocityEvidence } from "@/lib/jira";
import { generateInsights } from "@/lib/openai-insights";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const evidence = await loadFlowVelocityEvidence();
    const narrative = await generateInsights(evidence);
    return NextResponse.json(
      { evidence, narrative },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve Jira insights.";
    return NextResponse.json(
      { error: message },
      {
        status: 502,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}
