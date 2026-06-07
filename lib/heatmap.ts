import { ReadinessInput, HeatmapCell, RiskLevel } from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Higher health score = lower risk.
function riskFromHealth(score: number): RiskLevel {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "HIGH";
  return "CRITICAL";
}

/**
 * Build the six-dimension upgrade risk heatmap (custom code, data, integration,
 * testing, security, environments). Custom code, data, integration, and testing
 * are derived directly from programme inputs; security and environments are
 * lightweight heuristics in this prototype (flagged with `heuristic: true`).
 */
export function buildHeatmap(input: ReadinessInput): HeatmapCell[] {
  // Custom code — same customisation load model as the readiness score.
  const customLoad =
    input.customGosuClasses * 0.05 +
    input.customEntities * 1.5 +
    input.customTypelists * 0.5 +
    input.customPcfFiles * 0.08;
  const customHealth = clamp(100 - customLoad);

  // Integration — share of HIGH-criticality integrations with both a mock and
  // a contract test (falls back to all integrations when none are HIGH).
  const critical = input.integrations.filter(i => i.criticality === "HIGH");
  const pool = critical.length ? critical : input.integrations;
  const covered = pool.filter(i => i.hasMock && i.hasContractTest).length;
  const integrationHealth = pool.length
    ? clamp((covered / pool.length) * 100)
    : 100;

  // Testing — average of regression and API coverage.
  const testingHealth = clamp(
    (input.regressionCoveragePercent + input.apiTestCoveragePercent) / 2
  );

  // Security (heuristic) — untested critical integrations expose auth/contract
  // failure handling; open blockers reduce confidence.
  const untestedCritical = critical.filter(
    i => !i.hasMock || !i.hasContractTest
  ).length;
  const securityHealth = clamp(
    100 - untestedCritical * 15 - (input.knownUpgradeBlockers > 0 ? 10 : 0)
  );

  // Environments (heuristic) — batch volume and application count proxy the
  // environment/cutover complexity.
  const environmentsHealth = clamp(
    100 - input.batchProcesses * 2 - (input.applications.length - 1) * 5
  );

  const cells: HeatmapCell[] = [
    {
      dimension: "Custom code",
      score: customHealth,
      risk: riskFromHealth(customHealth),
      note: `${input.customGosuClasses} Gosu, ${input.customEntities} entities, ${input.customTypelists} typelists, ${input.customPcfFiles} PCF files.`,
      heuristic: false
    },
    {
      dimension: "Data",
      score: clamp(input.dataQualityScorePercent),
      risk: riskFromHealth(input.dataQualityScorePercent),
      note: `Data quality score ${input.dataQualityScorePercent}%.`,
      heuristic: false
    },
    {
      dimension: "Integration",
      score: integrationHealth,
      risk: riskFromHealth(integrationHealth),
      note: `${covered}/${pool.length} ${
        critical.length ? "critical " : ""
      }integrations have both a mock and a contract test.`,
      heuristic: false
    },
    {
      dimension: "Testing",
      score: testingHealth,
      risk: riskFromHealth(testingHealth),
      note: `Regression ${input.regressionCoveragePercent}%, API ${input.apiTestCoveragePercent}%.`,
      heuristic: false
    },
    {
      dimension: "Security",
      score: securityHealth,
      risk: riskFromHealth(securityHealth),
      note: `${untestedCritical} critical integration(s) without full mock + contract coverage; ${input.knownUpgradeBlockers} open blocker(s).`,
      heuristic: true
    },
    {
      dimension: "Environments",
      score: environmentsHealth,
      risk: riskFromHealth(environmentsHealth),
      note: `${input.batchProcesses} batch process(es) across ${input.applications.length} application(s).`,
      heuristic: true
    }
  ];

  return cells;
}
