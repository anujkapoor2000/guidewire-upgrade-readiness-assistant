import "./globals.css";

export const metadata = {
  title: "Guidewire Upgrade Readiness Assistant",
  description: "Upgrade readiness, vendor mocks, contract tests, and data migration validation for Guidewire programmes."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}