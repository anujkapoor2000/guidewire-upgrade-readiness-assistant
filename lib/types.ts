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