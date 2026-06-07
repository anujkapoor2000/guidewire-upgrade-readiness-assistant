"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  ReadinessInput,
  ReadinessResult,
  ReadinessAdvisory,
  IntegrationInventoryItem
} from "@/lib/types";

const defaultInput: ReadinessInput = {
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
};

const numericFields: { key: keyof ReadinessInput; label: string; hint?: string }[] = [
  { key: "customGosuClasses", label: "Custom Gosu classes" },
  { key: "customEntities", label: "Custom entities" },
  { key: "customTypelists", label: "Custom typelists" },
  { key: "customPcfFiles", label: "Custom PCF files" },
  { key: "batchProcesses", label: "Batch processes" },
  { key: "regressionCoveragePercent", label: "Regression coverage %", hint: "0–100" },
  { key: "apiTestCoveragePercent", label: "API test coverage %", hint: "0–100" },
  { key: "dataQualityScorePercent", label: "Data quality score %", hint: "0–100" },
  { key: "knownUpgradeBlockers", label: "Known upgrade blockers" }
];

function scoreClass(score: number) {
  if (score >= 80) return "score-good";
  if (score >= 55) return "score-warn";
  return "score-bad";
}

export default function UpgradeReadinessPage() {
  const [input, setInput] = useState<ReadinessInput>(defaultInput);
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [advisory, setAdvisory] = useState<ReadinessAdvisory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateNumber(key: keyof ReadinessInput, value: string) {
    setInput(prev => ({ ...prev, [key]: Number(value) || 0 }));
  }

  function updateIntegration(
    index: number,
    field: keyof IntegrationInventoryItem,
    value: boolean
  ) {
    setInput(prev => {
      const integrations = prev.integrations.map((it, i) =>
        i === index ? { ...it, [field]: value } : it
      );
      return { ...prev, integrations };
    });
  }

  async function runAssessment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setResult(data.result);
      setAdvisory(data.advisory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="breadcrumb">
        <Link href="/">Home</Link> / Upgrade Readiness Scoring
      </div>
      <div className="page-head">
        <h1>Upgrade Readiness Scoring</h1>
        <p>
          Assess Guidewire upgrade risk across configuration, custom code,
          testing, integrations, and data — then generate an AI steering
          advisory.
        </p>
      </div>

      <section className="card">
        <h2>Programme inputs</h2>
        <div className="form-grid">
          <div className="field">
            <label>Current version</label>
            <input
              type="text"
              value={input.currentVersion}
              onChange={e =>
                setInput({ ...input, currentVersion: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Target version</label>
            <input
              type="text"
              value={input.targetVersion}
              onChange={e =>
                setInput({ ...input, targetVersion: e.target.value })
              }
            />
          </div>
          {numericFields.map(f => (
            <div className="field" key={f.key}>
              <label>
                {f.label}
                {f.hint ? <span className="hint"> ({f.hint})</span> : null}
              </label>
              <input
                type="number"
                value={input[f.key] as number}
                onChange={e => updateNumber(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <h3>Integration inventory</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Integration</th>
                <th>Type</th>
                <th>Criticality</th>
                <th>Has mock</th>
                <th>Has contract test</th>
              </tr>
            </thead>
            <tbody>
              {input.integrations.map((it, i) => (
                <tr key={it.name}>
                  <td>{it.name}</td>
                  <td>
                    <span className="label label-neutral">{it.type}</span>
                  </td>
                  <td>
                    <span className={`label label-${it.criticality.toLowerCase()}`}>
                      {it.criticality}
                    </span>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={it.hasMock}
                      onChange={e =>
                        updateIntegration(i, "hasMock", e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={it.hasContractTest}
                      onChange={e =>
                        updateIntegration(i, "hasContractTest", e.target.checked)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={runAssessment} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? "Assessing…" : "Score & generate AI advisory"}
          </button>
        </div>
        {error ? (
          <div className="banner banner-warning" style={{ marginTop: 12 }}>
            {error}
          </div>
        ) : null}
      </section>

      {result ? (
        <section className="card">
          <h2>Readiness score</h2>
          <div className="score-banner">
            <div className={`score-circle ${scoreClass(result.readinessScore)}`}>
              <span className="value">{result.readinessScore}</span>
              <span className="max">/ 100</span>
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>
                <span className={`label label-${result.riskLevel.toLowerCase()}`}>
                  {result.riskLevel} RISK
                </span>
              </div>
              <p className="muted" style={{ margin: 0 }}>
                {result.findings.length} finding(s) detected across customisation,
                integrations, testing, and data.
              </p>
            </div>
          </div>

          <h3>Findings</h3>
          <div className="stack">
            {result.findings.length === 0 ? (
              <p className="muted">No risk findings — inputs are within thresholds.</p>
            ) : (
              result.findings.map((f, i) => (
                <div className={`finding risk-${f.risk.toLowerCase()}`} key={i}>
                  <h4>
                    {f.area}
                    <span className={`label label-${f.risk.toLowerCase()}`}>
                      {f.risk}
                    </span>
                  </h4>
                  <p>{f.message}</p>
                  <p className="muted">
                    <strong>Recommendation:</strong> {f.recommendation}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}

      {advisory ? (
        <section className="card">
          <h2>
            AI upgrade advisory{" "}
            {advisory.aiGenerated ? (
              <span className="ai-badge">✦ Claude {advisory.model}</span>
            ) : (
              <span className="label label-neutral">Deterministic fallback</span>
            )}
          </h2>

          {!advisory.aiGenerated ? (
            <div className="banner banner-info">
              Set <code>ANTHROPIC_API_KEY</code> to generate a full AI advisory.
              Showing a deterministic summary built from the rule-based findings.
            </div>
          ) : null}

          <div className="btn-row" style={{ marginBottom: 12 }}>
            <span className={`label label-${advisory.goNoGoRecommendation.toLowerCase()}`}>
              {advisory.goNoGoRecommendation.replace("_", " ")}
            </span>
            <span className="label label-neutral">
              Confidence: {advisory.confidence}
            </span>
          </div>

          <p>{advisory.executiveSummary}</p>

          {advisory.keyRisks.length ? (
            <>
              <h3>Key risks</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Risk</th>
                      <th>Business impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advisory.keyRisks.map((r, i) => (
                      <tr key={i}>
                        <td>{r.area}</td>
                        <td>{r.risk}</td>
                        <td className="muted">{r.businessImpact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {advisory.remediationBacklog.length ? (
            <>
              <h3>Remediation backlog</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Item</th>
                      <th>Rationale</th>
                      <th>Effort</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advisory.remediationBacklog.map((r, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`label label-${r.priority.toLowerCase()}`}>
                            {r.priority}
                          </span>
                        </td>
                        <td>{r.title}</td>
                        <td className="muted">{r.rationale}</td>
                        <td>{r.estimatedEffort}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {advisory.sprintPlan.length ? (
            <>
              <h3>Suggested upgrade sprint plan</h3>
              <div className="grid">
                {advisory.sprintPlan.map((s, i) => (
                  <div className="card card-muted" key={i} style={{ margin: 0 }}>
                    <h4 style={{ marginTop: 0 }}>{s.sprint}</h4>
                    <p className="muted" style={{ marginTop: 0 }}>
                      {s.focus}
                    </p>
                    <ul className="checks">
                      {s.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
