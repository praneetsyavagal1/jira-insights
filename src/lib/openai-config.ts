import "server-only";

export function openAiInsightsEnabled(): boolean {
  const value = process.env.OPENAI_INSIGHTS_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" || value === "on";
}
