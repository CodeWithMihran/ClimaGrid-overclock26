'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IncidentRecord, WaterSensorNode, RouteSegment } from '../types';

interface TacticalMapProps {
  activeModule: 'flood' | 'water' | 'heat';
  incidents: IncidentRecord[];
  selectedIncident: IncidentRecord | null;
  onSelectIncident: (inc: IncidentRecord) => void;
  waterSensors: WaterSensorNode[];
  heatData: any;
  floodGeoJSON: any;
  activeRoute: RouteSegment | null;
}

// Controller to smoothly animate and frame map to route or selected incident
const MapController: React.FC<{
  selectedIncident: IncidentRecord | null;
  activeRoute: RouteSegment | null;
}> = ({ selectedIncident, activeRoute }) => {
  const map = useMap();

  useEffect(() => {
    if (activeRoute?.coordinates && activeRoute.coordinates.length > 1) {
      const bounds = L.latLngBounds(
        activeRoute.coordinates.map((coord) => [coord[0], coord[1]])
      );
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
        duration: 1.0
      });
    } else if (selectedIncident && selectedIncident.latitude && selectedIncident.longitude) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 15, {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedIncident?.id, activeRoute, map]);

  return null;
};

// Custom SVG Icons for tactical EOC look
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-tactical-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 11px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const boatIcon = L.divIcon({
  className: 'custom-boat-marker',
  html: `
    <div style="
      background: #0284c7;
      color: #ffffff;
      border: 2px solid #ffffff;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 5px;
    ">
      🚤 NDRF-04
    </div>
  `,
  iconSize: [86, 28],
  iconAnchor: [43, 14]
});

export const TacticalMap: React.FC<TacticalMapProps> = ({
  activeModule,
  incidents,
  selectedIncident,
  onSelectIncident,
  waterSensors,
  heatData,
  floodGeoJSON,
  activeRoute
}) => {
  const [mounted, setMounted] = useState(false);
  const centerPosition: [number, number] = [29.8580, 77.8920]; // Roorkee center

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-[#09090b] flex items-center justify-center text-slate-500 dark:text-zinc-500 font-mono text-sm">
        Initializing Tactical Map Canvas...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={centerPosition}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap crisp tiles with zero watermark */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Dynamic map viewport controller for smooth routing flyTo */}
        <MapController selectedIncident={selectedIncident} activeRoute={activeRoute} />

        {/* 1. FLOOD INUNDATION HAZARDS (Visible in flood or all modes) */}
        {activeModule === 'flood' && floodGeoJSON?.features && (
          floodGeoJSON.features.map((feature: any, idx: number) => {
            if (feature.geometry.type === 'Polygon') {
              const coords: [number, number][] = feature.geometry.coordinates[0].map(
                (c: [number, number]) => [c[1], c[0]]
              );
              return (
                <Polygon
                  key={`flood-${idx}`}
                  positions={coords}
                  pathOptions={{
                    color: feature.properties.fillColor || '#EF4444',
                    fillColor: feature.properties.fillColor || '#EF4444',
                    fillOpacity: 0.28,
                    weight: 2,
                    dashArray: '4, 4'
                  }}
                >
                  <Popup>
                    <div className="text-slate-900 dark:text-zinc-100 text-xs">
                      <p className="font-bold text-red-600 dark:text-red-400">{feature.properties.name}</p>
                      <p>Water Depth: <b>{feature.properties.depth_feet} ft</b></p>
                      <p>Severity: <b>{feature.properties.severity}</b></p>
                    </div>
                  </Popup>
                </Polygon>
              );
            }
            return null;
          })
        )}

        {/* 2. SUBMERGED BRIDGE HAZARDS */}
        <Marker
          position={[29.8610, 77.8950]}
          icon={createCustomIcon('#DC2626', '⛔')}
        >
          <Popup>
            <div className="text-slate-900 dark:text-zinc-100 text-xs">
              <p className="font-bold text-red-700 dark:text-red-400">Brij Bridge (SUBMERGED)</p>
              <p className="text-slate-600 dark:text-zinc-300">Water depth 5.5ft. Impassable for standard vehicles.</p>
              <span className="text-[10px] bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                BYPASS MANDATORY
              </span>
            </div>
          </Popup>
        </Marker>

        {/* 3. RESCUE FLEET BOAT POSITION */}
        <Marker position={[29.8550, 77.8860]} icon={boatIcon}>
          <Popup>
            <div className="text-slate-900 dark:text-zinc-100 text-xs">
              <p className="font-bold text-sky-700 dark:text-sky-400">NDRF Motorboat Unit 04</p>
              <p>Status: Ready for high-priority extraction</p>
              <p>Battery: 88% | Capacity: 8 rescued</p>
            </div>
          </Popup>
        </Marker>

        {/* 4. ACTIVE RESCUE ROUTE (SAFE CORRIDOR) */}
        {activeRoute && activeRoute.coordinates.length > 0 && (
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: activeRoute.is_safe ? '#0284c7' : '#ef4444',
              weight: 5,
              opacity: 0.95,
              dashArray: activeRoute.is_safe ? undefined : '6, 6'
            }}
          />
        )}

        {/* 5. SOS DISTRESS INCIDENT PINS */}
        {incidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          const isP1 = incident.triage.priority_tier.includes('P1');
          const isP2 = incident.triage.priority_tier.includes('P2');
          const markerColor = isP1 ? '#EF4444' : isP2 ? '#F97316' : '#EAB308';

          return (
            <React.Fragment key={incident.id}>
              <Marker
                position={[incident.latitude, incident.longitude]}
                icon={createCustomIcon(markerColor, isP1 ? 'P1' : isP2 ? 'P2' : 'SOS')}
                eventHandlers={{
                  click: () => onSelectIncident(incident)
                }}
              >
                <Popup>
                  <div className="text-slate-900 dark:text-zinc-100 text-xs font-sans min-w-[220px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-zinc-100">{incident.id}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        isP1 ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                      }`}>
                        {incident.triage.priority_tier}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-zinc-200">{incident.landmark}</p>
                    <p className="text-slate-600 dark:text-zinc-400 mt-1 italic leading-relaxed">"{incident.raw_message}"</p>
                    <div className="mt-2 pt-1 border-t border-slate-200 dark:border-zinc-800 text-[11px]">
                      <p>Trapped: <b>{incident.trapped_count} citizens</b></p>
                      <p>Triage Score: <b>{incident.triage.final_score}</b></p>
                    </div>
                  </div>
                </Popup>
              </Marker>
              {isSelected && (
                <Circle
                  center={[incident.latitude, incident.longitude]}
                  radius={180}
                  pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.15 }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* 6. JEEVAN WATER SENSORS (Active when water module selected) */}
        {activeModule === 'water' && waterSensors.map((node) => {
          const isDanger = node.status === 'CRITICAL_CONTAMINATION';
          const isWarning = node.status === 'WARNING';
          const nodeColor = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';

          return (
            <Marker
              key={node.id}
              position={[node.latitude, node.longitude]}
              icon={createCustomIcon(nodeColor, '💧')}
            >
              <Popup>
                <div className="text-slate-900 dark:text-zinc-100 text-xs min-w-[220px]">
                  <p className="font-bold text-slate-800 dark:text-zinc-100">{node.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{node.landmark}</p>
                  <div className="mt-2 bg-slate-50 dark:bg-zinc-800/60 p-2 rounded border border-slate-200 dark:border-zinc-700 space-y-1">
                    <p>Turbidity: <b>{node.turbidity_ntu} NTU</b> (Safe &lt; 5)</p>
                    <p>pH Level: <b>{node.ph_level}</b> (Std 6.5 - 8.5)</p>
                    <p>TDS: <b>{node.tds_ppm} ppm</b></p>
                    <p>Dissolved O2: <b>{node.dissolved_oxygen_mg_l} mg/L</b></p>
                  </div>
                  {node.alert_message && (
                    <p className="mt-2 text-red-600 dark:text-red-400 text-[11px] font-semibold">{node.alert_message}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 7. HEATSHIELD URBAN HEAT ISLAND POLYGONS (Active when heat module selected) */}
        {activeModule === 'heat' && heatData?.features && heatData.features.map((feat: any, idx: number) => {
          const coords: [number, number][] = feat.geometry.coordinates[0].map(
            (c: [number, number]) => [c[1], c[0]]
          );
          return (
            <Polygon
              key={`heat-${idx}`}
              positions={coords}
              pathOptions={{
                color: feat.properties.fillColor || '#DC2626',
                fillColor: feat.properties.fillColor || '#DC2626',
                fillOpacity: 0.35,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-slate-900 dark:text-zinc-100 text-xs min-w-[240px]">
                  <p className="font-bold text-rose-700 dark:text-rose-400">{feat.properties.zone_name}</p>
                  <p>Surface Temperature: <b>{feat.properties.surface_temp_celsius}°C</b></p>
                  <p>NDVI Vegetation: <b>{feat.properties.ndvi_vegetation_index}</b></p>
                  <p>Heat Stress: <b>{feat.properties.heat_stress_level}</b></p>
                  <div className="mt-2 text-[11px] text-slate-600 dark:text-zinc-300">
                    <p className="font-semibold text-slate-800 dark:text-zinc-100">Action Plan:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {feat.properties.recommended_interventions?.map((rec: string, rIdx: number) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};
