'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Sparkles, 
  Mic, 
  MicOff, 
  Camera, 
  Upload, 
  Waves,
  Radio,
  Tag,
  MessageSquare
} from 'lucide-react';
import { SampleMessage, ImageAnalysisResponse, ImagePreset } from '../types';
import { analyzeFloodPhoto, fetchImagePresets } from '../lib/api';

interface QuickDistressSimulatorProps {
  onSendMessage: (message: string, source: string) => Promise<void>;
  sampleMessages: SampleMessage[];
  isProcessing: boolean;
  lastLatencyMs: number | null;
}

export const QuickDistressSimulator: React.FC<QuickDistressSimulatorProps> = ({
  onSendMessage,
  sampleMessages,
  isProcessing,
  lastLatencyMs
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'vision'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedSource, setSelectedSource] = useState('WhatsApp');

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Vision Analysis States
  const [imagePresets, setImagePresets] = useState<ImagePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sample_roof');
  const [visionAnalysis, setVisionAnalysis] = useState<ImageAnalysisResponse | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load presets on mount
  useEffect(() => {
    fetchImagePresets()
      .then((presets) => {
        setImagePresets(presets);
        if (presets.length > 0) {
          handleRunPresetAnalysis('sample_roof');
        }
      })
      .catch((e) => console.error('Preset error:', e));
  }, []);

  // Web Speech API Initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = speechLang;

        reco.onresult = (event: any) => {
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setInputText((prev) => `${prev} ${event.results[i][0].transcript}`.trim());
              setInterimTranscript('');
            } else {
              currentInterim += event.results[i][0].transcript;
              setInterimTranscript(currentInterim);
            }
          }
        };

        reco.onerror = (err: any) => {
          console.warn('Speech recognition warning:', err);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = reco;
      }
    }
  }, [speechLang]);

  // Toggle Live Microphone
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech start error:', err);
      }
    }
  };

  // Run Vision Preset Analysis
  const handleRunPresetAnalysis = async (presetId: string) => {
    setSelectedPresetId(presetId);
    setIsAnalyzingImage(true);
    try {
      const res = await analyzeFloodPhoto(presetId, undefined, 'Solani Aqueduct, Roorkee');
      setVisionAnalysis(res);
    } catch (e) {
      console.error('Vision analysis error:', e);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Handle Custom Photo Upload
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsAnalyzingImage(true);
      try {
        const res = await analyzeFloodPhoto(undefined, base64, 'Roorkee Flooded Area');
        setVisionAnalysis(res);
        setSelectedPresetId('custom_upload');
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Text/Voice message into central triage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await onSendMessage(inputText, selectedSource);
    setInputText('');
    setInterimTranscript('');
  };

  const handleSelectSample = (sample: SampleMessage) => {
    setInputText(sample.message);
    setSelectedSource(sample.source);
  };

  // Quick 1-Click Vernacular Voice Simulation
  const handleSimulateVoiceSOS = () => {
    const vernacularSOS = "Solani bridge ke paas paani chhat tak aa gaya hai, dadi behosh hain aur 2 bachhe ro rahe hain, jaldi rescue boat bhejo!";
    setInputText(vernacularSOS);
    setSelectedSource("Vernacular Voice Note (Hindi-Dialect)");
  };

  return (
    <div className="bg-[#0b132b] border-t border-slate-800 p-3 space-y-2.5">
      {/* Multimodal Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1 bg-[#070d1e] p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'text'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text / SOS Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'voice'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-red-400" />
            <span>Voice SOS (Hindi)</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'vision'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Vision Depth Gauge</span>
          </button>
        </div>

        {lastLatencyMs && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
            Bedrock AI Latency: {(lastLatencyMs / 1000).toFixed(2)}s
          </span>
        )}
      </div>

      {/* TAB 1: TEXT / PRESET FEED */}
      {activeTab === 'text' && (
        <div className="space-y-2">
          {/* Preset Scenario Pills */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Scenarios:
            </span>
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="text-[11px] bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded-lg transition-all"
              >
                <span className="font-semibold text-cyan-400">{sample.title.split(' ')[0]}</span>{' '}
                <span className="text-slate-400">({sample.expected_tier})</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw citizen message (e.g. 'Solani aqueduct ke paas paani 6ft ho gaya hai, dadi behosh hai...')"
              className="flex-1 bg-[#070d1e] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-[#070d1e] border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Emergency 112">Emergency 112</option>
              <option value="SMS Gateway">SMS</option>
              <option value="Citizen App">Citizen App</option>
            </select>

            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              {isProcessing ? <span>Extracting...</span> : <><Zap className="w-3.5 h-3.5 fill-current" /><span>Process</span></>}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: MULTILINGUAL VOICE SOS */}
      {activeTab === 'voice' && (
        <div className="bg-[#070d1e] p-3 rounded-2xl border border-red-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-xs font-bold text-slate-200">
                {isListening ? 'LISTENING TO CITIZEN AUDIO STREAM...' : 'MULTIMODAL AUDIO RECORDER'}
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Dialect:</span>
              <button
                onClick={() => setSpeechLang('hi-IN')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  speechLang === 'hi-IN' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Hindi / Hinglish (hi-IN)
              </button>
              <button
                onClick={() => setSpeechLang('en-IN')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  speechLang === 'en-IN' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                English (en-IN)
              </button>
            </div>
          </div>

          {/* Voice transcript display */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 min-h-[46px] text-xs">
            {inputText || interimTranscript ? (
              <p className="text-slate-200">
                {inputText} <span className="text-red-400 italic font-mono">{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-slate-500 italic">
                Press "Start Live Mic" and speak vernacular Hindi/English distress message...
              </p>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleSpeechRecognition}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-red-400" />
                  <span>Start Live Microphone</span>
                </>
              )}
            </button>

            <button
              onClick={handleSimulateVoiceSOS}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Vernacular Voice Note</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isProcessing}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Run Bedrock NLP</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: COMPUTER VISION WATERLINE DEPTH GAUGE */}
      {activeTab === 'vision' && (
        <div className="bg-[#070d1e] p-3 rounded-2xl border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Rekognition & Bedrock Vision Waterline Gauge
              </span>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Disaster Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* 3 Clickable Photo Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {imagePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleRunPresetAnalysis(preset.id)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-amber-950/60 border-amber-500 shadow-md shadow-amber-950/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {preset.thumbnail_label}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {preset.waterline}
                </span>
                <span className={`mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  preset.badge.includes('CRITICAL') ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  Est: {preset.depth_feet}ft
                </span>
              </button>
            ))}
          </div>

          {/* Real-time Waterline Vision HUD Result */}
          {visionAnalysis && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-mono font-bold text-sm flex items-center gap-1">
                    <Waves className="w-4 h-4 text-blue-400" />
                    <span>{visionAnalysis.estimated_depth_feet} FT ({visionAnalysis.estimated_depth_meters}m)</span>
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono font-bold">
                    {visionAnalysis.waterline_level}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Confidence: {(visionAnalysis.confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {visionAnalysis.summary}
              </p>

              {/* Detected reference objects */}
              <div className="flex flex-wrap gap-1">
                {visionAnalysis.detected_objects.map((obj, i) => (
                  <span key={i} className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{obj}</span>
                  </span>
                ))}
              </div>

              {/* Inject into Triage Button */}
              <button
                onClick={async () => {
                  await onSendMessage(visionAnalysis.suggested_distress_message, 'Multimodal Vision Gauge');
                }}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-950"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Inject Vision Analysis into Triage Queue & Safe Route</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
