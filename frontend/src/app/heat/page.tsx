'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trees, 
  Building2, 
  Thermometer, 
  ShieldAlert, 
  Check, 
  TrendingDown, 
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { simulateHeatwave, fetchHeatInterventions } from '../../lib/api';

export default function HeatResiliencePage() {
  const [ambientTemp, setAmbientTemp] = useState<number>(42);
  const [simData, setSimData] = useState<any>(null);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'simulator' | 'roi'>('simulator');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sim, inv] = await Promise.all([
          simulateHeatwave(42),
          fetchHeatInterventions()
        ]);
        setSimData(sim);
        setInterventions(inv);
      } catch (e) {
        console.error('Failed to load heat resilience:', e);
      }
    }
    load();
  }, []);

  const handleTempChange = async (newTemp: number) => {
    setAmbientTemp(newTemp);
    setIsSimulating(true);
    try {
      const res = await simulateHeatwave(newTemp);
      setSimData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  HEATSHIELD URBAN HEAT RESILIENCE & ROI SIMULATOR
                </h1>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
                  PRE-DISASTER MITIGATION
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Satellite thermal mapping, extreme heatwave stress testing & 3-year reflective cool roof municipal ROI
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-[#070d1e] p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'simulator'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span>Heatwave Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'roi'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span>Cool Roof 3-Year ROI</span>
            </button>
          </div>
        </div>

        {/* Interactive Temperature Slider Card */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">
                EXTREME AMBIENT TEMPERATURE SLIDER
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Simulate Roorkee Peak Summer Heatwave ({ambientTemp}°C)
              </h3>
            </div>
            <span className="text-3xl font-black text-rose-400 font-mono">
              {ambientTemp}°C
            </span>
          </div>

          <input
            type="range"
            min={35}
            max={48}
            step={1}
            value={ambientTemp}
            onChange={(e) => handleTempChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>35°C (Moderate Summer)</span>
            <span>40°C (Heatwave Advisory)</span>
            <span>44°C (Severe Heatwave)</span>
            <span className="text-rose-400 font-bold">48°C (Catastrophic Peak)</span>
          </div>
        </div>

        {/* Dynamic Simulation Output Metrics */}
        {simData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">COOLING SHELTERS SCALED</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {simData.required_cooling_shelters} Centers
              </span>
              <span className="text-xs text-slate-400 block mt-1">AC & Misting Stations</span>
            </div>

            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">POPULATION AT HEAT RISK</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                {simData.vulnerable_citizens_at_risk.toLocaleString()}
              </span>
              <span className="text-xs text-amber-500 block mt-1">Informal Settlements</span>
            </div>

            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">HEAT INDEX PEAK</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {simData.projected_heat_index_c}°C
              </span>
              <span className="text-xs text-rose-500 block mt-1">Wet-Bulb Danger Mark</span>
            </div>

            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">ADVISORY STATUS</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block truncate">
                {simData.heat_alert_level}
              </span>
              <span className="text-xs text-emerald-400 block mt-1">NDMA Protocol Active</span>
            </div>
          </div>
        )}

        {/* TAB 1: HEAT SIMULATOR WARDS */}
        {activeTab === 'simulator' && simData && (
          <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-400" />
              <span>Ward-Level Urban Heat Island Telemetry</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simData.hotspot_wards?.map((ward: any, i: number) => (
                <div
                  key={i}
                  className="bg-[#070d1e] p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{ward.name}</span>
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded font-black text-xs">
                      {ward.surface_temp_c}°C Surface Temp
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs">
                    <b>Risk:</b> {ward.vulnerability_reason}
                  </p>
                  <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                    <span>Target Population: <b>{ward.population.toLocaleString()}</b></span>
                    <span className="text-cyan-400">Canopy: {ward.tree_canopy_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COOL ROOF 3-YEAR ROI */}
        {activeTab === 'roi' && (
          <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                <span>Tree Canopy & Reflective Cool Roof 3-Year Municipal ROI</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Projected thermal reduction and energy savings across Roorkee municipal housing clusters:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {interventions.map((inv, i) => (
                <div
                  key={i}
                  className="bg-[#070d1e] p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">{inv.category}</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                      -{inv.temp_reduction_c}°C Drop
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{inv.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{inv.description}</p>
                  <div className="pt-3 border-t border-slate-800 font-mono text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Implementation Cost:</span>
                      <b className="text-white">₹{(inv.cost_inr / 100000).toFixed(1)} Lakhs</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">3-Year Energy Saved:</span>
                      <b className="text-emerald-400">₹{(inv.three_year_savings_inr / 100000).toFixed(1)} Lakhs</b>
                    </div>
                    <div className="flex justify-between text-cyan-300 font-bold">
                      <span>ROI Payback Period:</span>
                      <span>{inv.payback_months} Months</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
