import Link from "next/link";

const features = [
  {
    href: "/upgrade-readiness",
    icon: "📊",
    title: "Upgrade Readiness Scoring",
    description:
      "Score upgrade risk across custom code, integrations, testing, and data — then generate an AI go/no-go advisory with a remediation backlog and sprint plan."
  },
  {
    href: "/vendor-mocks",
    icon: "🔌",
    title: "Vendor Mocks & Contract Tests",
    description:
      "Simulate vendor endpoints (fraud, document, payment, address) with happy-path and failure scenarios, and validate integration payloads against agreed contracts."
  },
  {
    href: "/data-migration",
    icon: "🗄️",
    title: "Data Migration Assist",
    description:
      "Validate source-to-target migration records for Guidewire entities and produce an AI remediation plan with reconciliation and balancing checks."
  }
];

export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Guidewire Upgrade Readiness Assistant</h1>
        <p>
          Assess InsuranceSuite upgrade and cloud-migration risk before
          committing to a delivery plan. Combine deterministic scoring with
          AI-generated steering recommendations.
        </p>
        <div className="btn-row">
          <Link href="/upgrade-readiness" className="btn btn-primary">
            Run a readiness assessment
          </Link>
          <Link href="/vendor-mocks" className="btn">
            Explore vendor mocks
          </Link>
        </div>
      </section>

      <div className="grid">
        {features.map(f => (
          <Link key={f.href} href={f.href} className="feature-card">
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </Link>
        ))}
      </div>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>How it works</h2>
        <p className="muted">
          A rule engine computes a 0–100 readiness index and risk findings from
          your customisation footprint, integration inventory, test coverage,
          and data quality. Claude then turns that evidence into an executive
          summary, a go/no-go recommendation, a prioritised remediation backlog,
          and a suggested upgrade sprint plan. Set the{" "}
          <code>ANTHROPIC_API_KEY</code> environment variable to enable the AI
          features — without it, the app falls back to deterministic summaries so
          every screen still works.
        </p>
      </section>
    </main>
  );
}
