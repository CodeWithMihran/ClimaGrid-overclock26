'use client';

import React, { useState, useEffect } from 'react';
import { Home, Users, Droplets, Utensils, HeartPulse, Phone, ShieldCheck, AlertCircle, X, CheckCircle, Navigation } from 'lucide-react';
import { fetchReliefShelters, allocateShelterForIncident } from '../lib/api';
import { ReliefShelter, ShelterAllocationResponse, IncidentRecord } from '../types';

interface ReliefShelterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIncident?: IncidentRecord | null;
}

export const ReliefShelterModal: React.FC<ReliefShelterModalProps> = ({
  isOpen,
  onClose,
  selectedIncident
}) => {
  const [shelters, setShelters] = useState<ReliefShelter[]>([]);
  const [allocationResult, setAllocationResult] = useState<ShelterAllocationResponse | null>(null);
  const [isAllocating, setIsAllocating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadShelters();
      setAllocationResult(null);
    }
  }, [isOpen]);

  async function loadShelters() {
    const list = await fetchReliefShelters();
    setShelters(list);
  }

  const handleAutoAllocate = async () => {
    if (!selectedIncident) return;
    setIsAllocating(true);
    try {
      const res = await allocateShelterForIncident(
        selectedIncident.id,
        selectedIncident.latitude,
        selectedIncident.longitude,
        selectedIncident.trapped_count,
        selectedIncident.vulnerabilities
      );
      setAllocationResult(res);
      await loadShelters(); // refresh occupancy
    } catch (e) {
      console.error(e);
    } finally {
      setIsAllocating(false);
    }
  };

  if (!isOpen) return null;

  const totalBeds = shelters.reduce((acc, s) => acc + s.total_capacity_beds, 0);
  const occupiedBeds = shelters.reduce((acc, s) => acc + s.occupied_beds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const totalWater = shelters.reduce((acc, s) => acc + s.potable_water_liters, 0);
  const totalRations = shelters.reduce((acc, s) => acc + s.dry_ration_kits, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b132b] border border-cyan-500/40 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#070d1e] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                RELIEF CAMPS & EVACUATION SHELTERS LOGISTICS
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  DISTRICT DISASTER COMMAND
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live Capacity, Medical Triage Matching & Supply Inventory across Roorkee / Solani
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#091026] border-b border-slate-800/80 font-mono text-xs">
          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">TOTAL BEDS:</span>
            <span className="text-lg font-black text-white">{occupiedBeds} / {totalBeds}</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">({availableBeds} Free Cots)</span>
          </div>

          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">POTABLE WATER:</span>
            <span className="text-lg font-black text-cyan-300">{totalWater.toLocaleString()} L</span>
            <span className="text-[10px] text-cyan-500 block mt-0.5">Jeevan Verified Safe</span>
          </div>

          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">DRY RATION KITS:</span>
            <span className="text-lg font-black text-amber-300">{totalRations.toLocaleString()}</span>
            <span className="text-[10px] text-amber-500 block mt-0.5">72h Ready Meals</span>
          </div>

          <div className="bg-[#0e1738] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">CAMP OCCUPANCY:</span>
            <span className="text-lg font-black text-emerald-400">{Math.round((occupiedBeds / totalBeds) * 100)}%</span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">Safe Threshold (&lt;85%)</span>
          </div>
        </div>

        {/* Selected Incident Allocation Trigger */}
        {selectedIncident && (
          <div className="mx-6 mt-4 p-3 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Target Distress Incident:</span>
                <span className="text-xs font-mono font-black text-cyan-300">{selectedIncident.id}</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-mono font-bold">
                  {selectedIncident.triage.priority_tier}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedIncident.trapped_count} victims trapped near {selectedIncident.landmark}. Vulnerabilities: {selectedIncident.vulnerabilities.join(', ') || 'None specified'}
              </p>
            </div>

            <button
              onClick={handleAutoAllocate}
              disabled={isAllocating}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all shrink-0 disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{isAllocating ? 'Matching...' : 'Auto-Allocate Shelter Beds'}</span>
            </button>
          </div>
        )}

        {/* Allocation Result Confirmation Banner */}
        {allocationResult && (
          <div className="mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-400 rounded-xl flex items-start gap-3 animate-fade-in text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-emerald-200 block text-sm">
                Beds Successfully Allocated at {allocationResult.recommended_shelter.name}
              </span>
              <p className="text-slate-300 mt-0.5">
                {allocationResult.rationale} Distance: <b>{allocationResult.distance_km} km</b>.
                Officer in charge: <b>{allocationResult.recommended_shelter.contact_officer}</b> ({allocationResult.recommended_shelter.contact_phone}).
              </p>
            </div>
          </div>
        )}

        {/* Camp Cards List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {shelters.map((shelter) => {
            const pct = Math.round((shelter.occupied_beds / shelter.total_capacity_beds) * 100);
            return (
              <div
                key={shelter.id}
                className="bg-[#070d1e] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      {shelter.name}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        shelter.status === 'CRITICAL_CAPACITY'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : shelter.status === 'HIGH_OCCUPANCY'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {shelter.status.replace('_', ' ')}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">{shelter.landmark}</p>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-white font-bold">{shelter.available_beds} beds free</span>
                    <span className="text-slate-500 text-[11px] block">
                      ({shelter.occupied_beds}/{shelter.total_capacity_beds} occupied)
                    </span>
                  </div>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 mb-3 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Amenities & Contact Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800/80 pt-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">FACILITIES:</span>
                    {shelter.medical_capabilities.map((med, i) => (
                      <span
                        key={i}
                        className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"
                      >
                        <HeartPulse className="w-3 h-3 text-rose-400" />
                        {med}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{shelter.potable_water_liters.toLocaleString()}L</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span>{shelter.dry_ration_kits.toLocaleString()} Kits</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{shelter.contact_phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
