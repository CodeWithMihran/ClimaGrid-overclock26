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
  Download, 
  ShieldCheck, 
  MapPin,
  Check,
  CheckCheck
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { fetchDamageAssessment } from '../../lib/api';
import { DamageAssessmentResponse } from '../../types';

export default function DroneDamagePage() {
  const [data, setData] = useState<DamageAssessmentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'sectors' | 'sdrf_grant' | 'dossier'>('sectors');
  const [downloaded, setDownloaded] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDamageAssessment();
        setData(res);
      } catch (e) {
        console.error('Failed to load damage assessment:', e);
      }
    }
    load();
  }, []);

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

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  AUTONOMOUS DRONE DAMAGE & SDRF RELIEF LOSS CALCULATOR
                </h1>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
                  MHA SDRF NORMS
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Autonomous drone aerial reconnaissance, computer vision structural classification & official Ministry of Home Affairs disaster grant disbursement
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadDossier}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xl shadow-amber-950 transition-all font-mono active:scale-95"
          >
            {downloaded ? <Check className="w-4 h-4 text-slate-950" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Downloaded Dossier!' : 'Download Official SDRF Dossier (.txt)'}</span>
          </button>
        </div>

        {/* Top Summary Metrics Row */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">TOTAL ECONOMIC LOSS</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                ₹{data.summary_metrics.total_economic_loss_cr} Crores
              </span>
              <span className="text-xs text-slate-500 block mt-1">Direct Physical & Crop Damage</span>
            </div>

            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">SDRF GRANT CLAIM</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ₹{data.summary_metrics.total_sdrf_grant_claim_cr} Crores
              </span>
              <span className="text-xs text-emerald-500 block mt-1">Official Treasury Disbursal</span>
            </div>

            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">AFFECTED FAMILIES</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {data.summary_metrics.total_affected_families.toLocaleString()} Households
              </span>
              <span className="text-xs text-amber-400 block mt-1">~{(data.summary_metrics.total_affected_families * 4).toLocaleString()} Displaced Citizens</span>
            </div>

            <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 block">ROAD NETWORK WASHOUT</span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">
                {data.summary_metrics.road_network_washout_km} km
              </span>
              <span className="text-xs text-cyan-500 block mt-1">
                Drone Severity: {data.summary_metrics.average_drone_severity_score}/10
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-[#0b132b] px-6 pt-3 border-b border-slate-800 rounded-2xl shadow-xl flex items-center gap-3">
          <button
            onClick={() => setActiveTab('sectors')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sectors'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Sector Drone Surveys (4 Zones)</span>
          </button>

          <button
            onClick={() => setActiveTab('sdrf_grant')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sdrf_grant'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>MHA SDRF Itemized Compensation Grants</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'dossier'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Official Treasury Memorandum Dossier</span>
          </button>
        </div>

        {/* TAB 1: 4 SECTOR SURVEYS */}
        {activeTab === 'sectors' && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.sectors.map((s) => (
              <div
                key={s.sector_id}
                className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 block">{s.sector_id}</span>
                    <h3 className="font-bold text-base text-white mt-0.5">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.damage_category}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-xs font-mono font-black inline-block">
                      {s.severity_grade}
                    </span>
                    <span className="text-xs font-mono text-slate-400 block mt-1.5">
                      Drone CV Score: <b className="text-amber-400">{s.drone_survey_score}/10</b>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#070d1e] p-3.5 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[11px]">INUNDATED AREA:</span>
                    <span className="font-bold text-cyan-300 text-sm mt-0.5 block">{s.inundated_hectares} Hectares</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">DAMAGED DWELLINGS:</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{s.affected_dwellings} Houses</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">STRUCTURAL LOSS:</span>
                    <span className="font-bold text-rose-400 text-sm mt-0.5 block">₹{(s.structural_loss_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">AGRICULTURAL LOSS:</span>
                    <span className="font-bold text-amber-400 text-sm mt-0.5 block">₹{(s.crop_loss_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                    CRITICAL DAMAGE FINDINGS:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {s.key_failures.map((f, i) => (
                      <li key={i} className="leading-relaxed">{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SDRF GRANT BREAKDOWN */}
        {activeTab === 'sdrf_grant' && data && (
          <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <span>State Disaster Response Fund (SDRF) Itemized Grant Allocation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculated automatically under Ministry of Home Affairs (MHA Disaster Management Division) official guidelines:
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between p-4 bg-[#070d1e] rounded-xl border border-slate-800 gap-2">
                <div>
                  <span className="font-bold text-white text-sm block">1. Ex-Gratia Immediate Family Subsistence Relief</span>
                  <span className="text-slate-400 text-xs mt-0.5 block">Emergency cash grant (₹12,500 cap per household) for 1,480 inundated families</span>
                </div>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.ex_gratia_family_relief_inr / 10000000).toFixed(2)} Crores
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 bg-[#070d1e] rounded-xl border border-slate-800 gap-2">
                <div>
                  <span className="font-bold text-white text-sm block">2. Critical Infrastructure & Bridge Reconstruction</span>
                  <span className="text-slate-400 text-xs mt-0.5 block">Brij Bridge footing scour restoration + 7.8km arterial road reconstruction</span>
                </div>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.infrastructure_reconstruction_inr / 10000000).toFixed(2)} Crores
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 bg-[#070d1e] rounded-xl border border-slate-800 gap-2">
                <div>
                  <span className="font-bold text-white text-sm block">3. Agricultural Siltation & Crop Loss Input Subsidy</span>
                  <span className="text-slate-400 text-xs mt-0.5 block">Input subsidies for desilting riparian farm plots along Solani Basin</span>
                </div>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.agricultural_input_subsidy_inr / 100000).toFixed(1)} Lakhs
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 bg-[#070d1e] rounded-xl border border-slate-800 gap-2">
                <div>
                  <span className="font-bold text-white text-sm block">4. Municipal Drinking Water & Sanitation Rehabilitation</span>
                  <span className="text-slate-400 text-xs mt-0.5 block">Purqazi intake desilting + emergency chlorinated supply tankers</span>
                </div>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.water_sanitation_rehabilitation_inr / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <span className="font-bold text-emerald-300 text-base">TOTAL RECOMMENDED SDRF GRANT DISBURSAL:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ₹{data.summary_metrics.total_sdrf_grant_claim_cr} Crores
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL MEMORANDUM DOSSIER */}
        {activeTab === 'dossier' && data && (
          <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-white text-sm">OFFICIAL PRELIMINARY DAMAGE MEMORANDUM (PLAIN TEXT)</span>
              <span>Rule 12, Disaster Management Act 2005</span>
            </div>
            <pre className="text-xs font-mono text-emerald-300/90 whitespace-pre-wrap max-h-[500px] overflow-y-auto bg-[#070d1e] p-6 rounded-2xl border border-slate-800 leading-relaxed shadow-inner">
              {data.dossier_text}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
