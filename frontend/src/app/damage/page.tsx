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
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 space-y-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#fef9ee] dark:bg-[#342918] border border-[#fcedca] dark:border-[#4d3a1f] flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
              <Camera className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  AUTONOMOUS DRONE DAMAGE & SDRF RELIEF LOSS CALCULATOR
                </h1>
                <span className="bg-[#fef9ee] dark:bg-[#342918] text-amber-700 dark:text-amber-300 border border-[#fcedca] dark:border-[#4d3a1f] text-xs font-mono font-semibold px-3 py-1 rounded-full">
                  MHA SDRF NORMS
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-[#787774] dark:text-[#9b9a97] mt-1">
                Autonomous drone aerial reconnaissance, computer vision structural classification & official Ministry of Home Affairs disaster grant disbursement
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadDossier}
            className="bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2.5 shadow-xs transition-all font-mono"
          >
            {downloaded ? <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Downloaded Dossier!' : 'Download Official SDRF Dossier (.txt)'}</span>
          </button>
        </div>

        {/* Top Summary Metrics Row */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 font-mono">
            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">TOTAL ECONOMIC LOSS</span>
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 block">
                ₹{data.summary_metrics.total_economic_loss_cr} Crores
              </span>
              <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1">Direct Physical & Crop Damage</span>
            </div>

            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">SDRF GRANT CLAIM</span>
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 block">
                ₹{data.summary_metrics.total_sdrf_grant_claim_cr} Crores
              </span>
              <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block mt-1">Official Treasury Disbursal</span>
            </div>

            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">AFFECTED FAMILIES</span>
              <span className="text-3xl font-bold text-[#2f2e2b] dark:text-white block">
                {data.summary_metrics.total_affected_families.toLocaleString()} Households
              </span>
              <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 block mt-1">~{(data.summary_metrics.total_affected_families * 4).toLocaleString()} Displaced Citizens</span>
            </div>

            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
              <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">ROAD NETWORK WASHOUT</span>
              <span className="text-3xl font-bold text-sky-600 dark:text-sky-400 block">
                {data.summary_metrics.road_network_washout_km} km
              </span>
              <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1">
                Drone Severity: {data.summary_metrics.average_drone_severity_score}/10
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-[#202020] px-6 pt-3 border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl shadow-xs flex items-center gap-4">
          <button
            onClick={() => setActiveTab('sectors')}
            className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'sectors'
                ? 'border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 font-semibold'
                : 'border-transparent text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Sector Drone Surveys (4 Zones)</span>
          </button>

          <button
            onClick={() => setActiveTab('sdrf_grant')}
            className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'sdrf_grant'
                ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'border-transparent text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>MHA SDRF Itemized Compensation Grants</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'dossier'
                ? 'border-sky-600 dark:border-sky-400 text-sky-700 dark:text-sky-300 font-semibold'
                : 'border-transparent text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Official Treasury Memorandum Dossier</span>
          </button>
        </div>

        {/* TAB 1: 4 SECTOR SURVEYS */}
        {activeTab === 'sectors' && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.sectors.map((s) => (
              <div
                key={s.sector_id}
                className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 space-y-5 hover:border-[#deddd9] dark:hover:border-[#383838] transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 block">{s.sector_id}</span>
                    <h3 className="font-bold text-lg text-[#2f2e2b] dark:text-white mt-1">{s.name}</h3>
                    <p className="text-sm text-[#787774] dark:text-[#9b9a97]">{s.damage_category}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#fdf2f2] dark:bg-[#341d1d] text-[#b91c1c] dark:text-[#f87171] border border-[#fae1e1] dark:border-[#4d2525] px-3.5 py-1 rounded-full text-xs font-mono font-bold inline-block">
                      {s.severity_grade}
                    </span>
                    <span className="text-xs font-mono text-[#787774] dark:text-[#9b9a97] block mt-2">
                      CV Score: <b className="text-amber-600 dark:text-amber-400">{s.drone_survey_score}/10</b>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl text-sm font-mono border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">INUNDATED AREA:</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 text-base mt-0.5 block">{s.inundated_hectares} Hectares</span>
                  </div>
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">DAMAGED DWELLINGS:</span>
                    <span className="font-bold text-[#2f2e2b] dark:text-white text-base mt-0.5 block">{s.affected_dwellings} Houses</span>
                  </div>
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">STRUCTURAL LOSS:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-base mt-0.5 block">₹{(s.structural_loss_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs">AGRICULTURAL LOSS:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-base mt-0.5 block">₹{(s.crop_loss_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2.5 uppercase tracking-wider">
                    CRITICAL DAMAGE FINDINGS:
                  </span>
                  <ul className="text-sm text-[#575653] dark:text-[#d4d4d4] space-y-2 list-disc list-inside">
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
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#2f2e2b] dark:text-white flex items-center gap-2.5">
                <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span>State Disaster Response Fund (SDRF) Itemized Grant Allocation</span>
              </h3>
              <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-1">
                Calculated automatically under Ministry of Home Affairs (MHA Disaster Management Division) official guidelines:
              </p>
            </div>

            <div className="space-y-4 font-mono text-sm">
              <div className="flex flex-wrap items-center justify-between p-5 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] gap-3">
                <div>
                  <span className="font-bold text-[#2f2e2b] dark:text-white text-base block">1. Ex-Gratia Immediate Family Subsistence Relief</span>
                  <span className="text-[#787774] dark:text-[#9b9a97] text-xs sm:text-sm mt-0.5 block">Emergency cash grant (₹12,500 cap per household) for 1,480 inundated families</span>
                </div>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.ex_gratia_family_relief_inr / 10000000).toFixed(2)} Crores
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-5 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] gap-3">
                <div>
                  <span className="font-bold text-[#2f2e2b] dark:text-white text-base block">2. Critical Infrastructure & Bridge Reconstruction</span>
                  <span className="text-[#787774] dark:text-[#9b9a97] text-xs sm:text-sm mt-0.5 block">Brij Bridge footing scour restoration + 7.8km arterial road reconstruction</span>
                </div>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.infrastructure_reconstruction_inr / 10000000).toFixed(2)} Crores
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-5 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] gap-3">
                <div>
                  <span className="font-bold text-[#2f2e2b] dark:text-white text-base block">3. Agricultural Siltation & Crop Loss Input Subsidy</span>
                  <span className="text-[#787774] dark:text-[#9b9a97] text-xs sm:text-sm mt-0.5 block">Input subsidies for desilting riparian farm plots along Solani Basin</span>
                </div>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.agricultural_input_subsidy_inr / 100000).toFixed(1)} Lakhs
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between p-5 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] gap-3">
                <div>
                  <span className="font-bold text-[#2f2e2b] dark:text-white text-base block">4. Municipal Drinking Water & Sanitation Rehabilitation</span>
                  <span className="text-[#787774] dark:text-[#9b9a97] text-xs sm:text-sm mt-0.5 block">Purqazi intake desilting + emergency chlorinated supply tankers</span>
                </div>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{(data.sdrf_grant_breakdown.water_sanitation_rehabilitation_inr / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            </div>

            <div className="p-6 bg-[#eef8f2] dark:bg-[#192b1f] border border-[#ccecd8] dark:border-[#274f35] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 text-lg">TOTAL RECOMMENDED SDRF GRANT DISBURSAL:</span>
              <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                ₹{data.summary_metrics.total_sdrf_grant_claim_cr} Crores
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL MEMORANDUM DOSSIER */}
        {activeTab === 'dossier' && data && (
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#787774] dark:text-[#9b9a97]">
              <span className="font-bold text-[#2f2e2b] dark:text-white text-sm">OFFICIAL PRELIMINARY DAMAGE MEMORANDUM (PLAIN TEXT)</span>
              <span>Rule 12, Disaster Management Act 2005</span>
            </div>
            <pre className="text-xs sm:text-sm font-mono text-emerald-800 dark:text-emerald-400 whitespace-pre-wrap max-h-[520px] overflow-y-auto bg-[#191919] dark:bg-[#141414] p-6 rounded-xl border border-[#2e2e2e] leading-relaxed">
              {data.dossier_text}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
