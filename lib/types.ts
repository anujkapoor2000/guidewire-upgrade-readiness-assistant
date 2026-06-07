export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReadinessInput = {
  currentVersion: string;
  targetVersion: string;
  applications: string[];
  customGosuClasses: number;
  customEntities: number;
  customTypelists: number;
  customPcfFiles: number;
  integrations: IntegrationInventoryItem[];
  batchProcesses: number;
  regressionCoveragePercent: number;
  apiTestCoveragePercent: number;
  dataQualityScorePercent: number;
  knownUpgradeBlockers: number;
};

export type IntegrationInventoryItem = {
  name: string;
  type: "REST" | "SOAP" | "FILE" | "EVENT" | "DB";
  criticality: "LOW" | "MEDIUM" | "HIGH";
  hasContractTest: boolean;
  hasMock: boolean;
};

export type ReadinessFinding = {
  area: string;
  risk: RiskLevel;
  message: string;
  recommendation: string;
};

export type ReadinessResult = {
  readinessScore: number;
  riskLevel: RiskLevel;
  findings: ReadinessFinding[];
  recommendedNextActions: string[];
};

export type MigrationRecord = {
  sourceSystem: string;
  entityType: "Account" | "Policy" | "Claim" | "Exposure" | "Contact" | "BillingAccount";
  externalId: string;
  payload: Record<string, unknown>;
};

export type MigrationValidationIssue = {
  externalId: string;
  entityType: string;
  severity: RiskLevel;
  field?: string;
  message: string;
  suggestedFix: string;
};

// AI advisor outputs -------------------------------------------------------

export type GoNoGo = "GO" | "CONDITIONAL_GO" | "NO_GO";

export type RemediationItem = {
  title: string;
  priority: "P0" | "P1" | "P2" | "P3";
  rationale: string;
  estimatedEffort: string;
};

export type SprintPlanItem = {
  sprint: string;
  focus: string;
  items: string[];
};

export type AdvisoryKeyRisk = {
  area: string;
  risk: string;
  businessImpact: string;
};

export type ReadinessAdvisory = {
  aiGenerated: boolean;
  model: string | null;
  executiveSummary: string;
  goNoGoRecommendation: GoNoGo;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  keyRisks: AdvisoryKeyRisk[];
  remediationBacklog: RemediationItem[];
  sprintPlan: SprintPlanItem[];
};

export type MigrationFix = {
  entityType: string;
  issue: string;
  recommendation: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

export type MigrationRemediation = {
  aiGenerated: boolean;
  model: string | null;
  summary: string;
  overallDataReadiness: "READY" | "NEEDS_WORK" | "NOT_READY";
  prioritizedFixes: MigrationFix[];
  reconciliationChecks: string[];
};

// Risk heatmap -------------------------------------------------------------

export type HeatmapDimension =
  | "Custom code"
  | "Data"
  | "Integration"
  | "Testing"
  | "Security"
  | "Environments";

export type HeatmapCell = {
  dimension: HeatmapDimension;
  score: number; // 0-100, higher = healthier
  risk: RiskLevel;
  note: string;
  heuristic: boolean;
};