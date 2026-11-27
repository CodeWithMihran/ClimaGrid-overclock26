'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Waves, 
  Droplets, 
  Flame, 
  Activity, 
  Bell, 
  ShieldAlert, 
  Radio, 
  Play, 
  Square, 
  Home, 
  Megaphone, 
  Camera, 
  Cpu, 
  Smartphone,
  ChevronDown,
  Layers
} from 'lucide-react';

interface HeaderHUDProps {
  activeModule: 'flood' | 'water' | 'heat';
  onModuleChange: (mod: 'flood' | 'water' | 'heat') => void;
  sosCount: number;
  criticalCount: number;
  onOpenArchitecture?: () => void;
  onOpenShelters?: () => void;
  onOpenCAPAlert?: () => void;
  onOpenDamageAssessment?: () => void;
  isTourRunning?: boolean;
  onToggleGuidedTour?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeModule,
  onModuleChange,
  sosCount,
  criticalCount,
  onOpenArchitecture,
  onOpenShelters,
  onOpenCAPAlert,
  onOpenDamageAssessment,
  isTourRunning = false,
  onToggleGuidedTour
}) => {
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  return (
    <header className="bg-[#0b132b]/95 backdrop-blur-md border-b border-slate-800/90 px-4 py-2.5 sticky top-0 z-50 shadow-xl transition-all">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
        {/* Brand & Region Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-wider text-white">
                CLIMA<span className="text-cyan-400">GRID</span>
              </h1>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE EOC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Roorkee - Haridwar Multi-Hazard Basin</p>
          </div>
        </div>

        {/* Center: Hazard Mode Segmented Controller */}
        <div className="hidden md:flex items-center bg-[#070d1e] p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onModuleChange('flood')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'flood'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Flood & Rescue</span>
          </button>

          <button
            onClick={() => onModuleChange('water')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'water'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-amber-400" />
            <span>Water Safety</span>
          </button>

          <button
            onClick={() => onModuleChange('heat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'heat'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Heat Resilience</span>
          </button>
        </div>

        {/* Right: Telemetry Counts & Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Key Metrics Badges */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono">
            <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Bell className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-slate-400">SOS:</span>
              <span className="text-yellow-400 font-bold">{sosCount}</span>
            </div>

            <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-400">P1 Critical:</span>
              <span className="text-red-400 font-bold">{criticalCount}</span>
            </div>

            <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Boats:</span>
              <span className="text-emerald-400 font-semibold">11/14</span>
            </div>
          </div>

          {/* 3-Min Pitch Tour */}
          {onToggleGuidedTour && (
            <button
              onClick={onToggleGuidedTour}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-md ${
                isTourRunning
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-950'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-cyan-950'
              }`}
            >
              {isTourRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Tour</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Pitch Tour</span>
                </>
              )}
            </button>
          )}

          {/* Primary Action Buttons (Desktop 2xl+) */}
          <div className="hidden 2xl:flex items-center gap-2">
            <button
              onClick={onOpenShelters}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>Relief Camps</span>
            </button>

            <button
              onClick={onOpenCAPAlert}
              className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm shadow-red-950"
            >
              <Megaphone className="w-3.5 h-3.5 text-red-400" />
              <span>CAP Siren</span>
            </button>

            <button
              onClick={onOpenDamageAssessment}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>SDRF Damage</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloud Arch</span>
            </button>
          </div>

          {/* Responsive Emergency Tools Dropdown (when < 2xl) */}
          <div className="relative 2xl:hidden">
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Action Tools</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isToolsMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-[#0b132b] border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsToolsMenuOpen(false)}
              >
                <button
                  onClick={onOpenShelters}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-2 transition-colors"
                >
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>Relief Camps & Logistics</span>
                </button>

                <button
                  onClick={onOpenCAPAlert}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                >
                  <Megaphone className="w-4 h-4 text-red-400" />
                  <span>NDMA CAP Siren Alert</span>
                </button>

                <button
                  onClick={onOpenDamageAssessment}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:bg-amber-950/40 flex items-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Drone Damage & SDRF</span>
                </button>

                <button
                  onClick={onOpenArchitecture}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-cyan-300 hover:bg-cyan-950/40 flex items-center gap-2 transition-colors"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Cloud Architecture</span>
                </button>
              </div>
            )}
          </div>

          {/* Citizen SOS App Link */}
          <Link
            href="/citizen"
            target="_blank"
            className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm shadow-red-950"
          >
            <Smartphone className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Citizen SOS Portal</span>
            <span className="sm:hidden">Citizen</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
