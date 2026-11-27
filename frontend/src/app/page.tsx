'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertCircle, 
  CheckCircle2, 
  Navigation, 
  Send, 
  MapPin, 
  Users, 
  Waves, 
  Clock, 
  AlertTriangle,
  ShieldAlert,
  BatteryCharging,
  Layers,
  Radio,
  Zap,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { 
  fetchIncidentQueue, 
  parseDistressMessage, 
  approveDispatch, 
  calculateRoute, 
  fetchFleetAssets, 
  fetchSampleMessages,
  fetchWaterSensors,
  fetchHeatZones,
  fetchFloodGeoJSON
} from '../lib/api';
import { IncidentRecord, RouteSegment, FleetAsset, SampleMessage, WaterSensorNode } from '../types';

// Load TacticalMap dynamically to avoid SSR window/Leaflet issues
const TacticalMap = dynamic(
  () => import('../components/TacticalMap').then((mod) => mod.TacticalMap),
  { ssr: false }
);

export default function DispatchCommandPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteSegment | null>(null);
  const [avoidHazards, setAvoidHazards] = useState<boolean>(true);
  const [fleetAssets, setFleetAssets] = useState<FleetAsset[]>([]);
  const [sampleMessages, setSampleMessages] = useState<SampleMessage[]>([]);
  const [waterSensors, setWaterSensors] = useState<WaterSensorNode[]>([]);
  const [heatData, setHeatData] = useState<any>(null);
  const [floodGeoJSON, setFloodGeoJSON] = useState<any>(null);

  // Quick Ingestion Input
  const [inputText, setInputText] = useState('');
  const [selectedSource, setSelectedSource] = useState('WhatsApp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [q, fleet, samples, water, heat, flood] = await Promise.all([
          fetchIncidentQueue(),
          fetchFleetAssets(),
          fetchSampleMessages(),
          fetchWaterSensors(),
          fetchHeatZones(),
          fetchFloodGeoJSON()
        ]);
        setIncidents(q);
        setFleetAssets(fleet);
        setSampleMessages(samples);
        setWaterSensors(water);
        setHeatData(heat);
        setFloodGeoJSON(flood);

        if (q.length > 0) {
          setSelectedIncident(q[0]);
          handleCalculateRoute(q[0], true);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();

    // Auto-poll incident queue every 2.5s for live citizen updates
    const interval = setInterval(async () => {
      try {
        const liveQ = await fetchIncidentQueue();
        setIncidents(liveQ);
      } catch (e) {
        // quiet sync
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleCalculateRoute = async (incident: IncidentRecord, avoid: boolean = avoidHazards) => {
    try {
      const boatOrigin: [number, number] = [29.8550, 77.8860];
      const targetDest: [number, number] = [incident.latitude, incident.longitude];
      const route = await calculateRoute(boatOrigin, targetDest, avoid);
      setActiveRoute(route);
    } catch (err) {
      console.error('Route calculation error:', err);
    }
  };

  const handleToggleAvoidance = () => {
    const nextAvoid = !avoidHazards;
    setAvoidHazards(nextAvoid);
    if (selectedIncident) {
      handleCalculateRoute(selectedIncident, nextAvoid);
    }
  };

  const handleApproveDispatch = async (incidentId: string) => {
    try {
      await approveDispatch(incidentId, 'NDRF-BOAT-04');
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === incidentId
            ? { ...inc, status: 'DISPATCHED', assigned_unit: 'NDRF-BOAT-04' }
            : inc
        )
      );
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const start = performance.now();
    try {
      const record = await parseDistressMessage(inputText, selectedSource);
      const elapsed = Math.round(performance.now() - start);
      setLastLatencyMs(elapsed);

      setIncidents((prev) => {
        const next = [record, ...prev.filter((i) => i.id !== record.id)];
        next.sort((a, b) => b.triage.final_score - a.triage.final_score);
        return next;
      });

      setSelectedIncident(record);
      handleCalculateRoute(record, avoidHazards);
      setInputText('');
    } catch (err) {
      console.error('Message parsing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Main Content Area - Spacious 2-Column Grid */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols on LG): Live Distress Triage Stream & Ingestion */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {/* Section Header */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  LIVE DISTRESS TRIAGE QUEUE (AAPDA360)
                </h2>
                <p className="text-xs text-slate-400">Real-time NLP priority scoring & emergency dispatch</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full">
              {incidents.length} Records Active
            </span>
          </div>

          {/* Incident Cards List */}
          <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const isP1 = inc.triage.priority_tier.includes('P1');
              const isP2 = inc.triage.priority_tier.includes('P2');
              const isDispatched = inc.status === 'DISPATCHED';

              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    handleCalculateRoute(inc, avoidHazards);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-lg ${
                    isSelected
                      ? 'bg-slate-800/95 border-cyan-400 ring-2 ring-cyan-500/30 shadow-cyan-950/60'
                      : 'bg-[#0b132b] border-slate-800/90 hover:border-slate-700 hover:bg-[#0e1738]'
                  }`}
                >
                  {/* Top Bar: ID, Priority Badge & Score */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-slate-200">{inc.id}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md font-mono ${
                          isP1
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                            : isP2
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        }`}
                      >
                        {inc.triage.priority_tier}
                      </span>
                    </div>

                    <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 rounded-lg">
                      Score: {inc.triage.final_score.toFixed(2)}
                    </span>
                  </div>

                  {/* Raw Citizen Distress Message */}
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800/80 mb-3">
                    <p className="text-sm text-slate-200 leading-relaxed italic">
                      &ldquo;{inc.raw_message}&rdquo;
                    </p>
                  </div>

                  {/* Extracted Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#070d1e]/80 p-2.5 rounded-xl border border-slate-800/70 mb-3 font-medium">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">{inc.landmark}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span>{inc.trapped_count} Trapped</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Waves className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Water: {inc.water_level_feet} ft</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{inc.timestamp}</span>
                    </div>
                  </div>

                  {/* Vulnerability Tags */}
                  {inc.vulnerabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {inc.vulnerabilities.map((v, i) => (
                        <span
                          key={i}
                          className="text-xs bg-rose-950/70 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded-md font-mono flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>{v}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reasoning */}
                  <p className="text-xs text-slate-400 mb-3 font-mono leading-relaxed">
                    <b>Triage Rationale:</b> {inc.triage.explanation}
                  </p>

                  {/* Actions: Route Preview & Approve Fleet */}
                  <div className="flex items-center gap-3 pt-2.5 border-t border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(inc);
                        handleCalculateRoute(inc, avoidHazards);
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-sm"
                    >
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      <span>Preview Route</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveDispatch(inc.id);
                      }}
                      disabled={isDispatched}
                      className={`flex-1 text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        isDispatched
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Dispatched</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Approve Fleet Dispatch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Distress Message Ingestion Box */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Simulate Emergency Distress Ingestion</span>
              </h3>
              {lastLatencyMs && (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Bedrock NLP: {(lastLatencyMs / 1000).toFixed(2)}s
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Presets:
              </span>
              {sampleMessages.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(sample.message);
                    setSelectedSource(sample.source);
                  }}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded-lg transition-all"
                >
                  <span className="font-bold text-cyan-400">{sample.title.split(' ')[0]}</span>{' '}
                  <span className="text-slate-400">({sample.expected_tier})</span>
                </button>
              ))}
            </div>

            {/* Ingestion Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste Hindi/English distress message (e.g., 'Solani aqueduct ke paas paani 6ft ho gaya hai...')"
                className="flex-1 bg-[#070d1e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-[#070d1e] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Emergency 112">Emergency 112</option>
                <option value="SMS Gateway">SMS</option>
              </select>
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950"
              >
                {isProcessing ? <span>Extracting...</span> : <><Zap className="w-4 h-4 fill-current" /><span>Triage</span></>}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column (7 Cols on LG): Map & Live Route Optimization */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Section Header */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  TACTICAL GEOSPATIAL MAP & LIVE ROUTE OPTIMIZATION
                </h2>
                <p className="text-xs text-slate-400">Hazard-aware obstacle bypass & high-ground rescue routing</p>
              </div>
            </div>
            <button
              onClick={handleToggleAvoidance}
              className="text-xs font-bold py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{avoidHazards ? 'Bypass Active: Safe High-Ground' : 'Blind Path: Direct Danger'}</span>
            </button>
          </div>

          {/* Map Container */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[460px] relative">
            <TacticalMap
              activeModule="flood"
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                handleCalculateRoute(inc, avoidHazards);
              }}
              waterSensors={waterSensors}
              heatData={heatData}
              floodGeoJSON={floodGeoJSON}
              activeRoute={activeRoute}
            />
          </div>

          {/* Route Optimization Telemetry Card (SW-01) */}
          {activeRoute && (
            <div className="bg-[#0b132b] border border-cyan-500/40 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>DYNAMIC RESCUE CORRIDOR TELEMETRY</span>
                </div>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  activeRoute.is_safe
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {activeRoute.is_safe ? 'SUBMERGED-SAFE HIGH-GROUND' : 'DANGEROUS DIRECT CORRIDOR'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">CORRIDOR DISTANCE</span>
                  <span className="text-base font-bold text-white">{activeRoute.distance_km} km</span>
                </div>
                <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">ESTIMATED TRAVEL TIME</span>
                  <span className="text-base font-bold text-cyan-400">{activeRoute.duration_minutes} mins</span>
                </div>
                <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">TARGET INCIDENT</span>
                  <span className="text-base font-bold text-yellow-400">{selectedIncident?.id || 'Selected'}</span>
                </div>
                <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">ESTIMATED WATER DEPTH</span>
                  <span className="text-base font-bold text-rose-400">{selectedIncident?.water_level_feet || 6} ft</span>
                </div>
              </div>

              {activeRoute.avoided_hazards.length > 0 && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Real-Time Road Blockages Automatically Detoured:</span>
                  </span>
                  <ul className="list-disc pl-5 text-red-200/90 space-y-0.5 text-xs font-medium">
                    {activeRoute.avoided_hazards.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Staging Hubs & Fleet Assets (SW-01 Multi-Tier Dispatch) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Optimal Drop Zones */}
            <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Optimal Drop Zones & Staging (SW-01)</span>
                </span>
                <span className="text-xs text-cyan-400 font-mono font-bold">2 ACTIVE</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="bg-[#070d1e] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Solani High-Ground Helipad (LZ-1)</p>
                    <p className="text-[11px] text-slate-400">Elevation: 274m • Air Drop & Boat Launch</p>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold">
                    ACTIVE
                  </span>
                </div>
                <div className="bg-[#070d1e] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">IIT Roorkee Stadium Staging Depot</p>
                    <p className="text-[11px] text-slate-400">Volunteer Assembly & Medical Depot</p>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold">
                    READY
                  </span>
                </div>
              </div>
            </div>

            {/* Live Fleet Assets */}
            <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Rescue Fleet Readiness</span>
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">LIVE GPS</span>
              </h3>
              <div className="space-y-2 text-xs">
                {fleetAssets.slice(0, 3).map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-[#070d1e] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white">{asset.callsign}</p>
                      <p className="text-[11px] text-slate-400">{asset.type} • {asset.status}</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                      <BatteryCharging className="w-4 h-4 text-cyan-400" />
                      <span>{asset.battery_or_fuel_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
