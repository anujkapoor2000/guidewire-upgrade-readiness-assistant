import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Guidewire Upgrade Readiness Assistant",
  description:
    "AI-assisted upgrade readiness scoring, vendor mocks, contract tests, and data migration validation for Guidewire programmes."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="app-header-inner">
            <Link href="/" className="app-brand">
              <span className="mark">⬡</span>
              Guidewire Upgrade Readiness Assistant
            </Link>
            <nav className="app-nav">
              <Link href="/upgrade-readiness">Readiness</Link>
              <Link href="/vendor-mocks">Vendor Mocks</Link>
              <Link href="/data-migration">Data Migration</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="app-footer">
          <div className="app-footer-inner">
            <span>
              Prototype delivery accelerator for Guidewire InsuranceSuite cloud
              upgrades.
            </span>
            <span>AI features powered by Claude.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
