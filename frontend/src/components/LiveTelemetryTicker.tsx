'use client';

import React, { useState, useEffect } from 'react';
import { Waves, Droplets, Flame, Radio, Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
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

    // Poll live telemetry every 2.5s
    const timer = setInterval(async () => {
      const snap = await fetchTelemetrySnapshot();
      if (isMounted) setTelemetry(snap);
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (!telemetry) return null;

  const solaniGauge = telemetry.gauges.find(g => g.id === "GAUGE-SOLANI-01") || telemetry.gauges[0];
  const gangaGauge = telemetry.gauges.find(g => g.id === "GAUGE-GANGA-02") || telemetry.gauges[1];

  return (
    <div className="bg-[#070d1e] border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300 overflow-x-auto gap-4 select-none">
      {/* Live Feed Status Tag */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
          IoT Telemetry Stream
        </span>
      </div>

      {/* Sensor Tickers */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Solani River Gauge */}
        {solaniGauge && (
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{solaniGauge.name}:</span>
            <span className="text-white font-bold">{solaniGauge.water_level_m}m</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
              solaniGauge.status === 'CRITICAL'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {solaniGauge.status} ({solaniGauge.trend})
            </span>
          </div>
        )}

        {/* Upper Ganga Canal Flow */}
        {gangaGauge && (
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">{gangaGauge.name}:</span>
            <span className="text-white font-bold">{gangaGauge.water_level_m}m</span>
            <span className="text-slate-400">({gangaGauge.discharge_cusecs.toLocaleString()} cusecs)</span>
          </div>
        )}

        {/* Water Quality Spike (JEEVAN) */}
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Purqazi Turbidity:</span>
          <span className="text-rose-400 font-bold">{telemetry.water_quality.turbidity_ntu} NTU</span>
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded text-[9px] font-black">
            CONTAMINATION SPIKE
          </span>
        </div>

        {/* Microclimate Heat Index */}
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-slate-400">Ambient / HI:</span>
          <span className="text-amber-300 font-bold">{telemetry.meteorological.temperature_c}°C</span>
          <span className="text-slate-500">/</span>
          <span className="text-rose-400 font-bold">{telemetry.meteorological.heat_index_c}°C Heat Index</span>
        </div>

        {/* SLA & LoRa Gateway */}
        <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-4">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Bedrock NLP:</span>
          <span className="text-cyan-300 font-bold">{telemetry.system_health.bedrock_nlp_latency_ms}ms</span>
          <span className="text-emerald-400 text-[10px]">(&lt;1.2s SLA ✓)</span>
        </div>
      </div>
    </div>
  );
};
