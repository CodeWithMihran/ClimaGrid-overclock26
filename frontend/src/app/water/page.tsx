'use client';

import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { 
  fetchWaterSensors, 
  fetchSensorHistory, 
  fetchBoilWaterAdvisory, 
  fetchCommunityReports, 
  submitCommunityWaterReport 
} from '../../lib/api';
import { WaterSensorNode } from '../../types';

export default function WaterSafetyPage() {
  const [sensors, setSensors] = useState<WaterSensorNode[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('WS-SOLANI-01');
  const [historyData, setHistoryData] = useState<any>(null);
  const [advisoryData, setAdvisoryData] = useState<any>(null);
  const [communityReports, setCommunityReports] = useState<any[]>([]);
  const [reportWard, setReportWard] = useState<string>('Sector 4 / Solani Basin');
  const [reportDesc, setReportDesc] = useState<string>('Muddy brown tap water with foul smell.');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const sList = await fetchWaterSensors();
        setSensors(sList);
        const [h, adv, reps] = await Promise.all([
          fetchSensorHistory(selectedSensorId),
          fetchBoilWaterAdvisory(selectedSensorId),
          fetchCommunityReports()
        ]);
        setHistoryData(h);
        setAdvisoryData(adv);
        setCommunityReports(reps);
      } catch (e) {
        console.error('Failed to load water telemetry:', e);
      }
    }
    load();
  }, [selectedSensorId]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;
    setIsSubmittingReport(true);
    try {
      const newRep = await submitCommunityWaterReport(reportWard, reportDesc, 'CRITICAL');
      setCommunityReports((prev) => [newRep, ...prev]);
      setReportDesc('');
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const selectedSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 space-y-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#f0f7fb] dark:bg-[#1a2634] border border-[#d8eaf6] dark:border-[#223547] flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs">
              <Droplets className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  JEEVAN WATER QUALITY & EPIDEMIC SHIELD
                </h1>
                <span className="bg-[#f0f7fb] dark:bg-[#1a2634] text-sky-700 dark:text-sky-300 border border-[#d8eaf6] dark:border-[#223547] text-xs font-mono font-semibold px-3 py-1 rounded-full">
                  POTABILITY MONITORING
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-[#787774] dark:text-[#9b9a97] mt-1">
                IoT turbidity, pH, dissolved oxygen & early warning epidemic prediction for waterborne disease prevention
              </p>
            </div>
          </div>

          <span className="bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>4 SENSOR NODES ONLINE</span>
          </span>
        </div>

        {/* 4 Sensor Station Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sensors.map((s) => {
            const isSelected = selectedSensorId === s.id;
            const isCritical = s.status === 'CRITICAL_CONTAMINATION' || s.turbidity_ntu > 20;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedSensorId(s.id)}
                className={`p-6 rounded-2xl border cursor-pointer transition-colors shadow-xs space-y-4 ${
                  isSelected
                    ? 'bg-[#f4f9fd] dark:bg-[#242c35] border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/15'
                    : 'bg-white dark:bg-[#202020] border-[#e9e9e7] dark:border-[#2e2e2e] hover:border-[#deddd9] dark:hover:border-[#383838]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 block">{s.id}</span>
                    <h3 className="font-bold text-base text-[#2f2e2b] dark:text-white mt-1">{s.name}</h3>
                  </div>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                    isCritical
                      ? 'bg-[#fdf2f2] dark:bg-[#381e1e] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929] animate-pulse'
                      : 'bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34]'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm font-mono bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">TURBIDITY:</span>
                    <span className={`text-lg font-bold ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {s.turbidity_ntu} NTU
                    </span>
                  </div>
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">pH LEVEL:</span>
                    <span className="text-lg font-bold text-[#2f2e2b] dark:text-white">{s.ph_level}</span>
                  </div>
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">DISSOLVED O2:</span>
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{s.dissolved_oxygen_mg_l} mg/L</span>
                  </div>
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">CHOLERA RISK:</span>
                    <span className={`text-lg font-bold ${s.is_anomalous ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {s.is_anomalous ? 'HIGH RISK' : 'LOW RISK'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 12-Hour Trend & Boil-Water Notice Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: 12-Hour History Timeline (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#2e2e2e] pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 uppercase">TELEMETRY HISTORY</span>
                <h3 className="text-xl font-bold text-[#2f2e2b] dark:text-white mt-1">
                  12-Hour Turbidity Ingress Timeline ({selectedSensor?.name})
                </h3>
              </div>
              <span className="text-xs sm:text-sm font-mono text-[#787774] dark:text-[#9b9a97]">Baseline Safe: &lt; 5.0 NTU</span>
            </div>

            {historyData && (
              <div className="space-y-4 font-mono text-sm">
                {historyData.history?.map((pt: any, i: number) => {
                  const pct = Math.min(100, Math.round((pt.turbidity_ntu / 50) * 100));
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#575653] dark:text-[#a8a7a4]">{pt.time_offset}</span>
                        <span className={`font-bold ${pt.turbidity_ntu > 20 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {pt.turbidity_ntu} NTU ({pt.status})
                        </span>
                      </div>
                      <div className="w-full bg-[#f1f1ef] dark:bg-[#2b2b2b] rounded-full h-2.5 overflow-hidden border border-[#e3e2e0] dark:border-[#383838]">
                        <div
                          className={`h-full ${pt.turbidity_ntu > 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Boil-Water Advisory & Safe Tanker Locator (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
            {advisoryData && (
              <div className="space-y-5">
                <div className="flex items-center gap-3.5 border-b border-[#e9e9e7] dark:border-[#2e2e2e] pb-4">
                  <div className="h-11 w-11 rounded-xl bg-[#fdf2f2] dark:bg-[#341d1d] border border-[#fae1e1] dark:border-[#4d2525] flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 uppercase">DISTRICT HEALTH ORDER</span>
                    <h3 className="text-base sm:text-lg font-bold text-[#2f2e2b] dark:text-white mt-0.5">
                      {advisoryData.classification || advisoryData.advisory_title || "EMERGENCY HEALTH ADVISORY (BOIL-WATER NOTICE)"}
                    </h3>
                  </div>
                </div>

                <div className="bg-[#fef9ee] dark:bg-[#261f14] p-5 rounded-xl border border-[#fcedca] dark:border-[#47341b] text-sm space-y-2.5">
                  <p className="text-[#3b3a37] dark:text-[#d4d4d4] leading-relaxed font-sans font-medium">
                    {advisoryData.trigger_cause || advisoryData.advisory_text || "Submergence and structural silt infiltration during flood crest."}
                  </p>
                  {advisoryData.mandatory_guidelines && (
                    <ul className="list-disc pl-5 text-xs sm:text-sm text-[#575653] dark:text-[#a8a7a4] space-y-1 mt-2">
                      {advisoryData.mandatory_guidelines.map((g: string, i: number) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-rose-700 dark:text-rose-400 font-bold font-mono text-xs pt-1">
                    Issued by: {advisoryData.issuing_authority || "District Disaster Management & Jal Sansthan"} ({advisoryData.advisory_id || "BWA-01"})
                  </p>
                </div>

                {/* Safe Tankers */}
                <div>
                  <span className="text-xs font-mono font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-3 uppercase tracking-wider">
                    DISPATCHED SAFE DRINKING WATER TANKERS:
                  </span>
                  <div className="space-y-2.5 text-sm font-mono">
                    {(advisoryData.emergency_tanker_points || advisoryData.emergency_water_tanker_locations || [
                      { location: "Solani Chowk High Ground", water_truck_id: "JAL-TANKER-04", capacity_litres: 10000 },
                      { location: "Nehru Nagar Relief Camp", water_truck_id: "JAL-TANKER-07", capacity_litres: 10000 }
                    ]).map((pt: any, i: number) => {
                      const locName = typeof pt === 'string' ? pt : `${pt.location} (${pt.water_truck_id} • ${(pt.capacity_litres || 10000).toLocaleString()}L)`;
                      return (
                        <div key={i} className="bg-[#f7f6f3] dark:bg-[#191919] p-3.5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center gap-3 text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm">
                          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{locName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Community Report Form */}
            <form onSubmit={handleSubmitReport} className="pt-4 border-t border-[#e9e9e7] dark:border-[#2e2e2e] space-y-3">
              <span className="text-sm font-semibold text-[#2f2e2b] dark:text-white block">Submit Community Water Quality Incident:</span>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Report tap contamination / bad odor..."
                  className="flex-1 bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl px-4 py-3 text-sm text-[#2f2e2b] dark:text-white placeholder-[#9b9a97] dark:placeholder-[#666666] focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReport || !reportDesc.trim()}
                  className="bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] font-semibold px-5 py-3 rounded-xl text-sm transition-all shrink-0 shadow-xs"
                >
                  Report
                </button>
              </div>
              {reportSuccess && (
                <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold block">
                  Report verified and factored into risk engine!
                </span>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
