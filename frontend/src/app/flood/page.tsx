'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Waves, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Megaphone,
  Play,
  Pause
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { fetchPredictiveFloodTimeline, fetchFloodGeoJSON } from '../../lib/api';
import { PredictiveTimelineResponse, PredictiveFloodStep } from '../../types';

// Dynamic Leaflet Map
const TacticalMap = dynamic(
  () => import('../../components/TacticalMap').then((mod) => mod.TacticalMap),
  { ssr: false }
);

export default function PredictiveFloodPage() {
  const [data, setData] = useState<PredictiveTimelineResponse | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [floodGeoJSON, setFloodGeoJSON] = useState<any>(null);
  const [alertTriggered, setAlertTriggered] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [timelineRes, geoRes] = await Promise.all([
          fetchPredictiveFloodTimeline(),
          fetchFloodGeoJSON()
        ]);
        setData(timelineRes);
        setFloodGeoJSON(geoRes);
        if (timelineRes.steps.length > 0) {
          setFloodGeoJSON(timelineRes.steps[0].geojson);
        }
      } catch (e) {
        console.error('Failed to load flood intelligence:', e);
      }
    }
    load();
  }, []);

  // Auto-simulation loop
  useEffect(() => {
    if (!isPlaying || !data) return;
    const interval = setInterval(() => {
      setSelectedIdx((prev) => {
        const next = (prev + 1) % data.steps.length;
        setFloodGeoJSON(data.steps[next].geojson);
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying, data]);

  const handleSelectStep = (idx: number) => {
    setSelectedIdx(idx);
    setIsPlaying(false);
    if (data?.steps[idx]) {
      setFloodGeoJSON(data.steps[idx].geojson);
    }
  };

  const handleTriggerAlert = (action: string) => {
    setAlertTriggered(action);
    setTimeout(() => setAlertTriggered(null), 5000);
  };

  const currentStep: PredictiveFloodStep | undefined = data?.steps[selectedIdx];

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#f0f7fb] dark:bg-[#1a2634] border border-[#d8eaf6] dark:border-[#223547] flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs">
              <Waves className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  6-HOUR PREDICTIVE FLOOD INUNDATION TIMELINE
                </h1>
                <span className="bg-[#f0f7fb] dark:bg-[#1a2634] text-sky-700 dark:text-sky-300 border border-[#d8eaf6] dark:border-[#223547] text-xs font-mono font-semibold px-3 py-1 rounded-full">
                  MISSION MAUSAM / HYDRA-AI
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-[#787774] dark:text-[#9b9a97] mt-1">
                Dynamic hydrodynamic model forecasting water spread from Solani River & Upper Ganga canal breaches
              </p>
            </div>
          </div>

          {/* Play / Pause Simulator */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-3 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-2.5 shadow-xs transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                : 'bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Forecast</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Play 6-Hour Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Meteorological Baseline Stats Bar */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] font-mono block mb-1 uppercase font-medium">RIVER STAGE LEVEL</span>
              <span className="text-3xl font-bold text-[#2f2e2b] dark:text-white block">
                {currentStep?.solani_stage_meters || 5.42} m
              </span>
              <span className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium block mt-1">Danger Mark: 6.20m</span>
            </div>

            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] font-mono block mb-1 uppercase font-medium">UPSTREAM DISCHARGE</span>
              <span className="text-3xl font-bold text-sky-600 dark:text-sky-400 block">
                {data.meteorological_baseline.upstream_discharge_cusecs.toLocaleString()} cusecs
              </span>
              <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1">Haridwar Ganga Barrage</span>
            </div>

            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] font-mono block mb-1 uppercase font-medium">RAINFALL INTENSITY</span>
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 block">
                {data.meteorological_baseline.rain_rate_mm_hr} mm/hr
              </span>
              <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 block mt-1">Extreme Cloudburst Band</span>
            </div>

            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] font-mono block mb-1 uppercase font-medium">CITIZENS AT RISK</span>
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 block">
                {currentStep?.citizens_in_hazard_zone.toLocaleString() || '14,000'}
              </span>
              <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block mt-1">In Projected Inundation Mesh</span>
            </div>
          </div>
        )}

        {/* 4 Interactive Discrete Stepper Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {data.steps.map((s, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={s.step_id}
                  onClick={() => handleSelectStep(idx)}
                  className={`p-6 rounded-2xl text-left transition-all border shadow-xs ${
                    isSelected
                      ? 'bg-[#f4f9fd] dark:bg-[#242c35] border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/15'
                      : 'bg-white dark:bg-[#202020] border-[#e9e9e7] dark:border-[#2e2e2e] hover:border-[#deddd9] dark:hover:border-[#383838]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                    <span className={`text-sm font-bold ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-[#2f2e2b] dark:text-[#e6e6e5]'}`}>
                      {s.label}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      idx === 0 ? 'bg-[#f7f6f3] dark:bg-[#2b2b2b] text-[#575653] dark:text-[#a8a7a4]' :
                      idx === 1 ? 'bg-[#fef9ee] dark:bg-[#342918] text-[#b45309] dark:text-[#fbbf24] border border-[#fcedca] dark:border-[#4d3a1f]' :
                      idx === 2 ? 'bg-[#fdf2f2] dark:bg-[#381e1e] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929] animate-pulse' :
                      'bg-[#f0f7fb] dark:bg-[#1a2634] text-sky-700 dark:text-sky-300 border border-[#d8eaf6] dark:border-[#223547]'
                    }`}>
                      {s.status_badge}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-[#2f2e2b] dark:text-white mb-1.5">
                    {s.flooded_area_hectares} Hectares Flooded
                  </div>

                  <p className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] font-medium">
                    {s.citizens_in_hazard_zone.toLocaleString()} residents in risk zone
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Evacuation Alert Notification Banner */}
        {alertTriggered && (
          <div className="p-5 bg-[#fdf2f2] dark:bg-[#341d1d] border border-[#fae1e1] dark:border-[#4d2525] rounded-2xl flex items-center justify-between gap-4 text-sm sm:text-base shadow-xs">
            <div className="flex items-center gap-3.5 text-[#b91c1c] dark:text-[#f87171]">
              <Megaphone className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse shrink-0" />
              <span>
                <b>NDMA SACHET BROADCAST TRANSMITTED:</b> {alertTriggered}
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-[#b91c1c] text-white px-3.5 py-1.5 rounded-lg">
              CELL TOWERS NOTIFIED
            </span>
          </div>
        )}

        {/* Map & Step Detail Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Tactical Map (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl overflow-hidden shadow-xs h-[540px] relative">
            <TacticalMap
              activeModule="flood"
              incidents={[]}
              selectedIncident={null}
              onSelectIncident={() => {}}
              waterSensors={[]}
              heatData={null}
              floodGeoJSON={floodGeoJSON}
              activeRoute={null}
            />
          </div>

          {/* Right: Selected Forecast Step Detail (5 Cols) */}
          {currentStep && (
            <div className="lg:col-span-5 bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#2e2e2e] pb-4">
                  <div>
                    <span className="text-xs font-mono text-sky-700 dark:text-sky-400 uppercase font-semibold block">
                      HYDRO-SIMULATION TIMESTEP
                    </span>
                    <h3 className="text-2xl font-bold text-[#2f2e2b] dark:text-white mt-1">{currentStep.label}</h3>
                  </div>
                  <span className="text-sm font-mono font-semibold bg-[#f0f7fb] dark:bg-[#1a2634] text-sky-700 dark:text-sky-300 border border-[#d8eaf6] dark:border-[#223547] px-3.5 py-1.5 rounded-full">
                    {currentStep.flooded_area_hectares} Ha Flooded
                  </span>
                </div>

                {/* Submerged Infrastructure */}
                <div>
                  <h4 className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Impassable Infrastructure & Critical Points:</span>
                  </h4>
                  <div className="space-y-2.5">
                    {currentStep.impassable_infrastructure.map((inf, i) => (
                      <div
                        key={i}
                        className="bg-[#f7f6f3] dark:bg-[#191919] p-3.5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-between text-sm font-mono"
                      >
                        <span className="font-semibold text-[#2f2e2b] dark:text-white">{inf.name}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-semibold bg-[#fdf2f2] dark:bg-[#341d1d] border border-[#fae1e1] dark:border-[#4d2525] px-2.5 py-1 rounded-md text-xs">
                          Depth: {inf.depth_feet} ft
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Evacuation Action - Notion Callout style */}
                <div className="bg-[#fef9ee] dark:bg-[#261f14] p-5 rounded-xl border border-[#fcedca] dark:border-[#47341b] space-y-2 text-sm">
                  <span className="font-semibold text-[#b45309] dark:text-[#fbbf24] block flex items-center gap-2 text-base">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Early Warning & Preemptive Advisory:</span>
                  </span>
                  <p className="text-[#575653] dark:text-[#d4d4d4] leading-relaxed font-sans text-sm sm:text-[15px]">
                    {currentStep.recommended_action}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleTriggerAlert(currentStep.recommended_action)}
                className="w-full bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] font-bold text-sm sm:text-base py-3.5 px-5 rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all"
              >
                <Megaphone className="w-5 h-5 text-rose-400 dark:text-rose-600" />
                <span>Broadcast Geofenced Siren Evacuation Alert</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
