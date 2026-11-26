'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { HeaderHUD } from '../components/HeaderHUD';
import { DistressStream } from '../components/DistressStream';
import { TacticalSideHUD } from '../components/TacticalSideHUD';
import { QuickDistressSimulator } from '../components/QuickDistressSimulator';
import { ArchitectureModal } from '../components/ArchitectureModal';
import {
  fetchIncidentQueue,
  parseDistressMessage,
  approveDispatch,
  fetchFloodGeoJSON,
  fetchWaterSensors,
  fetchHeatZones,
  calculateRoute,
  fetchFleetAssets,
  fetchSampleMessages
} from '../lib/api';
import { IncidentRecord, WaterSensorNode, RouteSegment, FleetAsset, SampleMessage } from '../types';

// Load TacticalMap dynamically to avoid SSR window/Leaflet errors
const TacticalMap = dynamic(
  () => import('../components/TacticalMap').then((mod) => mod.TacticalMap),
  { ssr: false }
);

export default function CommandOperationsPage() {
  const [activeModule, setActiveModule] = useState<'flood' | 'water' | 'heat'>('flood');
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [waterSensors, setWaterSensors] = useState<WaterSensorNode[]>([]);
  const [heatData, setHeatData] = useState<any>(null);
  const [floodGeoJSON, setFloodGeoJSON] = useState<any>(null);
  const [fleetAssets, setFleetAssets] = useState<FleetAsset[]>([]);
  const [sampleMessages, setSampleMessages] = useState<SampleMessage[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteSegment | null>(null);
  const [avoidHazards, setAvoidHazards] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

  // Live update of thermal polygons on map when user moves heatwave slider
  const handleHeatSimulationUpdate = (simulatedGeoJSON: any) => {
    setHeatData(simulatedGeoJSON);
  };

  // Initial Data Load
  useEffect(() => {
    async function init() {
      try {
        const [q, flood, water, heat, fleet, samples] = await Promise.all([
          fetchIncidentQueue(),
          fetchFloodGeoJSON(),
          fetchWaterSensors(),
          fetchHeatZones(),
          fetchFleetAssets(),
          fetchSampleMessages()
        ]);
        setIncidents(q);
        setFloodGeoJSON(flood);
        setWaterSensors(water);
        setHeatData(heat);
        setFleetAssets(fleet);
        setSampleMessages(samples);

        // Pre-select first P1 critical incident if present
        if (q.length > 0) {
          setSelectedIncident(q[0]);
          handleCalculateRoute(q[0], true);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();

    // Live Queue Sync: Auto-polls every 2.5s to catch SOS incoming from /citizen mobile app
    const syncInterval = setInterval(async () => {
      try {
        const liveQueue = await fetchIncidentQueue();
        setIncidents(liveQueue);
      } catch (e) {
        // quiet sync fallback
      }
    }, 2500);

    return () => clearInterval(syncInterval);
  }, []);

  // Calculate dynamic route for an incident
  const handleCalculateRoute = async (incident: IncidentRecord, avoid: boolean = avoidHazards) => {
    try {
      // Boat origin in Roorkee
      const boatOrigin: [number, number] = [29.8550, 77.8860];
      const targetDest: [number, number] = [incident.latitude, incident.longitude];
      const route = await calculateRoute(boatOrigin, targetDest, avoid);
      setActiveRoute(route);
    } catch (err) {
      console.error('Failed to calculate safe corridor:', err);
    }
  };

  // Toggle Hazard Avoidance (Show Safe Detour vs Direct Danger Path)
  const handleToggleHazardAvoidance = () => {
    const nextAvoid = !avoidHazards;
    setAvoidHazards(nextAvoid);
    if (selectedIncident) {
      handleCalculateRoute(selectedIncident, nextAvoid);
    }
  };

  // Tactical Alert Sound Synthesizer (Web Audio API - Zero Asset Dependency)
  const playTacticalAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 high alert tone
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // quiet fallback
    }
  };

  // Human-in-the-loop Approve Dispatch
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

  // Ingest raw citizen distress text
  const handleSendMessage = async (message: string, source: string) => {
    setIsProcessing(true);
    const start = performance.now();
    try {
      const record = await parseDistressMessage(message, source);
      const elapsed = Math.round(performance.now() - start);
      setLastLatencyMs(elapsed);

      // Play tactical sensory chime for incoming distress call
      playTacticalAlertSound();

      // Re-sort queue so new P1 immediately tops the list
      setIncidents((prev) => {
        const next = [record, ...prev.filter((i) => i.id !== record.id)];
        next.sort((a, b) => b.triage.final_score - a.triage.final_score);
        return next;
      });

      setSelectedIncident(record);
      handleCalculateRoute(record, avoidHazards);
    } catch (err) {
      console.error('Failed to parse distress message:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const criticalCount = incidents.filter((i) => i.triage.priority_tier.includes('P1')).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070d1e] text-slate-100">
      {/* 1. Header Tactical Bar with Module Toggles */}
      <HeaderHUD
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        sosCount={incidents.length}
        criticalCount={criticalCount}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
      />

      {/* 2. Main 3-Column Tactical Console */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column (Zone 2): Distress Triage Stream */}
        <div className="col-span-3 h-full overflow-hidden">
          <DistressStream
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              handleCalculateRoute(inc, avoidHazards);
            }}
            onApproveDispatch={handleApproveDispatch}
            onCalculateRoute={(inc) => {
              setSelectedIncident(inc);
              handleCalculateRoute(inc, avoidHazards);
            }}
          />
        </div>

        {/* Center Column (Zone 1): Tactical Geospatial Map Canvas + Quick Simulator */}
        <div className="col-span-6 flex flex-col h-full overflow-hidden border-r border-slate-800">
          <div className="flex-1 relative">
            <TacticalMap
              activeModule={activeModule}
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

          {/* Bottom Live Bedrock Distress Simulator */}
          <QuickDistressSimulator
            onSendMessage={handleSendMessage}
            sampleMessages={sampleMessages}
            isProcessing={isProcessing}
            lastLatencyMs={lastLatencyMs}
          />
        </div>

        {/* Right Column (Zone 3): Fleet Telemetry, Water & Heat Intel, Route Stats */}
        <div className="col-span-3 h-full overflow-hidden">
          <TacticalSideHUD
            activeModule={activeModule}
            fleetAssets={fleetAssets}
            waterSensors={waterSensors}
            activeRoute={activeRoute}
            onToggleHazardAvoidance={handleToggleHazardAvoidance}
            avoidHazards={avoidHazards}
            onHeatSimulationUpdate={handleHeatSimulationUpdate}
          />
        </div>
      </div>

      {/* Judges Architecture & System Cloud Depth Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
