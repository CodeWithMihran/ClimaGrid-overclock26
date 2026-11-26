'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Navigation, Send } from 'lucide-react';
import { IncidentRecord } from '../types';

interface DistressStreamProps {
  incidents: IncidentRecord[];
  selectedIncident: IncidentRecord | null;
  onSelectIncident: (inc: IncidentRecord) => void;
  onApproveDispatch: (incidentId: string) => void;
  onCalculateRoute: (incident: IncidentRecord) => void;
}

export const DistressStream: React.FC<DistressStreamProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onApproveDispatch,
  onCalculateRoute
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0b132b]/90 border-r border-slate-800 w-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-[#070d1e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Live Distress Triage Stream
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
          {incidents.length} Records Ranked
        </span>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {incidents.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 font-mono">
            No distress calls in queue. Ingest message below to trigger triage.
          </div>
        ) : (
          incidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isP1 = inc.triage.priority_tier.includes('P1');
            const isP2 = inc.triage.priority_tier.includes('P2');
            const isDispatched = inc.status === 'DISPATCHED';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top Row: ID, Priority Badge & Score */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">{inc.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isP1
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : isP2
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}
                    >
                      {inc.triage.priority_tier}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      Score: {inc.triage.final_score.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Raw message quotation */}
                <p className="text-xs text-slate-300 line-clamp-2 italic mb-2">
                  &ldquo;{inc.raw_message}&rdquo;
                </p>

                {/* Extracted Entity Tags */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-[#070d1e] p-2 rounded-lg border border-slate-800/60 mb-2">
                  <div className="text-slate-400">
                    📍 <span className="text-slate-200">{inc.landmark}</span>
                  </div>
                  <div className="text-slate-400">
                    👥 <span className="text-slate-200">{inc.trapped_count} Trapped</span>
                  </div>
                  <div className="text-slate-400">
                    🌊 Water: <span className="text-slate-200">{inc.water_level_feet} ft</span>
                  </div>
                  <div className="text-slate-400">
                    🕒 Time: <span className="text-slate-200">{inc.timestamp}</span>
                  </div>
                </div>

                {/* Vulnerability badges */}
                {inc.vulnerabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {inc.vulnerabilities.map((v, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-rose-950/70 text-rose-300 border border-rose-800/60 px-1.5 py-0.5 rounded font-mono"
                      >
                        ⚠️ {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Explainable Reasoning snippet */}
                <p className="text-[10px] text-slate-400 font-mono mb-3 leading-tight">
                  {inc.triage.explanation}
                </p>

                {/* Action Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCalculateRoute(inc);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Route Preview</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproveDispatch(inc.id);
                    }}
                    disabled={isDispatched}
                    className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isDispatched
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/40'
                    }`}
                  >
                    {isDispatched ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Dispatched</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Approve Fleet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
