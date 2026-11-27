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
  Sun,
  Moon
} from 'lucide-react';
import { LiveTelemetryTicker } from './LiveTelemetryTicker';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'Live Dispatch (SW-01)', icon: Map },
    { href: '/flood', label: 'Predictive Flood', icon: Waves },
    { href: '/shelters', label: 'Relief Shelters & Warehouses', icon: Home },
    { href: '/siren', label: 'CAP Siren Broadcast', icon: Megaphone },
    { href: '/damage', label: 'Drone Damage & SDRF', icon: Camera },
    { href: '/water', label: 'Water Safety (JEEVAN)', icon: Droplets },
    { href: '/heat', label: 'Heat Resilience', icon: Flame },
    { href: '/architecture', label: 'Cloud Architecture', icon: Cpu },
  ];

  return (
    <header className="bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-200 shadow-sm">
      {/* Top Main Navigation Bar */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & EOC Live Tag */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-spin-slow text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                CLIMA<span className="text-sky-600 dark:text-sky-400">GRID</span>
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE EOC
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">Roorkee - Haridwar Multi-Hazard Basin Operations</p>
          </div>
        </Link>

        {/* Navigation Links (Desktop: >= xl) */}
        <nav className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-[#09090b] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-zinc-700 font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar: Theme Toggle & Citizen Portal */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle theme"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Citizen App Link */}
          <Link
            href="/citizen"
            target="_blank"
            className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Smartphone className="w-4 h-4" />
            <span>Citizen SOS</span>
          </Link>
        </div>
      </div>

      {/* Secondary Horizontal Nav Row for Tablet / Small Desktop (< xl) */}
      <div className="xl:hidden bg-slate-50 dark:bg-[#09090b] border-t border-slate-200 dark:border-zinc-800/80 px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700 font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-zinc-500'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Live IoT River Telemetry Ticker */}
      <LiveTelemetryTicker />
    </header>
  );
};
