'use client';

import React, { useState, useEffect } from 'react';
import { Waves, Clock, AlertTriangle, ShieldAlert, ArrowRight, Activity, Users, Compass, Megaphone } from 'lucide-react';
import { fetchPredictiveFloodTimeline } from '../lib/api';
import { PredictiveTimelineResponse, PredictiveFloodStep } from '../types';

interface PredictiveFloodTimelineProps {
  onSelectStepGeoJSON: (geojson: any) => void;
  onTriggerEvacAlert?: (actionText: string) => void;
}

export const PredictiveFloodTimeline: React.FC<PredictiveFloodTimelineProps> = ({
  onSelectStepGeoJSON,
  onTriggerEvacAlert
}) => {
  const [data, setData] = useState<PredictiveTimelineResponse | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const res = await fetchPredictiveFloodTimeline();
      if (isMounted) {
        setData(res);
        if (res.steps.length > 0) {
          onSelectStepGeoJSON(res.steps[0].geojson);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  // Auto-play preview loop
  useEffect(() => {
    if (!isPlaying || !data) return;
    const interval = setInterval(() => {
      setSelectedIdx((prev) => {
        const next = (prev + 1) % data.steps.length;
        onSelectStepGeoJSON(data.steps[next].geojson);
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying, data]);

  if (!data || !data.steps || data.steps.length === 0) return null;

  const currentStep = data.steps[selectedIdx];

  const handleSelectStep = (idx: number) => {
    setSelectedIdx(idx);
    setIsPlaying(false);
    onSelectStepGeoJSON(data.steps[idx].geojson);
  };

  return (
    <div className="bg-[#0b132b]/95 border-b border-slate-800 p-3 shadow-xl backdrop-blur-md">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-white uppercase">
                6-Hour Predictive Flood Inundation Timeline
              </span>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9px] font-mono px-1.5 py-0.2 rounded">
                MISSION MAUSAM / HYDRA-AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Upstream Haridwar Discharge: {data.meteorological_baseline.upstream_discharge_cusecs.toLocaleString()} cusecs | Rain Rate: {data.meteorological_baseline.rain_rate_mm_hr}mm/hr
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span>{isPlaying ? '⏸ Pause Simulation' : '▶ Play 6h Forecast'}</span>
          </button>
        </div>
      </div>

      {/* 4 Discrete Step Selector Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-2.5">
        {data.steps.map((s, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={s.step_id}
              onClick={() => handleSelectStep(idx)}
              className={`p-2 rounded-lg text-left transition-all border ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                  : 'bg-[#070d1e]/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                <span className={`px-1 rounded text-[8px] font-black ${
                  idx === 0 ? 'bg-slate-800 text-slate-300' :
                  idx === 1 ? 'bg-amber-500/20 text-amber-400' :
                  idx === 2 ? 'bg-red-500/20 text-red-400 animate-pulse' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {s.status_badge.split(' ')[0]}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-white">{s.flooded_area_hectares} Ha</span>
                <span className="text-slate-400 text-[10px] font-mono">{s.citizens_in_hazard_zone.toLocaleString()} At Risk</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Forecast Metrics & Early Warning Advisory */}
      <div className="bg-[#070d1e] rounded-lg p-2.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">River Stage:</span>
            <span className="text-white font-bold">{currentStep.solani_stage_meters}m</span>
            <span className="text-[10px] text-slate-500">(Danger: 6.20m)</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Users className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-slate-400">Citizens In Danger:</span>
            <span className="text-yellow-400 font-bold">{currentStep.citizens_in_hazard_zone.toLocaleString()}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="text-slate-400">Submerged:</span>
            <span className="text-red-300 font-semibold truncate max-w-xs">
              {currentStep.impassable_infrastructure.map(i => i.name).join(', ')}
            </span>
          </div>
        </div>

        {/* Action Callout */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            ⚡ {currentStep.recommended_action.split('.')[0]}.
          </span>
          {onTriggerEvacAlert && (
            <button
              onClick={() => onTriggerEvacAlert(currentStep.recommended_action)}
              className="bg-red-600/90 hover:bg-red-500 text-white font-mono text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow transition-all shrink-0"
            >
              <Megaphone className="w-3 h-3" />
              <span>Broadcast Evac Alert</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
