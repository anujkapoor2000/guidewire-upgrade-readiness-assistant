"use client";

import Link from "next/link";
import { useState } from "react";

const vendorSamples: Record<string, unknown> = {
  fraud: {
    claimNumber: "CLM-100245",
    lossDate: "2026-04-01",
    claimAmount: 18500,
    policyNumber: "POL-55012"
  },
  document: {
    documentType: "PolicySchedule",
    entityReference: "POL-55012",
    deliveryChannel: "EMAIL"
  },
  payment: {
    payeeId: "PAYEE-9931",
    amount: 4200.5,
    currency: "GBP",
    paymentType: "ClaimIndemnity"
  },
  address: {
    line1: "10 Downing Street",
    city: "London",
    postcode: "sw1a 2aa",
    country: "GB"
  }
};

const scenarios = [
  { value: "normal", label: "Happy path" },
  { value: "timeout", label: "Timeout (5s delay)" },
  { value: "server-error", label: "Server error (500)" },
  { value: "unauthorised", label: "Unauthorised (401)" }
];

const contractSamples: Record<string, unknown> = {
  fraudRequest: {
    claimNumber: "CLM-100245",
    lossDate: "2026-04-01",
    claimAmount: 18500
  },
  paymentRequest: {
    payeeId: "PAYEE-9931",
    amount: 4200.5,
    currency: "GBP"
  },
  documentRequest: {
    documentType: "PolicySchedule",
    entityReference: "POL-55012",
    deliveryChannel: "EMAIL"
  }
};

export default function VendorMocksPage() {
  // Vendor mock state
  const [vendor, setVendor] = useState("fraud");
  const [scenario, setScenario] = useState("normal");
  const [mockBody, setMockBody] = useState(
    JSON.stringify(vendorSamples.fraud, null, 2)
  );
  const [mockResponse, setMockResponse] = useState<string | null>(null);
  const [mockStatus, setMockStatus] = useState<number | null>(null);
  const [mockLoading, setMockLoading] = useState(false);

  // Contract test state
  const [contractName, setContractName] = useState("fraudRequest");
  const [contractPayload, setContractPayload] = useState(
    JSON.stringify(contractSamples.fraudRequest, null, 2)
  );
  const [contractResult, setContractResult] = useState<any>(null);
  const [contractLoading, setContractLoading] = useState(false);

  function onVendorChange(v: string) {
    setVendor(v);
    setMockBody(JSON.stringify(vendorSamples[v] ?? {}, null, 2));
    setMockResponse(null);
    setMockStatus(null);
  }

  function onContractChange(c: string) {
    setContractName(c);
    setContractPayload(JSON.stringify(contractSamples[c] ?? {}, null, 2));
    setContractResult(null);
  }

  async function sendMock() {
    setMockLoading(true);
    setMockResponse(null);
    try {
      const body = JSON.parse(mockBody);
      const url =
        `/api/mocks/vendor/${vendor}` +
        (scenario !== "normal" ? `?scenario=${scenario}` : "");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      setMockStatus(res.status);
      const data = await res.json();
      setMockResponse(JSON.stringify(data, null, 2));
    } catch (e) {
      setMockResponse(
        e instanceof Error ? `Invalid JSON: ${e.message}` : "Request failed"
      );
    } finally {
      setMockLoading(false);
    }
  }

  async function runContract() {
    setContractLoading(true);
    setContractResult(null);
    try {
      const payload = JSON.parse(contractPayload);
      const res = await fetch("/api/contracts/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractName, payload })
      });
      setContractResult(await res.json());
    } catch (e) {
      setContractResult({
        status: "ERROR",
        error: e instanceof Error ? e.message : "Request failed"
      });
    } finally {
      setContractLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="breadcrumb">
        <Link href="/">Home</Link> / Vendor Mocks &amp; Contract Tests
      </div>
      <div className="page-head">
        <h1>Vendor Integration Mocks &amp; Contract Tests</h1>
        <p>
          Simulate vendor endpoints and validate Guidewire integration payloads
          against agreed contracts.
        </p>
      </div>

      <section className="card">
        <h2>Vendor mock</h2>
        <div className="form-grid">
          <div className="field">
            <label>Vendor</label>
            <select value={vendor} onChange={e => onVendorChange(e.target.value)}>
              <option value="fraud">Fraud scoring</option>
              <option value="document">Document generation</option>
              <option value="payment">Payment</option>
              <option value="address">Address validation</option>
            </select>
          </div>
          <div className="field">
            <label>Scenario</label>
            <select value={scenario} onChange={e => setScenario(e.target.value)}>
              {scenarios.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Request body</label>
          <textarea
            rows={8}
            value={mockBody}
            onChange={e => setMockBody(e.target.value)}
          />
        </div>
        <div className="btn-row">
          <button className="btn btn-accent" onClick={sendMock} disabled={mockLoading}>
            {mockLoading ? <span className="spinner" /> : null}
            {mockLoading ? "Sending…" : "Send mock request"}
          </button>
        </div>

        {mockResponse ? (
          <>
            <h3>
              Response{" "}
              {mockStatus !== null ? (
                <span
                  className={`label label-${
                    mockStatus < 300 ? "success" : "danger"
                  }`}
                >
                  HTTP {mockStatus}
                </span>
              ) : null}
            </h3>
            <pre className="output">{mockResponse}</pre>
          </>
        ) : null}
      </section>

      <section className="card">
        <h2>Contract test</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Validate an outbound payload against a JSON Schema contract. Edit the
          payload to introduce a violation and re-run.
        </p>
        <div className="form-grid">
          <div className="field">
            <label>Contract</label>
            <select
              value={contractName}
              onChange={e => onContractChange(e.target.value)}
            >
              <option value="fraudRequest">fraudRequest</option>
              <option value="paymentRequest">paymentRequest</option>
              <option value="documentRequest">documentRequest</option>
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Payload</label>
          <textarea
            rows={8}
            value={contractPayload}
            onChange={e => setContractPayload(e.target.value)}
          />
        </div>
        <div className="btn-row">
          <button
            className="btn btn-accent"
            onClick={runContract}
            disabled={contractLoading}
          >
            {contractLoading ? <span className="spinner" /> : null}
            {contractLoading ? "Validating…" : "Run contract test"}
          </button>
        </div>

        {contractResult ? (
          <>
            <h3>
              Result{" "}
              <span
                className={`label label-${
                  contractResult.status === "PASS" ? "pass" : "fail"
                }`}
              >
                {contractResult.status}
              </span>
            </h3>
            {contractResult.errors && contractResult.errors.length ? (
              <div className="table-wrap" style={{ marginBottom: 12 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Path</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractResult.errors.map((err: any, i: number) => (
                      <tr key={i}>
                        <td>
                          <code>{err.instancePath || "(root)"}</code>
                        </td>
                        <td>
                          {err.message}
                          {err.params
                            ? ` — ${JSON.stringify(err.params)}`
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <pre className="output">
              {JSON.stringify(contractResult, null, 2)}
            </pre>
          </>
        ) : null}
      </section>
    </main>
  );
}
