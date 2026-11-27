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
  Sparkles
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
  }, []);

  const handleCalculateRoute = async (incident: IncidentRecord, avoid: boolean) => {
    try {
      const fleetLat = 29.8550;
      const fleetLng = 77.8860;
      const route = await calculateRoute(
        [fleetLat, fleetLng],
        [incident.latitude, incident.longitude],
        avoid
      );
      setActiveRoute(route);
    } catch (err) {
      console.error('Routing error:', err);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Main Content Area - Spacious 2-Column Grid */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 Cols on LG): Live Distress Triage Stream & Ingestion */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Section Header Card */}
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  LIVE DISTRESS TRIAGE QUEUE (AAPDA360)
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Real-time NLP priority scoring & multi-tier dispatch</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-sky-50 dark:bg-zinc-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-zinc-700 px-3 py-1 rounded-full shadow-xs">
              {incidents.length} Active
            </span>
          </div>

          {/* Incident Cards List */}
          <div className="space-y-4 max-h-[660px] overflow-y-auto pr-1.5 scrollbar-thin">
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
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-sky-50/50 dark:bg-zinc-800/90 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20'
                      : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-zinc-800/90 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/60 dark:hover:bg-[#18181b]'
                  }`}
                >
                  {/* Top Bar: ID, Priority Badge & Score */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">{inc.id}</span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md font-mono ${
                          isP1
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse'
                            : isP2
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                        }`}
                      >
                        {inc.triage.priority_tier}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-zinc-900 border border-sky-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg">
                      Score: {inc.triage.final_score.toFixed(2)}
                    </span>
                  </div>

                  {/* Raw Citizen Distress Message */}
                  <div className="bg-slate-50 dark:bg-[#09090b] p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 mb-3.5">
                    <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed italic">
                      &ldquo;{inc.raw_message}&rdquo;
                    </p>
                  </div>

                  {/* Extracted Details Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 mb-3.5 font-medium">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                      <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="truncate">{inc.landmark}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                      <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{inc.trapped_count} Trapped</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                      <Waves className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Water: {inc.water_level_feet} ft</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <span>{inc.timestamp}</span>
                    </div>
                  </div>

                  {/* Vulnerability Tags */}
                  {inc.vulnerabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3.5">
                      {inc.vulnerabilities.map((v, i) => (
                        <span
                          key={i}
                          className="text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 px-2 py-0.5 rounded-md font-mono flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>{v}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reasoning */}
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mb-4 font-mono leading-relaxed">
                    <b className="text-slate-800 dark:text-zinc-200">Triage Rationale:</b> {inc.triage.explanation}
                  </p>

                  {/* Actions: Route Preview & Approve Fleet */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(inc);
                        handleCalculateRoute(inc, avoidHazards);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-zinc-700 shadow-xs"
                    >
                      <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>Preview Route</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveDispatch(inc.id);
                      }}
                      disabled={isDispatched}
                      className={`flex-1 text-xs py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        isDispatched
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Dispatched</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Approve Fleet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Distress Message Ingestion Box */}
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Simulate Emergency Distress Ingestion</span>
              </h3>
              {lastLatencyMs && (
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  Bedrock NLP: {(lastLatencyMs / 1000).toFixed(2)}s
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 font-medium mr-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Presets:
              </span>
              {sampleMessages.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(sample.message);
                    setSelectedSource(sample.source);
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-lg transition-colors"
                >
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">{sample.title.split(' ')[0]}</span>{' '}
                  <span className="text-slate-500 dark:text-zinc-400">({sample.expected_tier})</span>
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
                className="flex-1 bg-slate-50 dark:bg-[#09090b] border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-slate-50 dark:bg-[#09090b] border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Emergency 112">Emergency 112</option>
                <option value="SMS Gateway">SMS</option>
              </select>
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isProcessing ? <span>Extracting...</span> : <><Zap className="w-4 h-4 fill-current" /><span>Triage</span></>}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column (7 Cols on LG): Map & Live Route Optimization */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Section Header */}
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  TACTICAL GEOSPATIAL MAP & LIVE ROUTE OPTIMIZATION
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Hazard-aware obstacle bypass & high-ground rescue routing</p>
              </div>
            </div>
            <button
              onClick={handleToggleAvoidance}
              className="text-xs font-semibold py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-2 transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{avoidHazards ? 'Bypass Active: Safe Path' : 'Direct Path: Risk Alert'}</span>
            </button>
          </div>

          {/* Map Container */}
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs h-[480px] relative">
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
            <div className="bg-white dark:bg-[#121214] border border-sky-300 dark:border-sky-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>DYNAMIC RESCUE CORRIDOR TELEMETRY</span>
                </div>
                <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full ${
                  activeRoute.is_safe
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}>
                  {activeRoute.is_safe ? 'SUBMERGED-SAFE HIGH-GROUND' : 'DANGEROUS DIRECT CORRIDOR'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs font-mono">
                <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[11px] mb-1">CORRIDOR DISTANCE</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">{activeRoute.distance_km} km</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[11px] mb-1">ESTIMATED TIME</span>
                  <span className="text-lg font-bold text-sky-700 dark:text-sky-400">{activeRoute.duration_minutes} mins</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[11px] mb-1">TARGET INCIDENT</span>
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{selectedIncident?.id || 'Selected'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[11px] mb-1">WATER DEPTH</span>
                  <span className="text-lg font-bold text-rose-700 dark:text-rose-400">{selectedIncident?.water_level_feet || 6} ft</span>
                </div>
              </div>

              {activeRoute.avoided_hazards.length > 0 && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs space-y-1.5">
                  <span className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Real-Time Road Blockages Automatically Detoured:</span>
                  </span>
                  <ul className="list-disc pl-5 text-red-700 dark:text-red-300 space-y-0.5 text-xs font-medium">
                    {activeRoute.avoided_hazards.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Staging Hubs & Fleet Assets (SW-01 Multi-Tier Dispatch) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Optimal Drop Zones */}
            <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Optimal Drop Zones & Staging (SW-01)</span>
                </span>
                <span className="text-xs text-sky-700 dark:text-sky-400 font-mono font-bold">2 ACTIVE</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-50 dark:bg-[#18181b] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-zinc-100">Solani High-Ground Helipad (LZ-1)</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Elevation: 274m • Air Drop & Boat Launch</p>
                  </div>
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-mono font-semibold">
                    ACTIVE
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-[#18181b] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-zinc-100">IIT Roorkee Stadium Staging Depot</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Volunteer Assembly & Medical Depot</p>
                  </div>
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-mono font-semibold">
                    READY
                  </span>
                </div>
              </div>
            </div>

            {/* Live Fleet Assets */}
            <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Rescue Fleet Readiness</span>
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">LIVE GPS</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                {fleetAssets.slice(0, 3).map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-slate-50 dark:bg-[#18181b] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-zinc-100">{asset.callsign}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{asset.type} • {asset.status}</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-zinc-300">
                      <BatteryCharging className="w-4 h-4 text-sky-600 dark:text-sky-400" />
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
