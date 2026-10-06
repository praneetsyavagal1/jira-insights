import { describe, expect, it } from "vitest";

import {
  azureV1BaseUrl,
  DEFAULT_AZURE_SCOPE,
  redactSecrets,
  resolveOpenAiTarget,
} from "@/lib/openai-target";

describe("azureV1BaseUrl", () => {
  it("appends the v1 route to a bare resource endpoint", () => {
    expect(azureV1BaseUrl("https://example.services.ai.azure.com/")).toBe(
      "https://example.services.ai.azure.com/openai/v1/",
    );
  });

  it("keeps an endpoint that already carries the v1 route", () => {
    expect(azureV1BaseUrl("https://example.openai.azure.com/openai/v1/")).toBe(
      "https://example.openai.azure.com/openai/v1/",
    );
  });
});

describe("resolveOpenAiTarget", () => {
  it("uses OpenAI with an API key when no Azure endpoint is configured", () => {
    expect(resolveOpenAiTarget({ OPENAI_API_KEY: "sk-test" })).toEqual({
      ok: true,
      provider: "openai",
      model: "gpt-5.6-sol",
      apiKey: "sk-test",
    });
  });

  it("selects Azure when an endpoint is configured", () => {
    expect(
      resolveOpenAiTarget({
        AZURE_OPENAI_ENDPOINT: "https://example.services.ai.azure.com",
        AZURE_OPENAI_DEPLOYMENT: "gpt-deployment",
        OPENAI_API_KEY: "sk-ignored",
      }),
    ).toEqual({
      ok: true,
      provider: "azure",
      model: "gpt-deployment",
      baseURL: "https://example.services.ai.azure.com/openai/v1/",
      scope: DEFAULT_AZURE_SCOPE,
    });
  });

  it("honors an explicit provider and custom scope", () => {
    const target = resolveOpenAiTarget({
      OPENAI_PROVIDER: "azure",
      AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com",
      OPENAI_MODEL: "fallback-model",
      AZURE_OPENAI_SCOPE: "https://cognitiveservices.azure.com/.default",
    });
    expect(target).toMatchObject({
      ok: true,
      model: "fallback-model",
      scope: "https://cognitiveservices.azure.com/.default",
    });
  });

  it("reports missing Azure settings instead of throwing", () => {
    expect(resolveOpenAiTarget({ OPENAI_PROVIDER: "azure" })).toMatchObject({
      ok: false,
      error: expect.stringContaining("AZURE_OPENAI_ENDPOINT"),
    });
    expect(
      resolveOpenAiTarget({ AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com" }),
    ).toMatchObject({ ok: false, error: expect.stringContaining("AZURE_OPENAI_DEPLOYMENT") });
  });

  it("treats blank values as unset", () => {
    expect(
      resolveOpenAiTarget({ AZURE_OPENAI_ENDPOINT: "  ", OPENAI_API_KEY: "" }),
    ).toMatchObject({ ok: false, provider: "openai" });
  });

  it("rejects an unknown provider", () => {
    expect(resolveOpenAiTarget({ OPENAI_PROVIDER: "bedrock" })).toMatchObject({
      ok: false,
    });
  });
});

describe("redactSecrets", () => {
  it("removes API keys and bearer tokens", () => {
    const message = "failed for sk-abc123 with eyJhbGci.eyJzdWIi.c2lnbmF0dXJl";
    expect(redactSecrets(message)).toBe("failed for [redacted] with [redacted]");
  });
});
