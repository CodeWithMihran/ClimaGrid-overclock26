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
    <div className="bg-[#f7f6f3] dark:bg-[#1f1f1f] border-t border-b border-[#e9e9e7] dark:border-[#2e2e2e] px-5 sm:px-8 py-2.5 flex items-center justify-between text-xs sm:text-[13px] font-mono text-[#5f5e5b] dark:text-[#a8a7a4] overflow-x-auto gap-6 select-none scrollbar-none transition-colors">
      {/* Live Feed Status Tag */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 dark:bg-emerald-500"></span>
        </span>
        <span className="text-[#207a43] dark:text-[#4ade80] font-bold uppercase tracking-wider text-xs">
          Live Basin Telemetry
        </span>
      </div>

      {/* Sensor Tickers */}
      <div className="flex items-center gap-7 shrink-0">
        {/* Solani River Gauge */}
        {solaniGauge && (
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-[#787774] dark:text-[#9b9a97]">{solaniGauge.name}:</span>
            <span className="text-[#2f2e2b] dark:text-white font-bold">{solaniGauge.water_level_m}m</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
              solaniGauge.status === 'CRITICAL'
                ? 'bg-[#fdf2f2] dark:bg-[#381e1e] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929] animate-pulse'
                : 'bg-[#fef9ee] dark:bg-[#342918] text-[#b45309] dark:text-[#fbbf24] border border-[#fcedca] dark:border-[#4d3a1f]'
            }`}>
              {solaniGauge.status} ({solaniGauge.trend})
            </span>
          </div>
        )}

        {/* Upper Ganga Canal Flow */}
        {gangaGauge && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[#787774] dark:text-[#9b9a97]">{gangaGauge.name}:</span>
            <span className="text-[#2f2e2b] dark:text-white font-bold">{gangaGauge.water_level_m}m</span>
            <span className="text-[#8c8a85] dark:text-[#888888]">({gangaGauge.discharge_cusecs.toLocaleString()} cusecs)</span>
          </div>
        )}

        {/* Water Quality Spike (JEEVAN) */}
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-[#787774] dark:text-[#9b9a97]">Turbidity:</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">{telemetry.water_quality.turbidity_ntu} NTU</span>
          <span className="bg-[#fdf2f2] dark:bg-[#381e1e] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929] px-2 py-0.5 rounded-md text-xs font-bold">
            SPIKE
          </span>
        </div>

        {/* Microclimate Heat Index */}
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="text-[#787774] dark:text-[#9b9a97]">Ambient / HI:</span>
          <span className="text-[#b45309] dark:text-[#fbbf24] font-bold">{telemetry.meteorological.temperature_c}°C</span>
          <span className="text-[#b0aeaa] dark:text-[#666666]">/</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">{telemetry.meteorological.heat_index_c}°C</span>
        </div>

        {/* Cloud SLA */}
        <div className="flex items-center gap-2 text-[#787774] dark:text-[#9b9a97] border-l border-[#deddd9] dark:border-[#383838] pl-5">
          <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Bedrock Triage:</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
            {telemetry.system_health.bedrock_nlp_latency_ms}ms
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs bg-[#eef8f2] dark:bg-[#1b2b22] px-2 py-0.5 rounded-md border border-[#ccecd8] dark:border-[#244b34]">
            &lt; 1.2s SLA
          </span>
        </div>
      </div>
    </div>
  );
};
