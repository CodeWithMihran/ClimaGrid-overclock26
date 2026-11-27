'use client';

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Radio, 
  CheckCircle2, 
  Copy, 
  Volume2, 
  Globe, 
  FileCode,
  Check,
  Smartphone,
  TowerControl,
  Users,
  ShieldAlert,
  Zap,
  VolumeX
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { fetchActiveCAPAlerts, fetchCAPTemplates, broadcastCAPAlert } from '../../lib/api';
import { CAPAlert, CAPTemplate } from '../../types';

export default function CAPSirenPage() {
  const [templates, setTemplates] = useState<CAPTemplate[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<CAPAlert[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_flood');

  // Form State
  const [severity, setSeverity] = useState<string>('Extreme');
  const [event, setEvent] = useState<string>('Flash Flood & River Ingress');
  const [headlineEn, setHeadlineEn] = useState<string>('🚨 NDMA URGENT FLASH FLOOD SIREN: Solani River embankment breached in Roorkee. Move to high ground immediately.');
  const [headlineHi, setHeadlineHi] = useState<string>('🚨 राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA): सोलानी नदी तटबंध टूटा। तुरंत सुरक्षित ऊंचे स्थान पर जाएं।');
  const [descriptionEn, setDescriptionEn] = useState<string>('Solani River water stage has exceeded 5.4m warning mark. Brij Bridge underpass is impassable (5.5ft deep current). Preemptive evacuation ordered for Ramnagar Ward 4 and Solani Basin. RIT Roorkee Safe Campus opened for relief shelter.');
  const [descriptionHi, setDescriptionHi] = useState<string>('सोलानी नदी का जलस्तर चेतावनी स्तर को पार कर गया है। बृज ब्रिज जलमग्न है। रामनगर वार्ड 4 के नागरिक तुरंत सुरक्षित ऊंचाई पर जाएं। RIT रुड़की सुरक्षित राहत शिविर में शरण लें।');
  const [areaDesc, setAreaDesc] = useState<string>('Roorkee - Solani Basin, Ramnagar Ward 4, Civil Lines');

  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isPlayingSiren, setIsPlayingSiren] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<CAPAlert | null>(null);
  const [copiedXML, setCopiedXML] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'xml' | 'active'>('compose');

  useEffect(() => {
    async function load() {
      try {
        const [tpls, alerts] = await Promise.all([
          fetchCAPTemplates(),
          fetchActiveCAPAlerts()
        ]);
        setTemplates(tpls);
        setActiveAlerts(alerts);
      } catch (e) {
        console.error('Failed to load CAP templates:', e);
      }
    }
    load();
  }, []);

  const handleApplyTemplate = (tpl: CAPTemplate) => {
    setSelectedTemplateId(tpl.id);
    setSeverity(tpl.severity);
    setEvent(tpl.event);
    setHeadlineEn(tpl.headline_en);
    setHeadlineHi(tpl.headline_hi);
    setDescriptionEn(tpl.description_en);
    setDescriptionHi(tpl.description_hi);
    setAreaDesc(tpl.area_description);
  };

  // Web Audio API 853Hz + 960Hz dual-frequency warble siren
  const playEmergencySirenSound = () => {
    setIsPlayingSiren(true);
    setTimeout(() => setIsPlayingSiren(false), 2600);
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(853, ctx.currentTime);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(960, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4, ctx.currentTime);
      lfoGain.gain.setValueAtTime(25, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 2.5);
      osc2.stop(ctx.currentTime + 2.5);
      lfo.stop(ctx.currentTime + 2.5);
    } catch (e) {
      console.error('Audio synthesizer error:', e);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransmitting(true);
    playEmergencySirenSound();

    try {
      const res = await broadcastCAPAlert({
        event,
        severity,
        headline_en: headlineEn,
        headline_hi: headlineHi,
        description_en: descriptionEn,
        description_hi: descriptionHi,
        area_description: areaDesc
      });
      setBroadcastSuccess(res);
      setActiveAlerts(prev => [res, ...prev]);
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleCopyXML = () => {
    const xmlToCopy = broadcastSuccess?.cap_xml || activeAlerts[0]?.cap_xml;
    if (!xmlToCopy) return;
    navigator.clipboard.writeText(xmlToCopy);
    setCopiedXML(true);
    setTimeout(() => setCopiedXML(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 space-y-8">
        
        {/* Header Card */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#fdf2f2] dark:bg-[#341d1d] border border-[#fae1e1] dark:border-[#4d2525] flex items-center justify-center text-[#b91c1c] dark:text-[#f87171] shadow-2xs">
              <Megaphone className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  NDMA SACHET / CAP GEOFENCED SIREN BROADCASTER
                </h1>
                <span className="bg-[#fdf2f2] dark:bg-[#341d1d] text-[#b91c1c] dark:text-[#f87171] border border-[#fae1e1] dark:border-[#4d2525] text-xs font-mono font-semibold px-3 py-1 rounded-full">
                  ITU-T X.1303 / OASIS CAP v1.2
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-[#787774] dark:text-[#9b9a97] mt-1">
                Bilingual cell-broadcast gateway, 853Hz+960Hz dual-frequency siren synthesizer & telecommunication geofencing
              </p>
            </div>
          </div>

          {/* Test Siren Button with Waveform Visualizer */}
          <button
            onClick={playEmergencySirenSound}
            className={`px-6 py-3 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-2.5 shadow-2xs transition-all ${
              isPlayingSiren
                ? 'bg-[#b91c1c] text-white animate-pulse border border-[#991b1b]'
                : 'bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#2b2b2b] dark:hover:bg-[#333333] text-[#b91c1c] dark:text-[#f87171] border border-[#deddd9] dark:border-[#3d3d3d]'
            }`}
          >
            <Volume2 className={`w-5 h-5 ${isPlayingSiren ? 'text-white animate-bounce' : 'text-rose-600 dark:text-rose-400'}`} />
            <span>{isPlayingSiren ? 'Dual-Tone 853Hz+960Hz Active...' : 'Test 853Hz+960Hz Acoustic Siren'}</span>
          </button>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 font-mono">
          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">CELL TOWERS TARGETED</span>
            <span className="text-3xl font-bold text-[#2f2e2b] dark:text-white block">
              42 Towers
            </span>
            <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block mt-1 font-sans">Geofenced 100% Active</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">POPULATION REACH</span>
            <span className="text-3xl font-bold text-sky-600 dark:text-sky-400 block">
              68,400+
            </span>
            <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1 font-sans">Instant Lockscreen Alert</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">BILINGUAL COMPLIANCE</span>
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 block truncate">
              English + हिंदी
            </span>
            <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1 font-sans">Zero App Download Needed</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">BROADCAST STANDARD</span>
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 block truncate">
              OASIS CAP 1.2
            </span>
            <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block mt-1 font-sans">NDMA SACHET Native</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-[#202020] px-6 pt-3 border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl shadow-xs flex items-center gap-4">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'compose'
                ? 'border-red-600 dark:border-red-500 text-red-700 dark:text-red-400 font-semibold'
                : 'border-transparent text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Compose Alert & Siren</span>
          </button>

          <button
            onClick={() => setActiveTab('xml')}
            className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'xml'
                ? 'border-sky-600 dark:border-sky-400 text-sky-700 dark:text-sky-300 font-semibold'
                : 'border-transparent text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>OASIS CAP XML Specification</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'active'
                ? 'border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 font-semibold'
                : 'border-transparent text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Logs ({activeAlerts.length})</span>
          </button>
        </div>

        {/* TAB 1: COMPOSE ALERT */}
        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column (8 Cols on LG) */}
            <form onSubmit={handleBroadcast} className="lg:col-span-8 bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Template Selector */}
              <div>
                <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2.5 uppercase tracking-wider font-mono">
                  Select Predefined Disaster Template:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className={`p-5 rounded-xl border text-left transition-colors ${
                        selectedTemplateId === tpl.id
                          ? 'bg-[#fdf2f2]/60 dark:bg-[#341d1d]/60 border-red-500 dark:border-red-500 ring-2 ring-red-500/15'
                          : 'bg-[#f7f6f3] dark:bg-[#191919] border-[#e9e9e7] dark:border-[#2e2e2e] hover:border-[#deddd9] dark:hover:border-[#383838]'
                      }`}
                    >
                      <span className="text-base font-bold text-[#2f2e2b] dark:text-white block mb-1">{tpl.event}</span>
                      <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block truncate">{tpl.area_description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity & Event */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2 uppercase tracking-wider font-mono">
                    Alert Severity Tier:
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl px-4 py-3 text-sm sm:text-base text-[#2f2e2b] dark:text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    <option value="Extreme">RED ALERT - EXTREME (Immediate Danger to Life)</option>
                    <option value="Severe">AMBER ALERT - SEVERE (Significant Threat)</option>
                    <option value="Moderate">YELLOW ALERT - MODERATE (Precautionary)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2 uppercase tracking-wider font-mono">
                    Geofenced Hazard Event:
                  </label>
                  <input
                    type="text"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl px-4 py-3 text-sm sm:text-base text-[#2f2e2b] dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Bilingual Headlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2 flex items-center gap-2 font-mono">
                    <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>English Siren Headline:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={headlineEn}
                    onChange={(e) => setHeadlineEn(e.target.value)}
                    className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl p-4 text-sm sm:text-base text-[#2f2e2b] dark:text-white focus:outline-none focus:border-red-500 font-mono leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2 flex items-center gap-2 font-mono">
                    <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Hindi Siren Headline (हिंदी):</span>
                  </label>
                  <textarea
                    rows={2}
                    value={headlineHi}
                    onChange={(e) => setHeadlineHi(e.target.value)}
                    className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl p-4 text-sm sm:text-base text-[#2f2e2b] dark:text-white focus:outline-none focus:border-red-500 leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Bilingual Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2 font-mono">Detailed Evacuation Action (English):</label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl p-4 text-sm sm:text-base text-[#2f2e2b] dark:text-white focus:outline-none focus:border-red-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2 font-mono">विस्तृत नागरिक निर्देश (हिंदी):</label>
                  <textarea
                    rows={3}
                    value={descriptionHi}
                    onChange={(e) => setDescriptionHi(e.target.value)}
                    className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl p-4 text-sm sm:text-base text-[#2f2e2b] dark:text-white focus:outline-none focus:border-red-500 leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Target Area */}
              <div>
                <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-2 font-mono">Target Geofenced Polygon / Municipal Wards:</label>
                <input
                  type="text"
                  value={areaDesc}
                  onChange={(e) => setAreaDesc(e.target.value)}
                  className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl px-4 py-3 text-sm sm:text-base text-[#2f2e2b] dark:text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              {/* Broadcast Confirmation Banner */}
              {broadcastSuccess && (
                <div className="p-5 bg-[#eef8f2] dark:bg-[#192b1f] border border-[#ccecd8] dark:border-[#274f35] rounded-2xl flex items-center justify-between gap-4 text-sm sm:text-base shadow-xs animate-fadeIn">
                  <div className="flex items-center gap-3.5 text-[#227744] dark:text-[#4ade80]">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Emergency siren transmitted successfully to <b>42 cell towers</b>! Identifier: <b>{broadcastSuccess.identifier}</b>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('xml')}
                    className="bg-[#227744] hover:bg-[#1b5e36] text-white font-mono text-xs sm:text-sm px-4 py-2 rounded-lg"
                  >
                    Inspect XML Payload
                  </button>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-4 border-t border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isTransmitting}
                  className="bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-xs flex items-center gap-2.5 transition-all disabled:opacity-50"
                >
                  <Megaphone className="w-5 h-5 text-rose-400 dark:text-rose-600" />
                  <span>{isTransmitting ? 'Transmitting to Cell Towers...' : 'Broadcast Emergency Siren to Region'}</span>
                </button>
              </div>
            </form>

            {/* Right Column (4 Cols on LG): Smartphone Lockscreen Simulator Preview */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#2f2e2b] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Citizen Lockscreen Preview</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#787774] dark:text-[#9b9a97] bg-[#f7f6f3] dark:bg-[#2b2b2b] px-2 py-0.5 rounded">
                    GSM-CB CH 4370
                  </span>
                </div>

                {/* Mock Smartphone Frame */}
                <div className="bg-slate-950 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-xl space-y-4 font-sans">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>11:24 AM</span>
                    <span>5G • 88%</span>
                  </div>

                  {/* Android / iOS Emergency Alert Modal */}
                  <div className="bg-red-950/90 border-2 border-red-500 rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
                      <ShieldAlert className="w-4 h-4" />
                      <span>CRITICAL EMERGENCY ALERT</span>
                    </div>

                    <p className="text-xs font-bold text-white leading-snug">
                      {headlineEn}
                    </p>

                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      {descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-red-900/60 text-[10px] text-slate-300 font-mono">
                      Target Area: {areaDesc}
                    </div>
                  </div>

                  {/* Hindi Alternate Notification */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 space-y-1.5 text-[11px]">
                    <span className="text-amber-400 font-bold block text-[10px]">
                      राष्ट्रीय आपदा चेतावनी (हिंदी):
                    </span>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      {headlineHi}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#787774] dark:text-[#9b9a97] leading-relaxed">
                  <b>Zero App Barrier:</b> Bypasses silent switches on iOS/Android devices within the geofenced cell towers using the national standard Emergency Alert protocol.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RAW OASIS CAP XML */}
        {activeTab === 'xml' && (
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#2f2e2b] dark:text-[#e6e6e5] text-base font-semibold">
                OASIS Common Alerting Protocol v1.2 / ITU-T X.1303 Telecom Payload:
              </span>
              <button
                onClick={handleCopyXML}
                className="bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#2b2b2b] dark:hover:bg-[#333333] text-[#2f2e2b] dark:text-white border border-[#deddd9] dark:border-[#3d3d3d] px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
              >
                {copiedXML ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedXML ? 'Copied XML!' : 'Copy Raw XML'}</span>
              </button>
            </div>

            <pre className="bg-[#191919] dark:bg-[#141414] text-sky-400 p-6 rounded-xl border border-[#2e2e2e] text-xs sm:text-sm overflow-x-auto leading-relaxed max-h-[520px]">
              {broadcastSuccess?.cap_xml || activeAlerts[0]?.cap_xml || '<!-- Select or broadcast alert to inspect live XML payload -->'}
            </pre>
          </div>
        )}

        {/* TAB 3: BROADCAST LOGS */}
        {activeTab === 'active' && (
          <div className="space-y-5">
            {activeAlerts.map((alert) => (
              <div
                key={alert.identifier}
                className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#2f2e2b] dark:text-white text-base">{alert.identifier}</span>
                    <span className="text-xs bg-[#fdf2f2] dark:bg-[#341d1d] text-[#b91c1c] dark:text-[#f87171] border border-[#fae1e1] dark:border-[#4d2525] px-3 py-1 rounded-full font-mono font-semibold">
                      {alert.severity}
                    </span>
                  </div>
                  <span className="text-[#787774] dark:text-[#9b9a97] font-mono text-xs">{alert.sent}</span>
                </div>
                <h4 className="font-bold text-[#2f2e2b] dark:text-white text-base">{alert.headline_en}</h4>
                <p className="text-[#575653] dark:text-[#d4d4d4] text-sm leading-relaxed">{alert.description_en}</p>
                <div className="flex items-center gap-6 text-xs sm:text-sm font-mono text-[#787774] dark:text-[#9b9a97] pt-3 border-t border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span>Target Area: <b>{alert.area_description}</b></span>
                  <span>Targeted Cell Towers: <b>{alert.cell_towers_targeted}</b></span>
                  <span>Estimated Recipients: <b>{Number(alert.estimated_recipients || 0).toLocaleString()}</b></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
