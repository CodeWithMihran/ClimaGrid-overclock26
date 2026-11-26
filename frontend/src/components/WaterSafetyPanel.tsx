'use client';

import React, { useState, useEffect } from 'react';
import { Droplets, AlertTriangle, FileText, CheckCircle2, ShieldCheck, Activity, Users, Send } from 'lucide-react';
import { WaterSensorNode } from '../types';
import { fetchSensorHistory, fetchBoilWaterAdvisory, fetchCommunityReports, submitCommunityWaterReport } from '../lib/api';

interface WaterSafetyPanelProps {
  sensors: WaterSensorNode[];
  onSelectSensorOnMap?: (sensor: WaterSensorNode) => void;
}

export const WaterSafetyPanel: React.FC<WaterSafetyPanelProps> = ({ sensors }) => {
  const [selectedSensorId, setSelectedSensorId] = useState<string>('WS-SOLANI-01');
  const [historyData, setHistoryData] = useState<any>(null);
  const [advisoryModalOpen, setAdvisoryModalOpen] = useState<boolean>(false);
  const [advisoryData, setAdvisoryData] = useState<any>(null);
  const [communityReports, setCommunityReports] = useState<any[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportWard, setReportWard] = useState<string>('Sector 4 / Solani Basin');
  const [reportDesc, setReportDesc] = useState<string>('Muddy brown tap water with foul smell.');

  // Load history & community reports on mount
  useEffect(() => {
    fetchSensorHistory(selectedSensorId)
      .then(setHistoryData)
      .catch(console.error);

    fetchCommunityReports()
      .then(setCommunityReports)
      .catch(console.error);
  }, [selectedSensorId]);

  const handleOpenAdvisory = async () => {
    try {
      const adv = await fetchBoilWaterAdvisory(selectedSensorId);
      setAdvisoryData(adv);
      setAdvisoryModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;
    try {
      const newRep = await submitCommunityWaterReport(reportWard, reportDesc, 'CRITICAL');
      setCommunityReports((prev) => [newRep, ...prev]);
      setReportModalOpen(false);
      alert('Community Water Report submitted and factored into risk engine!');
    } catch (e) {
      console.error(e);
    }
  };

  const selectedSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  return (
    <div className="bg-[#070d1e] border border-amber-500/30 rounded-2xl p-3.5 space-y-3.5 text-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-slate-100 uppercase tracking-wider">
            JEEVAN Water Quality Intelligence
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
          POST-FLOOD EPIDEMIC SHIELD
        </span>
      </div>

      {/* Sensor Node Switcher Tabs */}
      <div className="flex flex-wrap gap-1">
        {sensors.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSensorId(s.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedSensorId === s.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {s.name.replace('HydraSense ', '')}
          </button>
        ))}
      </div>

      {/* Selected Sensor Status Card */}
      {selectedSensor && (
        <div className={`p-2.5 rounded-xl border ${
          selectedSensor.status === 'CRITICAL_CONTAMINATION'
            ? 'bg-red-950/60 border-red-500/50 text-red-200'
            : selectedSensor.status === 'WARNING'
            ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold">{selectedSensor.landmark}</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/40">
              {selectedSensor.status}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono mt-1.5">
            <div className="bg-black/30 p-1.5 rounded">
              <span className="block text-[9px] opacity-70">TURBIDITY</span>
              <span className="font-bold text-sm text-amber-300">{selectedSensor.turbidity_ntu} NTU</span>
            </div>
            <div className="bg-black/30 p-1.5 rounded">
              <span className="block text-[9px] opacity-70">PH LEVEL</span>
              <span className="font-bold text-sm">{selectedSensor.ph_level}</span>
            </div>
            <div className="bg-black/30 p-1.5 rounded">
              <span className="block text-[9px] opacity-70">TDS PPM</span>
              <span className="font-bold text-sm">{selectedSensor.tds_ppm}</span>
            </div>
            <div className="bg-black/30 p-1.5 rounded">
              <span className="block text-[9px] opacity-70">DISSOLVED O2</span>
              <span className="font-bold text-sm">{selectedSensor.dissolved_oxygen_mg_l}</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Time-Series Anomaly Chart (12 Hours) */}
      {historyData && (
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              12-Hour Turbidity Inundation Timeline
            </span>
            <span className="text-[10px] text-amber-400 font-mono">
              Safe Limit: &lt;5 NTU
            </span>
          </div>

          {/* SVG Line / Bar visualization */}
          <div className="h-20 w-full flex items-end gap-1.5 pt-4 px-1 border-b border-slate-800">
            {historyData.timeline.map((point: any, idx: number) => {
              const maxTurbidity = 50;
              const heightPct = Math.min(100, Math.max(10, (point.turbidity / maxTurbidity) * 100));
              const isBreach = point.turbidity > historyData.safe_threshold_turbidity;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 border border-slate-700 text-[9px] px-1.5 py-0.5 rounded text-white font-mono z-20 whitespace-nowrap">
                    {point.turbidity} NTU ({point.time})
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      isBreach ? 'bg-gradient-to-t from-red-600 to-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[8px] text-slate-500 font-mono mt-1">{point.time}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>Flood Breach: <b className="text-red-400">Hour -4</b></span>
            <span>Contamination: <b className="text-amber-400">{historyData.contamination_factor}</b></span>
          </div>
        </div>
      )}

      {/* Action Buttons: Issue Boil Water Notice & Community Tap Reporting */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleOpenAdvisory}
          className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Issue Boil-Water Notice</span>
        </button>

        <button
          onClick={() => setReportModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Report Tap Water</span>
        </button>
      </div>

      {/* Community Reports Feed */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
          Crowdsourced Citizen Reports ({communityReports.length}):
        </span>
        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
          {communityReports.map((rep: any) => (
            <div key={rep.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px]">
              <div className="flex justify-between items-center text-slate-400 text-[10px]">
                <span className="font-bold text-slate-200">{rep.ward}</span>
                <span className="font-mono text-amber-400">{rep.timestamp}</span>
              </div>
              <p className="text-slate-300 mt-0.5 italic">"{rep.description}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* OFFICIAL MUNICIPAL BOIL WATER ADVISORY MODAL */}
      {advisoryModalOpen && advisoryData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border-2 border-amber-500 rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-3.5 text-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-amber-500/40 pb-2">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold tracking-wider uppercase block">
                  DISTRICT DISASTER MANAGEMENT CELL
                </span>
                <h2 className="text-sm font-black text-white">{advisoryData.classification}</h2>
              </div>
              <span className="text-xs font-mono bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p><b>Bulletin ID:</b> <span className="font-mono text-cyan-300">{advisoryData.advisory_id}</span></p>
              <p><b>Trigger:</b> {advisoryData.trigger_cause}</p>
              <p><b>Affected Wards:</b> {advisoryData.affected_zones.join(', ')}</p>
            </div>

            <div>
              <h4 className="font-bold text-xs text-amber-300 mb-1">Mandatory Protective Measures:</h4>
              <ul className="list-disc pl-5 text-[11px] text-slate-300 space-y-1">
                {advisoryData.mandatory_guidelines.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-[11px]">
              <span className="font-bold text-emerald-300 block mb-1">Emergency Clean Potable Tanker Depots:</span>
              {advisoryData.emergency_tanker_points.map((t: any, i: number) => (
                <p key={i} className="text-emerald-200">
                  📍 {t.location} • <b>{t.water_truck_id}</b> ({t.capacity_litres} Litres Potable Supply)
                </p>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold"
              >
                Print / Export PDF
              </button>
              <button
                onClick={() => setAdvisoryModalOpen(false)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-bold"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT COMMUNITY WATER REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitReport} className="bg-[#0b132b] border border-cyan-500 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3 text-slate-200">
            <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Report Contaminated Tap Water</span>
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ward / Location:</label>
              <input
                type="text"
                value={reportWard}
                onChange={(e) => setReportWard(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Observations / Water Condition:</label>
              <textarea
                rows={3}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to EOC</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
