'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Trees, Building2, Thermometer, ShieldAlert, Check, TrendingDown, Layers } from 'lucide-react';
import { simulateHeatwave, fetchHeatInterventions } from '../lib/api';

interface HeatShieldPanelProps {
  onSimulationUpdate?: (simulatedGeoJSON: any) => void;
}

export const HeatShieldPanel: React.FC<HeatShieldPanelProps> = ({ onSimulationUpdate }) => {
  const [ambientTemp, setAmbientTemp] = useState<number>(40);
  const [simData, setSimData] = useState<any>(null);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'simulator' | 'interventions'>('simulator');

  useEffect(() => {
    fetchHeatInterventions()
      .then(setInterventions)
      .catch(console.error);

    runSimulation(40);
  }, []);

  const runSimulation = async (temp: number) => {
    setAmbientTemp(temp);
    try {
      const res = await simulateHeatwave(temp);
      setSimData(res);
      if (onSimulationUpdate && res.simulated_geojson) {
        onSimulationUpdate(res.simulated_geojson);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#070d1e] border border-rose-500/30 rounded-2xl p-3.5 space-y-3.5 text-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <h3 className="font-bold text-slate-100 uppercase tracking-wider">
            HEATSHIELD Urban Heat Intelligence
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full">
          PRE-DISASTER RESILIENCE
        </span>
      </div>

      {/* Mode Sub-tabs */}
      <div className="flex bg-[#0b132b] p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'simulator'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🌡️ Dynamic Heatwave Simulator
        </button>

        <button
          onClick={() => setActiveTab('interventions')}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'interventions'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🌳 Tree Canopy & ROI Matrix
        </button>
      </div>

      {/* ---------------- TAB 1: DYNAMIC HEATWAVE SIMULATOR ---------------- */}
      {activeTab === 'simulator' && (
        <div className="space-y-3">
          {/* Ambient Temperature Slider */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-400" />
                Ambient Summer Heatwave:
              </span>
              <span className={`text-base font-black font-mono px-2 py-0.5 rounded ${
                ambientTemp >= 44
                  ? 'bg-red-600 text-white'
                  : ambientTemp >= 41
                  ? 'bg-amber-600 text-white'
                  : 'bg-yellow-600 text-slate-900'
              }`}>
                {ambientTemp}°C
              </span>
            </div>

            <input
              type="range"
              min="35"
              max="48"
              step="1"
              value={ambientTemp}
              onChange={(e) => runSimulation(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>35°C (Normal)</span>
              <span>41°C (Heat Alert)</span>
              <span>48°C (Extreme Danger)</span>
            </div>
          </div>

          {/* Simulation Output Cards */}
          {simData && (
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">COOLING SHELTERS NEEDED</span>
                <span className="text-lg font-black text-rose-400">
                  {simData.cooling_shelters_required} Operational
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Misting stations active</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">VULNERABLE POPULATION</span>
                <span className="text-lg font-black text-amber-400">
                  {simData.vulnerable_population_at_risk.toLocaleString()} At Risk
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Concrete trap density</span>
              </div>
            </div>
          )}

          {/* Impacted Hotspot Radii */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-300 text-[11px] block">
              Active Urban Heat Island Amplification:
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded">
                <span className="text-slate-300">Station Rd Industrial Corridor:</span>
                <b className="text-rose-400 font-mono">{(44.8 + (ambientTemp - 36) * 1.25).toFixed(1)}°C (LST)</b>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded">
                <span className="text-slate-300">Old Roorkee Dense Bazar:</span>
                <b className="text-amber-400 font-mono">{(42.1 + (ambientTemp - 36) * 1.1).toFixed(1)}°C (LST)</b>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded">
                <span className="text-slate-300">IIT Roorkee Forest Sink:</span>
                <b className="text-emerald-400 font-mono">{(32.4 + (ambientTemp - 36) * 0.55).toFixed(1)}°C (LST)</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: TREE CANOPY & SHADING ROI MATRIX ---------------- */}
      {activeTab === 'interventions' && (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          <p className="text-[11px] text-slate-400 leading-tight">
            Data-driven smart-city interventions showing long-term temperature reduction:
          </p>

          {interventions.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-[11px]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-emerald-300 text-xs">{item.corridor_name}</h4>
                  <p className="text-slate-400 text-[10px]">{item.intervention_type}</p>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  {item.projected_lst_reduction_celsius}°C
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded">
                <span>Citizens Protected: <b className="text-slate-200">{item.vulnerable_citizens_protected?.toLocaleString() || '12,000+'}</b></span>
                <span>Budget: <b className="text-cyan-300">{item.estimated_budget_inr}</b></span>
              </div>

              {item.dual_benefit && (
                <p className="text-[10px] text-cyan-300 italic">
                  💡 <b>Dual-Resilience:</b> {item.dual_benefit}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
