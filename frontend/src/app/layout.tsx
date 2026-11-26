import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifeline360 // Disaster Command Operations",
  description: "AI-Powered Multi-Hazard Command Operations Platform (AAPDA360 + JEEVAN + HEATSHIELD)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070d1e] antialiased select-none">{children}</body>
    </html>
  );
}
