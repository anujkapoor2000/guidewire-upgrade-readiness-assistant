Below is a practical set of Guidewire Upgrade Readiness Assistant use cases, followed by Vercel deployable Next.js code for a prototype covering:

Upgrade readiness scoring
Vendor integration mocks
Contract tests
Data migration assist

I have assumed a Guidewire InsuranceSuite upgrade or cloud migration context, where teams need to assess configuration/custom code risk, validate integrations, and prepare migration data checks. Guidewire’s public Cloud API material confirms REST API based integration patterns, and Guidewire Integration Gateway is positioned for third party and internal application integrations in Guidewire Cloud Platform


1. Use cases
A. Guidewire Upgrade Readiness Assistant

Objective: Help delivery, architecture, testing, and product teams understand upgrade risk before committing to a delivery plan.

Typical users: Programme manager, Guidewire architect, test lead, delivery lead, application owner.

Inputs:

Input	Example
Current Guidewire version	ClaimCenter 10, PolicyCenter 10, BillingCenter 10
Target version	Guidewire Cloud current release
Custom Gosu inventory	Plugins, rules, typelists, entity extensions
Integration inventory	FNOL, document generation, payments, fraud, broker portal
Batch jobs	Renewals, billing extracts, claims feeds
Known defects	Upgrade blockers, failing regression areas
Test coverage	Unit, API, regression, E2E, contract tests

Assistant outputs:

Output	Description
Upgrade readiness score	0 to 100 readiness index
Risk heatmap	Custom code, data, integration, testing, security, environments
Remediation backlog	Prioritised list of issues
Upgrade sprint plan	Suggested sequencing
Go or no go recommendation	Evidence based decision summary


How this becomes enterprise grade

The prototype can be extended into a proper delivery accelerator as follows:

Area	Enhancement
Guidewire metadata ingestion	Parse configuration, Gosu, PCF, entity, typelist, and integration config repositories
AI assistant	Add RAG over upgrade guides, design docs, ADRs, defect history, and test evidence
Integration contracts	Store OpenAPI, AsyncAPI, XSD, JSON Schema, and CSV layout contracts
Vendor mocks	Add scenario libraries for happy path, timeout, auth failure, malformed payload, duplicate request, idempotency
Migration validation	Add source to target reconciliation, business balancing, duplicate detection, and typelist mapping
CI/CD	Add GitHub Actions, quality gates, and automatic readiness scoring per build
Security	Add SSO, role based access, audit logs, and environment separation
Reporting	Generate steering committee upgrade readiness packs

---

## Running the app

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Pages

- `/` — landing page with feature navigation
- `/upgrade-readiness` — editable readiness inputs → 0–100 score, risk findings, and an AI upgrade advisory (go/no-go, remediation backlog, sprint plan)
- `/vendor-mocks` — call vendor mocks (fraud, document, payment, address) with happy-path and failure scenarios, and run JSON Schema contract tests
- `/data-migration` — validate candidate migration records and generate an AI remediation plan with reconciliation checks

### Sample scenarios, risk heatmap & steering pack export

- **One-click sample scenarios** — each tool ships presets so it is self-demonstrating:
  readiness profiles (*Cloud-ready*, *Typical*, *Heavy customisation*), migration
  datasets (*Clean*, *Common defects*, *Critical blockers*), and valid/invalid
  contract-test payloads.
- **Risk heatmap** — a colour-coded grid across the six upgrade dimensions
  (custom code, data, integration, testing, security, environments). The first four
  are derived directly from inputs; security and environments are flagged heuristic
  estimates in this prototype (`lib/heatmap.ts`).
- **Steering pack export** — from a completed readiness assessment, download a
  Markdown steering pack (`lib/report.ts`) or use *Print / Save as PDF* (a print
  stylesheet hides the inputs and chrome so the score, heatmap, and advisory print
  cleanly).

### AI features

The AI features are powered by Claude through the official `@anthropic-ai/sdk`
(model `claude-opus-4-8` with adaptive thinking). Two server routes call the model:

- `POST /api/ai/advisory` — scores readiness, then generates a steering advisory
- `POST /api/ai/migration-remediation` — validates records, then generates a remediation plan

Set `ANTHROPIC_API_KEY` (see `.env.example`) to enable them. **Without an API key
the app gracefully falls back to deterministic summaries built from the rule
engine**, so the prototype is always demoable. Optionally override the model with
`ANTHROPIC_MODEL`.

The original deterministic endpoints remain available:
`POST /api/readiness/score`, `POST /api/contracts/run`,
`POST /api/migration/validate`, and `POST /api/mocks/vendor/{vendor}`.
