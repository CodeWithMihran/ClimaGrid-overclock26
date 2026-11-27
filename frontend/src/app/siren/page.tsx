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
  Check
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

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shadow-xs">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  NDMA SACHET / CAP GEOFENCED SIREN BROADCASTER
                </h1>
                <span className="bg-red-50 dark:bg-zinc-800 text-red-700 dark:text-red-300 border border-red-200 dark:border-zinc-700 text-xs font-mono font-semibold px-3 py-0.5 rounded-full">
                  ITU-T X.1303 / OASIS CAP v1.2
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Bilingual cell-broadcast gateway, 853Hz+960Hz dual-frequency siren synthesizer & telecommunication geofencing
              </p>
            </div>
          </div>

          {/* Test Siren Button */}
          <button
            onClick={playEmergencySirenSound}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-red-700 dark:text-red-400 border border-slate-300 dark:border-zinc-700 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Volume2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Test 853Hz+960Hz Siren</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-[#121214] px-6 pt-3 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center gap-4">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'compose'
                ? 'border-red-600 dark:border-red-500 text-red-700 dark:text-red-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Compose Alert & Siren</span>
          </button>

          <button
            onClick={() => setActiveTab('xml')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'xml'
                ? 'border-sky-600 dark:border-sky-400 text-sky-700 dark:text-sky-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>OASIS CAP XML Specification</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'active'
                ? 'border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Logs ({activeAlerts.length})</span>
          </button>
        </div>

        {/* TAB 1: COMPOSE ALERT */}
        {activeTab === 'compose' && (
          <form onSubmit={handleBroadcast} className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Template Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2 uppercase tracking-wider font-mono">
                Select Predefined Disaster Template:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      selectedTemplateId === tpl.id
                        ? 'bg-red-50/70 dark:bg-zinc-800 border-red-500 dark:border-red-500 ring-2 ring-red-500/20'
                        : 'bg-slate-50 dark:bg-[#18181b] border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-900 dark:text-white block mb-0.5">{tpl.event}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">{tpl.area_description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity & Event */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 uppercase tracking-wider font-mono">
                  Alert Severity Tier:
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 font-semibold"
                >
                  <option value="Extreme">RED ALERT - EXTREME (Immediate Danger to Life)</option>
                  <option value="Severe">AMBER ALERT - SEVERE (Significant Threat)</option>
                  <option value="Moderate">YELLOW ALERT - MODERATE (Precautionary)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 uppercase tracking-wider font-mono">
                  Geofenced Hazard Event:
                </label>
                <input
                  type="text"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Bilingual Headlines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-2 font-mono">
                  <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>English Siren Headline:</span>
                </label>
                <textarea
                  rows={2}
                  value={headlineEn}
                  onChange={(e) => setHeadlineEn(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-2 font-mono">
                  <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Hindi Siren Headline (हिंदी):</span>
                </label>
                <textarea
                  rows={2}
                  value={headlineHi}
                  onChange={(e) => setHeadlineHi(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Bilingual Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 font-mono">Detailed Evacuation Action (English):</label>
                <textarea
                  rows={3}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 font-mono">विस्तृत नागरिक निर्देश (हिंदी):</label>
                <textarea
                  rows={3}
                  value={descriptionHi}
                  onChange={(e) => setDescriptionHi(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Target Area */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 font-mono">Target Geofenced Polygon / Municipal Wards:</label>
              <input
                type="text"
                value={areaDesc}
                onChange={(e) => setAreaDesc(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Broadcast Confirmation Banner */}
            {broadcastSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-4 text-sm shadow-xs">
                <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Emergency siren transmitted successfully to <b>45 cell towers</b>! Identifier: <b>{broadcastSuccess.identifier}</b>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('xml')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs px-3 py-1.5 rounded-lg"
                >
                  Inspect XML Payload
                </button>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isTransmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Megaphone className="w-4 h-4" />
                <span>{isTransmitting ? 'Transmitting to Cell Towers...' : 'Broadcast Emergency Siren to Region'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: RAW OASIS CAP XML */}
        {activeTab === 'xml' && (
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-800 dark:text-zinc-200 text-sm font-semibold">
                OASIS Common Alerting Protocol v1.2 / ITU-T X.1303 Telecom Payload:
              </span>
              <button
                onClick={handleCopyXML}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                {copiedXML ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedXML ? 'Copied XML!' : 'Copy Raw XML'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 dark:bg-[#09090b] text-sky-400 p-5 rounded-xl border border-slate-800 dark:border-zinc-800 text-xs overflow-x-auto leading-relaxed max-h-[500px]">
              {broadcastSuccess?.cap_xml || activeAlerts[0]?.cap_xml || '<!-- Select or broadcast alert to inspect live XML payload -->'}
            </pre>
          </div>
        )}

        {/* TAB 3: BROADCAST LOGS */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.identifier}
                className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{alert.identifier}</span>
                    <span className="text-xs bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                      {alert.severity}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-zinc-400 font-mono text-xs">{alert.sent}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{alert.headline_en}</h4>
                <p className="text-slate-600 dark:text-zinc-300 text-xs leading-relaxed">{alert.description_en}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <span>Target Area: <b>{alert.area_description}</b></span>
                  <span>Targeted Cell Towers: <b>{alert.cell_towers_targeted}</b></span>
                  <span>Estimated Recipients: <b>{alert.estimated_recipients.toLocaleString()}</b></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
