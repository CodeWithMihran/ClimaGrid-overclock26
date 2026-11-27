'use client';

import React, { useState, useEffect } from 'react';
import { Waves, Droplets, Flame, Activity, Zap } from 'lucide-react';
import { fetchTelemetrySnapshot } from '../lib/api';
import { TelemetryData } from '../types';

export const LiveTelemetryTicker: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      const snap = await fetchTelemetrySnapshot();
      if (isMounted) setTelemetry(snap);
    }
    loadInitial();

    // Poll live telemetry every 3s
    const timer = setInterval(async () => {
      const snap = await fetchTelemetrySnapshot();
      if (isMounted) setTelemetry(snap);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (!telemetry) return null;

  const solaniGauge = telemetry.gauges.find(g => g.id === "GAUGE-SOLANI-01") || telemetry.gauges[0];
  const gangaGauge = telemetry.gauges.find(g => g.id === "GAUGE-GANGA-02") || telemetry.gauges[1];

  return (
    <div className="bg-slate-100 dark:bg-[#09090b] border-b border-slate-200 dark:border-zinc-800/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400 overflow-x-auto gap-5 select-none scrollbar-none transition-colors">
      {/* Live Feed Status Tag */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-500"></span>
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
          IoT Telemetry
        </span>
      </div>

      {/* Sensor Tickers */}
      <div className="flex items-center gap-6 shrink-0 text-xs">
        {/* Solani River Gauge */}
        {solaniGauge && (
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="text-slate-500 dark:text-zinc-400">{solaniGauge.name}:</span>
            <span className="text-slate-900 dark:text-zinc-100 font-bold">{solaniGauge.water_level_m}m</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              solaniGauge.status === 'CRITICAL'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}>
              {solaniGauge.status} ({solaniGauge.trend})
            </span>
          </div>
        )}

        {/* Upper Ganga Canal Flow */}
        {gangaGauge && (
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-500 dark:text-zinc-400">{gangaGauge.name}:</span>
            <span className="text-slate-900 dark:text-zinc-100 font-bold">{gangaGauge.water_level_m}m</span>
            <span className="text-slate-500 dark:text-zinc-500">({gangaGauge.discharge_cusecs.toLocaleString()} cusecs)</span>
          </div>
        )}

        {/* Water Quality Spike (JEEVAN) */}
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-slate-500 dark:text-zinc-400">Turbidity:</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">{telemetry.water_quality.turbidity_ntu} NTU</span>
          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
            SPIKE
          </span>
        </div>

        {/* Microclimate Heat Index */}
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          <span className="text-slate-500 dark:text-zinc-400">Ambient / HI:</span>
          <span className="text-amber-700 dark:text-amber-300 font-bold">{telemetry.meteorological.temperature_c}°C</span>
          <span className="text-slate-400 dark:text-zinc-600">/</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">{telemetry.meteorological.heat_index_c}°C</span>
        </div>

        {/* Cloud SLA */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 border-l border-slate-300 dark:border-zinc-800 pl-4">
          <Zap className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          <span>Bedrock Triage:</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
            {telemetry.system_health.bedrock_nlp_latency_ms}ms (&lt;1.2s SLA)
          </span>
        </div>
      </div>
    </div>
  );
};
