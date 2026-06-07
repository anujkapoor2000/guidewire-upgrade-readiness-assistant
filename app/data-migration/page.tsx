"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  MigrationValidationIssue,
  MigrationRemediation
} from "@/lib/types";

const sampleRecords = [
  {
    sourceSystem: "LegacyPAS",
    entityType: "Policy",
    externalId: "POL-55012",
    payload: { policyNumber: "POL-55012", effectiveDate: "2026-01-01" }
  },
  {
    sourceSystem: "LegacyClaims",
    entityType: "Claim",
    externalId: "CLM-100245",
    payload: { lossDate: "2026-04-01" }
  },
  {
    sourceSystem: "CRM",
    entityType: "Contact",
    externalId: "",
    payload: { email: "broken-email.example.com" }
  }
];

export default function DataMigrationPage() {
  const [recordsText, setRecordsText] = useState(
    JSON.stringify(sampleRecords, null, 2)
  );
  const [issues, setIssues] = useState<MigrationValidationIssue[] | null>(null);
  const [remediation, setRemediation] = useState<MigrationRemediation | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function validate() {
    setLoading(true);
    setError(null);
    setIssues(null);
    setRemediation(null);
    try {
      const records = JSON.parse(recordsText);
      const res = await fetch("/api/ai/migration-remediation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records })
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json();
      setIssues(data.issues);
      setRemediation(data.remediation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="breadcrumb">
        <Link href="/">Home</Link> / Data Migration Assist
      </div>
      <div className="page-head">
        <h1>Data Migration Assist</h1>
        <p>
          Validate source-to-target migration records for Guidewire entities and
          generate an AI remediation plan.
        </p>
      </div>

      <section className="card">
        <h2>Candidate migration records</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Supported entity types: Account, Policy, Claim, Exposure, Contact,
          BillingAccount. Edit the JSON to test different scenarios.
        </p>
        <div className="field">
          <textarea
            rows={16}
            value={recordsText}
            onChange={e => setRecordsText(e.target.value)}
          />
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={validate} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? "Validating…" : "Validate & generate remediation"}
          </button>
        </div>
        {error ? (
          <div className="banner banner-warning" style={{ marginTop: 12 }}>
            {error}
          </div>
        ) : null}
      </section>

      {issues ? (
        <section className="card">
          <h2>
            Validation issues{" "}
            <span
              className={`label label-${issues.length === 0 ? "success" : "danger"}`}
            >
              {issues.length} found
            </span>
          </h2>
          {issues.length === 0 ? (
            <p className="muted">No validation issues detected.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>External ID</th>
                    <th>Entity</th>
                    <th>Severity</th>
                    <th>Field</th>
                    <th>Issue</th>
                    <th>Suggested fix</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((it, i) => (
                    <tr key={i}>
                      <td>
                        <code>{it.externalId || "—"}</code>
                      </td>
                      <td>{it.entityType}</td>
                      <td>
                        <span className={`label label-${it.severity.toLowerCase()}`}>
                          {it.severity}
                        </span>
                      </td>
                      <td>
                        <code>{it.field ?? "—"}</code>
                      </td>
                      <td>{it.message}</td>
                      <td className="muted">{it.suggestedFix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {remediation ? (
        <section className="card">
          <h2>
            AI remediation plan{" "}
            {remediation.aiGenerated ? (
              <span className="ai-badge">✦ Claude {remediation.model}</span>
            ) : (
              <span className="label label-neutral">Deterministic fallback</span>
            )}
          </h2>

          {!remediation.aiGenerated ? (
            <div className="banner banner-info">
              Set <code>ANTHROPIC_API_KEY</code> to generate an AI remediation
              plan. Showing a deterministic summary built from the rule-based
              issues.
            </div>
          ) : null}

          <div className="btn-row" style={{ marginBottom: 12 }}>
            <span
              className={`label label-${remediation.overallDataReadiness.toLowerCase()}`}
            >
              {remediation.overallDataReadiness.replace("_", " ")}
            </span>
          </div>
          <p>{remediation.summary}</p>

          {remediation.prioritizedFixes.length ? (
            <>
              <h3>Prioritised fixes</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Entity</th>
                      <th>Issue</th>
                      <th>Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remediation.prioritizedFixes.map((f, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`label label-${f.priority.toLowerCase()}`}>
                            {f.priority}
                          </span>
                        </td>
                        <td>{f.entityType}</td>
                        <td>{f.issue}</td>
                        <td className="muted">{f.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {remediation.reconciliationChecks.length ? (
            <>
              <h3>Reconciliation &amp; balancing checks</h3>
              <ul className="checks">
                {remediation.reconciliationChecks.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
