'use client';

import React from 'react';
import { 
  BatteryCharging, 
  Shield, 
  Navigation, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  Truck,
  Anchor
} from 'lucide-react';
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
    <div className="flex flex-col h-full bg-[#0b132b]/95 border-l border-slate-800 w-full overflow-y-auto p-3.5 space-y-3.5">
      {/* 1. TACTICAL ROUTE NAVIGATION & HAZARD BYPASS (SW-01 Advanced Goal) */}
      {activeRoute && activeModule === 'flood' && (
        <div className="bg-[#070d1e] border border-cyan-500/40 rounded-xl p-3 shadow-lg shadow-cyan-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>LIVE ROUTE OPTIMIZATION</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                activeRoute.is_safe
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {activeRoute.is_safe ? 'SAFE HIGH-GROUND' : 'DANGEROUS DIRECT'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-2.5 font-mono">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CORRIDOR DISTANCE</span>
              <span className="text-slate-100 font-bold">{activeRoute.distance_km} km</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ESTIMATED TIME</span>
              <span className="text-cyan-400 font-bold">{activeRoute.duration_minutes} mins</span>
            </div>
          </div>

          {activeRoute.avoided_hazards.length > 0 && (
            <div className="text-[11px] bg-red-950/40 border border-red-900/50 p-2 rounded-lg mb-2.5">
              <span className="font-semibold text-red-300 block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Road Blockages Bypassed:</span>
              </span>
              <ul className="list-disc pl-4 text-red-200/80 space-y-0.5 text-[10.5px]">
                {activeRoute.avoided_hazards.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Toggle between Safe Detour and Blind Dangerous Route */}
          <button
            onClick={onToggleHazardAvoidance}
            className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Mode: {avoidHazards ? 'Simulate Blind Route (Show Hazard)' : 'Enable Detour (High-Ground)'}
            </span>
          </button>
        </div>
      )}

      {/* 2. OPTIMAL DROP ZONES & STAGING HUBS (SW-01 Basic Goal) */}
      {activeModule === 'flood' && (
        <div className="bg-[#070d1e] border border-slate-800 rounded-xl p-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Optimal Drop Zones & Staging</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">SW-01</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">Solani High-Ground Helipad (LZ-1)</p>
                <p className="text-[10px] text-slate-400">Elevation: 274m • Air Drop & Boat Launch</p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                ACTIVE
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">IIT Roorkee Stadium Staging Post</p>
                <p className="text-[10px] text-slate-400">Volunteer Assembly & Medical Depot</p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                READY
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPLAINABLE TRIAGE FORMULA HUD */}
      {activeModule === 'flood' && (
        <div className="bg-[#070d1e] border border-slate-800 rounded-xl p-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Explainable Triage Model</span>
          </h3>
          <p className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 mb-2">
            Score = (0.35 × Haz) + (0.35 × Med) + (0.20 × Vuln) + (0.10 × Time)
          </p>
          <p className="text-[10px] text-slate-400 leading-normal">
            Auditable mathematical formula prioritizing vulnerable lives over raw headcounts. Human commanders retain final dispatch authorization.
          </p>
        </div>
      )}

      {/* 4. MODULE-SPECIFIC DEEP VIEWS */}
      {activeModule === 'water' && (
        <WaterSafetyPanel sensors={waterSensors} />
      )}

      {activeModule === 'heat' && (
        <HeatShieldPanel onSimulationUpdate={onHeatSimulationUpdate} />
      )}

      {/* 5. FLEET & VOLUNTEER RESOURCE ALLOCATION (SW-01 Dispatch Telemetry) */}
      <div className="bg-[#070d1e] border border-slate-800 rounded-xl p-3 space-y-2">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fleet & Volunteer Telemetry</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">LIVE GPS</span>
        </h3>

        <div className="space-y-1.5">
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
