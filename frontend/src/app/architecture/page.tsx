'use client';

import React from 'react';
import { 
  Server, 
  Cpu, 
  Cloud, 
  Zap, 
  Globe, 
  Download
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 space-y-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#f5f0fb] dark:bg-[#2a1e36] border border-[#e2d5f3] dark:border-[#422c57] flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-2xs">
              <Cpu className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  CLIMAGRID DECOUPLED SERVERLESS CLOUD ARCHITECTURE
                </h1>
                <span className="bg-[#f5f0fb] dark:bg-[#2a1e36] text-purple-700 dark:text-purple-300 border border-[#e2d5f3] dark:border-[#422c57] text-xs font-mono font-semibold px-3 py-1 rounded-full">
                  AWS AI HACKATHON BLUEPRINT
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-[#787774] dark:text-[#9b9a97] mt-1">
                Event-driven cloud microservices architecture scaling from zero idle cost to 50,000 requests/second during cloudbursts
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/CLIMAGRID_HACKATHON_PRESENTATION.pptx"
              download="CLIMAGRID_HACKATHON_PRESENTATION.pptx"
              className="bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-all font-mono"
            >
              <Download className="w-4 h-4" />
              <span>Pitch Deck (.pptx)</span>
            </a>

            <a
              href="/CLIMAGRID_TECH_STACK_AND_ARCHITECTURE.pdf"
              target="_blank"
              download="CLIMAGRID_TECH_STACK_AND_ARCHITECTURE.pdf"
              className="bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#2b2b2b] dark:hover:bg-[#333333] text-[#2f2e2b] dark:text-white border border-[#deddd9] dark:border-[#3d3d3d] font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-2xs transition-all font-mono"
            >
              <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Whitepaper (.pdf)</span>
            </a>
          </div>
        </div>

        {/* 1. 5-Stage Event-Driven Pipeline */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h3 className="text-base sm:text-lg font-bold text-[#2f2e2b] dark:text-white uppercase tracking-wider flex items-center gap-2.5">
            <Server className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>5-Stage Disaster Response Event Pipeline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-5 text-sm font-mono">
            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] text-center space-y-2.5">
              <span className="text-xs text-sky-700 dark:text-sky-400 font-bold block">STAGE 1</span>
              <p className="font-bold text-[#2f2e2b] dark:text-white text-base">Multimodal Ingestion</p>
              <p className="text-[#575653] dark:text-[#d4d4d4] text-xs sm:text-sm leading-relaxed font-sans">
                WhatsApp Bot (+91 112), SMS Gateways, IoT River Gauges, Citizen Mobile Client
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] text-center space-y-2.5">
              <span className="text-xs text-sky-700 dark:text-sky-400 font-bold block">STAGE 2</span>
              <p className="font-bold text-[#2f2e2b] dark:text-white text-base">Bedrock AI Extraction</p>
              <p className="text-[#575653] dark:text-[#d4d4d4] text-xs sm:text-sm leading-relaxed font-sans">
                Amazon Bedrock (Claude 3.5 Sonnet) zero-shot entity extraction in &lt;1.2s
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] text-center space-y-2.5">
              <span className="text-xs text-sky-700 dark:text-sky-400 font-bold block">STAGE 3</span>
              <p className="font-bold text-[#2f2e2b] dark:text-white text-base">Explainable Triage</p>
              <p className="text-[#575653] dark:text-[#d4d4d4] text-xs sm:text-sm leading-relaxed font-sans">
                Transparent mathematical rule engine prioritizing acute vulnerability over headcounts
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] text-center space-y-2.5">
              <span className="text-xs text-sky-700 dark:text-sky-400 font-bold block">STAGE 4</span>
              <p className="font-bold text-[#2f2e2b] dark:text-white text-base">Dynamic Routing</p>
              <p className="text-[#575653] dark:text-[#d4d4d4] text-xs sm:text-sm leading-relaxed font-sans">
                Amazon Location Service detour calculation excluding submerged bridges
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] text-center space-y-2.5">
              <span className="text-xs text-sky-700 dark:text-sky-400 font-bold block">STAGE 5</span>
              <p className="font-bold text-[#2f2e2b] dark:text-white text-base">Fleet Dispatch</p>
              <p className="text-[#575653] dark:text-[#d4d4d4] text-xs sm:text-sm leading-relaxed font-sans">
                Human-in-the-loop approved manifests dispatched to NDRF motorboats
              </p>
            </div>
          </div>
        </div>

        {/* 2. AWS Services Mapping Matrix */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h3 className="text-base sm:text-lg font-bold text-[#2f2e2b] dark:text-white uppercase tracking-wider flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>AWS Cloud Services & Component Mapping</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-6 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-base block">Amazon Bedrock (Claude 3.5)</span>
              <p className="text-[#575653] dark:text-[#d4d4d4] leading-relaxed font-sans">
                Zero-shot multimodal entity extraction from Hindi/English voice and text in under 1.2s. Extracts trapped counts, medical emergencies, and landmarks.
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-6 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-base block">Amazon Aurora PostGIS</span>
              <p className="text-[#575653] dark:text-[#d4d4d4] leading-relaxed font-sans">
                Geospatial relational SQL queries (ST_DWithin, ST_Intersects) matching rescue boats and relief shelters to flood clusters.
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-6 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-base block">Amazon DynamoDB</span>
              <p className="text-[#575653] dark:text-[#d4d4d4] leading-relaxed font-sans">
                Single-digit millisecond latency state store for live GPS telematics of rescue motorboats and multi-warehouse inventory sync.
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-6 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-base block">AWS Lambda & EventBridge</span>
              <p className="text-[#575653] dark:text-[#d4d4d4] leading-relaxed font-sans">
                100% serverless event backbone, auto-scaling from zero to 50,000 req/sec during cloudbursts with zero idle cost.
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-6 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-base block">Amazon Location Service</span>
              <p className="text-[#575653] dark:text-[#d4d4d4] leading-relaxed font-sans">
                Calculates real-time obstacle avoidance routing, dynamically excluding submerged bridges and flooded railway underpasses.
              </p>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-6 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-base block">AWS SageMaker ML</span>
              <p className="text-[#575653] dark:text-[#d4d4d4] leading-relaxed font-sans">
                XGBoost geospatial inundation progression & multi-metric anomaly detection for IoT river gauges and turbidity spikes.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Performance Benchmarks & UN SDG Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#202020] p-7 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-4 font-mono text-sm shadow-xs">
            <span className="font-bold text-sky-700 dark:text-sky-300 text-base block flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>Real-Time SLA Benchmarks:</span>
            </span>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-4 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                <span className="text-[#575653] dark:text-[#a8a7a4]">Multimodal Entity Extraction:</span>
                <b className="text-emerald-700 dark:text-emerald-400">&lt; 1.2 seconds</b>
              </div>
              <div className="flex justify-between p-4 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                <span className="text-[#575653] dark:text-[#a8a7a4]">JSON Schema Extraction Accuracy:</span>
                <b className="text-emerald-700 dark:text-emerald-400">98.4%</b>
              </div>
              <div className="flex justify-between p-4 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                <span className="text-[#575653] dark:text-[#a8a7a4]">Submerged Route Detour Latency:</span>
                <b className="text-emerald-700 dark:text-emerald-400">&lt; 180 ms</b>
              </div>
              <div className="flex justify-between p-4 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                <span className="text-[#575653] dark:text-[#a8a7a4]">Dispatch Latency Reduction:</span>
                <b className="text-sky-600 dark:text-sky-400">65% faster than manual calls</b>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#202020] p-7 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-4 shadow-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base block flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>United Nations SDG Alignment:</span>
            </span>
            <div className="space-y-4 text-sm text-[#575653] dark:text-[#d4d4d4]">
              <div className="p-4 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] leading-relaxed">
                <b className="text-[#2f2e2b] dark:text-white block mb-1">SDG 11 (Sustainable Cities & Communities):</b>
                Protecting high-risk informal settlements and vulnerable citizens during flash floods, river overflows, and extreme heatwaves.
              </div>
              <div className="p-4 bg-[#f7f6f3] dark:bg-[#191919] rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] leading-relaxed">
                <b className="text-[#2f2e2b] dark:text-white block mb-1">SDG 13 (Climate Action):</b>
                Building integrated climate resilience across the whole compound disaster cycle (Pre-Disaster Early Warning, In-Disaster Triage, Post-Disaster Recovery).
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
