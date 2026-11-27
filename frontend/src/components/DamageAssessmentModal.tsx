'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  AlertTriangle, 
  Building2, 
  Truck, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  X, 
  Download, 
  ShieldCheck, 
  MapPin,
  Check
} from 'lucide-react';
import { fetchDamageAssessment } from '../lib/api';
import { DamageAssessmentResponse } from '../types';

interface DamageAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DamageAssessmentModal: React.FC<DamageAssessmentModalProps> = ({
  isOpen,
  onClose
}) => {
  const [data, setData] = useState<DamageAssessmentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'sectors' | 'sdrf_grant' | 'dossier'>('sectors');
  const [downloaded, setDownloaded] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadAssessment();
    }
  }, [isOpen]);

  async function loadAssessment() {
    const res = await fetchDamageAssessment();
    setData(res);
  }

  const handleDownloadDossier = () => {
    if (!data) return;
    const blob = new Blob([data.dossier_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SDRF_GRANT_CLAIM_MEMORANDUM_ROORKEE_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b132b] border border-amber-500/50 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#070d1e] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                DRONE DAMAGE ASSESSMENT & SDRF RELIEF LOSS CALCULATOR
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  MHA SDRF NORMS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Haridwar District / Roorkee Basin Autonomous Aerial Damage Quantification & Recovery Grant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#091026] border-b border-slate-800/80 font-mono text-xs">
          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">TOTAL DAMAGE LOSS:</span>
            <span className="text-xl font-black text-rose-400">₹{data.summary_metrics.total_economic_loss_cr} Cr</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Direct Physical Damage</span>
          </div>

          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">SDRF GRANT CLAIM:</span>
            <span className="text-xl font-black text-emerald-400">₹{data.summary_metrics.total_sdrf_grant_claim_cr} Cr</span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">Govt Compensation Claim</span>
          </div>

          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">AFFECTED CITIZENS:</span>
            <span className="text-lg font-black text-white">{data.summary_metrics.total_affected_families.toLocaleString()} Families</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">~{(data.summary_metrics.total_affected_families * 4).toLocaleString()} Displaced</span>
          </div>

          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">ROADS WASHOUT:</span>
            <span className="text-lg font-black text-cyan-300">{data.summary_metrics.road_network_washout_km} km</span>
            <span className="text-[10px] text-cyan-500 block mt-0.5">Drone Score: {data.summary_metrics.average_drone_severity_score}/10</span>
          </div>
        </div>

        {/* View Switcher Tabs & Download Button */}
        <div className="px-6 py-2.5 bg-[#070d1e] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setActiveTab('sectors')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'sectors'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sector Drone Surveys (4 Zones)
            </button>
            <button
              onClick={() => setActiveTab('sdrf_grant')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'sdrf_grant'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MHA SDRF Compensation Breakdown
            </button>
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'dossier'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Official Memorandum Dossier
            </button>
          </div>

          <button
            onClick={handleDownloadDossier}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-950 transition-all font-mono"
          >
            {downloaded ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloaded ? 'Downloaded Dossier!' : 'Download SDRF Dossier (.txt)'}</span>
          </button>
        </div>

        {/* Body Views */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: 4 SECTORS */}
          {activeTab === 'sectors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {data.sectors.map((s) => (
                <div
                  key={s.sector_id}
                  className="bg-[#070d1e] border border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 block">{s.sector_id}</span>
                      <h4 className="font-bold text-sm text-white">{s.name}</h4>
                      <p className="text-xs text-slate-400">{s.damage_category}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-black block">
                        {s.severity_grade}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">
                        Drone Score: <b className="text-amber-400">{s.drone_survey_score}/10</b>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-[#091026] p-2.5 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">SUBMERGED:</span>
                      <span className="font-bold text-cyan-300">{s.inundated_hectares} Hectares</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DAMAGED HOMES:</span>
                      <span className="font-bold text-white">{s.affected_dwellings} Houses</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">STRUCTURAL LOSS:</span>
                      <span className="font-bold text-rose-400">₹{(s.structural_loss_inr / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">AGRICULTURAL LOSS:</span>
                      <span className="font-bold text-amber-400">₹{(s.crop_loss_inr / 100000).toFixed(1)} Lakhs</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">KEY STRUCTURAL FAILURES:</span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {s.key_failures.map((f, i) => (
                        <li key={i} className="text-[11px] leading-tight">{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SDRF GRANT BREAKDOWN */}
          {activeTab === 'sdrf_grant' && (
            <div className="space-y-4">
              <div className="bg-[#070d1e] p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  <span>State Disaster Response Fund (SDRF) Itemized Grant Allocation</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Calculated automatically following Ministry of Home Affairs (Disaster Management Division) norms:
                </p>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-3 bg-[#091026] rounded-lg border border-slate-800/80">
                    <div>
                      <span className="font-bold text-white block">1. Ex-Gratia Immediate Family Subsistence Relief</span>
                      <span className="text-slate-500 text-[11px]">Emergency cash grant for 1,480 fully/partially inundated households</span>
                    </div>
                    <span className="text-base font-black text-emerald-400">
                      ₹{(data.sdrf_grant_breakdown.ex_gratia_family_relief_inr / 10000000).toFixed(2)} Crores
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#091026] rounded-lg border border-slate-800/80">
                    <div>
                      <span className="font-bold text-white block">2. Critical Infrastructure & Bridge Reconstruction</span>
                      <span className="text-slate-500 text-[11px]">Brij Bridge footing scour repair + 7.8km arterial road resurfacing</span>
                    </div>
                    <span className="text-base font-black text-emerald-400">
                      ₹{(data.sdrf_grant_breakdown.infrastructure_reconstruction_inr / 10000000).toFixed(2)} Crores
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#091026] rounded-lg border border-slate-800/80">
                    <div>
                      <span className="font-bold text-white block">3. Agricultural Siltation & Crop Loss Input Subsidy</span>
                      <span className="text-slate-500 text-[11px]">Subsidies for desilting riparian farm plots along Solani Basin</span>
                    </div>
                    <span className="text-base font-black text-emerald-400">
                      ₹{(data.sdrf_grant_breakdown.agricultural_input_subsidy_inr / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#091026] rounded-lg border border-slate-800/80">
                    <div>
                      <span className="font-bold text-white block">4. Municipal Drinking Water & Sanitation Rehabilitation</span>
                      <span className="text-slate-500 text-[11px]">Purqazi intake desilting + chlorinated emergency tanker deployment</span>
                    </div>
                    <span className="text-base font-black text-emerald-400">
                      ₹{(data.sdrf_grant_breakdown.water_sanitation_rehabilitation_inr / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm">TOTAL RECOMMENDED SDRF GRANT DISBURSAL:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    ₹{data.summary_metrics.total_sdrf_grant_claim_cr} Crores
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL MEMORANDUM DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>OFFICIAL PRELIMINARY DAMAGE MEMORANDUM (PLAIN TEXT)</span>
                <span>Rule 12, Disaster Management Act 2005</span>
              </div>
              <pre className="text-[11px] font-mono text-emerald-300/90 whitespace-pre-wrap max-h-96 overflow-y-auto bg-slate-900/60 p-4 rounded-lg border border-slate-800 leading-relaxed">
                {data.dossier_text}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
