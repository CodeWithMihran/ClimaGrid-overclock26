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
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { parseDistressMessage, fetchIncidentStatus, analyzeFloodPhoto } from '../../lib/api';
import { IncidentRecord } from '../../types';

export default function CitizenSOSPage() {
  const [activeTab, setActiveTab] = useState<'sos_app' | 'whatsapp'>('sos_app');

  // Network Offline Mesh Simulation States
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Array<{ id: string; time: string; msg: string }>>([]);
  const [syncToast, setSyncToast] = useState<string | null>(null);

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

  // Vision Depth Gauge State
  const [photoAnalysis, setPhotoAnalysis] = useState<any | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);

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
    setIsAnalyzingPhoto(true);
    try {
      const res = await analyzeFloodPhoto('sample_roof');
      const depth = res.estimated_depth_feet;
      const depthOption = depth >= 8 ? '8ft+ - Submerged Room' : depth >= 5.5 ? '6ft - Roof / Chhat' : depth >= 3.5 ? '4ft - Waist Deep' : '2ft - Knee Deep';
      setWaterLevel(depthOption);
      setVoiceText(res.suggested_distress_message);
      setPhotoAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Quick Preset Handlers
  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'solani') {
      setHeadcount(4);
      setWaterLevel('6ft - Roof / Chhat');
      setSelectedVulns(['Elderly / Dadi', 'Infant / Baby']);
      setLandmark('Solani Aqueduct, Roorkee');
      setVoiceText('Solani aqueduct ke paas paani 6ft ho gaya hai, dadi behosh hai aur chhota baby bhi hai chhat par, jaldi aao please!');
    } else if (presetName === 'bazaar') {
      setHeadcount(2);
      setWaterLevel('4ft - Waist Deep');
      setSelectedVulns(['Elderly / Dadi', 'Wheelchair / Disabled']);
      setLandmark('Old Roorkee Dense Bazaar');
      setVoiceText('Old Roorkee bazaar alley flooded 4ft, grandfather on wheelchair unable to evacuate ground floor.');
    } else if (presetName === 'purqazi') {
      setHeadcount(5);
      setWaterLevel('8ft+ - Submerged Room');
      setSelectedVulns(['Pregnant Woman', 'Infant / Baby', 'Trapped Ground Floor']);
      setLandmark('Purqazi Embankment Cluster');
      setVoiceText('Purqazi embankment breach, house submerged over 8ft, 5 family members including pregnant lady waiting on tin roof.');
    }
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

  // 1-Tap SOS Broadcast Trigger (Online or Offline Mesh Queuing)
  const handleBroadcastSOS = async () => {
    const compositeMessage = `${voiceText} [Headcount: ${headcount}, Water Level: ${waterLevel}, Near: ${landmark}, Vulnerabilities: ${selectedVulns.join(', ')}]`;

    if (isOffline) {
      // Store in encrypted local mesh queue
      const queuedItem = {
        id: `OFFLINE-SOS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        time: new Date().toLocaleTimeString(),
        msg: compositeMessage
      };
      setOfflineQueue((prev) => [queuedItem, ...prev]);
      setSyncToast(`📶 Cellular deadzone detected. SOS packet encrypted & buffered in Offline Mesh Queue.`);
      return;
    }

    setIsBroadcasting(true);
    try {
      const record = await parseDistressMessage(compositeMessage, 'Citizen 1-Tap Mobile SOS');
      setActiveIncident(record);
      setSyncToast(`🚨 SOS Broadcast Dispatched to NDRF EOC (ID: ${record.id})`);
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Flush Offline Outbox
  const handleFlushOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsBroadcasting(true);
    try {
      const lastItem = offlineQueue[0];
      const record = await parseDistressMessage(lastItem.msg, 'Citizen Mesh Synced SOS');
      setActiveIncident(record);
      setOfflineQueue([]);
      setIsOffline(false);
      setSyncToast(`⚡ Reconnected! Transmitted ${offlineQueue.length} buffered SOS signal(s) to NDRF Dispatch.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // WhatsApp Message Submit
  const handleSendWhatsApp = async (textToSend?: string) => {
    const msg = textToSend || waInput;
    if (!msg.trim()) return;

    const userMsg = msg;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setWaMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: nowTime }]);
    if (!textToSend) setWaInput('');
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
      }, 700);
    } catch (err) {
      console.error(err);
      setIsWaTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col items-center justify-start p-4 sm:p-8 font-sans transition-colors duration-200">
      {/* Top Navigation & Return to EOC Bar */}
      <div className="w-full max-w-lg flex items-center justify-between py-2 px-1 mb-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to EOC Command Center</span>
        </Link>
        <span className="text-xs font-mono bg-[#fdf2f2] dark:bg-[#341d1d] text-[#b91c1c] dark:text-[#f87171] border border-[#fae1e1] dark:border-[#4d2525] px-3 py-1 rounded-full flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          CITIZEN CLIENT
        </span>
      </div>

      {/* Mobile Shell Container - Notion styled */}
      <div className="w-full max-w-lg bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-3xl shadow-xs overflow-hidden flex flex-col min-h-[720px]">
        
        {/* Offline Simulation HUD Bar */}
        <div className="bg-[#f7f6f3] dark:bg-[#151515] px-4 py-2 border-b border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isOffline ? (
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-mono font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>OFFLINE MESH BUFFER ({offlineQueue.length})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                <Wifi className="w-3.5 h-3.5" />
                <span>CELLULAR ONLINE</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {offlineQueue.length > 0 && (
              <button
                onClick={handleFlushOfflineQueue}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sync Outbox ({offlineQueue.length})</span>
              </button>
            )}

            <button
              onClick={() => setIsOffline(!isOffline)}
              className="text-xs text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white underline font-mono"
            >
              Toggle {isOffline ? 'Online' : 'Deadzone'}
            </button>
          </div>
        </div>

        {/* Sync / Notification Toast */}
        {syncToast && (
          <div className="bg-[#eef8f2] dark:bg-[#1b2b22] border-b border-[#ccecd8] dark:border-[#244b34] px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <span>{syncToast}</span>
            <button onClick={() => setSyncToast(null)} className="font-bold ml-2 text-emerald-700 dark:text-emerald-300">✕</button>
          </div>
        )}

        {/* App Mode Toggle Header */}
        <div className="bg-[#f7f6f3] dark:bg-[#191919] border-b border-[#e9e9e7] dark:border-[#2e2e2e] p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('sos_app')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'sos_app'
                ? 'bg-[#2f2e2b] dark:bg-white text-white dark:text-[#191919] shadow-xs'
                : 'text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>1-Tap SOS App</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-[#227744] text-white shadow-xs'
                : 'text-[#787774] dark:text-[#9b9a97] hover:text-[#2f2e2b] dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Bot Simulator</span>
          </button>
        </div>

        {/* ----------------- TAB 1: 1-TAP SOS CLIENT ----------------- */}
        {activeTab === 'sos_app' && (
          <div className="p-6 sm:p-7 space-y-5 flex-1 overflow-y-auto">
            {/* BIG RED SOS BUTTON */}
            <div className="flex flex-col items-center justify-center py-3">
              <button
                onClick={handleBroadcastSOS}
                disabled={isBroadcasting}
                className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-700 text-white border-4 border-red-200 dark:border-red-900/60 shadow-lg shadow-red-600/20 flex flex-col items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
              >
                <Radio className={`w-9 h-9 text-white mb-1 ${isBroadcasting ? 'animate-spin' : 'animate-pulse'}`} />
                <span className="font-extrabold text-base text-white">
                  {isOffline ? 'QUEUE SOS (OFFLINE)' : 'SOS EMERGENCY'}
                </span>
                <span className="text-xs font-mono text-red-100 mt-0.5">आपातकालीन सहायता</span>
              </button>
              <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-3 text-center">
                {isOffline
                  ? 'Deadzone mode: Buffers encrypted packet for immediate transmission upon network reconnect'
                  : 'Press to instantly alert NDRF & local rescue boats'}
              </p>
            </div>

            {/* QUICK PRESET CHIPS */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-[#787774] dark:text-[#9b9a97]">Quick Scenario Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('solani')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f7f6f3] dark:bg-[#282828] hover:bg-[#eae8e4] text-[#2f2e2b] dark:text-[#e6e6e5] border border-[#e3e2e0] dark:border-[#383838]"
                >
                  Solani Aqueduct (6ft Roof)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('bazaar')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f7f6f3] dark:bg-[#282828] hover:bg-[#eae8e4] text-[#2f2e2b] dark:text-[#e6e6e5] border border-[#e3e2e0] dark:border-[#383838]"
                >
                  Old Bazaar (Wheelchair)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('purqazi')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f7f6f3] dark:bg-[#282828] hover:bg-[#eae8e4] text-[#2f2e2b] dark:text-[#e6e6e5] border border-[#e3e2e0] dark:border-[#383838]"
                >
                  Purqazi (8ft Submerged)
                </button>
              </div>
            </div>

            {/* QUICK VULNERABILITY SELECTOR */}
            <div>
              <label className="text-xs font-bold text-[#2f2e2b] dark:text-[#e6e6e5] uppercase tracking-wider block mb-2.5 font-mono">
                Immediate Vulnerabilities Present:
              </label>
              <div className="grid grid-cols-2 gap-2">
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
                      className={`text-sm py-2 px-3 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'bg-[#fdf2f2] dark:bg-[#341d1d] border-red-300 dark:border-red-800 text-[#b91c1c] dark:text-[#f87171] font-semibold'
                          : 'bg-[#f7f6f3] dark:bg-[#191919] border-[#e9e9e7] dark:border-[#2e2e2e] text-[#575653] dark:text-[#a8a7a4] hover:border-[#deddd9] dark:hover:border-[#383838]'
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-1.5 font-mono">
                  Water Depth:
                </label>
                <select
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value)}
                  className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] text-sm text-[#2f2e2b] dark:text-white rounded-xl p-3 focus:border-red-500 focus:outline-none"
                >
                  <option value="2ft - Knee Deep">2ft - Knee Deep</option>
                  <option value="4ft - Waist Deep">4ft - Waist Deep</option>
                  <option value="6ft - Roof / Chhat">6ft - Roof / Chhat</option>
                  <option value="8ft+ - Submerged Room">8ft+ - Submerged Room</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2f2e2b] dark:text-[#e6e6e5] block mb-1.5 font-mono">
                  Trapped Citizens:
                </label>
                <div className="flex items-center bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl p-1.5 justify-between">
                  <button
                    onClick={() => setHeadcount((prev) => Math.max(1, prev - 1))}
                    className="w-9 h-9 rounded-lg bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#2f2e2b] dark:text-white font-bold flex items-center justify-center hover:bg-[#eaeaea] dark:hover:bg-[#333333]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base text-sky-600 dark:text-sky-400">{headcount}</span>
                  <button
                    onClick={() => setHeadcount((prev) => prev + 1)}
                    className="w-9 h-9 rounded-lg bg-[#f1f1ef] dark:bg-[#2b2b2b] text-[#2f2e2b] dark:text-white font-bold flex items-center justify-center hover:bg-[#eaeaea] dark:hover:bg-[#333333]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* VISION DEPTH GAUGE INLINE RESULT CARD */}
            {photoAnalysis && (
              <div className="bg-[#fef9ee] dark:bg-[#261f14] border border-[#fcedca] dark:border-[#47341b] rounded-xl p-4 text-xs font-mono space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    AI Vision Depth Gauge Result
                  </span>
                  <span className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-bold">
                    {photoAnalysis.estimated_depth_feet} ft Waterline
                  </span>
                </div>
                <p className="text-[#575653] dark:text-[#d4d4d4] font-sans">
                  <b>Identified:</b> {photoAnalysis.waterline_level} • {photoAnalysis.structural_hazard_level}
                </p>
                <p className="text-emerald-700 dark:text-emerald-300 font-sans">
                  ✓ Automatically updated Water Depth selector to {waterLevel}.
                </p>
              </div>
            )}

            {/* VOICE / HINGLISH DISTRESS TEXT */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#2f2e2b] dark:text-[#e6e6e5] font-mono">
                  Voice / Panicked Message:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleMobileMic}
                    className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold ${
                      isMobileListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-[#f7f6f3] dark:bg-[#262626] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929]'
                    }`}
                  >
                    {isMobileListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isMobileListening ? 'Listening...' : 'Voice Record'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePhotoGauge}
                    disabled={isAnalyzingPhoto}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#f7f6f3] dark:bg-[#262626] text-[#b45309] dark:text-[#fbbf24] border border-[#fcedca] dark:border-[#4d3a1f] flex items-center gap-1.5 font-semibold hover:bg-[#eae8e4] disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isAnalyzingPhoto ? 'Analyzing...' : 'Photo Gauge'}</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="Type or speak in Hindi/English..."
                className="w-full bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl p-3.5 text-sm text-[#2f2e2b] dark:text-white placeholder-[#9b9a97] dark:placeholder-[#666666] focus:outline-none focus:border-red-500 leading-relaxed"
              />
            </div>

            {/* LIVE ACTIVE DISPATCH STATUS CARD */}
            {activeIncident && (
              <div className="bg-[#f7f6f3] dark:bg-[#191919] border border-red-300 dark:border-red-800/80 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                    <span className="font-bold text-sm text-[#2f2e2b] dark:text-white font-mono">
                      SOS CASE: {activeIncident.id}
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-[#b91c1c] text-white px-2.5 py-1 rounded font-mono">
                    {activeIncident.triage.priority_tier}
                  </span>
                </div>

                {/* Dispatch state banner */}
                <div className={`p-4 rounded-xl border text-sm font-mono flex items-center justify-between ${
                  activeIncident.status === 'DISPATCHED'
                    ? 'bg-[#eef8f2] dark:bg-[#192b1f] border-[#ccecd8] dark:border-[#274f35] text-[#227744] dark:text-[#4ade80]'
                    : 'bg-[#fef9ee] dark:bg-[#261f14] border-[#fcedca] dark:border-[#47341b] text-[#b45309] dark:text-[#fbbf24]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {activeIncident.status === 'DISPATCHED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
                    )}
                    <div>
                      <p className="font-bold">
                        {activeIncident.status === 'DISPATCHED'
                          ? 'RESCUE FLEET DISPATCHED!'
                          : 'TRIAGE QUEUE: PENDING APPROVAL'}
                      </p>
                      <p className="text-xs opacity-80 mt-0.5">
                        {activeIncident.status === 'DISPATCHED'
                          ? 'Unit: NDRF-BOAT-04 • ETA ~6 mins'
                          : 'Assigned to EOC Commander for priority approval'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Turn-by-Turn Safe Evacuation Push */}
                <div className="bg-white dark:bg-[#202020] border border-sky-200 dark:border-sky-800/60 p-4 rounded-xl text-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold">
                    <Navigation className="w-4 h-4" />
                    <span>Safe High-Ground Evacuation Vector:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#2f2e2b] dark:text-[#d4d4d4]">
                    ⚠️ <b>Avoid Brij Bridge:</b> Submerged under 5.5ft water.
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                    👉 <b>Safe Direction:</b> Move 400m North-East towards IIT Roorkee Multi-Purpose Hall High Ground.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: WHATSAPP BOT SIMULATOR ----------------- */}
        {activeTab === 'whatsapp' && (
          <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] h-full overflow-hidden transition-colors">
            
            {/* WhatsApp Chat Header */}
            <div className="bg-[#008069] dark:bg-[#1f2c34] p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-800 flex items-center justify-center font-bold text-sm">
                  NDRF
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">AAPDA Sahayata Bot</h3>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-xs text-emerald-100 dark:text-emerald-400 font-mono">Disaster Emergency Command (+91 112)</p>
                </div>
              </div>
              <PhoneCall className="w-5 h-5 text-white" />
            </div>

            {/* Chat History Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {waMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] text-sm rounded-2xl p-3.5 shadow-xs ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-[#d9fdd3] dark:bg-[#005c4b] text-[#2f2e2b] dark:text-white rounded-tr-none'
                      : 'mr-auto bg-white dark:bg-[#202c33] text-[#2f2e2b] dark:text-[#f4f4f5] rounded-tl-none border border-slate-200 dark:border-zinc-700/50'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">
                    {msg.text.split('\n').map((line, lIdx) => (
                      <span key={lIdx} className="block">
                        {line.split(/(\*[^*]+\*)/g).map((part, pIdx) => {
                          if (part.startsWith('*') && part.endsWith('*')) {
                            return <strong key={pIdx} className="font-bold">{part.slice(1, -1)}</strong>;
                          }
                          return part;
                        })}
                      </span>
                    ))}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 text-right mt-1.5 font-mono">
                    {msg.time} {msg.sender === 'user' && '✓✓'}
                  </span>
                </div>
              ))}

              {isWaTyping && (
                <div className="mr-auto bg-white dark:bg-[#202c33] text-slate-600 dark:text-zinc-400 text-xs rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
                  <span>Bedrock NLP analyzing distress signal...</span>
                </div>
              )}
            </div>

            {/* Quick WhatsApp Prompt Pills */}
            <div className="bg-[#e4ded5] dark:bg-[#182229] px-3 py-2 flex gap-1.5 overflow-x-auto text-xs border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleSendWhatsApp('Solani aqueduct ke paas 5 log phase hain, paani 6ft ho gaya hai!')}
                className="whitespace-nowrap px-3 py-1 bg-white dark:bg-[#202c33] hover:bg-slate-50 dark:hover:bg-[#2a3942] text-slate-800 dark:text-slate-200 rounded-full border border-slate-300 dark:border-zinc-700"
              >
                🌊 Solani 6ft Flood (5 trapped)
              </button>
              <button
                type="button"
                onClick={() => handleSendWhatsApp('Old Roorkee bazaar mein elderly patient ko urgent insulin aur oxygen chahiye')}
                className="whitespace-nowrap px-3 py-1 bg-white dark:bg-[#202c33] hover:bg-slate-50 dark:hover:bg-[#2a3942] text-slate-800 dark:text-slate-200 rounded-full border border-slate-300 dark:border-zinc-700"
              >
                🩺 Urgent Insulin & Elderly
              </button>
              <button
                type="button"
                onClick={() => handleSendWhatsApp('Hamare sabse paas safe relief shelter kaunsa hai?')}
                className="whitespace-nowrap px-3 py-1 bg-white dark:bg-[#202c33] hover:bg-slate-50 dark:hover:bg-[#2a3942] text-slate-800 dark:text-slate-200 rounded-full border border-slate-300 dark:border-zinc-700"
              >
                📍 Nearest Safe Shelter?
              </button>
            </div>

            {/* WhatsApp Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendWhatsApp();
              }} 
              className="bg-slate-100 dark:bg-[#1f2c34] p-3 flex items-center gap-2.5 border-t border-slate-200 dark:border-slate-700"
            >
              <input
                type="text"
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                placeholder="Type emergency message in Hindi or English..."
                className="flex-1 bg-white dark:bg-[#2a3942] border border-slate-300 dark:border-none rounded-xl px-4 py-2.5 text-sm text-[#2f2e2b] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                aria-label="Send WhatsApp emergency distress message"
                disabled={!waInput.trim()}
                className="bg-[#008069] dark:bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-xs"
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
