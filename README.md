# DASH Agent Insights

A read-only Next.js proof of concept that turns live Jira delivery data into grounded Flow Velocity and Epic insights.

## What it does

- Connects to the `DASH` project and Jira board `4174` using a server-side personal access token.
- Reads Jira Sprint Report totals for every closed sprint.
- Compares Sprint 1 with Sprint 7 and validates the 40-to-56-point PoC scenario.
- Resolves Story Points, Sprint, Epic Link, Parent Link, and AI Tool custom fields by display name rather than hard-coded IDs.
- Compares DASH-8 with DASH-5 and DASH-14 with DASH-4 using story points and active cycle time.
- Rolls child delivery, AI usage, and open critical work into the current Epic view.
- Sends normalized evidence to the OpenAI Responses API when configured.
- Uses deterministic grounded insights when no OpenAI key is present or model output fails validation.
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
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-5.6-sol
```

Without those values, the dashboard remains fully usable and labels its narrative source as deterministic analysis. The OpenAI integration follows the [Responses API](https://platform.openai.com/docs/api-reference/responses) pattern with schema-constrained output.

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
