import { MigrationRecord, MigrationValidationIssue } from "./types";

export function validateMigrationRecords(records: MigrationRecord[]): MigrationValidationIssue[] {
  const issues: MigrationValidationIssue[] = [];

  for (const record of records) {
    const payload = record.payload;

    if (!record.externalId || record.externalId.trim().length === 0) {
      issues.push({
        externalId: record.externalId || "UNKNOWN",
        entityType: record.entityType,
        severity: "CRITICAL",
        field: "externalId",
        message: "Missing external identifier.",
        suggestedFix: "Populate stable source system identifier before migration."
      });
    }

    if (record.entityType === "Policy") {
      if (!payload.policyNumber) {
        issues.push({
          externalId: record.externalId,
          entityType: record.entityType,
          severity: "CRITICAL",
          field: "policyNumber",
          message: "Policy is missing policy number.",
          suggestedFix: "Derive policy number from source policy master table."
        });
      }

      if (!payload.effectiveDate || !payload.expirationDate) {
        issues.push({
          externalId: record.externalId,
          entityType: record.entityType,
          severity: "HIGH",
          field: "effectiveDate/expirationDate",
          message: "Policy period dates are incomplete.",
          suggestedFix: "Populate effective and expiration dates before loading policy periods."
        });
      }
    }

    if (record.entityType === "Claim") {
      if (!payload.claimNumber) {
        issues.push({
          externalId: record.externalId,
          entityType: record.entityType,
          severity: "CRITICAL",
          field: "claimNumber",
          message: "Claim is missing claim number.",
          suggestedFix: "Map source claim reference to target claim number."
        });
      }

      if (!payload.lossDate) {
        issues.push({
          externalId: record.externalId,
          entityType: record.entityType,
          severity: "HIGH",
          field: "lossDate",
          message: "Claim is missing loss date.",
          suggestedFix: "Backfill loss date from first notice of loss or claim event history."
        });
      }
    }

    if (record.entityType === "Contact") {
      if (!payload.firstName && !payload.organisationName) {
        issues.push({
          externalId: record.externalId,
          entityType: record.entityType,
          severity: "HIGH",
          field: "firstName/organisationName",
          message: "Contact has neither person name nor organisation name.",
          suggestedFix: "Classify contact as person or company and populate the appropriate name fields."
        });
      }

      if (payload.email && typeof payload.email === "string" && !payload.email.includes("@")) {
        issues.push({
          externalId: record.externalId,
          entityType: record.entityType,
          severity: "MEDIUM",
          field: "email",
          message: "Contact email address is invalid.",
          suggestedFix: "Correct malformed email or move it to notes if not a usable email address."
        });
      }
    }
  }

  return issues;
}