'use client';

import React from 'react';
import { BatteryCharging, Shield, Navigation, Layers } from 'lucide-react';
import { FleetAsset, WaterSensorNode, RouteSegment } from '../types';
import { WaterSafetyPanel } from './WaterSafetyPanel';
import { HeatShieldPanel } from './HeatShieldPanel';

interface TacticalSideHUDProps {
  activeModule: 'flood' | 'water' | 'heat';
  fleetAssets: FleetAsset[];
  waterSensors: WaterSensorNode[];
  activeRoute: RouteSegment | null;
  onToggleHazardAvoidance: () => void;
  avoidHazards: boolean;
  onHeatSimulationUpdate?: (simulatedGeoJSON: any) => void;
}

export const TacticalSideHUD: React.FC<TacticalSideHUDProps> = ({
  activeModule,
  fleetAssets,
  waterSensors,
  activeRoute,
  onToggleHazardAvoidance,
  avoidHazards,
  onHeatSimulationUpdate
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0b132b]/90 border-l border-slate-800 w-full overflow-y-auto p-4 space-y-4">
      {/* 1. TACTICAL ROUTE NAVIGATION CARD (AAPDA) */}
      {activeRoute && activeModule === 'flood' && (
        <div className="bg-[#070d1e] border border-cyan-500/40 rounded-xl p-3 shadow-lg shadow-cyan-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>DYNAMIC RESCUE CORRIDOR</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                activeRoute.is_safe
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {activeRoute.is_safe ? 'SUBMERGED-SAFE' : 'DANGEROUS (DIRECT)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CORRIDOR DISTANCE</span>
              <span className="text-slate-100 font-bold">{activeRoute.distance_km} km</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ESTIMATED TIME</span>
              <span className="text-cyan-400 font-bold">{activeRoute.duration_minutes} mins</span>
            </div>
          </div>

          {activeRoute.avoided_hazards.length > 0 && (
            <div className="text-[11px] bg-red-950/40 border border-red-900/50 p-2 rounded-lg mb-3">
              <span className="font-semibold text-red-300 block mb-1">
                Submerged Obstacles Bypassed:
              </span>
              <ul className="list-disc pl-4 text-red-200/80 space-y-0.5">
                {activeRoute.avoided_hazards.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Toggle between Safe Detour and Blind Dangerous Route */}
          <button
            onClick={onToggleHazardAvoidance}
            className="w-full text-xs font-medium py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Toggle Mode: {avoidHazards ? 'Disable Avoidance (Show Danger Path)' : 'Enable Avoidance (Safe Detour)'}
            </span>
          </button>
        </div>
      )}

      {/* 2. EXPLAINABLE TRIAGE FORMULA HUD */}
      {activeModule === 'flood' && (
        <div className="bg-[#070d1e] border border-slate-800 rounded-xl p-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Explainable Triage Model</span>
          </h3>
          <p className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 mb-2">
            Score = (0.35 × Haz) + (0.35 × Med) + (0.20 × Vuln) + (0.10 × Time)
          </p>
          <p className="text-[10px] text-slate-500 leading-tight">
            Strictly auditable and open-source rules prioritizing acute vulnerability over raw crowd headcounts. Responders hold final dispatch authority.
          </p>
        </div>
      )}

      {/* 3. MODULE-SPECIFIC DEEP VIEW */}
      {activeModule === 'water' && (
        <WaterSafetyPanel sensors={waterSensors} />
      )}

      {activeModule === 'heat' && (
        <HeatShieldPanel onSimulationUpdate={onHeatSimulationUpdate} />
      )}

      {/* 4. FLEET ASSET READINESS TELEMETRY */}
      <div className="bg-[#070d1e] border border-slate-800 rounded-xl p-3 space-y-2">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span>Active Fleet Telemetry</span>
          <span className="text-[10px] text-emerald-400 font-mono">LIVE GPS</span>
        </h3>

        <div className="space-y-2">
          {fleetAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-slate-900/70 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-200">{asset.callsign}</p>
                <p className="text-[10px] text-slate-400">{asset.type} • {asset.status}</p>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
                <span>{asset.battery_or_fuel_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
