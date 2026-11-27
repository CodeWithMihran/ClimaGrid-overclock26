'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Thermometer, 
  TrendingDown,
  ShieldAlert,
  Trees,
  CheckCircle2,
  Droplets,
  Sun,
  Activity,
  Zap,
  Building2,
  Sparkles,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { simulateHeatwave, fetchHeatInterventions } from '../../lib/api';

export default function HeatResiliencePage() {
  const [ambientTemp, setAmbientTemp] = useState<number>(42);
  const [simData, setSimData] = useState<any>(null);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'simulator' | 'roi'>('simulator');
  const [isSimulating, setIsSimulating] = useState(false);
  const [mistingStatus, setMistingStatus] = useState<string | null>(null);
  
  // Interactive Cool Roof ROI parameters
  const [roofAreaM2, setRoofAreaM2] = useState<number>(25000);

  useEffect(() => {
    async function load() {
      try {
        const [sim, inv] = await Promise.all([
          simulateHeatwave(42),
          fetchHeatInterventions()
        ]);
        setSimData(sim);
        setInterventions(inv || []);
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

  const handleDispatchMisting = () => {
    setMistingStatus(`MIST-QRT-01 deployed to Station Road Industrial Corridor. 4,000L high-pressure cold mist + 1,500 ORS sachets dispatched.`);
    setTimeout(() => {
      setMistingStatus(null);
    }, 7000);
  };

  const deltaT = ambientTemp - 36;
  const coolingShelters = simData?.cooling_shelters_required ?? (ambientTemp >= 43 ? 5 : ambientTemp >= 40 ? 3 : 2);
  const vulnerablePop = simData?.vulnerable_population_at_risk ?? (ambientTemp >= 43 ? 14700 : 8200);
  const heatIndex = (ambientTemp + (ambientTemp >= 44 ? 4.8 : 3.4)).toFixed(1);
  const alertLevel = simData?.heat_alert_level ?? (ambientTemp >= 42 ? "RED SEVERE HEATWAVE" : "ORANGE HEAT STRESS");

  // Dynamic Ward telemetry based on ambient temp
  const hotspotWards = [
    {
      name: "Station Road Industrial Corridor",
      surface_temp_c: (44.8 + deltaT * 1.25).toFixed(1),
      population: 8200,
      tree_canopy_pct: 6,
      vulnerability_reason: "High thermal inertia asphalt, zero shading, industrial corrugated metal roofing heat trap."
    },
    {
      name: "Old Roorkee Dense Bazaar",
      surface_temp_c: (42.1 + deltaT * 1.1).toFixed(1),
      population: 6500,
      tree_canopy_pct: 9,
      vulnerability_reason: "Narrow crowded alleys with minimal air circulation, multi-story masonry thermal absorption."
    },
    {
      name: "Solani Embankment Settlements",
      surface_temp_c: (43.5 + deltaT * 1.15).toFixed(1),
      population: 5400,
      tree_canopy_pct: 4,
      vulnerability_reason: "Tin-roof informal settlements, unpaved dust corridors, high elderly and infant vulnerability."
    },
    {
      name: "IIT Roorkee Forest Sink",
      surface_temp_c: (32.4 + deltaT * 0.55).toFixed(1),
      population: 12000,
      tree_canopy_pct: 48,
      vulnerability_reason: "Continuous native Sal and Neem tree canopy providing natural evaporative microclimate buffer."
    }
  ];

  // Dynamic ROI Calculations
  const capexLakhs = ((roofAreaM2 * 68) / 100000).toFixed(2);
  const annualKwhSaved = (roofAreaM2 * 19.5).toLocaleString();
  const annualSavingsLakhs = ((roofAreaM2 * 19.5 * 7.5) / 100000).toFixed(2);
  const paybackYears = (Number(capexLakhs) / Number(annualSavingsLakhs)).toFixed(1);
  const citizensProtected = Math.round(roofAreaM2 * 0.38).toLocaleString();

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 space-y-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#fef9ee] dark:bg-[#342918] border border-[#fcedca] dark:border-[#4d3a1f] flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
              <Flame className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  HEATSHIELD URBAN HEAT RESILIENCE & ROI SIMULATOR
                </h1>
                <span className="bg-[#fef9ee] dark:bg-[#342918] text-amber-700 dark:text-amber-300 border border-[#fcedca] dark:border-[#4d3a1f] text-xs font-mono font-semibold px-3 py-1 rounded-full">
                  PRE-DISASTER MITIGATION
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-[#787774] dark:text-[#9b9a97] mt-1">
                Satellite thermal mapping, extreme heatwave stress testing & 3-year reflective cool roof municipal ROI
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-[#f1f1ef] dark:bg-[#262626] p-1.5 rounded-xl border border-[#e3e2e0] dark:border-[#333333]">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-[#2e2e2e] text-[#2f2e2b] dark:text-white shadow-xs border border-[#deddd9] dark:border-[#404040] font-semibold'
                  : 'text-[#6b6966] dark:text-[#a8a7a4] hover:text-[#2f2e2b] dark:hover:text-white'
              }`}
            >
              <Thermometer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Heatwave Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'roi'
                  ? 'bg-white dark:bg-[#2e2e2e] text-[#2f2e2b] dark:text-white shadow-xs border border-[#deddd9] dark:border-[#404040] font-semibold'
                  : 'text-[#6b6966] dark:text-[#a8a7a4] hover:text-[#2f2e2b] dark:hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Cool Roof 3-Year ROI</span>
            </button>
          </div>
        </div>

        {/* Live Misting Van Toast / Confirmation Banner */}
        {mistingStatus && (
          <div className="bg-[#eef8f2] dark:bg-[#1b2b22] border border-[#ccecd8] dark:border-[#244b34] p-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                {mistingStatus}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 uppercase shrink-0">
              QRT ACTIVE
            </span>
          </div>
        )}

        {/* Interactive Temperature Slider & Scenario Presets */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                EXTREME AMBIENT TEMPERATURE SLIDER & SCENARIO BENCHMARKS
              </span>
              <h3 className="text-xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] mt-1">
                Simulate Roorkee Peak Summer Heatwave ({ambientTemp}°C)
              </h3>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDispatchMisting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch Mobile Misting Van</span>
              </button>

              <span className="text-4xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {ambientTemp}°C
              </span>
            </div>
          </div>

          {/* Quick Scenario Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] self-center mr-2 font-mono">
              Presets:
            </span>
            <button
              onClick={() => handleTempChange(38)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                ambientTemp === 38
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold'
                  : 'bg-[#f7f6f3] dark:bg-[#252525] text-[#575653] dark:text-[#a8a7a4] border-[#e3e2e0] dark:border-[#383838] hover:bg-[#eae8e4]'
              }`}
            >
              38°C Baseline Summer
            </button>
            <button
              onClick={() => handleTempChange(42)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                ambientTemp === 42
                  ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800 font-semibold'
                  : 'bg-[#f7f6f3] dark:bg-[#252525] text-[#575653] dark:text-[#a8a7a4] border-[#e3e2e0] dark:border-[#383838] hover:bg-[#eae8e4]'
              }`}
            >
              42°C Severe Heatwave
            </button>
            <button
              onClick={() => handleTempChange(46)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                ambientTemp === 46
                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold'
                  : 'bg-[#f7f6f3] dark:bg-[#252525] text-[#575653] dark:text-[#a8a7a4] border-[#e3e2e0] dark:border-[#383838] hover:bg-[#eae8e4]'
              }`}
            >
              46°C Extreme Heatwave
            </button>
            <button
              onClick={() => handleTempChange(48)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                ambientTemp === 48
                  ? 'bg-red-200 dark:bg-red-950/60 text-red-900 dark:text-red-300 border-red-400 dark:border-red-700 font-bold'
                  : 'bg-[#f7f6f3] dark:bg-[#252525] text-[#575653] dark:text-[#a8a7a4] border-[#e3e2e0] dark:border-[#383838] hover:bg-[#eae8e4]'
              }`}
            >
              48°C Catastrophic Wet-Bulb Peak
            </button>
          </div>

          <input
            type="range"
            min={35}
            max={48}
            step={1}
            value={ambientTemp}
            onChange={(e) => handleTempChange(Number(e.target.value))}
            className="w-full h-3 bg-[#e9e9e7] dark:bg-[#333333] rounded-lg appearance-none cursor-pointer accent-rose-600"
          />

          <div className="flex justify-between text-xs sm:text-sm font-mono text-[#787774] dark:text-[#9b9a97]">
            <span>35°C (Moderate)</span>
            <span>40°C (Heatwave Alert)</span>
            <span>44°C (Severe)</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">48°C (Extreme Peak)</span>
          </div>
        </div>

        {/* Dynamic Simulation Output Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 font-mono">
          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">COOLING SHELTERS SCALED</span>
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 block">
              {coolingShelters} Centers
            </span>
            <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1">AC & Misting Stations</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">POPULATION AT RISK</span>
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 block">
              {Number(vulnerablePop).toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 block mt-1">Informal Settlements</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">HEAT INDEX PEAK</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#2f2e2b] dark:text-white block">
              {heatIndex}°C
            </span>
            <span className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 block mt-1">Wet-Bulb Danger Mark</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">ADVISORY STATUS</span>
            <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 block leading-snug">
              {alertLevel}
            </span>
            <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block mt-1">NDMA Protocol Active</span>
          </div>
        </div>

        {/* TAB 1: HEAT SIMULATOR WARDS & THERMAL INERTIA */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#2f2e2b] dark:text-white flex items-center gap-2.5">
                    <Thermometer className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span>Ward-Level Urban Heat Island Telemetry</span>
                  </h3>
                  <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-1">
                    Differential surface temperature response calculated across Roorkee administrative sectors
                  </p>
                </div>
                <span className="text-xs font-mono bg-[#f7f6f3] dark:bg-[#282828] text-[#575653] dark:text-[#d4d4d4] px-3 py-1.5 rounded-lg border border-[#e3e2e0] dark:border-[#383838]">
                  4 Priority Sectors Monitored
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hotspotWards.map((ward, i) => (
                  <div
                    key={i}
                    className="bg-[#f7f6f3] dark:bg-[#191919] p-5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2.5 text-sm font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2f2e2b] dark:text-white text-base">{ward.name}</span>
                      <span className={`px-3 py-1 rounded-md font-bold text-xs border ${
                        Number(ward.surface_temp_c) >= 48
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : Number(ward.surface_temp_c) >= 42
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      }`}>
                        {ward.surface_temp_c}°C Surface Temp
                      </span>
                    </div>
                    <p className="text-[#575653] dark:text-[#d4d4d4] font-sans text-sm">
                      <b>Thermal Risk:</b> {ward.vulnerability_reason}
                    </p>
                    <div className="flex items-center justify-between text-[#787774] dark:text-[#9b9a97] pt-2.5 border-t border-[#e9e9e7] dark:border-[#2e2e2e] text-xs">
                      <span>Target Population: <b>{Number(ward.population || 0).toLocaleString()}</b></span>
                      <span className={ward.tree_canopy_pct >= 20 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400"}>
                        Canopy: {ward.tree_canopy_pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Explainer Card */}
            <div className="bg-[#f7f6f3] dark:bg-[#1c1c1c] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-white dark:bg-[#252525] rounded-xl border border-[#deddd9] dark:border-[#383838] text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-2 text-sm">
                <h4 className="font-bold text-[#2f2e2b] dark:text-[#f4f4f5] text-base">
                  NDMA Wet-Bulb Heat Action Protocol (WBGT ≥ 32°C Critical Threshold)
                </h4>
                <p className="text-[#575653] dark:text-[#a8a7a4] leading-relaxed">
                  When ambient temperatures exceed 42°C in high-humidity canal basins like Roorkee, the human body loses its ability to cool down through sweat evaporation. CLIMAGRID automatically converts temperature and relative humidity into Wet-Bulb Globe Temperature (WBGT), triggering automatic sirens and pre-allocating community cooling shelters before casualty spikes occur.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COOL ROOF 3-YEAR ROI & INTERACTIVE MUNICIPAL CALCULATOR */}
        {activeTab === 'roi' && (
          <div className="space-y-6">
            {/* Interactive Municipal ROI Calculator Card */}
            <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-7 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    MUNICIPAL ECONOMIC OPTIMIZER
                  </span>
                  <h3 className="text-xl font-bold text-[#2f2e2b] dark:text-white mt-1 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Interactive Cool Roof Payback & Energy Model</span>
                  </h3>
                  <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-1">
                    Calculate capital investment vs electricity savings and indoor thermal reduction across government & residential roofs
                  </p>
                </div>
                <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {paybackYears} Year Payback
                </span>
              </div>

              {/* Roof Area Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[#575653] dark:text-[#d4d4d4]">Target Cool Roof Coated Area:</span>
                  <span className="font-mono font-bold text-[#2f2e2b] dark:text-white">
                    {roofAreaM2.toLocaleString()} m² (≈ {(roofAreaM2 / 1000).toFixed(1)}k sq meters)
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={100000}
                  step={5000}
                  value={roofAreaM2}
                  onChange={(e) => setRoofAreaM2(Number(e.target.value))}
                  className="w-full h-3 bg-[#e9e9e7] dark:bg-[#333333] rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs font-mono text-[#787774] dark:text-[#9b9a97]">
                  <span>5,000 m² (Single Cluster)</span>
                  <span>25,000 m² (Ward Pilot)</span>
                  <span>50,000 m² (Sub-District)</span>
                  <span>100,000 m² (City-Wide)</span>
                </div>
              </div>

              {/* Economic & Energy KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono pt-2">
                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1">CAPEX (COATING)</span>
                  <span className="text-xl font-bold text-[#2f2e2b] dark:text-white">₹{capexLakhs} Lakhs</span>
                  <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mt-1">@ ₹68/m² (Elastomeric)</span>
                </div>

                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1">ANNUAL POWER SAVED</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{annualKwhSaved} kWh</span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 block mt-1">19.5 kWh/m²/yr</span>
                </div>

                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1">TARIFF SAVINGS</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{annualSavingsLakhs} L/yr</span>
                  <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mt-1">@ ₹7.50 / unit</span>
                </div>

                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1">PEOPLE PROTECTED</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{citizensProtected}</span>
                  <span className="text-xs text-amber-700 dark:text-amber-300 block mt-1">Indoor -4.2°C Relief</span>
                </div>
              </div>
            </div>

            {/* Existing Interventions List */}
            <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-7 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2f2e2b] dark:text-white flex items-center gap-2.5">
                  <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tree Canopy & Shading Interventions Roadmap</span>
                </h3>
                <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-1">
                  Targeted municipal interventions funded through state climate adaptation grants:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {interventions.map((inv, i) => (
                  <div
                    key={i}
                    className="bg-[#f7f6f3] dark:bg-[#191919] p-6 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-3.5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                          {inv.intervention_type?.split(' ')[0] || 'ADAPTATION'}
                        </span>
                        <span className="text-xs bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] px-3 py-1 rounded-full font-mono font-semibold">
                          {inv.projected_lst_reduction_celsius}°C Drop
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-[#2f2e2b] dark:text-white">{inv.corridor_name || inv.title}</h4>
                      <p className="text-sm text-[#575653] dark:text-[#d4d4d4] leading-relaxed">
                        {inv.dual_benefit || inv.intervention_type}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e9e9e7] dark:border-[#2e2e2e] font-mono text-xs sm:text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#787774] dark:text-[#9b9a97]">Estimated Budget:</span>
                        <b className="text-[#2f2e2b] dark:text-white">{inv.estimated_budget_inr || '₹16.5 Lakhs'}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#787774] dark:text-[#9b9a97]">Citizens Protected:</span>
                        <b className="text-emerald-600 dark:text-emerald-400">
                          {Number(inv.vulnerable_citizens_protected || 8200).toLocaleString()}
                        </b>
                      </div>
                      <div className="flex justify-between text-sky-600 dark:text-sky-400 font-semibold">
                        <span>Timeline:</span>
                        <span>{inv.implementation_timeline || 'Phase 1'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
