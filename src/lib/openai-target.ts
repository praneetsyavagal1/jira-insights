// Scope for the /openai/v1 route on an Azure AI Foundry resource. The older
// /openai/deployments route uses https://cognitiveservices.azure.com/.default.
export const DEFAULT_AZURE_SCOPE = "https://ai.azure.com/.default";
export const DEFAULT_OPENAI_MODEL = "gpt-5.6-sol";

export type OpenAiProvider = "openai" | "azure";

export type OpenAiTarget =
  | { ok: true; provider: "openai"; model: string; apiKey: string }
  | {
      ok: true;
      provider: "azure";
      model: string;
      baseURL: string;
      scope: string;
    }
  | { ok: false; provider: OpenAiProvider; error: string };

type Env = Record<string, string | undefined>;

function read(env: Env, name: string): string | undefined {
  return env[name]?.trim() || undefined;
}

/**
 * Normalize a Foundry resource endpoint to the /openai/v1/ base URL. Accepts
 * the bare resource host or one that already carries the suffix; a missing
 * path segment otherwise only surfaces as a 404 from the service.
 */
export function azureV1BaseUrl(endpoint: string): string {
  let base = endpoint.trim().replace(/\/+$/, "");
  if (!base.endsWith("/openai/v1")) base = `${base}/openai/v1`;
  return `${base}/`;
}

/**
 * Decide which backend serves the narrative. OPENAI_PROVIDER picks explicitly;
 * otherwise a configured AZURE_OPENAI_ENDPOINT selects Azure AI Foundry.
 */
export function resolveOpenAiTarget(env: Env): OpenAiTarget {
  const requested = read(env, "OPENAI_PROVIDER")?.toLowerCase();
  if (requested && requested !== "openai" && requested !== "azure") {
    return {
      ok: false,
      provider: "openai",
      error: `OPENAI_PROVIDER must be "openai" or "azure", not "${requested}".`,
    };
  }

  const endpoint = read(env, "AZURE_OPENAI_ENDPOINT");
  const provider: OpenAiProvider =
    (requested as OpenAiProvider | undefined) ?? (endpoint ? "azure" : "openai");

  if (provider === "azure") {
    if (!endpoint) {
      return {
        ok: false,
        provider,
        error: "AZURE_OPENAI_ENDPOINT is not configured in the running server.",
      };
    }
    const model = read(env, "AZURE_OPENAI_DEPLOYMENT") ?? read(env, "OPENAI_MODEL");
    if (!model) {
      return {
        ok: false,
        provider,
        error: "AZURE_OPENAI_DEPLOYMENT is not configured in the running server.",
      };
    }
    return {
      ok: true,
      provider,
      model,
      baseURL: azureV1BaseUrl(endpoint),
      scope: read(env, "AZURE_OPENAI_SCOPE") ?? DEFAULT_AZURE_SCOPE,
    };
  }

  const apiKey = read(env, "OPENAI_API_KEY");
  if (!apiKey) {
    return {
      ok: false,
      provider,
      error: "OPENAI_API_KEY is not configured in the running server.",
    };
  }
  return {
    ok: true,
    provider,
    model: read(env, "OPENAI_MODEL") ?? DEFAULT_OPENAI_MODEL,
    apiKey,
  };
}

/** Strip anything credential-shaped from an error before it is logged or returned. */
export function redactSecrets(message: string): string {
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g, "[redacted]")
    .slice(0, 240);
}
