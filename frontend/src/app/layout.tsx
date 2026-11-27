import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClimaGrid // Disaster Command Operations",
  description: "AI-Powered Multi-Hazard Command Operations Platform (AAPDA360 + JEEVAN + HEATSHIELD)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070d1e] text-slate-100 antialiased font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
