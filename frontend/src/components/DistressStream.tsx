'use client';

import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Navigation, 
  Send, 
  MapPin, 
  Users, 
  Waves, 
  Clock, 
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
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
    <div className="flex flex-col h-full bg-[#0b132b]/95 w-full overflow-hidden">
      {/* Stream Header */}
      <div className="p-3.5 border-b border-slate-800 bg-[#070d1e] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Live Distress Triage Stream
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-full shadow-sm">
          {incidents.length} Ranked
        </span>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {incidents.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-slate-500 font-mono">
            No distress calls in queue. Ingest message using simulator below.
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
                    ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {/* Top Row: ID, Priority Badge & Score */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">{inc.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isP1
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-mono animate-pulse'
                          : isP2
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-mono'
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
                <p className="text-xs text-slate-300 line-clamp-2 italic mb-2.5 leading-relaxed bg-[#070d1e]/60 p-2 rounded-lg border border-slate-800/40">
                  &ldquo;{inc.raw_message}&rdquo;
                </p>

                {/* Extracted Entity Tags */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-[#070d1e] p-2 rounded-lg border border-slate-800/80 mb-2">
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{inc.landmark}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>{inc.trapped_count} Trapped</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Waves className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Water: {inc.water_level_feet} ft</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{inc.timestamp}</span>
                  </div>
                </div>

                {/* Vulnerability badges */}
                {inc.vulnerabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {inc.vulnerabilities.map((v, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-rose-950/70 text-rose-300 border border-rose-800/60 px-1.5 py-0.5 rounded font-mono flex items-center gap-1"
                      >
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                        <span>{v}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Explainable Reasoning snippet */}
                <p className="text-[10px] text-slate-400 font-mono mb-2.5 leading-tight">
                  {inc.triage.explanation}
                </p>

                {/* Action Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCalculateRoute(inc);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
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
                    className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isDispatched
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950 hover:shadow-red-900/60'
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
