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
    { href: '/shelters', label: 'Relief Shelters', icon: Home },
    { href: '/siren', label: 'CAP Siren', icon: Megaphone },
    { href: '/damage', label: 'Drone Damage & SDRF', icon: Camera },
    { href: '/water', label: 'Water Safety', icon: Droplets },
    { href: '/heat', label: 'Heat Resilience', icon: Flame },
    { href: '/architecture', label: 'Cloud Architecture', icon: Cpu },
  ];

  return (
    <header className="bg-[#fbfbfa]/95 dark:bg-[#191919]/95 backdrop-blur-md border-b border-[#e9e9e7] dark:border-[#2e2e2e] sticky top-0 z-50 transition-colors duration-200">
      {/* Top Main Navigation Bar - Spacious Notion Style */}
      <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & EOC Live Tag */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#2f2e2b] dark:bg-[#2b2b2b] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#2f2e2b] dark:text-[#f4f4f5]">
                CLIMA<span className="text-sky-600 dark:text-sky-400">GRID</span>
              </span>
              <span className="bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                LIVE EOC
              </span>
            </div>
            <p className="text-xs text-[#787774] dark:text-[#9b9a97] font-normal tracking-normal mt-0.5 hidden sm:block">
              Roorkee - Haridwar Multi-Hazard Basin Operations
            </p>
          </div>
        </Link>

        {/* Navigation Links (Desktop: >= 2xl for full inline) */}
        <nav className="hidden 2xl:flex items-center gap-1 bg-[#f1f1ef] dark:bg-[#242424] p-1 rounded-xl border border-[#e3e2e0] dark:border-[#333333]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#2e2e2e] text-[#2f2e2b] dark:text-white shadow-xs border border-[#deddd9] dark:border-[#404040] font-semibold'
                    : 'text-[#6b6966] dark:text-[#a8a7a4] hover:text-[#2f2e2b] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#2c2c2c]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-[#8c8a85] dark:text-[#787774]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar: Theme Toggle & Citizen Portal */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle theme"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl border border-[#deddd9] dark:border-[#383838] bg-white dark:bg-[#242424] text-[#2f2e2b] dark:text-[#e6e6e5] hover:bg-[#f1f1ef] dark:hover:bg-[#2d2d2d] text-xs sm:text-sm font-medium transition-all shadow-2xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#575653]" />
                <span className="hidden md:inline">Dark</span>
              </>
            )}
          </button>

          {/* Citizen App Link */}
          <Link
            href="/citizen"
            target="_blank"
            className="bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-[#333333] dark:hover:bg-[#404040] text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-all shrink-0 border border-transparent dark:border-[#4a4a4a]"
          >
            <Smartphone className="w-4 h-4 text-rose-400" />
            <span>Citizen SOS</span>
          </Link>
        </div>
      </div>

      {/* Secondary Horizontal Nav Row for Screens < 2xl */}
      <div className="2xl:hidden bg-[#f7f6f3] dark:bg-[#202020] border-t border-[#e9e9e7] dark:border-[#2e2e2e] px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#2b2b2b] text-[#2f2e2b] dark:text-white shadow-xs border border-[#deddd9] dark:border-[#404040] font-semibold'
                  : 'text-[#6b6966] dark:text-[#a8a7a4] hover:text-[#2f2e2b] dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-[#8c8a85] dark:text-[#787774]'}`} />
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
