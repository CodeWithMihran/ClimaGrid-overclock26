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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  JEEVAN WATER QUALITY & EPIDEMIC SHIELD
                </h1>
                <span className="bg-sky-50 dark:bg-zinc-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-zinc-700 text-xs font-mono font-semibold px-3 py-0.5 rounded-full">
                  POTABILITY MONITORING
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                IoT turbidity, pH, dissolved oxygen & early warning epidemic prediction for waterborne disease prevention
              </p>
            </div>
          </div>

          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>4 SENSOR NODES ONLINE</span>
          </span>
        </div>

        {/* 4 Sensor Station Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sensors.map((s) => {
            const isSelected = selectedSensorId === s.id;
            const isCritical = s.status === 'CRITICAL_CONTAMINATION' || s.turbidity_ntu > 20;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedSensorId(s.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-colors shadow-xs space-y-3 ${
                  isSelected
                    ? 'bg-sky-50/70 dark:bg-zinc-800/90 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20'
                    : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 block">{s.id}</span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{s.name}</h3>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-[#18181b] p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">TURBIDITY:</span>
                    <span className={`text-base font-bold ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {s.turbidity_ntu} NTU
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">pH LEVEL:</span>
                    <span className="text-base font-bold text-slate-900 dark:text-zinc-100">{s.ph_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">DISSOLVED O2:</span>
                    <span className="text-base font-bold text-sky-700 dark:text-sky-300">{s.dissolved_oxygen_mg_l} mg/L</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">CHOLERA RISK:</span>
                    <span className={`text-base font-bold ${s.is_anomalous ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {s.is_anomalous ? 'HIGH RISK' : 'LOW RISK'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 12-Hour Trend & Boil-Water Notice Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 12-Hour History Timeline (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 uppercase">TELEMETRY HISTORY</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  12-Hour Turbidity Ingress Timeline ({selectedSensor?.name})
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">Baseline Safe: &lt; 5.0 NTU</span>
            </div>

            {historyData && (
              <div className="space-y-3 font-mono text-xs">
                {historyData.history?.map((pt: any, i: number) => {
                  const pct = Math.min(100, Math.round((pt.turbidity_ntu / 50) * 100));
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-zinc-400">{pt.time_offset}</span>
                        <span className={`font-bold ${pt.turbidity_ntu > 20 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {pt.turbidity_ntu} NTU ({pt.status})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-zinc-700">
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
          <div className="lg:col-span-5 bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
            {advisoryData && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 uppercase">DISTRICT HEALTH ORDER</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{advisoryData.advisory_title}</h3>
                  </div>
                </div>

                <div className="bg-rose-50/50 dark:bg-[#18181b] p-4 rounded-xl border border-rose-200 dark:border-zinc-800 text-xs space-y-2">
                  <p className="text-slate-800 dark:text-zinc-200 leading-relaxed font-sans">{advisoryData.advisory_text}</p>
                  <p className="text-rose-700 dark:text-rose-400 font-bold font-mono">Issued by: {advisoryData.issuing_authority}</p>
                </div>

                {/* Safe Tankers */}
                <div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 block mb-2 uppercase tracking-wider">
                    DISPATCHED SAFE DRINKING WATER TANKERS:
                  </span>
                  <div className="space-y-2 text-xs font-mono">
                    {advisoryData.emergency_water_tanker_locations?.map((loc: string, i: number) => (
                      <div key={i} className="bg-slate-50 dark:bg-[#18181b] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{loc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Community Report Form */}
            <form onSubmit={handleSubmitReport} className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Submit Community Water Quality Incident:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Report tap contamination / bad odor..."
                  className="flex-1 bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReport || !reportDesc.trim()}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 shadow-xs"
                >
                  Report
                </button>
              </div>
              {reportSuccess && (
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">
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
