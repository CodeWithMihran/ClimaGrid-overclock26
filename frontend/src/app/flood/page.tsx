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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  6-HOUR PREDICTIVE FLOOD INUNDATION TIMELINE
                </h1>
                <span className="bg-sky-50 dark:bg-zinc-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-zinc-700 text-xs font-mono font-semibold px-3 py-0.5 rounded-full">
                  MISSION MAUSAM / HYDRA-AI
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Dynamic hydrodynamic model forecasting water spread from Solani River & Upper Ganga canal breaches
              </p>
            </div>
          </div>

          {/* Play / Pause Simulator */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Forecast</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play 6-Hour Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Meteorological Baseline Stats Bar */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono block mb-1">RIVER STAGE LEVEL</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 block">
                {currentStep?.solani_stage_meters || 5.42} m
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium block mt-1">Danger Mark: 6.20m</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono block mb-1">UPSTREAM DISCHARGE</span>
              <span className="text-2xl font-bold text-sky-700 dark:text-sky-400 block">
                {data.meteorological_baseline.upstream_discharge_cusecs.toLocaleString()} cusecs
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-1">Haridwar Ganga Barrage</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono block mb-1">RAINFALL INTENSITY</span>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 block">
                {data.meteorological_baseline.rain_rate_mm_hr} mm/hr
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 block mt-1">Extreme Cloudburst Band</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono block mb-1">CITIZENS AT RISK</span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 block">
                {currentStep?.citizens_in_hazard_zone.toLocaleString() || '14,000'}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 block mt-1">In Projected Inundation Mesh</span>
            </div>
          </div>
        )}

        {/* 4 Interactive Discrete Stepper Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {data.steps.map((s, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={s.step_id}
                  onClick={() => handleSelectStep(idx)}
                  className={`p-5 rounded-2xl text-left transition-all border shadow-xs ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-zinc-800/90 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20'
                      : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className={`font-bold ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-zinc-200'}`}>
                      {s.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      idx === 0 ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300' :
                      idx === 1 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                      idx === 2 ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-800 animate-pulse' :
                      'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                    }`}>
                      {s.status_badge}
                    </span>
                  </div>

                  <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {s.flooded_area_hectares} Hectares Flooded
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    {s.citizens_in_hazard_zone.toLocaleString()} residents in risk zone
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Evacuation Alert Notification Banner */}
        {alertTriggered && (
          <div className="p-4 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-2xl flex items-center justify-between gap-4 text-sm shadow-xs">
            <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
              <Megaphone className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse shrink-0" />
              <span>
                <b>NDMA SACHET BROADCAST TRANSMITTED:</b> {alertTriggered}
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-red-700 text-white px-3 py-1 rounded-lg">
              CELL TOWERS NOTIFIED
            </span>
          </div>
        )}

        {/* Map & Step Detail Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tactical Map (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs h-[520px] relative">
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
            <div className="lg:col-span-5 bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-sky-700 dark:text-sky-400 uppercase font-semibold block">
                      HYDRO-SIMULATION TIMESTEP
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{currentStep.label}</h3>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-sky-50 dark:bg-zinc-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-zinc-700 px-3 py-1 rounded-full">
                    {currentStep.flooded_area_hectares} Ha Flooded
                  </span>
                </div>

                {/* Submerged Infrastructure */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Impassable Infrastructure & Critical Points:</span>
                  </h4>
                  <div className="space-y-2">
                    {currentStep.impassable_infrastructure.map((inf, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 dark:bg-[#18181b] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{inf.name}</span>
                        <span className="text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded">
                          Depth: {inf.depth_feet} ft
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Evacuation Action */}
                <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs">
                  <span className="font-semibold text-amber-800 dark:text-amber-300 block flex items-center gap-1.5 text-sm">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Early Warning & Preemptive Advisory:</span>
                  </span>
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-sans text-xs">
                    {currentStep.recommended_action}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleTriggerAlert(currentStep.recommended_action)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                <span>Broadcast Geofenced Siren Evacuation Alert</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
