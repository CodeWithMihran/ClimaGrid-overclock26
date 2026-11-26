'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  MapPin, 
  Radio, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  ArrowLeft, 
  Navigation, 
  Compass,
  Mic,
  MicOff,
  Camera,
  Upload,
  Clock,
  Waves
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
      alert('Speech recognition not available on this browser. Try Chrome/Edge.');
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
    alert(`📸 Vision Depth Gauge: Waterline detected at ${res.estimated_depth_feet}ft! Updated form.`);
  };

  // WhatsApp Bot States
  const [waMessages, setWaMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '🙏 Namaste. This is AAPDA360 / Lifeline360 Emergency Response Bot (NDRF / SDRF). If you are stranded or need rescue, reply with your location, number of trapped people, and urgent medical needs.',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4">
      {/* Top Navigation & Return to EOC Bar */}
      <div className="w-full max-w-md flex items-center justify-between py-2 px-1 mb-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to EOC Command Center</span>
        </Link>
        <span className="text-[10px] font-mono bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          CITIZEN FIELD CLIENT
        </span>
      </div>

      {/* Mobile Shell Container */}
      <div className="w-full max-w-md bg-[#070d1e] border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[680px]">
        
        {/* App Mode Toggle Header */}
        <div className="bg-[#0b132b] border-b border-slate-800 p-2 flex gap-1">
          <button
            onClick={() => setActiveTab('sos_app')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sos_app'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1-Tap SOS App</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Bot (+91 112)</span>
          </button>
        </div>

        {/* ----------------- TAB 1: 1-TAP SOS EMERGENCY APP ----------------- */}
        {activeTab === 'sos_app' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            
            {/* GPS Coordinate Lock Indicator */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 animate-pulse" />
                <div>
                  <p className="text-emerald-300 font-bold">GPS SIGNAL LOCKED (±4m)</p>
                  <p className="text-[10px] text-slate-400">29.8650° N, 77.8990° E • Roorkee Basin</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                LIVE
              </span>
            </div>

            {/* MASSIVE 1-TAP SOS BUTTON (Operable with wet/shaking hands) */}
            <div className="flex flex-col items-center py-2">
              <button
                onClick={handleBroadcastSOS}
                disabled={isBroadcasting}
                className="relative group w-44 h-44 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center border-4 border-red-300 hover:scale-105 active:scale-95 transition-all"
              >
                {/* Pulsing ring animation */}
                <span className="absolute -inset-2 rounded-full border-2 border-red-500/50 animate-ping opacity-75 pointer-events-none" />
                
                <Radio className="w-10 h-10 mb-1 text-white animate-pulse" />
                <span className="font-black text-xl tracking-wider">BROADCAST</span>
                <span className="font-extrabold text-sm text-red-100">SOS EMERGENCY</span>
                <span className="text-[9px] font-mono text-red-200 mt-1">आपातकालीन सहायता</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Press to instantly alert NDRF & local rescue boats
              </p>
            </div>

            {/* QUICK VULNERABILITY SELECTOR */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
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
                      className={`text-xs py-2 px-2.5 rounded-xl border font-medium text-left transition-all ${
                        isSelected
                          ? 'bg-rose-950 border-rose-500 text-rose-200 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Water Depth Level:
                </label>
                <select
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-2 focus:border-red-500"
                >
                  <option value="2ft - Knee Deep">2ft - Knee Deep</option>
                  <option value="4ft - Waist Deep">4ft - Waist Deep</option>
                  <option value="6ft - Roof / Chhat">6ft - Roof / Chhat</option>
                  <option value="8ft+ - Submerged Room">8ft+ - Submerged Room</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Trapped Citizens:
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 justify-between">
                  <button
                    onClick={() => setHeadcount((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold flex items-center justify-center hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm text-cyan-400">{headcount}</span>
                  <button
                    onClick={() => setHeadcount((prev) => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold flex items-center justify-center hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* VOICE / HINGLISH DISTRESS TEXT */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Voice / Panicked Message:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleMobileMic}
                    className={`text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold ${
                      isMobileListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-800 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {isMobileListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isMobileListening ? 'Listening...' : 'Voice Record'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePhotoGauge}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* LIVE ACTIVE DISPATCH STATUS CARD (Renders when an SOS has been sent) */}
            {activeIncident && (
              <div className="bg-slate-900/95 border-2 border-red-500/60 rounded-2xl p-3 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="font-bold text-xs text-slate-200 font-mono">
                      SOS CASE: {activeIncident.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded font-mono">
                    {activeIncident.triage.priority_tier}
                  </span>
                </div>

                {/* Dispatch state banner */}
                <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                  activeIncident.status === 'DISPATCHED'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-500 text-amber-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {activeIncident.status === 'DISPATCHED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
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
                <div className="bg-[#070d1e] border border-cyan-500/30 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Safe High-Ground Evacuation Vector:</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ⚠️ <b>Avoid Brij Bridge:</b> Submerged under 5.5ft water.
                  </p>
                  <p className="text-[11px] text-emerald-300">
                    👉 <b>Safe Direction:</b> Move 400m North-East towards IIT Roorkee Multi-Purpose Hall High Ground.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: WHATSAPP BOT SIMULATOR ----------------- */}
        {activeTab === 'whatsapp' && (
          <div className="flex-1 flex flex-col bg-[#0b141a] h-full overflow-hidden">
            
            {/* WhatsApp Chat Header */}
            <div className="bg-[#1f2c34] p-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                  NDRF
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-white">AAPDA Sahayata Bot</h3>
                    <span className="text-emerald-400 text-xs">✓</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-mono">Disaster Emergency Command (+91 112)</p>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Chat History Container */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {waMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] text-xs rounded-2xl p-3 shadow-md ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-[#005c4b] text-white rounded-tr-none'
                      : 'mr-auto bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] text-slate-400 text-right mt-1 font-mono">
                    {msg.time} {msg.sender === 'user' && '✓✓'}
                  </span>
                </div>
              ))}

              {isWaTyping && (
                <div className="mr-auto bg-[#202c33] text-slate-400 text-xs rounded-xl px-3 py-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
                  <span>Bedrock NLP analyzing distress signal...</span>
                </div>
              )}
            </div>

            {/* WhatsApp Input Bar */}
            <form onSubmit={handleSendWhatsApp} className="bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-slate-700">
              <input
                type="text"
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                placeholder="Type emergency message in Hindi or English..."
                className="flex-1 bg-[#2a3942] border-none rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!waInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white p-2 rounded-xl transition-all"
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
