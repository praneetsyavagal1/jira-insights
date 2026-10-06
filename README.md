# DASH Agent Insights

A read-only Next.js proof of concept that turns live Jira delivery data into grounded Flow Velocity and Epic insights.

## What it does

- Connects to the `DASH` project and Jira board `4174` using a server-side personal access token.
- Reads Jira Sprint Report totals for every closed sprint.
- Compares Sprint 1 with Sprint 7 and validates the 40-to-56-point PoC scenario.
- Resolves Story Points, Sprint, Epic Link, Parent Link, and AI Tool custom fields by display name rather than hard-coded IDs.
- Compares DASH-8 with DASH-5 and DASH-14 with DASH-4 using story points and active cycle time.
- Rolls child delivery, AI usage, and open critical work into the current Epic view.
- Supports prompt-governed OpenAI narratives for Flow Velocity, Defect Cost Avoidance, Unplanned Work Reduction, and Demand vs Capacity.
- Uses curated executive content by default and falls back to it whenever OpenAI is disabled or unavailable.
- Never writes to Jira.

## Run locally

Node.js 20 or newer is required.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

The existing `access-token.txt` file is supported for local development and is ignored by Git. For other environments, copy `.env.example` to `.env.local` and set `JIRA_PAT` in the environment instead.

To enable generated narrative insights, configure:

```text
OPENAI_INSIGHTS_ENABLED=true
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-5.6-sol
```

### Azure AI Foundry with Microsoft Entra ID

To use a model deployed in Azure AI Foundry instead of an OpenAI API key, configure:

```text
OPENAI_INSIGHTS_ENABLED=true
AZURE_OPENAI_ENDPOINT=https://<resource>.services.ai.azure.com
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
```

Setting `AZURE_OPENAI_ENDPOINT` selects Azure automatically; `OPENAI_PROVIDER=openai|azure` forces a choice. Requests go to the Foundry `/openai/v1/` route (appended to the endpoint if missing) with a bearer token for `AZURE_OPENAI_SCOPE`, which defaults to `https://ai.azure.com/.default`.

There is no API key. Tokens come from `DefaultAzureCredential`, so any standard Microsoft Entra sign-in works. The identity needs a data-plane role such as **Cognitive Services OpenAI User** on the Foundry resource.

| Where it runs | How it signs in |
| --- | --- |
| Windows workstation | The signed-in Windows account, silently, through the account broker. No `az login` needed. |
| macOS / Linux workstation | `az login`, `Connect-AzAccount`, `azd auth login` or the VS Code Azure sign-in. |
| Container or CI | A service principal: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` (or workload identity). |
| Hosted in Azure | Managed identity, picked up automatically. |

The account broker is best-effort: if its native runtime cannot load, the app logs a warning and uses the rest of the chain. Set `AZURE_USE_BROKER=false` to skip it, and `AZURE_TOKEN_CREDENTIALS=prod` in deployed environments to limit the chain to service principal, workload and managed identity.

`OPENAI_INSIGHTS_ENABLED` is opt-in and defaults to `false`. When disabled, no OpenAI request is created and the executive dashboard uses curated content. When enabled, clicking an analyzed metric sends its normalized Jira evidence and scenario prompt to the Responses API of the configured provider. Missing credentials, API failures, quota errors, invalid schema output, and unsupported Jira keys all fall back to curated content.

The separate live Flow Velocity diagnostic page uses deterministic rules as its fallback. All OpenAI calls use schema-constrained output and keep credentials on the server.

## Commands

```powershell
npm run test
npm run lint
npm run build
```

## Evidence and safety boundaries

- All numerical metrics are calculated in application code from Jira evidence.
- The model receives normalized issue metadata, not credentials or raw Jira responses.
- Model output is schema-validated and rejected if it cites an issue key absent from the evidence.
- AI Tool usage is reported as an association and never treated as proof of causation.
- Live Jira values are displayed even when they differ from the PoC target.
