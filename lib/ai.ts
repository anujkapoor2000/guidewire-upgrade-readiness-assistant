import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  ReadinessInput,
  ReadinessResult,
  ReadinessAdvisory,
  MigrationRecord,
  MigrationValidationIssue,
  MigrationRemediation
} from "./types";

// Default to the most capable Claude model. Override with ANTHROPIC_MODEL if needed.
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  // The SDK reads ANTHROPIC_API_KEY from the environment automatically.
  return new Anthropic();
}

// claude-opus-4-8 requires adaptive thinking (enabled/budget_tokens 400s).
// SDK 0.71 types predate the adaptive variant, so cast through unknown — the
// field is forwarded to the API unchanged at runtime.
const ADAPTIVE_THINKING = {
  type: "adaptive"
} as unknown as Anthropic.MessageCreateParams["thinking"];

/**
 * Pull the concatenated text out of a Messages API response, ignoring
 * thinking blocks. Strips an optional ```json fence so JSON.parse succeeds.
 */
function extractJson(message: Anthropic.Message): string {
  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map(block => block.text)
    .join("")
    .trim();

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

// ---------------------------------------------------------------------------
// Upgrade readiness advisory
// ---------------------------------------------------------------------------

const AdvisorySchema = z.object({
  executiveSummary: z.string(),
  goNoGoRecommendation: z.enum(["GO", "CONDITIONAL_GO", "NO_GO"]),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  keyRisks: z.array(
    z.object({
      area: z.string(),
      risk: z.string(),
      businessImpact: z.string()
    })
  ),
  remediationBacklog: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(["P0", "P1", "P2", "P3"]),
      rationale: z.string(),
      estimatedEffort: z.string()
    })
  ),
  sprintPlan: z.array(
    z.object({
      sprint: z.string(),
      focus: z.string(),
      items: z.array(z.string())
    })
  )
});

const ADVISORY_SYSTEM = `You are a Guidewire InsuranceSuite upgrade and cloud migration delivery advisor.
You support programme managers, Guidewire architects, and test leads who must decide whether an
upgrade is ready to execute. You are given a structured readiness assessment (a numeric score, a
risk level, and rule-based findings) and must turn it into an evidence-based steering recommendation.

Be specific to Guidewire: reference PolicyCenter / ClaimCenter / BillingCenter flows (quote, bind,
endorsement, FNOL, claim payment, renewal, cancellation, billing), Gosu custom code, PCF, typelists,
entity extensions, Cloud API integrations, contract tests, vendor mocks, and source-to-target data
reconciliation where relevant.

Respond with ONLY a single JSON object (no prose, no markdown fences) matching exactly this shape:
{
  "executiveSummary": string,            // 3-5 sentences for a steering committee
  "goNoGoRecommendation": "GO" | "CONDITIONAL_GO" | "NO_GO",
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "keyRisks": [ { "area": string, "risk": string, "businessImpact": string } ],
  "remediationBacklog": [ { "title": string, "priority": "P0"|"P1"|"P2"|"P3", "rationale": string, "estimatedEffort": string } ],
  "sprintPlan": [ { "sprint": string, "focus": string, "items": string[] } ]
}
Order remediationBacklog by priority (P0 first). Provide 2-4 sprints in sprintPlan.`;

export async function generateReadinessAdvisory(
  input: ReadinessInput,
  result: ReadinessResult
): Promise<ReadinessAdvisory> {
  if (!isAIConfigured()) {
    return fallbackAdvisory(input, result);
  }

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 6000,
      thinking: ADAPTIVE_THINKING,
      system: ADVISORY_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Readiness assessment input:\n${JSON.stringify(
            input,
            null,
            2
          )}\n\nComputed rule-based result:\n${JSON.stringify(
            result,
            null,
            2
          )}\n\nProduce the steering recommendation JSON now.`
        }
      ]
    });

    const parsed = AdvisorySchema.parse(JSON.parse(extractJson(message)));
    return { aiGenerated: true, model: MODEL, ...parsed };
  } catch (error) {
    console.error("AI advisory generation failed, using fallback:", error);
    return fallbackAdvisory(input, result);
  }
}

function fallbackAdvisory(
  input: ReadinessInput,
  result: ReadinessResult
): ReadinessAdvisory {
  const goNoGo =
    result.readinessScore >= 80
      ? "GO"
      : result.readinessScore >= 55
      ? "CONDITIONAL_GO"
      : "NO_GO";

  return {
    aiGenerated: false,
    model: null,
    executiveSummary: `Rule-based assessment scored this ${input.currentVersion} → ${input.targetVersion} upgrade at ${result.readinessScore}/100 (${result.riskLevel} risk), based on ${result.findings.length} finding(s) across customisation, integrations, testing, and data. Set ANTHROPIC_API_KEY to generate a full AI advisory with a tailored remediation backlog and sprint plan.`,
    goNoGoRecommendation: goNoGo,
    confidence: result.findings.length <= 1 ? "HIGH" : "MEDIUM",
    keyRisks: result.findings.map(f => ({
      area: f.area,
      risk: f.message,
      businessImpact: f.recommendation
    })),
    remediationBacklog: result.findings.map((f, i) => ({
      title: `Remediate ${f.area.toLowerCase()} risk`,
      priority: f.risk === "CRITICAL" ? "P0" : f.risk === "HIGH" ? "P1" : "P2",
      rationale: f.message,
      estimatedEffort: i === 0 ? "1-2 sprints" : "1 sprint"
    })),
    sprintPlan: [
      {
        sprint: "Sprint 1",
        focus: "Close critical blockers and integration contracts",
        items: result.recommendedNextActions.slice(0, 3)
      },
      {
        sprint: "Sprint 2",
        focus: "Testing coverage and data reconciliation",
        items: result.recommendedNextActions.slice(3)
      }
    ]
  };
}

// ---------------------------------------------------------------------------
// Data migration remediation
// ---------------------------------------------------------------------------

const RemediationSchema = z.object({
  summary: z.string(),
  overallDataReadiness: z.enum(["READY", "NEEDS_WORK", "NOT_READY"]),
  prioritizedFixes: z.array(
    z.object({
      entityType: z.string(),
      issue: z.string(),
      recommendation: z.string(),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"])
    })
  ),
  reconciliationChecks: z.array(z.string())
});

const MIGRATION_SYSTEM = `You are a Guidewire data migration specialist preparing source-to-target
loads into Guidewire Cloud (PolicyCenter / ClaimCenter / BillingCenter). You are given a set of
candidate migration records and the validation issues a rule engine found. Produce an actionable,
prioritised remediation plan and suggest balancing/reconciliation checks (record counts, control
totals, typelist mapping, referential integrity, duplicate detection).

Respond with ONLY a single JSON object (no prose, no markdown fences) matching exactly this shape:
{
  "summary": string,
  "overallDataReadiness": "READY" | "NEEDS_WORK" | "NOT_READY",
  "prioritizedFixes": [ { "entityType": string, "issue": string, "recommendation": string, "priority": "HIGH"|"MEDIUM"|"LOW" } ],
  "reconciliationChecks": string[]
}`;

export async function generateMigrationRemediation(
  records: MigrationRecord[],
  issues: MigrationValidationIssue[]
): Promise<MigrationRemediation> {
  if (!isAIConfigured()) {
    return fallbackRemediation(records, issues);
  }

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 5000,
      thinking: ADAPTIVE_THINKING,
      system: MIGRATION_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Candidate records (${records.length}):\n${JSON.stringify(
            records,
            null,
            2
          )}\n\nValidation issues (${issues.length}):\n${JSON.stringify(
            issues,
            null,
            2
          )}\n\nProduce the remediation plan JSON now.`
        }
      ]
    });

    const parsed = RemediationSchema.parse(JSON.parse(extractJson(message)));
    return { aiGenerated: true, model: MODEL, ...parsed };
  } catch (error) {
    console.error("AI migration remediation failed, using fallback:", error);
    return fallbackRemediation(records, issues);
  }
}

function fallbackRemediation(
  records: MigrationRecord[],
  issues: MigrationValidationIssue[]
): MigrationRemediation {
  const critical = issues.filter(i => i.severity === "CRITICAL").length;
  const readiness =
    issues.length === 0 ? "READY" : critical > 0 ? "NOT_READY" : "NEEDS_WORK";

  return {
    aiGenerated: false,
    model: null,
    summary: `Validated ${records.length} record(s) and found ${issues.length} issue(s) (${critical} critical). Set ANTHROPIC_API_KEY to generate an AI remediation plan with tailored reconciliation checks.`,
    overallDataReadiness: readiness,
    prioritizedFixes: issues.map(i => ({
      entityType: i.entityType,
      issue: `${i.field ? `${i.field}: ` : ""}${i.message}`,
      recommendation: i.suggestedFix,
      priority:
        i.severity === "CRITICAL"
          ? "HIGH"
          : i.severity === "HIGH"
          ? "MEDIUM"
          : "LOW"
    })),
    reconciliationChecks: [
      "Reconcile source vs target record counts per entity type.",
      "Validate mandatory fields and typelist mappings.",
      "Run referential integrity and duplicate detection on keys.",
      "Balance financial control totals for billing and claim payments."
    ]
  };
}
