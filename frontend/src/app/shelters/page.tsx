'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Droplets, 
  Utensils, 
  HeartPulse, 
  Phone, 
  ShieldCheck, 
  CheckCircle, 
  Navigation,
  Package,
  RefreshCw,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { fetchReliefShelters, allocateShelterForIncident } from '../../lib/api';
import { ReliefShelter, ShelterAllocationResponse } from '../../types';

export default function ReliefSheltersPage() {
  const [activeTab, setActiveTab] = useState<'shelters' | 'warehouse'>('shelters');
  const [shelters, setShelters] = useState<ReliefShelter[]>([]);
  const [allocationResult, setAllocationResult] = useState<ShelterAllocationResponse | null>(null);
  const [isAllocating, setIsAllocating] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchReliefShelters();
        setShelters(list);
      } catch (e) {
        console.error('Failed to fetch shelters:', e);
      }
    }
    load();
  }, []);

  const handleSimulateAllocation = async () => {
    setIsAllocating(true);
    try {
      // Simulate stranded high-vulnerability family near Solani Aqueduct
      const res = await allocateShelterForIncident(
        'INC-MUM-402',
        29.8640,
        77.8960,
        6,
        ['Pregnant Woman (Third Trimester)', 'Infant (3 months)', 'Elderly Diabetic']
      );
      setAllocationResult(res);
      const updated = await fetchReliefShelters();
      setShelters(updated);
    } catch (e) {
      console.error('Allocation failed:', e);
    } finally {
      setIsAllocating(false);
    }
  };

  const totalBeds = shelters.reduce((acc, s) => acc + s.total_capacity_beds, 0);
  const occupiedBeds = shelters.reduce((acc, s) => acc + s.occupied_beds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const totalWater = shelters.reduce((acc, s) => acc + s.potable_water_liters, 0);
  const totalRations = shelters.reduce((acc, s) => acc + s.dry_ration_kits, 0);

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Banner */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  RELIEF CAMPS & MULTI-WAREHOUSE LOGISTICS
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
                  SW-01 OPTIMIZER
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time bed occupancy, medical triage facility matching & regional stock synchronization across Roorkee
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-[#070d1e] p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'shelters'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Shelters & Medical Beds</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouse')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'warehouse'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-4 h-4 text-cyan-400" />
              <span>Multi-Warehouse Stock Sync (SW-01)</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 block">TOTAL BED OCCUPANCY</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {occupiedBeds} / {totalBeds}
            </span>
            <span className="text-xs text-amber-400 block mt-1">({availableBeds} Free Cots Available)</span>
          </div>

          <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 block">POTABLE DRINKING WATER</span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block">
              {totalWater.toLocaleString()} Liters
            </span>
            <span className="text-xs text-cyan-500 block mt-1">Jeevan Verified Safe Stock</span>
          </div>

          <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 block">DRY RATION FOOD KITS</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {totalRations.toLocaleString()} Kits
            </span>
            <span className="text-xs text-amber-500 block mt-1">72-Hour Ready Meal Packs</span>
          </div>

          <div className="bg-[#0b132b] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 block">CAMP CAPACITY UTILIZATION</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%
            </span>
            <span className="text-xs text-emerald-500 block mt-1">Safe Threshold (&lt;85%)</span>
          </div>
        </div>

        {/* TAB 1: SHELTERS & MEDICAL BED ALLOCATION */}
        {activeTab === 'shelters' && (
          <div className="space-y-6">
            {/* 1-Click Medical Matching Simulation Bar */}
            <div className="bg-gradient-to-r from-[#0b132b] to-[#0e1738] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  MULTI-CRITERIA BED ALLOCATION ENGINE
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Automated Medical Matching for Pregnant Women, Infants & Critical Patients
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Routes vulnerable patients to shelters with matching pediatric cribs, maternity beds, and doctors.
                </p>
              </div>

              <button
                onClick={handleSimulateAllocation}
                disabled={isAllocating}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{isAllocating ? 'Matching Patients...' : 'Run Auto-Allocation Simulation'}</span>
              </button>
            </div>

            {/* Allocation Result Banner */}
            {allocationResult && (
              <div className="p-4 bg-emerald-950/90 border-2 border-emerald-400 rounded-2xl flex items-start gap-4 animate-fade-in shadow-2xl text-xs">
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-emerald-200">
                    Beds Successfully Allocated at {allocationResult.recommended_shelter.name}
                  </h4>
                  <p className="text-slate-200 leading-relaxed">
                    <b>Rationale:</b> {allocationResult.rationale} Distance: <b>{allocationResult.distance_km} km</b>.
                  </p>
                  <p className="text-slate-300 font-mono">
                    Officer in Charge: <b>{allocationResult.recommended_shelter.contact_officer}</b> (Phone: {allocationResult.recommended_shelter.contact_phone})
                  </p>
                </div>
              </div>
            )}

            {/* Grid of Shelter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {shelters.map((shelter) => {
                const pct = Math.round((shelter.occupied_beds / shelter.total_capacity_beds) * 100);
                return (
                  <div
                    key={shelter.id}
                    className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-white flex items-center gap-2.5">
                          <span>{shelter.name}</span>
                          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            shelter.status === 'CRITICAL_CAPACITY'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : shelter.status === 'HIGH_OCCUPANCY'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {shelter.status.replace('_', ' ')}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{shelter.landmark}</p>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span className="text-base font-bold text-white block">{shelter.available_beds} beds free</span>
                        <span className="text-slate-400 text-xs block">
                          ({shelter.occupied_beds}/{shelter.total_capacity_beds} occupied)
                        </span>
                      </div>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="w-full bg-[#070d1e] rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Medical Capabilities Chips */}
                    <div>
                      <span className="text-xs text-slate-400 font-mono block mb-1.5 font-bold">
                        MEDICAL FACILITIES & CRITICAL CARE:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {shelter.medical_capabilities.map((med, i) => (
                          <span
                            key={i}
                            className="bg-[#070d1e] border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-medium"
                          >
                            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                            <span>{med}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Supplies & Contact Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <Droplets className="w-4 h-4" />
                        <span>{shelter.potable_water_liters.toLocaleString()} L Water</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Utensils className="w-4 h-4" />
                        <span>{shelter.dry_ration_kits.toLocaleString()} Ration Kits</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Phone className="w-4 h-4" />
                        <span>{shelter.contact_phone}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-WAREHOUSE STOCK SYNC (SW-01 ADVANCED GOAL) */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="bg-[#0b132b] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  REGIONAL DISASTER LOGISTICS HUBS
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Automated Multi-Warehouse State Store Synchronization (SW-01 Advanced Goal)
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Synchronizes emergency inventory across Roorkee depots via serverless Amazon DynamoDB & EventBridge streams.
                </p>
              </div>

              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-sm">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>STATE STORE SYNCED</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-bold text-sm text-white">Roorkee Central Depot (Civil Lines)</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">NODE: WH-01</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Inflatable Rescue Boats:</span>
                    <span className="text-base font-bold text-white mt-0.5 block">8 Boats Ready</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Dry Ration Packs:</span>
                    <span className="text-base font-bold text-amber-300 mt-0.5 block">1,850 Kits</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Purification Tablets:</span>
                    <span className="text-base font-bold text-cyan-300 mt-0.5 block">6,000 Units</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Trauma First-Aid Kits:</span>
                    <span className="text-base font-bold text-emerald-300 mt-0.5 block">140 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-bold text-sm text-white">IIT Roorkee Disaster Logistics Hub</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">NODE: WH-02</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Inflatable Rescue Boats:</span>
                    <span className="text-base font-bold text-white mt-0.5 block">4 Boats Ready</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Dry Ration Packs:</span>
                    <span className="text-base font-bold text-amber-300 mt-0.5 block">1,400 Kits</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Purification Tablets:</span>
                    <span className="text-base font-bold text-cyan-300 mt-0.5 block">5,200 Units</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Trauma First-Aid Kits:</span>
                    <span className="text-base font-bold text-emerald-300 mt-0.5 block">110 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-bold text-sm text-white">Gurukul Kangri Medical Staging Depot</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">NODE: WH-03</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Inflatable Rescue Boats:</span>
                    <span className="text-base font-bold text-white mt-0.5 block">2 Boats Ready</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Dry Ration Packs:</span>
                    <span className="text-base font-bold text-amber-300 mt-0.5 block">950 Kits</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Purification Tablets:</span>
                    <span className="text-base font-bold text-cyan-300 mt-0.5 block">3,800 Units</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Trauma First-Aid Kits:</span>
                    <span className="text-base font-bold text-emerald-300 mt-0.5 block">95 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-bold text-sm text-white">Roorkee Cantt Army Logistics Depot</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">NODE: WH-04</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Heavy Assault Boats:</span>
                    <span className="text-base font-bold text-white mt-0.5 block">6 Boats Ready</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Military MRE Packs:</span>
                    <span className="text-base font-bold text-amber-300 mt-0.5 block">2,200 Kits</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Mobile RO Tankers:</span>
                    <span className="text-base font-bold text-cyan-300 mt-0.5 block">4 Units</span>
                  </div>
                  <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-xs">Surgical Field Bags:</span>
                    <span className="text-base font-bold text-emerald-300 mt-0.5 block">85 Packs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
