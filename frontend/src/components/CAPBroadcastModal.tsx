'use client';

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Radio, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  X, 
  Volume2, 
  Globe, 
  FileCode,
  Check
} from 'lucide-react';
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
  const [descriptionHi, setDescriptionHi] = useState<string>('सोलानी नदी का जलस्तर चेतावनी स्तर को पार कर गया है। बृज ब्रिज जलमग्न है। रामनगर वार्ड 4 के नागरिक तुरंत सुरक्षित ऊंचाई पर जाएं। RIT रुड़की सुरक्षित राहत शिविर में शरण लें।');
  const [areaDesc, setAreaDesc] = useState<string>('Roorkee - Solani Basin, Ramnagar Ward 4, Civil Lines');

  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<CAPAlert | null>(null);
  const [copiedXML, setCopiedXML] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'xml' | 'active'>('compose');

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

      // Dual-tone frequency oscillators: 853Hz + 960Hz
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(853, ctx.currentTime);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(960, ctx.currentTime);

      // Warble modulation effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4, ctx.currentTime); // 4Hz warble
      lfoGain.gain.setValueAtTime(25, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
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
      if (onAlertBroadcasted) onAlertBroadcasted(res);
    } catch (err) {
      console.error(err);
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
                NDMA SACHET / CAP EMERGENCY GEOFENCED SIREN BROADCASTER
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  ITU-T X.1303 / OASIS CAP v1.2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Bilingual Cell-Broadcast, Web Audio 853Hz/960Hz Siren & Geofenced Mobile Alert Gateway
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

        {/* Navigation Tabs */}
        <div className="bg-[#091026] px-6 pt-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'compose'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Compose Alert & Siren</span>
            </button>

            <button
              onClick={() => setActiveTab('xml')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'xml'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>OASIS CAP XML Specification</span>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Active Broadcasts ({activeAlerts.length})</span>
            </button>
          </div>

          <button
            onClick={playEmergencySirenSound}
            className="text-xs font-mono font-bold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-sm mb-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test 853Hz+960Hz Siren</span>
          </button>
        </div>

        {/* Tab 1: Compose Alert */}
        {activeTab === 'compose' && (
          <form onSubmit={handleBroadcast} className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Quick Template Picker */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Load Standard Disaster Template:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'bg-red-950/60 border-red-500 ring-1 ring-red-500'
                        : 'bg-[#070d1e] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{tpl.event}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{tpl.area_description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity & Event */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Alert Severity Level:</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                >
                  <option value="Extreme">RED ALERT - EXTREME (Immediate Danger to Life)</option>
                  <option value="Severe">AMBER ALERT - SEVERE (Significant Threat)</option>
                  <option value="Moderate">YELLOW ALERT - MODERATE (Precautionary)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Geofenced Hazard Event:</label>
                <input
                  type="text"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Bilingual Text Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>English Siren Headline:</span>
                </label>
                <textarea
                  rows={2}
                  value={headlineEn}
                  onChange={(e) => setHeadlineEn(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hindi Siren Headline (हिंदी):</span>
                </label>
                <textarea
                  rows={2}
                  value={headlineHi}
                  onChange={(e) => setHeadlineHi(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Detailed Action (English):</label>
                <textarea
                  rows={3}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">विस्तृत निर्देश (हिंदी):</label>
                <textarea
                  rows={3}
                  value={descriptionHi}
                  onChange={(e) => setDescriptionHi(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Geofenced Polygon / Wards:</label>
              <input
                type="text"
                value={areaDesc}
                onChange={(e) => setAreaDesc(e.target.value)}
                className="w-full bg-[#070d1e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Confirmation Banner */}
            {broadcastSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-400 rounded-xl flex items-center justify-between gap-3 animate-fade-in text-xs">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    Alert broadcasted successfully via C-DoT / NDMA Gateway! Identifier: <b>{broadcastSuccess.identifier}</b>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('xml')}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-mono text-[10px] px-2.5 py-1 rounded-md"
                >
                  View XML
                </button>
              </div>
            )}

            {/* Transmit Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTransmitting}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-red-950 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Megaphone className="w-4 h-4" />
                <span>{isTransmitting ? 'Transmitting to Cell Towers...' : 'Broadcast Emergency Siren'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Raw OASIS CAP XML View */}
        {activeTab === 'xml' && (
          <div className="p-6 overflow-y-auto space-y-3 flex-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">OASIS Common Alerting Protocol v1.2 / ITU-T X.1303 XML Payload:</span>
              <button
                onClick={handleCopyXML}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedXML ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedXML ? 'Copied XML' : 'Copy XML'}</span>
              </button>
            </div>

            <pre className="bg-[#070d1e] p-4 rounded-xl border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
              {broadcastSuccess?.cap_xml || activeAlerts[0]?.cap_xml || '<!-- Select or broadcast alert to inspect live XML payload -->'}
            </pre>
          </div>
        )}

        {/* Tab 3: Active Alerts Log */}
        {activeTab === 'active' && (
          <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
            {activeAlerts.map((alert) => (
              <div
                key={alert.identifier}
                className="bg-[#070d1e] border border-slate-800 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{alert.identifier}</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      {alert.severity}
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{alert.sent}</span>
                </div>
                <p className="font-semibold text-slate-200">{alert.headline_en}</p>
                <p className="text-slate-400 text-[11px]">{alert.description_en}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
