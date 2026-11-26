import { IncidentRecord, WaterSensorNode, RouteSegment, FleetAsset, SampleMessage, ImageAnalysisResponse, ImagePreset } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchIncidentQueue(): Promise<IncidentRecord[]> {
  const res = await fetch(`${API_BASE}/distress/queue`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch incident queue');
  return res.json();
}

export async function parseDistressMessage(rawMessage: string, source: string = 'WhatsApp'): Promise<IncidentRecord> {
  const res = await fetch(`${API_BASE}/distress/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_message: rawMessage, source })
  });
  if (!res.ok) throw new Error('Failed to process message');
  return res.json();
}

export async function approveDispatch(incidentId: string, unitCallsign: string = 'NDRF-BOAT-04') {
  const res = await fetch(`${API_BASE}/distress/${incidentId}/approve?unit_callsign=${unitCallsign}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Dispatch approval failed');
  return res.json();
}

export async function fetchIncidentStatus(incidentId: string): Promise<IncidentRecord> {
  const res = await fetch(`${API_BASE}/distress/${incidentId}/status`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch incident status');
  return res.json();
}

export async function fetchFloodGeoJSON(): Promise<any> {
  const res = await fetch(`${API_BASE}/routing/flood-map`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load flood map');
  return res.json();
}

export async function fetchWaterSensors(): Promise<WaterSensorNode[]> {
  const res = await fetch(`${API_BASE}/water/sensors`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load water sensors');
  return res.json();
}

export async function fetchHeatZones(): Promise<any> {
  const res = await fetch(`${API_BASE}/heat/zones`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load heat zones');
  return res.json();
}

export async function calculateRoute(
  origin: [number, number],
  destination: [number, number],
  avoidFloodZones: boolean = true
): Promise<RouteSegment> {
  const res = await fetch(`${API_BASE}/routing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin,
      destination,
      avoid_flood_zones: avoidFloodZones
    })
  });
  if (!res.ok) throw new Error('Routing calculation failed');
  return res.json();
}

export async function fetchFleetAssets(): Promise<FleetAsset[]> {
  const res = await fetch(`${API_BASE}/fleet/assets`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch fleet assets');
  return res.json();
}

export async function fetchSampleMessages(): Promise<SampleMessage[]> {
  const res = await fetch(`${API_BASE}/distress/samples`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sample distress messages');
  return res.json();
}

export async function fetchImagePresets(): Promise<ImagePreset[]> {
  const res = await fetch(`${API_BASE}/distress/image-presets`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch image presets');
  return res.json();
}

export async function analyzeFloodPhoto(
  sampleId?: string,
  imageBase64?: string,
  landmarkHint: string = 'Solani Basin, Roorkee'
): Promise<ImageAnalysisResponse> {
  const res = await fetch(`${API_BASE}/distress/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sample_id: sampleId,
      image_base64: imageBase64,
      landmark_hint: landmarkHint
    })
  });
  if (!res.ok) throw new Error('Failed to analyze flood photo');
  return res.json();
}

export async function fetchSensorHistory(sensorId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/water/history/${sensorId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load sensor history');
  return res.json();
}

export async function fetchBoilWaterAdvisory(sensorId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/water/advisory/${sensorId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load advisory');
  return res.json();
}

export async function fetchCommunityReports(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/water/community-reports`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load community reports');
  return res.json();
}

export async function submitCommunityWaterReport(ward: string, description: string, severity: string = 'WARNING') {
  const res = await fetch(`${API_BASE}/water/community-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ward, description, severity })
  });
  if (!res.ok) throw new Error('Failed to submit report');
  return res.json();
}

export async function simulateHeatwave(ambientTempCelsius: number): Promise<any> {
  const res = await fetch(`${API_BASE}/heat/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ambient_temp_celsius: ambientTempCelsius })
  });
  if (!res.ok) throw new Error('Heat simulation failed');
  return res.json();
}

export async function fetchHeatInterventions(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/heat/interventions`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch interventions');
  return res.json();
}
