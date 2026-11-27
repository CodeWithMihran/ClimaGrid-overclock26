'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  ArrowLeft, 
  Navigation, 
  Mic, 
  MicOff, 
  Camera, 
  Clock 
} from 'lucide-react';
import { parseDistressMessage, fetchIncidentStatus, analyzeFloodPhoto } from '../../lib/api';
import { IncidentRecord } from '../../types';

export default function CitizenSOSPage() {
  const [activeTab, setActiveTab] = useState<'sos_app' | 'whatsapp'>('sos_app');

  // SOS App Form States
  const [headcount, setHeadcount] = useState<number>(3);
  const [waterLevel, setWaterLevel] = useState<string>('6ft - Roof / Chhat');
  const [selectedVulns, setSelectedVulns] = useState<string[]>(['Elderly / Dadi', 'Infant / Baby']);
  const [landmark, setLandmark] = useState<string>('Solani Aqueduct, Roorkee');
  const [voiceText, setVoiceText] = useState<string>(
    'Solani aqueduct ke paas paani 6ft ho gaya hai, dadi behosh hai aur chhota baby bhi hai chhat par, jaldi aao please!'
  );
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [activeIncident, setActiveIncident] = useState<IncidentRecord | null>(null);

  // Live Speech Recognition on Mobile
  const [isMobileListening, setIsMobileListening] = useState<boolean>(false);
  const mobileRecoRef = React.useRef<any>(null);

  // Initialize Web Speech on Citizen Client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.lang = 'hi-IN';
        reco.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setVoiceText(transcript);
          setIsMobileListening(false);
        };
        reco.onerror = () => setIsMobileListening(false);
        reco.onend = () => setIsMobileListening(false);
        mobileRecoRef.current = reco;
      }
    }
  }, []);

  const toggleMobileMic = () => {
    if (!mobileRecoRef.current) {
      alert('Speech recognition not available on this browser. Try Chrome or Edge.');
      return;
    }
    if (isMobileListening) {
      mobileRecoRef.current.stop();
      setIsMobileListening(false);
    } else {
      mobileRecoRef.current.start();
      setIsMobileListening(true);
    }
  };

  const handleSimulatePhotoGauge = async () => {
    const res = await analyzeFloodPhoto('sample_roof');
    setWaterLevel(`${res.estimated_depth_feet}ft - Roof / Chhat`);
    setVoiceText(res.suggested_distress_message);
    alert(`Vision Depth Gauge: Waterline detected at ${res.estimated_depth_feet}ft! Updated form.`);
  };

  // WhatsApp Bot States
  const [waMessages, setWaMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Namaste. This is ClimaGrid AAPDA360 Emergency Response Bot (NDRF / SDRF). If you are stranded or need rescue, reply with your location, number of trapped people, and urgent medical needs.',
      time: '16:30'
    }
  ]);
  const [waInput, setWaInput] = useState<string>('');
  const [isWaTyping, setIsWaTyping] = useState<boolean>(false);

  // Poll active incident status every 2.5 seconds to reflect when dispatcher clicks "Approve Fleet"
  useEffect(() => {
    if (!activeIncident?.id || activeIncident.status === 'DISPATCHED') return;

    const interval = setInterval(async () => {
      try {
        const updated = await fetchIncidentStatus(activeIncident.id);
        if (updated.status !== activeIncident.status) {
          setActiveIncident(updated);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeIncident]);

  // Toggle vulnerability chip
  const toggleVuln = (vuln: string) => {
    setSelectedVulns((prev) =>
      prev.includes(vuln) ? prev.filter((v) => v !== vuln) : [...prev, vuln]
    );
  };

  // 1-Tap SOS Broadcast Trigger
  const handleBroadcastSOS = async () => {
    setIsBroadcasting(true);
    try {
      const compositeMessage = `${voiceText} [Headcount: ${headcount}, Water Level: ${waterLevel}, Near: ${landmark}, Vulnerabilities: ${selectedVulns.join(', ')}]`;
      const record = await parseDistressMessage(compositeMessage, 'Citizen 1-Tap Mobile SOS');
      setActiveIncident(record);
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // WhatsApp Message Submit
  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waInput.trim()) return;

    const userMsg = waInput;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setWaMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: nowTime }]);
    setWaInput('');
    setIsWaTyping(true);

    try {
      const record = await parseDistressMessage(userMsg, 'WhatsApp Bot (+91 112)');
      setActiveIncident(record);

      const botReply = `🚨 *AAPDA SOS ACKNOWLEDGED*\n\n` +
        `• Priority: *${record.triage.priority_tier}* (Urgency Score: ${record.triage.final_score})\n` +
        `• Landmark Locked: *${record.landmark}*\n` +
        `• Trapped Count: *${record.trapped_count}*\n` +
        `• Hazards Avoided: *Submerged Brij Bridge bypassed*\n` +
        `• Status: *${record.status === 'DISPATCHED' ? '🚤 Rescue Fleet EN ROUTE' : '⏳ Awaiting Operator Dispatch Approval'}*\n\n` +
        `⚠️ *Safety Advice:* Move to upper floor/roof. Avoid touching electric poles. Do not drink tap water (boil alert active).`;

      setTimeout(() => {
        setWaMessages((prev) => [
          ...prev,
          { sender: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        setIsWaTyping(false);
      }, 900);
    } catch (err) {
      console.error(err);
      setIsWaTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col items-center justify-start p-3 sm:p-6 font-sans transition-colors duration-200">
      {/* Top Navigation & Return to EOC Bar */}
      <div className="w-full max-w-md flex items-center justify-between py-2 px-1 mb-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to EOC Command Center</span>
        </Link>
        <span className="text-[11px] font-mono bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          CITIZEN CLIENT
        </span>
      </div>

      {/* Mobile Shell Container */}
      <div className="w-full max-w-md bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[680px]">
        
        {/* App Mode Toggle Header */}
        <div className="bg-slate-50 dark:bg-[#18181b] border-b border-slate-200 dark:border-zinc-800 p-2 flex gap-1.5">
          <button
            onClick={() => setActiveTab('sos_app')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'sos_app'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1-Tap SOS App</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Bot Simulator</span>
          </button>
        </div>

        {/* ----------------- TAB 1: 1-TAP SOS CLIENT ----------------- */}
        {activeTab === 'sos_app' && (
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* BIG RED SOS BUTTON */}
            <div className="flex flex-col items-center justify-center py-3">
              <button
                onClick={handleBroadcastSOS}
                disabled={isBroadcasting}
                className="w-36 h-36 rounded-full bg-red-600 hover:bg-red-700 text-white border-4 border-red-200 dark:border-red-900/60 shadow-lg shadow-red-600/30 flex flex-col items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
              >
                <Radio className={`w-8 h-8 text-white mb-1 ${isBroadcasting ? 'animate-spin' : 'animate-pulse'}`} />
                <span className="font-extrabold text-sm text-white">SOS EMERGENCY</span>
                <span className="text-[10px] font-mono text-red-100 mt-0.5">आपातकालीन सहायता</span>
              </button>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-3 text-center">
                Press to instantly alert NDRF & local rescue boats
              </p>
            </div>

            {/* QUICK VULNERABILITY SELECTOR */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-2">
                Immediate Vulnerabilities Present:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  'Elderly / Dadi',
                  'Infant / Baby',
                  'Pregnant Woman',
                  'Trapped Ground Floor',
                  'Injured / Unconscious',
                  'Wheelchair / Disabled'
                ].map((vuln) => {
                  const isSelected = selectedVulns.includes(vuln);
                  return (
                    <button
                      key={vuln}
                      onClick={() => toggleVuln(vuln)}
                      className={`text-xs py-2 px-2.5 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-semibold'
                          : 'bg-slate-50 dark:bg-[#18181b] border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {vuln}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* WATER DEPTH & TRAPPED HEADCOUNT */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Water Depth:
                </label>
                <select
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 rounded-xl p-2.5 focus:border-red-500 focus:outline-none"
                >
                  <option value="2ft - Knee Deep">2ft - Knee Deep</option>
                  <option value="4ft - Waist Deep">4ft - Waist Deep</option>
                  <option value="6ft - Roof / Chhat">6ft - Roof / Chhat</option>
                  <option value="8ft+ - Submerged Room">8ft+ - Submerged Room</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Trapped Citizens:
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl p-1 justify-between">
                  <button
                    onClick={() => setHeadcount((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-700"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm text-sky-700 dark:text-sky-400">{headcount}</span>
                  <button
                    onClick={() => setHeadcount((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* VOICE / HINGLISH DISTRESS TEXT */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Voice / Panicked Message:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleMobileMic}
                    className={`text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                      isMobileListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                    }`}
                  >
                    {isMobileListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isMobileListening ? 'Listening...' : 'Voice Record'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePhotoGauge}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1 font-semibold"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Photo Gauge</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="Type or speak in Hindi/English..."
                className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* LIVE ACTIVE DISPATCH STATUS CARD */}
            {activeIncident && (
              <div className="bg-slate-50 dark:bg-[#18181b] border border-red-300 dark:border-red-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                    <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 font-mono">
                      SOS CASE: {activeIncident.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded font-mono">
                    {activeIncident.triage.priority_tier}
                  </span>
                </div>

                {/* Dispatch state banner */}
                <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                  activeIncident.status === 'DISPATCHED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {activeIncident.status === 'DISPATCHED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                    )}
                    <div>
                      <p className="font-bold">
                        {activeIncident.status === 'DISPATCHED'
                          ? 'RESCUE FLEET DISPATCHED!'
                          : 'TRIAGE QUEUE: PENDING APPROVAL'}
                      </p>
                      <p className="text-[10px] opacity-80">
                        {activeIncident.status === 'DISPATCHED'
                          ? 'Unit: NDRF-BOAT-04 • ETA ~6 mins'
                          : 'Assigned to EOC Commander for priority approval'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Turn-by-Turn Safe Evacuation Push */}
                <div className="bg-white dark:bg-[#09090b] border border-sky-200 dark:border-sky-800/60 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-bold">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Safe High-Ground Evacuation Vector:</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-300">
                    ⚠️ <b>Avoid Brij Bridge:</b> Submerged under 5.5ft water.
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    👉 <b>Safe Direction:</b> Move 400m North-East towards IIT Roorkee Multi-Purpose Hall High Ground.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: WHATSAPP BOT SIMULATOR ----------------- */}
        {activeTab === 'whatsapp' && (
          <div className="flex-1 flex flex-col bg-[#e5ddd5] dark:bg-[#0b141a] h-full overflow-hidden transition-colors">
            
            {/* WhatsApp Chat Header */}
            <div className="bg-[#008069] dark:bg-[#1f2c34] p-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white text-emerald-800 flex items-center justify-center font-bold text-xs">
                  NDRF
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-white">AAPDA Sahayata Bot</h3>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-[10px] text-emerald-100 dark:text-emerald-400 font-mono">Disaster Emergency Command (+91 112)</p>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-white" />
            </div>

            {/* Chat History Container */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {waMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] text-xs rounded-2xl p-3 shadow-xs ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none'
                      : 'mr-auto bg-white dark:bg-[#202c33] text-slate-900 dark:text-zinc-100 rounded-tl-none border border-slate-200 dark:border-zinc-700/50'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 text-right mt-1 font-mono">
                    {msg.time} {msg.sender === 'user' && '✓✓'}
                  </span>
                </div>
              ))}

              {isWaTyping && (
                <div className="mr-auto bg-white dark:bg-[#202c33] text-slate-600 dark:text-zinc-400 text-xs rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
                  <span>Bedrock NLP analyzing distress signal...</span>
                </div>
              )}
            </div>

            {/* WhatsApp Input Bar */}
            <form onSubmit={handleSendWhatsApp} className="bg-slate-100 dark:bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                placeholder="Type emergency message in Hindi or English..."
                className="flex-1 bg-white dark:bg-[#2a3942] border border-slate-300 dark:border-none rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!waInput.trim()}
                className="bg-[#008069] dark:bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
