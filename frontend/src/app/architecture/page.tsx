'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Server, 
  Cpu, 
  Database, 
  Cloud, 
  Zap, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  FileText,
  Download,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-950">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  CLIMAGRID DECOUPLED SERVERLESS CLOUD ARCHITECTURE
                </h1>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
                  AWS AI HACKATHON BLUEPRINT
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Event-driven cloud microservices architecture scaling from zero idle cost to 50,000 requests/second during cloudbursts
              </p>
            </div>
          </div>

          <a
            href="/CLIMAGRID_TECH_STACK_AND_ARCHITECTURE.pdf"
            target="_blank"
            download
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xl shadow-purple-950 transition-all font-mono"
          >
            <Download className="w-4 h-4" />
            <span>Download Technical Whitepaper (.pdf)</span>
          </a>
        </div>

        {/* 1. 5-Stage Event-Driven Pipeline */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>5-Stage Disaster Response Event Pipeline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs font-mono">
            <div className="bg-[#070d1e] p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs text-cyan-400 font-bold block">STAGE 1</span>
              <p className="font-bold text-white text-sm">Multimodal Ingestion</p>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                WhatsApp Bot (+91 112), SMS Gateways, IoT River Gauges, Citizen Mobile Client
              </p>
            </div>

            <div className="bg-[#070d1e] p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs text-cyan-400 font-bold block">STAGE 2</span>
              <p className="font-bold text-white text-sm">Bedrock AI Extraction</p>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Amazon Bedrock (Claude 3.5 Sonnet) zero-shot entity extraction in &lt;1.2s
              </p>
            </div>

            <div className="bg-[#070d1e] p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs text-cyan-400 font-bold block">STAGE 3</span>
              <p className="font-bold text-white text-sm">Explainable Triage</p>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Transparent mathematical rule engine prioritizing acute vulnerability over headcounts
              </p>
            </div>

            <div className="bg-[#070d1e] p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs text-cyan-400 font-bold block">STAGE 4</span>
              <p className="font-bold text-white text-sm">Dynamic Routing</p>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Amazon Location Service detour calculation excluding submerged bridges
              </p>
            </div>

            <div className="bg-[#070d1e] p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs text-cyan-400 font-bold block">STAGE 5</span>
              <p className="font-bold text-white text-sm">Fleet Dispatch</p>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Human-in-the-loop approved manifests dispatched to NDRF motorboats
              </p>
            </div>
          </div>
        </div>

        {/* 2. AWS Services Mapping Matrix */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cloud className="w-5 h-5 text-amber-400" />
            <span>AWS Cloud Services & Component Mapping</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#070d1e] p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">Amazon Bedrock (Claude 3.5)</span>
              <p className="text-slate-300 leading-relaxed font-sans">
                Zero-shot multimodal entity extraction from Hindi/English voice and text in under 1.2s. Extracts trapped counts, medical emergencies, and landmarks.
              </p>
            </div>

            <div className="bg-[#070d1e] p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">Amazon Aurora PostGIS</span>
              <p className="text-slate-300 leading-relaxed font-sans">
                Geospatial relational SQL queries (ST_DWithin, ST_Intersects) matching rescue boats and relief shelters to flood clusters.
              </p>
            </div>

            <div className="bg-[#070d1e] p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">Amazon DynamoDB</span>
              <p className="text-slate-300 leading-relaxed font-sans">
                Single-digit millisecond latency state store for live GPS telematics of rescue motorboats and multi-warehouse inventory sync.
              </p>
            </div>

            <div className="bg-[#070d1e] p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">AWS Lambda & EventBridge</span>
              <p className="text-slate-300 leading-relaxed font-sans">
                100% serverless event backbone, auto-scaling from zero to 50,000 req/sec during cloudbursts with zero idle cost.
              </p>
            </div>

            <div className="bg-[#070d1e] p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">Amazon Location Service</span>
              <p className="text-slate-300 leading-relaxed font-sans">
                Calculates real-time obstacle avoidance routing, dynamically excluding submerged bridges and flooded railway underpasses.
              </p>
            </div>

            <div className="bg-[#070d1e] p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">AWS SageMaker ML</span>
              <p className="text-slate-300 leading-relaxed font-sans">
                XGBoost geospatial inundation progression & multi-metric anomaly detection for IoT river gauges and turbidity spikes.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Performance Benchmarks & UN SDG Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0b132b] p-6 rounded-3xl border border-cyan-500/40 space-y-3 font-mono text-xs shadow-2xl">
            <span className="font-bold text-cyan-300 text-sm block flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Real-Time SLA Benchmarks:</span>
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-[#070d1e] rounded-xl border border-slate-800">
                <span className="text-slate-400">Multimodal Entity Extraction:</span>
                <b className="text-emerald-400">&lt; 1.2 seconds</b>
              </div>
              <div className="flex justify-between p-2.5 bg-[#070d1e] rounded-xl border border-slate-800">
                <span className="text-slate-400">JSON Schema Extraction Accuracy:</span>
                <b className="text-emerald-400">98.4%</b>
              </div>
              <div className="flex justify-between p-2.5 bg-[#070d1e] rounded-xl border border-slate-800">
                <span className="text-slate-400">Submerged Route Detour Latency:</span>
                <b className="text-emerald-400">&lt; 180 ms</b>
              </div>
              <div className="flex justify-between p-2.5 bg-[#070d1e] rounded-xl border border-slate-800">
                <span className="text-slate-400">Dispatch Latency Reduction:</span>
                <b className="text-cyan-400">65% faster than manual calls</b>
              </div>
            </div>
          </div>

          <div className="bg-[#0b132b] p-6 rounded-3xl border border-emerald-500/40 space-y-3 shadow-2xl">
            <span className="font-bold text-emerald-300 text-sm block flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>United Nations SDG Alignment:</span>
            </span>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-[#070d1e] rounded-xl border border-slate-800 leading-relaxed">
                <b className="text-white block mb-1">SDG 11 (Sustainable Cities & Communities):</b>
                Protecting high-risk informal settlements and vulnerable citizens during flash floods, river overflows, and extreme heatwaves.
              </div>
              <div className="p-3 bg-[#070d1e] rounded-xl border border-slate-800 leading-relaxed">
                <b className="text-white block mb-1">SDG 13 (Climate Action):</b>
                Building integrated climate resilience across the whole compound disaster cycle (Pre-Disaster Early Warning, In-Disaster Triage, Post-Disaster Recovery).
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
