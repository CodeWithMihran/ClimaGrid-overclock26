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

  // Operator Controls: Filter & Unit Selection
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3' | 'DISPATCHED'>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('NDRF-BOAT-04');
  const [routeToast, setRouteToast] = useState<string | null>(null);

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
      const destLat = incident.latitude || 29.8650;
      const destLng = incident.longitude || 77.8990;
      const route = await calculateRoute(
        [fleetLat, fleetLng],
        [destLat, destLng],
        avoid
      );
      setActiveRoute(route);
      setRouteToast(
        `Safe corridor to ${incident.landmark || 'Incident'} plotted: ${route.distance_km} km • ETA ${route.duration_minutes} mins (Bypassing Brij Bridge 5.5ft flood).`
      );
      setTimeout(() => setRouteToast(null), 6000);
    } catch (err) {
      console.error('Routing error:', err);
    }
  };

  const handleApproveDispatch = async (incidentId: string, unitCallsign: string = selectedUnit) => {
    try {
      const res = await approveDispatch(incidentId, unitCallsign);
      const updatedRecord = res?.incident || (res?.id && res?.triage ? res : null);
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === incidentId) {
            return updatedRecord || { ...inc, status: 'DISPATCHED', assigned_unit: unitCallsign };
          }
          return inc;
        })
      );
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident((prev) => prev ? (updatedRecord || { ...prev, status: 'DISPATCHED', assigned_unit: unitCallsign }) : null);
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  const handleToggleAvoidance = () => {
    const nextAvoid = !avoidHazards;
    setAvoidHazards(nextAvoid);
    if (selectedIncident) {
      handleCalculateRoute(selectedIncident, nextAvoid);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (priorityFilter === 'ALL') return true;
    if (priorityFilter === 'DISPATCHED') return inc.status === 'DISPATCHED';
    if (priorityFilter === 'P1') return inc.triage?.priority_tier?.includes('P1');
    if (priorityFilter === 'P2') return inc.triage?.priority_tier?.includes('P2');
    if (priorityFilter === 'P3') return inc.triage?.priority_tier?.includes('P3');
    return true;
  });

  const countP1 = incidents.filter((i) => i.triage?.priority_tier?.includes('P1')).length;
  const countP2 = incidents.filter((i) => i.triage?.priority_tier?.includes('P2')).length;
  const countP3 = incidents.filter((i) => i.triage?.priority_tier?.includes('P3')).length;
  const countDispatched = incidents.filter((i) => i.status === 'DISPATCHED').length;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const start = performance.now();
    try {
      const result = await parseDistressMessage(inputText, selectedSource);
      const latency = Math.round(performance.now() - start);
      setLastLatencyMs(latency);

      setIncidents((prev) => [result, ...prev]);
      setSelectedIncident(result);
      handleCalculateRoute(result, avoidHazards);
      setInputText('');
    } catch (err) {
      console.error('Parsing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Main Content Area - Spacious 2-Column Grid */}
      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column (5 Cols on LG): Live Distress Triage Stream & Ingestion */}
        <section className="lg:col-span-5 flex flex-col gap-6 sm:gap-7">
          {/* Section Header Card */}
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#fdf2f2] dark:bg-[#341d1d] border border-[#fae1e1] dark:border-[#4d2525] flex items-center justify-center text-[#b91c1c] dark:text-[#f87171]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  LIVE DISTRESS TRIAGE QUEUE (AAPDA360)
                </h2>
                <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-0.5">
                  Real-time NLP priority scoring & multi-tier dispatch coordination
                </p>
              </div>
            </div>
            <span className="text-sm font-mono font-bold bg-[#f0f7fb] dark:bg-[#1e2a38] text-sky-700 dark:text-sky-300 border border-[#d8eaf6] dark:border-[#2b415a] px-3.5 py-1.5 rounded-full shadow-2xs">
              {incidents.length} Active
            </span>
          </div>

          {/* Operator Triage Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-[#202020] p-2 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-2xs">
            {[
              { id: 'ALL', label: 'All Incidents', count: incidents.length },
              { id: 'P1', label: 'P1 Critical', count: countP1, color: 'text-rose-600 dark:text-rose-400' },
              { id: 'P2', label: 'P2 High', count: countP2, color: 'text-amber-600 dark:text-amber-400' },
              { id: 'P3', label: 'P3 Medium', count: countP3, color: 'text-slate-600 dark:text-slate-400' },
              { id: 'DISPATCHED', label: 'Dispatched', count: countDispatched, color: 'text-emerald-600 dark:text-emerald-400' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPriorityFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  priorityFilter === tab.id
                    ? 'bg-[#2f2e2b] text-white dark:bg-white dark:text-[#191919] shadow-xs'
                    : 'bg-[#f7f6f3] dark:bg-[#282828] text-[#6b6966] dark:text-[#a8a7a4] hover:bg-[#efefed] dark:hover:bg-[#333333]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`font-mono text-[11px] ${priorityFilter === tab.id ? 'opacity-90' : tab.color || 'opacity-70'}`}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          {/* Incident Cards List */}
          <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1.5 scrollbar-thin">
            {filteredIncidents.length === 0 ? (
              <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-8 text-center text-sm text-[#787774] dark:text-[#9b9a97]">
                No incidents matching the <b className="text-[#2f2e2b] dark:text-white">{priorityFilter}</b> filter.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const priorityTier = inc.triage?.priority_tier || 'P3 - MEDIUM';
                const isP1 = priorityTier.includes('P1');
                const isP2 = priorityTier.includes('P2');
                const isDispatched = inc.status === 'DISPATCHED';

              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    handleCalculateRoute(inc, avoidHazards);
                  }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-[#f4f9fd] dark:bg-[#242c35] border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/15'
                      : 'bg-white dark:bg-[#202020] border-[#e9e9e7] dark:border-[#2e2e2e] hover:border-[#deddd9] dark:hover:border-[#383838] hover:bg-[#fafaf8] dark:hover:bg-[#252525]'
                  }`}
                >
                  {/* Top Bar: ID, Priority Badge & Score */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-[#2f2e2b] dark:text-[#f4f4f5]">{inc.id}</span>
                      <span
                        className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-md font-mono ${
                          isP1
                            ? 'bg-[#fdf2f2] dark:bg-[#381e1e] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929] animate-pulse'
                            : isP2
                            ? 'bg-[#fef9ee] dark:bg-[#342918] text-[#b45309] dark:text-[#fbbf24] border border-[#fcedca] dark:border-[#4d3a1f]'
                            : 'bg-[#fafaf8] dark:bg-[#282828] text-[#575653] dark:text-[#a8a7a4] border border-[#e3e2e0] dark:border-[#3a3a3a]'
                        }`}
                      >
                        {priorityTier}
                      </span>
                    </div>

                    <span className="font-mono text-sm font-bold text-sky-700 dark:text-sky-300 bg-[#f0f7fb] dark:bg-[#1a2634] border border-[#d8eaf6] dark:border-[#25394e] px-3 py-1 rounded-lg">
                      Score: {inc.triage?.final_score != null ? inc.triage.final_score.toFixed(2) : '0.50'}
                    </span>
                  </div>

                  {/* Raw Citizen Distress Message - Notion Callout style */}
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 sm:p-5 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] mb-4">
                    <p className="text-[15px] sm:text-base text-[#2f2e2b] dark:text-[#e6e6e5] leading-relaxed italic">
                      &ldquo;{inc.raw_message}&rdquo;
                    </p>
                  </div>

                  {/* Extracted Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm bg-[#faf9f6] dark:bg-[#252525] p-3.5 rounded-xl border border-[#eae9e5] dark:border-[#303030] mb-4 font-medium">
                    <div className="flex items-center gap-2.5 text-[#2f2e2b] dark:text-[#e6e6e5]">
                      <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="truncate">{inc.landmark}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[#2f2e2b] dark:text-[#e6e6e5]">
                      <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{inc.trapped_count} Trapped</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[#2f2e2b] dark:text-[#e6e6e5]">
                      <Waves className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Water: {inc.water_level_feet} ft</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#787774] dark:text-[#9b9a97] font-mono text-xs">
                      <Clock className="w-4 h-4 text-[#a8a7a4] dark:text-[#666666] shrink-0" />
                      <span>{inc.timestamp}</span>
                    </div>
                  </div>

                  {/* Vulnerability Tags */}
                  {(inc.vulnerabilities || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {inc.vulnerabilities.map((v, i) => (
                        <span
                          key={i}
                          className="text-xs sm:text-[13px] bg-[#fdf2f2] dark:bg-[#341d1d] text-[#b91c1c] dark:text-[#f87171] border border-[#fae1e1] dark:border-[#4d2525] px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          <span>{v}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reasoning */}
                  <p className="text-xs sm:text-sm text-[#5f5e5b] dark:text-[#a8a7a4] mb-5 font-mono leading-relaxed">
                    <b className="text-[#2f2e2b] dark:text-white">Triage Rationale:</b> {inc.triage?.explanation || inc.clean_summary}
                  </p>

                  {/* Actions: Route Preview & Approve Fleet */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(inc);
                        handleCalculateRoute(inc, avoidHazards);
                      }}
                      className={`flex-1 text-sm py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border shadow-2xs ${
                        isSelected && activeRoute !== null
                          ? 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 font-bold'
                          : 'bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#2b2b2b] dark:hover:bg-[#333333] text-[#2f2e2b] dark:text-white border-[#deddd9] dark:border-[#3d3d3d]'
                      }`}
                    >
                      <Navigation className={`w-4 h-4 ${isSelected && activeRoute !== null ? 'text-sky-600 dark:text-sky-400 animate-pulse' : 'text-sky-600 dark:text-sky-400'}`} />
                      <span>{isSelected && activeRoute !== null ? '✓ Route Active' : 'Preview Route'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveDispatch(inc.id);
                      }}
                      disabled={isDispatched}
                      className={`flex-1 text-sm py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        isDispatched
                          ? 'bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] cursor-not-allowed'
                          : 'bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-[#f4f4f5] dark:hover:bg-white text-white dark:text-[#191919] shadow-xs'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Dispatched ({inc.assigned_unit || selectedUnit})</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Approve Fleet ({selectedUnit.split('-')[0]}-{selectedUnit.split('-')[1]})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>

          {/* Quick Distress Message Ingestion Box */}
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#2f2e2b] dark:text-[#f4f4f5] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Simulate Emergency Distress Ingestion</span>
              </h3>
              {lastLatencyMs && (
                <span className="text-xs sm:text-sm font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-[#eef8f2] dark:bg-[#1b2b22] px-2.5 py-1 rounded-md border border-[#ccecd8] dark:border-[#244b34]">
                  Bedrock NLP: {(lastLatencyMs / 1000).toFixed(2)}s
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] flex items-center gap-1 font-medium mr-1">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
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
                  className="text-xs sm:text-sm bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#262626] dark:hover:bg-[#303030] text-[#2f2e2b] dark:text-[#e6e6e5] border border-[#deddd9] dark:border-[#383838] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span className="font-semibold">{sample.title.split(' ')[0]}</span>{' '}
                  <span className="text-[#787774] dark:text-[#9b9a97]">({sample.expected_tier})</span>
                </button>
              ))}
            </div>

            {/* Ingestion Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste Hindi/English distress message (e.g., 'Solani aqueduct ke paas paani 6ft ho gaya hai...')"
                className="flex-1 bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl px-4 py-3 text-sm text-[#2f2e2b] dark:text-[#e6e6e5] placeholder-[#9b9a97] dark:placeholder-[#666666] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-[#fbfbfa] dark:bg-[#191919] border border-[#deddd9] dark:border-[#383838] rounded-xl px-3.5 py-3 text-sm text-[#2f2e2b] dark:text-[#e6e6e5] focus:outline-none"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Emergency 112">Emergency 112</option>
                <option value="SMS Gateway">SMS</option>
              </select>
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shrink-0"
              >
                {isProcessing ? <span>Extracting...</span> : <><Zap className="w-4 h-4 fill-current" /><span>Triage</span></>}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column (7 Cols on LG): Map & Live Route Optimization */}
        <section className="lg:col-span-7 flex flex-col gap-6 sm:gap-7">
          {/* Section Header */}
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#f0f7fb] dark:bg-[#1a2634] border border-[#d8eaf6] dark:border-[#223547] flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  TACTICAL GEOSPATIAL MAP & ROUTE OPTIMIZATION
                </h2>
                <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-0.5">
                  Hazard-aware obstacle bypass & high-ground rescue routing
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAvoidance}
              className="text-sm font-semibold py-2.5 px-4 rounded-xl bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#2b2b2b] dark:hover:bg-[#333333] text-[#2f2e2b] dark:text-white border border-[#deddd9] dark:border-[#3d3d3d] flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{avoidHazards ? 'Bypass Active: Safe Path' : 'Direct Path: Risk Alert'}</span>
            </button>
          </div>

          {/* Dynamic Route Notification Toast */}
          {routeToast && (
            <div className="bg-[#f0f7fb] dark:bg-[#182736] border border-[#d8eaf6] dark:border-[#274059] p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm text-sky-900 dark:text-sky-200 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="font-medium">{routeToast}</span>
              </div>
              <button onClick={() => setRouteToast(null)} className="font-bold text-sky-600 dark:text-sky-400 ml-2">✕</button>
            </div>
          )}

          {/* Map Container */}
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl overflow-hidden shadow-xs h-[520px] relative">
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
            <div className="bg-white dark:bg-[#202020] border border-sky-400/80 dark:border-sky-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-base font-bold text-[#2f2e2b] dark:text-white">
                  <Navigation className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <span>DYNAMIC RESCUE CORRIDOR TELEMETRY</span>
                </div>
                <span className={`text-xs sm:text-sm font-mono font-semibold px-3.5 py-1.5 rounded-full ${
                  activeRoute.is_safe
                    ? 'bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34]'
                    : 'bg-[#fdf2f2] dark:bg-[#381e1e] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929]'
                }`}>
                  {activeRoute.is_safe ? 'SUBMERGED-SAFE HIGH-GROUND' : 'DANGEROUS DIRECT CORRIDOR'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-mono">
                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block text-xs font-medium mb-1">CORRIDOR DISTANCE</span>
                  <span className="text-xl font-bold text-[#2f2e2b] dark:text-white">{activeRoute.distance_km} km</span>
                </div>
                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block text-xs font-medium mb-1">ESTIMATED TIME</span>
                  <span className="text-xl font-bold text-sky-600 dark:text-sky-400">{activeRoute.duration_minutes} mins</span>
                </div>
                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block text-xs font-medium mb-1">TARGET INCIDENT</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{selectedIncident?.id || 'Selected'}</span>
                </div>
                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block text-xs font-medium mb-1">WATER DEPTH</span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{selectedIncident?.water_level_feet || 6} ft</span>
                </div>
              </div>

              {activeRoute.avoided_hazards.length > 0 && (
                <div className="p-4 bg-[#fdf2f2] dark:bg-[#341d1d] border border-[#fae1e1] dark:border-[#4d2525] rounded-xl text-sm space-y-2">
                  <span className="font-semibold text-[#b91c1c] dark:text-[#f87171] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Real-Time Road Blockages Automatically Detoured:</span>
                  </span>
                  <ul className="list-disc pl-5 text-[#991b1b] dark:text-[#fca5a5] space-y-1 text-sm font-medium">
                    {activeRoute.avoided_hazards.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Explainable AI Triage Model Breakdown */}
          <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="text-base font-bold text-[#2f2e2b] dark:text-[#f4f4f5]">
                  EXPLAINABLE TRIAGE ALGORITHM (AAPDA360)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300 bg-[#f0f7fb] dark:bg-[#1a2634] px-2.5 py-1 rounded-md border border-[#d8eaf6] dark:border-[#25394e]">
                AUDITABLE MATHEMATICAL WEIGHTS
              </span>
            </div>

            <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] font-mono text-xs sm:text-sm text-[#2f2e2b] dark:text-[#e6e6e5]">
              <div className="font-bold text-sky-700 dark:text-sky-400 mb-2">
                Priority Score = (0.35 × Hazard) + (0.35 × Medical) + (0.20 × Vulnerability) + (0.10 × Exposure Time)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
                <div className="bg-white dark:bg-[#222222] p-2.5 rounded-lg border border-[#e9e9e7] dark:border-[#303030]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block font-medium">Hazard (35%)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">Water Depth & Rise</span>
                </div>
                <div className="bg-white dark:bg-[#222222] p-2.5 rounded-lg border border-[#e9e9e7] dark:border-[#303030]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block font-medium">Medical (35%)</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Pregnancy / Trauma</span>
                </div>
                <div className="bg-white dark:bg-[#222222] p-2.5 rounded-lg border border-[#e9e9e7] dark:border-[#303030]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block font-medium">Vulnerability (20%)</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">Infants & Elderly</span>
                </div>
                <div className="bg-white dark:bg-[#222222] p-2.5 rounded-lg border border-[#e9e9e7] dark:border-[#303030]">
                  <span className="text-[#787774] dark:text-[#9b9a97] block font-medium">Time (10%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Elapsed Wait</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#787774] dark:text-[#9b9a97] leading-relaxed">
              <b>Human-in-the-Loop Safeguard:</b> Algorithmic prioritization surfaces acute medical fragility and rising floodwaters over raw headcounts, while the final dispatch command requires human incident commander authorization.
            </p>
          </div>

          {/* Staging Hubs & Fleet Assets (SW-01 Multi-Tier Dispatch) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Optimal Drop Zones */}
            <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#2f2e2b] dark:text-[#f4f4f5] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Optimal Drop Zones & Staging (SW-01)</span>
                </span>
                <span className="text-xs text-sky-700 dark:text-sky-400 font-mono font-bold bg-[#f0f7fb] dark:bg-[#1a2634] px-2 py-0.5 rounded-md border border-[#d8eaf6] dark:border-[#25394e]">
                  2 ACTIVE
                </span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#2f2e2b] dark:text-white">Solani High-Ground Helipad (LZ-1)</p>
                    <p className="text-xs text-[#787774] dark:text-[#9b9a97] mt-0.5">Elevation: 274m • Air Drop & Boat Launch</p>
                  </div>
                  <span className="text-xs bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] px-2.5 py-1 rounded-md font-mono font-semibold">
                    ACTIVE
                  </span>
                </div>
                <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#2f2e2b] dark:text-white">IIT Roorkee Stadium Staging Depot</p>
                    <p className="text-xs text-[#787774] dark:text-[#9b9a97] mt-0.5">Volunteer Assembly & Medical Depot</p>
                  </div>
                  <span className="text-xs bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] px-2.5 py-1 rounded-md font-mono font-semibold">
                    READY
                  </span>
                </div>
              </div>
            </div>

            {/* Live Fleet Assets */}
            <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#2f2e2b] dark:text-[#f4f4f5] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Rescue Fleet Readiness</span>
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold bg-[#eef8f2] dark:bg-[#1b2b22] px-2 py-0.5 rounded-md border border-[#ccecd8] dark:border-[#244b34]">
                  LIVE GPS
                </span>
              </h3>
              <div className="space-y-3 text-sm">
                {fleetAssets.slice(0, 3).map((asset) => {
                  const isUnitSelected = selectedUnit === asset.callsign;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedUnit(asset.callsign)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isUnitSelected
                          ? 'bg-sky-50/80 dark:bg-[#1a2634] border-sky-400 dark:border-sky-600 ring-1 ring-sky-400/30'
                          : 'bg-[#f7f6f3] dark:bg-[#191919] border-[#e9e9e7] dark:border-[#2e2e2e] hover:border-[#deddd9] dark:hover:border-[#383838]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#2f2e2b] dark:text-white">{asset.callsign}</p>
                          {isUnitSelected && (
                            <span className="text-[10px] bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-mono font-bold px-1.5 py-0.5 rounded">
                              ASSIGNED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#787774] dark:text-[#9b9a97] mt-0.5">{asset.type} • {asset.status}</p>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-sm text-[#2f2e2b] dark:text-white">
                        <BatteryCharging className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span>{asset.battery_or_fuel_pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
