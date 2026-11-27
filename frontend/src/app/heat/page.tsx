'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Thermometer, 
  TrendingDown
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  HEATSHIELD URBAN HEAT RESILIENCE & ROI SIMULATOR
                </h1>
                <span className="bg-rose-50 dark:bg-zinc-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-zinc-700 text-xs font-mono font-semibold px-3 py-0.5 rounded-full">
                  PRE-DISASTER MITIGATION
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Satellite thermal mapping, extreme heatwave stress testing & 3-year reflective cool roof municipal ROI
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-slate-100 dark:bg-[#09090b] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-zinc-700 font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Thermometer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Heatwave Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === 'roi'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-zinc-700 font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Cool Roof 3-Year ROI</span>
            </button>
          </div>
        </div>

        {/* Interactive Temperature Slider Card */}
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                EXTREME AMBIENT TEMPERATURE SLIDER
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Simulate Roorkee Peak Summer Heatwave ({ambientTemp}°C)
              </h3>
            </div>
            <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono">
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
            className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />

          <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-zinc-400">
            <span>35°C (Moderate)</span>
            <span>40°C (Heatwave Alert)</span>
            <span>44°C (Severe)</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">48°C (Extreme Peak)</span>
          </div>
        </div>

        {/* Dynamic Simulation Output Metrics */}
        {simData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">COOLING SHELTERS SCALED</span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block">
                {simData.required_cooling_shelters} Centers
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-1">AC & Misting Stations</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">POPULATION AT RISK</span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 block">
                {simData.vulnerable_citizens_at_risk.toLocaleString()}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 block mt-1">Informal Settlements</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">HEAT INDEX PEAK</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 block">
                {simData.projected_heat_index_c}°C
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400 block mt-1">Wet-Bulb Danger Mark</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">ADVISORY STATUS</span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block truncate">
                {simData.heat_alert_level}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 block mt-1">NDMA Protocol Active</span>
            </div>
          </div>
        )}

        {/* TAB 1: HEAT SIMULATOR WARDS */}
        {activeTab === 'simulator' && simData && (
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Ward-Level Urban Heat Island Telemetry</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simData.hotspot_wards?.map((ward: any, i: number) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-[#18181b] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{ward.name}</span>
                    <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded font-bold text-xs">
                      {ward.surface_temp_c}°C Surface Temp
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-300 font-sans text-xs">
                    <b>Risk:</b> {ward.vulnerability_reason}
                  </p>
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span>Target Population: <b>{ward.population.toLocaleString()}</b></span>
                    <span className="text-sky-700 dark:text-sky-400">Canopy: {ward.tree_canopy_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COOL ROOF 3-YEAR ROI */}
        {activeTab === 'roi' && (
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Tree Canopy & Reflective Cool Roof 3-Year Municipal ROI</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Projected thermal reduction and energy savings across Roorkee municipal housing clusters:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {interventions.map((inv, i) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-[#18181b] p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">{inv.category}</span>
                    <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                      -{inv.temp_reduction_c}°C Drop
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{inv.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{inv.description}</p>
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 font-mono text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-zinc-400">Cost:</span>
                      <b className="text-slate-900 dark:text-zinc-100">₹{(inv.cost_inr / 100000).toFixed(1)} Lakhs</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-zinc-400">3-Yr Savings:</span>
                      <b className="text-emerald-700 dark:text-emerald-400">₹{(inv.three_year_savings_inr / 100000).toFixed(1)} Lakhs</b>
                    </div>
                    <div className="flex justify-between text-sky-700 dark:text-sky-300 font-semibold">
                      <span>ROI Payback:</span>
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
