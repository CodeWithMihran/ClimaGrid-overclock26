'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Map, 
  Waves, 
  Home, 
  Megaphone, 
  Camera, 
  Droplets, 
  Flame, 
  Cpu, 
  Smartphone,
  Radio,
  Clock
} from 'lucide-react';
import { LiveTelemetryTicker } from './LiveTelemetryTicker';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Live Dispatch (SW-01)', icon: Map, color: 'text-cyan-400' },
    { href: '/flood', label: 'Predictive Flood', icon: Waves, color: 'text-blue-400' },
    { href: '/shelters', label: 'Relief Shelters & Warehouses', icon: Home, color: 'text-emerald-400' },
    { href: '/siren', label: 'CAP Siren Broadcast', icon: Megaphone, color: 'text-rose-400' },
    { href: '/damage', label: 'Drone Damage & SDRF', icon: Camera, color: 'text-amber-400' },
    { href: '/water', label: 'Water Safety (JEEVAN)', icon: Droplets, color: 'text-cyan-300' },
    { href: '/heat', label: 'Heat Resilience', icon: Flame, color: 'text-orange-400' },
    { href: '/architecture', label: 'Cloud Architecture', icon: Cpu, color: 'text-purple-400' },
  ];

  return (
    <header className="bg-[#0b132b]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      {/* Top Main Navigation Bar */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & EOC Live Tag */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/60 group-hover:border-cyan-400 transition-colors">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-wider text-white">
                CLIMA<span className="text-cyan-400">GRID</span>
              </h1>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE EOC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Roorkee - Haridwar Multi-Hazard Basin Operations</p>
          </div>
        </Link>

        {/* Navigation Links (Scrollable on tablet/laptop, clean styling) */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#070d1e] p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${link.color}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Citizen Portal Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/citizen"
            target="_blank"
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-red-950 transition-all active:scale-95 shrink-0"
          >
            <Smartphone className="w-4 h-4" />
            <span>Citizen SOS App</span>
          </Link>
        </div>
      </div>

      {/* Secondary Horizontal Nav Row for Medium / Smaller Screens (< xl) */}
      <div className="xl:hidden bg-[#070d1e] border-t border-slate-800/80 px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-100 bg-slate-900/50 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${link.color}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Live IoT River Telemetry Stream Bar */}
      <LiveTelemetryTicker />
    </header>
  );
};
