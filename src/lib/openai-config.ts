import "server-only";

import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import OpenAI from "openai";

import { resolveOpenAiTarget, type OpenAiTarget } from "@/lib/openai-target";

export function openAiInsightsEnabled(): boolean {
  const value = process.env.OPENAI_INSIGHTS_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" || value === "on";
}

// A blank AZURE_CLIENT_ID makes DefaultAzureCredential fail instead of moving
// on to the next credential, and a copied .env.example leaves these empty.
const SERVICE_PRINCIPAL_VARS = [
  "AZURE_TENANT_ID",
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",
  "AZURE_CLIENT_CERTIFICATE_PATH",
] as const;

function brokerDisabled(): boolean {
  const value = process.env.AZURE_USE_BROKER?.trim().toLowerCase();
  return value === "false" || value === "0" || value === "no" || value === "off";
}

/**
 * Registering the native broker plugin adds BrokerCredential to
 * DefaultAzureCredential, so on a Windows workstation the signed-in account is
 * used silently. It is best-effort: if the native runtime cannot load (or
 * AZURE_USE_BROKER=false), the chain still offers service principal, workload
 * and managed identity, then Azure CLI, Azure PowerShell, azd and VS Code.
 */
async function registerBroker(): Promise<void> {
  if (brokerDisabled()) return;
  try {
    const [{ useIdentityPlugin: registerIdentityPlugin }, { nativeBrokerPlugin }] = await Promise.all([
      import("@azure/identity"),
      import("@azure/identity-broker"),
    ]);
    registerIdentityPlugin(nativeBrokerPlugin);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[Azure auth] Account broker unavailable; using other credentials. ${message}`);
  }
}

let credential: Promise<DefaultAzureCredential> | undefined;
const tokenProviders = new Map<string, Promise<() => Promise<string>>>();

function getCredential(): Promise<DefaultAzureCredential> {
  credential ??= registerBroker().then(() => {
    for (const name of SERVICE_PRINCIPAL_VARS) {
      if (name in process.env && !process.env[name]?.trim()) delete process.env[name];
    }
    return new DefaultAzureCredential();
  });
  return credential;
}

function azureTokenProvider(scope: string): () => Promise<string> {
  return async () => {
    let provider = tokenProviders.get(scope);
    if (!provider) {
      // Tokens are cached by the credential and refreshed as they near expiry.
      provider = getCredential().then((value) => getBearerTokenProvider(value, scope));
      tokenProviders.set(scope, provider);
    }
    return (await provider)();
  };
}

export type OpenAiConnection =
  | { ok: true; client: OpenAI; model: string; provider: OpenAiTarget["provider"] }
  | { ok: false; error: string };

/** Build a client for whichever backend the environment selects. */
export function createOpenAiConnection(): OpenAiConnection {
  const target = resolveOpenAiTarget(process.env);
  if (!target.ok) return { ok: false, error: target.error };

  if (target.provider === "azure") {
    return {
      ok: true,
      provider: target.provider,
      model: target.model,
      client: new OpenAI({
        baseURL: target.baseURL,
        apiKey: azureTokenProvider(target.scope),
      }),
    };
  }

  return {
    ok: true,
    provider: target.provider,
    model: target.model,
    client: new OpenAI({ apiKey: target.apiKey }),
  };
}
