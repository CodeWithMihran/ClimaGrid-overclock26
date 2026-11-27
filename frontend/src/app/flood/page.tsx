'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Waves, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Megaphone,
  Play,
  Pause,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Activity
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
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-950">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  6-HOUR PREDICTIVE FLOOD INUNDATION TIMELINE
                </h1>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
                  MISSION MAUSAM / HYDRA-AI
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Dynamic hydrodynamic model forecasting water spread from Solani River & Upper Ganga canal breaches
              </p>
            </div>
          </div>

          {/* Play / Pause Simulator */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 font-black animate-pulse shadow-amber-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-950'
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
            <div className="bg-[#0b132b] p-4 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-mono block">RIVER STAGE LEVEL</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {currentStep?.solani_stage_meters || 5.42} m
              </span>
              <span className="text-xs text-rose-400 font-medium block mt-1">Danger Mark: 6.20m</span>
            </div>

            <div className="bg-[#0b132b] p-4 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-mono block">UPSTREAM DISCHARGE</span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">
                {data.meteorological_baseline.upstream_discharge_cusecs.toLocaleString()} cusecs
              </span>
              <span className="text-xs text-slate-400 block mt-1">Haridwar Ganga Barrage</span>
            </div>

            <div className="bg-[#0b132b] p-4 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-mono block">RAINFALL INTENSITY</span>
              <span className="text-2xl font-black text-blue-400 mt-1 block">
                {data.meteorological_baseline.rain_rate_mm_hr} mm/hr
              </span>
              <span className="text-xs text-amber-400 block mt-1">Extreme Cloudburst Band</span>
            </div>

            <div className="bg-[#0b132b] p-4 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-mono block">CITIZENS AT RISK</span>
              <span className="text-2xl font-black text-yellow-400 mt-1 block">
                {currentStep?.citizens_in_hazard_zone.toLocaleString() || '14,000'}
              </span>
              <span className="text-xs text-emerald-400 block mt-1">In Projected Inundation Mesh</span>
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
                  className={`p-4 rounded-2xl text-left transition-all border shadow-lg ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-950'
                      : 'bg-[#0b132b] border-slate-800 hover:border-slate-700 hover:bg-[#0e1738]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {s.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      idx === 0 ? 'bg-slate-800 text-slate-300' :
                      idx === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      idx === 2 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {s.status_badge}
                    </span>
                  </div>

                  <div className="text-lg font-black text-white mb-1">
                    {s.flooded_area_hectares} Hectares Flooded
                  </div>

                  <p className="text-xs text-slate-400 font-medium">
                    {s.citizens_in_hazard_zone.toLocaleString()} residents in risk zone
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Evacuation Alert Notification Banner */}
        {alertTriggered && (
          <div className="p-4 bg-red-950/90 border-2 border-red-500 rounded-2xl flex items-center justify-between gap-4 text-sm animate-fade-in shadow-2xl">
            <div className="flex items-center gap-3 text-red-200">
              <Megaphone className="w-6 h-6 text-red-400 animate-pulse shrink-0" />
              <span>
                <b>NDMA SACHET BROADCAST TRANSMITTED:</b> {alertTriggered}
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-red-800 text-white px-3 py-1 rounded-lg">
              CELL TOWERS NOTIFIED
            </span>
          </div>
        )}

        {/* Map & Step Detail Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tactical Map (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0b132b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[520px] relative">
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
            <div className="lg:col-span-5 bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase font-bold block">
                      HYDRO-SIMULATION TIMESTEP
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{currentStep.label}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full">
                    {currentStep.flooded_area_hectares} Ha Flooded
                  </span>
                </div>

                {/* Submerged Infrastructure */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Impassable Infrastructure & Critical Points:</span>
                  </h4>
                  <div className="space-y-2">
                    {currentStep.impassable_infrastructure.map((inf, i) => (
                      <div
                        key={i}
                        className="bg-[#070d1e] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="font-bold text-slate-200">{inf.name}</span>
                        <span className="text-rose-400 font-bold bg-rose-950/60 border border-rose-900/60 px-2 py-0.5 rounded">
                          Water Depth: {inf.depth_feet} ft
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Evacuation Action */}
                <div className="bg-[#070d1e] p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                  <span className="font-bold text-amber-300 block flex items-center gap-1.5 text-sm">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Early Warning & Preemptive Advisory:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans text-xs">
                    {currentStep.recommended_action}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleTriggerAlert(currentStep.recommended_action)}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm py-3 px-4 rounded-xl shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Megaphone className="w-4 h-4" />
                <span>Broadcast Geofenced Siren Evacuation Alert for this Hour</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
