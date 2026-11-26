'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Droplets, Flame, Waves, Radio, Activity, Compass, Bell, Smartphone, Cpu } from 'lucide-react';

interface HeaderHUDProps {
  activeModule: 'flood' | 'water' | 'heat';
  onModuleChange: (mod: 'flood' | 'water' | 'heat') => void;
  sosCount: number;
  criticalCount: number;
  onOpenArchitecture?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeModule,
  onModuleChange,
  sosCount,
  criticalCount,
  onOpenArchitecture
}) => {
  return (
    <header className="bg-[#0b132b] border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-2xl">
      {/* Brand & Mission title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-wider text-white">LIFELINE<span className="text-cyan-400">360</span></h1>
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              LIVE COMMAND EOC
            </span>
          </div>
          <p className="text-xs text-slate-400">Roorkee - Haridwar Multi-Hazard Basin Operations</p>
        </div>
      </div>

      {/* 3 Module Toggle Switchers */}
      <div className="flex items-center bg-[#070d1e] p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onModuleChange('flood')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeModule === 'flood'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Waves className="w-4 h-4 text-cyan-400" />
          <span>Flood & Rescue (AAPDA)</span>
        </button>

        <button
          onClick={() => onModuleChange('water')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeModule === 'water'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-4 h-4 text-amber-400" />
          <span>Water Safety (JEEVAN)</span>
        </button>

        <button
          onClick={() => onModuleChange('heat')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeModule === 'heat'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Heat Resilience (HEATSHIELD)</span>
        </button>
      </div>

      {/* Telemetry quick indicators */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Rainfall:</span>
          <span className="text-white font-semibold">168mm</span>
        </div>

        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-slate-400">Total SOS:</span>
          <span className="text-yellow-400 font-bold">{sosCount}</span>
        </div>

        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span className="text-slate-400">Critical P1:</span>
          <span className="text-red-400 font-bold">{criticalCount}</span>
        </div>

        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Fleet Ready:</span>
          <span className="text-emerald-400 font-semibold">11/14 Boats</span>
        </div>

        <button
          onClick={onOpenArchitecture}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm font-sans font-bold"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Architecture & Cloud</span>
        </button>

        <Link
          href="/citizen"
          target="_blank"
          className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm font-sans font-bold"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-400" />
          <span>Citizen SOS App</span>
        </Link>
      </div>
    </header>
  );
};
