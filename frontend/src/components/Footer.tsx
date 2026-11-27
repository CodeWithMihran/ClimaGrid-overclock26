'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, HeartHandshake, FileText, Download, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#1c1c1c] border-t border-[#e9e9e7] dark:border-[#2e2e2e] text-[#575653] dark:text-[#a8a7a4] text-xs font-sans transition-colors duration-200 mt-12">
      <div className="max-w-[1850px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        
        {/* Top Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#2f2e2b] dark:bg-[#2e2e2e] text-white flex items-center justify-center">
                <Compass className="w-4 h-4 text-sky-400" />
              </div>
              <span className="font-extrabold text-lg text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                CLIMA<span className="text-sky-600 dark:text-sky-400">GRID</span>
              </span>
              <span className="bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full">
                v2.4 PRODUCTION
              </span>
            </div>
            <p className="text-sm text-[#787774] dark:text-[#9b9a97] leading-relaxed max-w-md">
              Decoupled, multi-hazard disaster intelligence and climate resilience operating system engineered for the Roorkee–Haridwar basin. Unifying predictive hydrodynamics, multilingual distress triage, and emergency supply logistics.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ganga Basin Telemetry Mesh: Solani, Purqazi, IIT Roorkee, Haridwar</span>
            </div>
          </div>

          {/* Core Modules Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-[#2f2e2b] dark:text-white uppercase tracking-wider text-[11px] font-mono">
              Emergency Response
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Multi-Hazard Live Dispatch (SW-01)
                </Link>
              </li>
              <li>
                <Link href="/flood" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Predictive Flood Inundation
                </Link>
              </li>
              <li>
                <Link href="/shelters" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Relief Camps & Logistics
                </Link>
              </li>
              <li>
                <Link href="/siren" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  CAP Cell Broadcast Siren
                </Link>
              </li>
            </ul>
          </div>

          {/* Mitigation & Climate Links */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-[#2f2e2b] dark:text-white uppercase tracking-wider text-[11px] font-mono">
              Mitigation & Adaptation
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/damage" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Autonomous Drone Damage & SDRF
                </Link>
              </li>
              <li>
                <Link href="/water" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  JEEVAN Water Safety
                </Link>
              </li>
              <li>
                <Link href="/heat" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  HEATSHIELD Heat Resilience
                </Link>
              </li>
              <li>
                <Link href="/citizen" target="_blank" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1">
                  <span>Citizen SOS Client</span>
                  <ExternalLink className="w-3 h-3 text-rose-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Hackathon Resources */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-[#2f2e2b] dark:text-white uppercase tracking-wider text-[11px] font-mono">
              Hackathon Artifacts
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/architecture" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Cloud Architecture & SLAs
                </Link>
              </li>
              <li>
                <a
                  href="/CLIMAGRID_HACKATHON_PRESENTATION.pptx"
                  download="CLIMAGRID_HACKATHON_PRESENTATION.pptx"
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pitch Deck (.pptx)</span>
                </a>
              </li>
              <li>
                <a
                  href="/CLIMAGRID_TECH_STACK_AND_ARCHITECTURE.pdf"
                  target="_blank"
                  download="CLIMAGRID_TECH_STACK_AND_ARCHITECTURE.pdf"
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  <span>Technical Paper (.pdf)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Badges, Standards & Attribution */}
        <div className="pt-6 border-t border-[#e9e9e7] dark:border-[#2e2e2e] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#f7f6f3] dark:bg-[#252525] px-2.5 py-1 rounded-md border border-[#e3e2e0] dark:border-[#383838]">
              ITU-T X.1303 / OASIS CAP 1.2
            </span>
            <span className="bg-[#f7f6f3] dark:bg-[#252525] px-2.5 py-1 rounded-md border border-[#e3e2e0] dark:border-[#383838]">
              MHA SDRF Norms
            </span>
            <span className="bg-[#f7f6f3] dark:bg-[#252525] px-2.5 py-1 rounded-md border border-[#e3e2e0] dark:border-[#383838]">
              WHO Water Potability Standards
            </span>
            <span className="bg-[#f7f6f3] dark:bg-[#252525] px-2.5 py-1 rounded-md border border-[#e3e2e0] dark:border-[#383838]">
              NDMA Wet-Bulb Guidelines
            </span>
          </div>

          <div className="text-[#8c8a85] dark:text-[#787774]">
            ClimaGrid © 2026 • Overclock &apos;26 Hackathon (RIT Roorkee)
          </div>
        </div>

      </div>
    </footer>
  );
};
