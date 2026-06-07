// app/page.tsx

"use client";

import Link from "next/link";
import { useState } from "react";

const sampleInput = {
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
    {
      name: "Fraud Scoring",
      type: "REST",
      criticality: "HIGH",
      hasContractTest: false,
      hasMock: true
    },
    {
      name: "Document Generation",
      type: "REST",
      criticality: "HIGH",
      hasContractTest: true,
      hasMock: false
    },
    {
      name: "Data Warehouse Extract",
      type: "FILE",
      criticality: "MEDIUM",
      hasContractTest: false,
      hasMock: false
    }
  ]
};

export default function HomePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runAssessment() {
    setLoading(true);

    const response = await fetch("/api/readiness/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sampleInput)
    });

    const data = await response.json();

    setResult(data);
    setLoading(false);
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>Guidewire Upgrade Readiness Assistant</h1>
        <p>
          Assess upgrade risk across custom code, integrations, testing, and data migration.
        </p>

        <nav className="navLinks">
          <Link href="/upgrade-readiness">Upgrade Readiness Scoring</Link>
          <Link href="/vendor-mocks">Vendor Mocks and Contract Tests</Link>
          <Link href="/data-migration">Data Migration Assist</Link>
        </nav>

        <button onClick={runAssessment} disabled={loading}>
          {loading ? "Assessing..." : "Run sample readiness assessment"}
        </button>
      </section>

      {result && (
        <section className="card">
          <h2>Readiness score: {result.readinessScore}</h2>
          <p>
            <strong>Risk level:</strong> {result.riskLevel}
          </p>

          <h3>Findings</h3>
          <div className="grid">
            {result.findings.map((finding: any, index: number) => (
              <div className="finding" key={index}>
                <h4>{finding.area}</h4>
                <p>
                  <strong>Risk:</strong> {finding.risk}
                </p>
                <p>{finding.message}</p>
                <p>
                  <strong>Recommendation:</strong> {finding.recommendation}
                </p>
              </div>
            ))}
          </div>

          <h3>Recommended next actions</h3>
          <ol>
            {result.recommendedNextActions.map((action: string, index: number) => (
              <li key={index}>{action}</li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
