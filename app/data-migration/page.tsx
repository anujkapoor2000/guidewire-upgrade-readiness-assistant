// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <h1>Guidewire Upgrade Readiness Assistant</h1>

      <nav>
        <ul>
          <li>
            <Link href="/upgrade-readiness">Upgrade Readiness Scoring</Link>
          </li>
          <li>
            <Link href="/vendor-mocks">Vendor Integration Mocks and Contract Tests</Link>
          </li>
          <li>
            <Link href="/data-migration">Data Migration Assist</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}