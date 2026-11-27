'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  IndianRupee, 
  FileText, 
  Download, 
  Check
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  AUTONOMOUS DRONE DAMAGE & SDRF RELIEF LOSS CALCULATOR
                </h1>
                <span className="bg-amber-50 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-zinc-700 text-xs font-mono font-semibold px-3 py-0.5 rounded-full">
                  MHA SDRF NORMS
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Autonomous drone aerial reconnaissance, computer vision structural classification & official Ministry of Home Affairs disaster grant disbursement
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadDossier}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors font-mono"
          >
            {downloaded ? <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Downloaded Dossier!' : 'Download Official SDRF Dossier (.txt)'}</span>
          </button>
        </div>

        {/* Top Summary Metrics Row */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">TOTAL ECONOMIC LOSS</span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block">
                ₹{data.summary_metrics.total_economic_loss_cr} Crores
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-1">Direct Physical & Crop Damage</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">SDRF GRANT CLAIM</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 block">
                ₹{data.summary_metrics.total_sdrf_grant_claim_cr} Crores
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-1">Official Treasury Disbursal</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">AFFECTED FAMILIES</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 block">
                {data.summary_metrics.total_affected_families.toLocaleString()} Households
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 block mt-1">~{(data.summary_metrics.total_affected_families * 4).toLocaleString()} Displaced Citizens</span>
            </div>

            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">ROAD NETWORK WASHOUT</span>
              <span className="text-2xl font-bold text-sky-700 dark:text-sky-400 block">
                {data.summary_metrics.road_network_washout_km} km
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-1">
                Drone Severity: {data.summary_metrics.average_drone_severity_score}/10
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-[#121214] px-6 pt-3 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center gap-4">
          <button
            onClick={() => setActiveTab('sectors')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sectors'
                ? 'border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Sector Drone Surveys (4 Zones)</span>
          </button>

          <button
            onClick={() => setActiveTab('sdrf_grant')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sdrf_grant'
                ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>MHA SDRF Itemized Compensation Grants</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'dossier'
                ? 'border-sky-600 dark:border-sky-400 text-sky-700 dark:text-sky-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
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
                className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 block">{s.sector_id}</span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{s.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{s.damage_category}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-3 py-1 rounded-full text-xs font-mono font-bold inline-block">
                      {s.severity_grade}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 block mt-1.5">
                      CV Score: <b className="text-amber-700 dark:text-amber-400">{s.drone_survey_score}/10</b>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-zinc-800">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">INUNDATED AREA:</span>
                    <span className="font-bold text-sky-700 dark:text-sky-300 text-sm mt-0.5 block">{s.inundated_hectares} Hectares</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">DAMAGED DWELLINGS:</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">{s.affected_dwellings} Houses</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">STRUCTURAL LOSS:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5 block">₹{(s.structural_loss_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">AGRICULTURAL LOSS:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-sm mt-0.5 block">₹{(s.crop_loss_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 block mb-2 uppercase tracking-wider">
                    CRITICAL DAMAGE FINDINGS:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-zinc-300 space-y-1.5 list-disc list-inside">
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
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>State Disaster Response Fund (SDRF) Itemized Grant Allocation</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Calculated automatically under Ministry of Home Affairs (MHA Disaster Management Division) official guidelines:
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-zinc-800 gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">1. Ex-Gratia Immediate Family Subsistence Relief</span>
                  <span className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 block">Emergency cash grant (₹12,500 cap per household) for 1,480 inundated families</span>
                </div>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.ex_gratia_family_relief_inr / 10000000).toFixed(2)} Crores
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-zinc-800 gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">2. Critical Infrastructure & Bridge Reconstruction</span>
                  <span className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 block">Brij Bridge footing scour restoration + 7.8km arterial road reconstruction</span>
                </div>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.infrastructure_reconstruction_inr / 10000000).toFixed(2)} Crores
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-zinc-800 gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">3. Agricultural Siltation & Crop Loss Input Subsidy</span>
                  <span className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 block">Input subsidies for desilting riparian farm plots along Solani Basin</span>
                </div>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.agricultural_input_subsidy_inr / 100000).toFixed(1)} Lakhs
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-zinc-800 gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">4. Municipal Drinking Water & Sanitation Rehabilitation</span>
                  <span className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 block">Purqazi intake desilting + emergency chlorinated supply tankers</span>
                </div>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.water_sanitation_rehabilitation_inr / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 text-base">TOTAL RECOMMENDED SDRF GRANT DISBURSAL:</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                ₹{data.summary_metrics.total_sdrf_grant_claim_cr} Crores
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL MEMORANDUM DOSSIER */}
        {activeTab === 'dossier' && data && (
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-400">
              <span className="font-bold text-slate-900 dark:text-white text-sm">OFFICIAL PRELIMINARY DAMAGE MEMORANDUM (PLAIN TEXT)</span>
              <span>Rule 12, Disaster Management Act 2005</span>
            </div>
            <pre className="text-xs font-mono text-emerald-800 dark:text-emerald-400 whitespace-pre-wrap max-h-[500px] overflow-y-auto bg-slate-50 dark:bg-[#09090b] p-6 rounded-xl border border-slate-200 dark:border-zinc-800 leading-relaxed">
              {data.dossier_text}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
