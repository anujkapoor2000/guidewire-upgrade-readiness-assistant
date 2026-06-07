import { ReadinessInput, ReadinessResult, ReadinessFinding, RiskLevel } from "./types";

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "HIGH";
  return "CRITICAL";
}

export function calculateReadiness(input: ReadinessInput): ReadinessResult {
  const findings: ReadinessFinding[] = [];

  let score = 100;

  const customisationLoad =
    input.customGosuClasses * 0.05 +
    input.customEntities * 1.5 +
    input.customTypelists * 0.5 +
    input.customPcfFiles * 0.08;

  score -= Math.min(customisationLoad, 25);

  if (customisationLoad > 15) {
    findings.push({
      area: "Customisation",
      risk: "HIGH",
      message: "High customisation footprint detected across Gosu, entities, typelists, or PCF files.",
      recommendation:
        "Prioritise custom code compatibility review, deprecated API checks, and regression coverage for customised flows."
    });
  }

  const criticalIntegrations = input.integrations.filter(i => i.criticality === "HIGH");
  const untestedCriticalIntegrations = criticalIntegrations.filter(
    i => !i.hasContractTest || !i.hasMock
  );

  score -= untestedCriticalIntegrations.length * 7;

  if (untestedCriticalIntegrations.length > 0) {
    findings.push({
      area: "Integrations",
      risk: "CRITICAL",
      message: `${untestedCriticalIntegrations.length} critical integrations do not have both mocks and contract tests.`,
      recommendation:
        "Create vendor mocks and schema based contract tests before entering upgrade system testing."
    });
  }

  if (input.regressionCoveragePercent < 70) {
    score -= 12;
    findings.push({
      area: "Testing",
      risk: "HIGH",
      message: "Regression coverage is below the recommended threshold.",
      recommendation:
        "Expand regression coverage for quote, bind, endorsement, FNOL, claim payment, renewal, cancellation, and billing flows."
    });
  }

  if (input.apiTestCoveragePercent < 60) {
    score -= 10;
    findings.push({
      area: "API testing",
      risk: "HIGH",
      message: "API test coverage is low for integration and digital channels.",
      recommendation:
        "Introduce API tests for inbound and outbound Guidewire Cloud API interactions."
    });
  }

  if (input.dataQualityScorePercent < 85) {
    score -= 15;
    findings.push({
      area: "Data migration",
      risk: "HIGH",
      message: "Data quality score is below migration readiness threshold.",
      recommendation:
        "Run profiling, mandatory field checks, typelist validation, referential integrity checks, and reconciliation dry runs."
    });
  }

  if (input.knownUpgradeBlockers > 0) {
    score -= input.knownUpgradeBlockers * 8;
    findings.push({
      area: "Known blockers",
      risk: "CRITICAL",
      message: `${input.knownUpgradeBlockers} known upgrade blockers are open.`,
      recommendation:
        "Resolve blockers before committing to upgrade execution or production cutover dates."
    });
  }

  score = Math.max(0, Math.round(score));

  return {
    readinessScore: score,
    riskLevel: riskFromScore(score),
    findings,
    recommendedNextActions: [
      "Complete integration inventory and classify criticality.",
      "Create mocks for all high criticality vendors.",
      "Add contract tests for all high criticality REST, SOAP, file, and event integrations.",
      "Run data profiling on source policy, claim, account, contact, and billing datasets.",
      "Agree upgrade entry and exit criteria with architecture, testing, data, and business owners."
    ]
  };
}