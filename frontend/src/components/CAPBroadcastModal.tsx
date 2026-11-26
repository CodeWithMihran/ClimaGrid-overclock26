'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Radio, AlertTriangle, ShieldAlert, CheckCircle2, Copy, X, Volume2, Globe, FileCode } from 'lucide-react';
import { fetchActiveCAPAlerts, fetchCAPTemplates, broadcastCAPAlert } from '../lib/api';
import { CAPAlert, CAPTemplate } from '../types';

interface CAPBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertBroadcasted?: (alert: CAPAlert) => void;
}

export const CAPBroadcastModal: React.FC<CAPBroadcastModalProps> = ({
  isOpen,
  onClose,
  onAlertBroadcasted
}) => {
  const [templates, setTemplates] = useState<CAPTemplate[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<CAPAlert[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_flood');

  // Form State
  const [severity, setSeverity] = useState<string>('Extreme');
  const [event, setEvent] = useState<string>('Flash Flood & River Ingress');
  const [headlineEn, setHeadlineEn] = useState<string>('🚨 NDMA URGENT FLASH FLOOD SIREN: Solani River embankment breached in Roorkee. Move to high ground immediately.');
  const [headlineHi, setHeadlineHi] = useState<string>('🚨 राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA): सोलानी नदी तटबंध टूटा। तुरंत सुरक्षित ऊंचे स्थान पर जाएं।');
  const [descriptionEn, setDescriptionEn] = useState<string>('Solani River water stage has exceeded 5.4m warning mark. Brij Bridge underpass is impassable (5.5ft deep current). Preemptive evacuation ordered for Ramnagar Ward 4 and Solani Basin. RIT Roorkee Safe Campus opened for relief shelter.');
  const [descriptionHi, setDescriptionHi] = useState<string>('सोलानी नदी का जलस्तर चेतावनी स्तर को पार कर गया है। बृज ब्रिज जलमग्न है। रामनगर वार्ड 4 के नागरिक तुरंत सुरक्षित ऊंचाई पर जाएं। आर.आई.टी रुड़की सुरक्षित राहत शिविर में शरण लें।');
  const [areaDesc, setAreaDesc] = useState<string>('Roorkee - Solani Basin, Ramnagar Ward 4, Civil Lines');

  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<CAPAlert | null>(null);
  const [copiedXML, setCopiedXML] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadInitial();
      setBroadcastSuccess(null);
    }
  }, [isOpen]);

  async function loadInitial() {
    const [tpls, alerts] = await Promise.all([
      fetchCAPTemplates(),
      fetchActiveCAPAlerts()
    ]);
    setTemplates(tpls);
    setActiveAlerts(alerts);
  }

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

  // Play Authentic Dual-Tone Emergency Broadcast Siren (853Hz & 960Hz)
  const playEmergencySirenSound = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Play 3 pulses of alternating dual-frequency emergency tones
      const now = ctx.currentTime;
      [0, 0.45, 0.9].forEach((startTime) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(853, now + startTime); // NOAA / CAP Standard Tone 1

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(960, now + startTime); // NOAA / CAP Standard Tone 2

        gain.gain.setValueAtTime(0.18, now + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + startTime);
        osc2.start(now + startTime);
        osc1.stop(now + startTime + 0.38);
        osc2.stop(now + startTime + 0.38);
      });
    } catch (e) {
      // audio fallback
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransmitting(true);
    try {
      playEmergencySirenSound();
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
      if (onAlertBroadcasted) {
        onAlertBroadcasted(res);
      }
      await loadInitial();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTransmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedXML(true);
      setTimeout(() => setCopiedXML(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b132b] border border-red-500/50 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#070d1e] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Megaphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                NDMA SACHET // CAP EMERGENCY BROADCAST CONSOLE
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  ITU-T X.1303 / OASIS CAP v1.2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Geofenced Cell-Broadcast Siren & Preemptive Siren Transmitter for Roorkee / Solani
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Preset Template Chips */}
          <div>
            <span className="text-xs font-mono font-bold text-slate-300 block mb-2">
              SELECT OFFICIAL NDMA SIREN PRESET:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-red-950/60 border-red-400 shadow-md ring-1 ring-red-400'
                      : 'bg-[#070d1e] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="font-bold text-slate-300 truncate">{tpl.event}</span>
                    <span className="bg-red-500/20 text-red-400 px-1 rounded text-[9px] font-black">
                      {tpl.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-snug">
                    {tpl.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleBroadcast} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">ALERT SEVERITY</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
                >
                  <option value="Extreme">🔴 Extreme (Immediate Life Threat)</option>
                  <option value="Severe">🟠 Severe (Significant Hazard)</option>
                  <option value="Moderate">🟡 Moderate (Advisory / Caution)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">INCIDENT CATEGORY</label>
                <input
                  type="text"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">GEOFENCED TARGET WARDS</label>
                <input
                  type="text"
                  value={areaDesc}
                  onChange={(e) => setAreaDesc(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>
            </div>

            {/* English Siren Headline */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                ENGLISH CELL-BROADCAST HEADLINE (MAX 120 CHARACTERS)
              </label>
              <input
                type="text"
                value={headlineEn}
                onChange={(e) => setHeadlineEn(e.target.value)}
                className="w-full bg-[#070d1e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Hindi Siren Headline */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                HINDI VERNACULAR SIREN HEADLINE (हिंदी प्रसारण)
              </label>
              <input
                type="text"
                value={headlineHi}
                onChange={(e) => setHeadlineHi(e.target.value)}
                className="w-full bg-[#070d1e] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Broadcast Metrics Strip */}
            <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-slate-400">Target Cell Towers:</span>
                <span className="text-white font-bold">52 Base Transceiver Stations (BTS)</span>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Target Handsets:</span>
                <span className="text-cyan-300 font-bold">~62,500 Estimated Citizens</span>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">Acoustic Warble:</span>
                <span className="text-amber-300 font-bold">853Hz + 960Hz Dual-Tone</span>
              </div>
            </div>

            {/* Submit Siren Button */}
            <button
              type="submit"
              disabled={isTransmitting}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-2xl transition-all disabled:opacity-50"
            >
              <Megaphone className="w-5 h-5 fill-current animate-bounce" />
              <span>
                {isTransmitting
                  ? 'TRANSMITTING CELL-BROADCAST TO CELL TOWERS...'
                  : '🚨 TRANSMIT GEOFENCED EMERGENCY BROADCAST SIREN'}
              </span>
            </button>
          </form>

          {/* Success Output & Raw XML Viewer */}
          {broadcastSuccess && (
            <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-4 animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>EMERGENCY SIREN BROADCAST CONFIRMED: {broadcastSuccess.identifier}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(broadcastSuccess.cap_xml)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-mono transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedXML ? 'Copied XML!' : 'Copy CAP XML'}</span>
                </button>
              </div>

              {/* Collapsible raw XML preview */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-400/90 overflow-x-auto max-h-40">
                <pre>{broadcastSuccess.cap_xml}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
