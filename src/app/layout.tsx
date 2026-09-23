import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "DASH · Agent Insights",
  description: "Grounded delivery insights from the Guardians PoC Jira board.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
