import { ReadinessInput, MigrationRecord } from "./types";

// ---------------------------------------------------------------------------
// Upgrade readiness presets
// ---------------------------------------------------------------------------

export type ReadinessPreset = {
  id: string;
  label: string;
  description: string;
  input: ReadinessInput;
};

export const readinessPresets: ReadinessPreset[] = [
  {
    id: "cloud-ready",
    label: "Cloud-ready",
    description: "Low risk — disciplined customisation, strong coverage",
    input: {
      currentVersion: "ClaimCenter 10",
      targetVersion: "Guidewire Cloud",
      applications: ["ClaimCenter"],
      customGosuClasses: 80,
      customEntities: 2,
      customTypelists: 6,
      customPcfFiles: 40,
      batchProcesses: 6,
      regressionCoveragePercent: 88,
      apiTestCoveragePercent: 82,
      dataQualityScorePercent: 94,
      knownUpgradeBlockers: 0,
      integrations: [
        { name: "Fraud Scoring", type: "REST", criticality: "HIGH", hasContractTest: true, hasMock: true },
        { name: "Document Generation", type: "REST", criticality: "HIGH", hasContractTest: true, hasMock: true },
        { name: "Data Warehouse Extract", type: "FILE", criticality: "MEDIUM", hasContractTest: true, hasMock: true }
      ]
    }
  },
  {
    id: "typical",
    label: "Typical programme",
    description: "Medium risk — gaps in coverage and contracts",
    input: {
      currentVersion: "InsuranceSuite 10",
      targetVersion: "Guidewire Cloud",
      applications: ["PolicyCenter", "ClaimCenter", "BillingCenter"],
      customGosuClasses: 420,
      customEntities: 12,
      customTypelists: 34,
      customPcfFiles: 260,
      batchProcesses: 18,
      regressionCoveragePercent: 62,
      apiTestCoveragePercent: 48,
      dataQualityScorePercent: 79,
      knownUpgradeBlockers: 2,
      integrations: [
        { name: "Fraud Scoring", type: "REST", criticality: "HIGH", hasContractTest: false, hasMock: true },
        { name: "Document Generation", type: "REST", criticality: "HIGH", hasContractTest: true, hasMock: false },
        { name: "Data Warehouse Extract", type: "FILE", criticality: "MEDIUM", hasContractTest: false, hasMock: false }
      ]
    }
  },
  {
    id: "heavy-customisation",
    label: "Heavy customisation",
    description: "High risk — large footprint, low coverage, open blockers",
    input: {
      currentVersion: "InsuranceSuite 9",
      targetVersion: "Guidewire Cloud",
      applications: ["PolicyCenter", "ClaimCenter", "BillingCenter"],
      customGosuClasses: 620,
      customEntities: 18,
      customTypelists: 48,
      customPcfFiles: 360,
      batchProcesses: 24,
      regressionCoveragePercent: 55,
      apiTestCoveragePercent: 40,
      dataQualityScorePercent: 71,
      knownUpgradeBlockers: 3,
      integrations: [
        { name: "Fraud Scoring", type: "REST", criticality: "HIGH", hasContractTest: false, hasMock: false },
        { name: "Payment Gateway", type: "REST", criticality: "HIGH", hasContractTest: false, hasMock: true },
        { name: "Broker Portal", type: "SOAP", criticality: "HIGH", hasContractTest: false, hasMock: false },
        { name: "Data Warehouse Extract", type: "FILE", criticality: "MEDIUM", hasContractTest: false, hasMock: false }
      ]
    }
  }
];

// ---------------------------------------------------------------------------
// Data migration presets
// ---------------------------------------------------------------------------

export type MigrationPreset = {
  id: string;
  label: string;
  description: string;
  records: MigrationRecord[];
};

export const migrationPresets: MigrationPreset[] = [
  {
    id: "clean",
    label: "Clean dataset",
    description: "All records valid — no issues expected",
    records: [
      {
        sourceSystem: "LegacyPAS",
        entityType: "Policy",
        externalId: "POL-55012",
        payload: {
          policyNumber: "POL-55012",
          effectiveDate: "2026-01-01",
          expirationDate: "2027-01-01"
        }
      },
      {
        sourceSystem: "LegacyClaims",
        entityType: "Claim",
        externalId: "CLM-100245",
        payload: { claimNumber: "CLM-100245", lossDate: "2026-04-01" }
      },
      {
        sourceSystem: "CRM",
        entityType: "Contact",
        externalId: "CON-7781",
        payload: { firstName: "Alex", email: "alex@example.com" }
      }
    ]
  },
  {
    id: "defects",
    label: "Common defects",
    description: "Incomplete dates, malformed email, missing loss date",
    records: [
      {
        sourceSystem: "LegacyPAS",
        entityType: "Policy",
        externalId: "POL-55013",
        payload: { policyNumber: "POL-55013", effectiveDate: "2026-02-01" }
      },
      {
        sourceSystem: "LegacyClaims",
        entityType: "Claim",
        externalId: "CLM-100246",
        payload: { claimNumber: "CLM-100246" }
      },
      {
        sourceSystem: "CRM",
        entityType: "Contact",
        externalId: "CON-7782",
        payload: { firstName: "Sam", email: "sam-at-example.com" }
      }
    ]
  },
  {
    id: "blockers",
    label: "Critical blockers",
    description: "Missing identifiers and key numbers — must fix first",
    records: [
      {
        sourceSystem: "LegacyPAS",
        entityType: "Policy",
        externalId: "POL-55014",
        payload: { effectiveDate: "2026-03-01" }
      },
      {
        sourceSystem: "LegacyClaims",
        entityType: "Claim",
        externalId: "",
        payload: { lossDate: "2026-04-01" }
      },
      {
        sourceSystem: "CRM",
        entityType: "Contact",
        externalId: "CON-7783",
        payload: { email: "broken-email.example.com" }
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Contract test example payloads
// ---------------------------------------------------------------------------

export const contractExamples: Record<
  string,
  { valid: unknown; invalid: unknown; invalidNote: string }
> = {
  fraudRequest: {
    valid: { claimNumber: "CLM-100245", lossDate: "2026-04-01", claimAmount: 18500 },
    invalid: { claimNumber: "CLM-100245" },
    invalidNote: "Missing required lossDate and claimAmount"
  },
  paymentRequest: {
    valid: { payeeId: "PAYEE-9931", amount: 4200.5, currency: "GBP" },
    invalid: { payeeId: "PAYEE-9931", amount: -10, currency: "YEN" },
    invalidNote: "Negative amount and an unsupported currency enum value"
  },
  documentRequest: {
    valid: { documentType: "PolicySchedule", entityReference: "POL-55012", deliveryChannel: "EMAIL" },
    invalid: { documentType: "PolicySchedule", deliveryChannel: "FAX" },
    invalidNote: "Missing entityReference and an invalid deliveryChannel"
  }
};
