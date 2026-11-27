'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Droplets, 
  Utensils, 
  HeartPulse, 
  Phone, 
  CheckCircle, 
  Package, 
  RefreshCw, 
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  RELIEF CAMPS & MULTI-WAREHOUSE LOGISTICS
                </h1>
                <span className="bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-zinc-700 text-xs font-mono font-semibold px-3 py-0.5 rounded-full">
                  SW-01 OPTIMIZER
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Real-time bed occupancy, medical triage facility matching & regional stock synchronization across Roorkee
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-slate-100 dark:bg-[#09090b] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === 'shelters'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-zinc-700 font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Shelters & Medical Beds</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouse')}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === 'warehouse'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-zinc-700 font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Multi-Warehouse Stock Sync (SW-01)</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">TOTAL BED OCCUPANCY</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 block">
              {occupiedBeds} / {totalBeds}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 block mt-1">({availableBeds} Free Cots Available)</span>
          </div>

          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">POTABLE DRINKING WATER</span>
            <span className="text-2xl font-bold text-sky-700 dark:text-sky-400 block">
              {totalWater.toLocaleString()} Liters
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-1">Jeevan Verified Safe Stock</span>
          </div>

          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">DRY RATION FOOD KITS</span>
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 block">
              {totalRations.toLocaleString()} Kits
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-1">72-Hour Ready Meal Packs</span>
          </div>

          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">CAPACITY UTILIZATION</span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 block">
              {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-1">Safe Threshold (&lt;85%)</span>
          </div>
        </div>

        {/* TAB 1: SHELTERS & MEDICAL BED ALLOCATION */}
        {activeTab === 'shelters' && (
          <div className="space-y-6">
            {/* 1-Click Medical Matching Simulation Bar */}
            <div className="bg-white dark:bg-[#121214] border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
                  MULTI-CRITERIA BED ALLOCATION ENGINE
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Automated Medical Matching for Pregnant Women, Infants & Critical Patients
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Routes vulnerable patients to shelters with matching pediatric cribs, maternity beds, and doctors.
                </p>
              </div>

              <button
                onClick={handleSimulateAllocation}
                disabled={isAllocating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{isAllocating ? 'Matching Patients...' : 'Run Auto-Allocation Simulation'}</span>
              </button>
            </div>

            {/* Allocation Result Banner */}
            {allocationResult && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-start gap-4 shadow-xs text-xs">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Beds Successfully Allocated at {allocationResult.recommended_shelter.name}
                  </h4>
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                    <b>Rationale:</b> {allocationResult.rationale} Distance: <b>{allocationResult.distance_km} km</b>.
                  </p>
                  <p className="text-slate-600 dark:text-zinc-400 font-mono">
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
                    className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2.5">
                          <span>{shelter.name}</span>
                          <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                            shelter.status === 'CRITICAL_CAPACITY'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : shelter.status === 'HIGH_OCCUPANCY'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {shelter.status.replace('_', ' ')}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{shelter.landmark}</p>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span className="text-base font-bold text-slate-900 dark:text-zinc-100 block">{shelter.available_beds} beds free</span>
                        <span className="text-slate-500 dark:text-zinc-400 text-xs block">
                          ({shelter.occupied_beds}/{shelter.total_capacity_beds} occupied)
                        </span>
                      </div>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-zinc-700">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Medical Capabilities Chips */}
                    <div>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono block mb-1.5 font-semibold">
                        MEDICAL FACILITIES & CRITICAL CARE:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {shelter.medical_capabilities.map((med, i) => (
                          <span
                            key={i}
                            className="bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-medium"
                          >
                            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                            <span>{med}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Supplies & Contact Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-bold">
                        <Droplets className="w-4 h-4" />
                        <span>{shelter.potable_water_liters.toLocaleString()} L Water</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                        <Utensils className="w-4 h-4" />
                        <span>{shelter.dry_ration_kits.toLocaleString()} Ration Kits</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
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
            <div className="bg-white dark:bg-[#121214] border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
                  REGIONAL DISASTER LOGISTICS HUBS
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Automated Multi-Warehouse State Store Synchronization (SW-01 Advanced Goal)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Synchronizes emergency inventory across Roorkee depots via serverless Amazon DynamoDB & EventBridge streams.
                </p>
              </div>

              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>STATE STORE SYNCED</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <span className="font-bold text-base text-slate-900 dark:text-white">Roorkee Central Depot (Civil Lines)</span>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold">NODE: WH-01</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Rescue Boats:</span>
                    <span className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block">8 Boats Ready</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Dry Ration Packs:</span>
                    <span className="text-base font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">1,850 Kits</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Purification Tablets:</span>
                    <span className="text-base font-bold text-sky-700 dark:text-sky-400 mt-0.5 block">6,000 Units</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Trauma First-Aid:</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">140 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <span className="font-bold text-base text-slate-900 dark:text-white">IIT Roorkee Disaster Logistics Hub</span>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold">NODE: WH-02</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Rescue Boats:</span>
                    <span className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block">4 Boats Ready</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Dry Ration Packs:</span>
                    <span className="text-base font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">1,400 Kits</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Purification Tablets:</span>
                    <span className="text-base font-bold text-sky-700 dark:text-sky-400 mt-0.5 block">5,200 Units</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Trauma First-Aid:</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">110 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <span className="font-bold text-base text-slate-900 dark:text-white">Gurukul Kangri Medical Staging Depot</span>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold">NODE: WH-03</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Rescue Boats:</span>
                    <span className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block">2 Boats Ready</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Dry Ration Packs:</span>
                    <span className="text-base font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">950 Kits</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Purification Tablets:</span>
                    <span className="text-base font-bold text-sky-700 dark:text-sky-400 mt-0.5 block">3,800 Units</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Trauma First-Aid:</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">95 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <span className="font-bold text-base text-slate-900 dark:text-white">Roorkee Cantt Army Logistics Depot</span>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold">NODE: WH-04</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Heavy Assault Boats:</span>
                    <span className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block">6 Boats Ready</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Military MRE Packs:</span>
                    <span className="text-base font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">2,200 Kits</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Mobile RO Tankers:</span>
                    <span className="text-base font-bold text-sky-700 dark:text-sky-400 mt-0.5 block">4 Units</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181b] p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-xs">Surgical Field Bags:</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">85 Packs</span>
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
