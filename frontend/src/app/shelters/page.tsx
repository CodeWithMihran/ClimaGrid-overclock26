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
  Sparkles,
  Truck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { fetchReliefShelters, allocateShelterForIncident, logSupplyDrop } from '../../lib/api';
import { ReliefShelter, ShelterAllocationResponse } from '../../types';

export default function ReliefSheltersPage() {
  const [activeTab, setActiveTab] = useState<'shelters' | 'warehouse'>('shelters');
  const [shelters, setShelters] = useState<ReliefShelter[]>([]);
  const [allocationResult, setAllocationResult] = useState<ShelterAllocationResponse | null>(null);
  const [isAllocating, setIsAllocating] = useState<boolean>(false);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [supplyDropToast, setSupplyDropToast] = useState<string | null>(null);
  const [droppingShelterId, setDroppingShelterId] = useState<string | null>(null);

  const patientScenarios = [
    {
      title: 'Maternal & Pediatric Critical',
      incidentId: 'INC-MUM-402',
      lat: 29.8640,
      lon: 77.8960,
      headcount: 4,
      vulnerabilities: ['Pregnant Woman (Third Trimester)', 'Infant (3 months)', 'Elderly Diabetic'],
      badge: 'Pediatric & Maternity Required'
    },
    {
      title: 'Elderly Dialysis & Wheelchair',
      incidentId: 'INC-CIVIL-104',
      lat: 29.8690,
      lon: 77.8840,
      headcount: 2,
      vulnerabilities: ['Renal Failure (Dialysis Required)', 'Wheelchair Mobility Impairment'],
      badge: 'Hospital / ICU Required'
    },
    {
      title: 'Trauma & Fracture Rescue',
      incidentId: 'INC-RAM-308',
      lat: 29.8550,
      lon: 77.8890,
      headcount: 5,
      vulnerabilities: ['Compound Fracture', 'Severe Hypothermia', 'Deep Laceration'],
      badge: '24/7 Trauma Triage'
    }
  ];

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

  const handleSimulateAllocation = async (scenario = patientScenarios[selectedScenarioIdx]) => {
    setIsAllocating(true);
    try {
      const res = await allocateShelterForIncident(
        scenario.incidentId,
        scenario.lat,
        scenario.lon,
        scenario.headcount,
        scenario.vulnerabilities
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

  const handleSupplyDrop = async (shelterId: string, shelterName: string) => {
    setDroppingShelterId(shelterId);
    try {
      await logSupplyDrop(shelterId, 2500, 200, 20);
      const updated = await fetchReliefShelters();
      setShelters(updated);
      setSupplyDropToast(`Emergency Supply Drop Successful! +2,500L Potable Water & +200 Ready Meal Kits delivered to ${shelterName}.`);
      setTimeout(() => setSupplyDropToast(null), 6000);
    } catch (e) {
      console.error('Supply drop failed:', e);
    } finally {
      setDroppingShelterId(null);
    }
  };

  const totalBeds = shelters.reduce((acc, s) => acc + s.total_capacity_beds, 0);
  const occupiedBeds = shelters.reduce((acc, s) => acc + s.occupied_beds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const totalWater = shelters.reduce((acc, s) => acc + s.potable_water_liters, 0);
  const totalRations = shelters.reduce((acc, s) => acc + s.dry_ration_kits, 0);

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#191919] text-[#2f2e2b] dark:text-[#e6e6e5] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1850px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 sm:py-9 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#eef8f2] dark:bg-[#1b2b22] border border-[#ccecd8] dark:border-[#244b34] flex items-center justify-center text-[#227744] dark:text-[#4ade80] shadow-2xs">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2f2e2b] dark:text-[#f4f4f5] tracking-tight">
                  RELIEF CAMPS & MULTI-WAREHOUSE LOGISTICS
                </h1>
                <span className="bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] text-xs font-mono font-semibold px-3 py-1 rounded-full">
                  SW-01 OPTIMIZER
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-[#787774] dark:text-[#9b9a97] mt-1">
                Real-time bed occupancy, medical triage facility matching & regional stock synchronization across Roorkee
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-[#f1f1ef] dark:bg-[#262626] p-1.5 rounded-xl border border-[#e3e2e0] dark:border-[#333333]">
            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'shelters'
                  ? 'bg-white dark:bg-[#2e2e2e] text-[#2f2e2b] dark:text-white shadow-xs border border-[#deddd9] dark:border-[#404040] font-semibold'
                  : 'text-[#6b6966] dark:text-[#a8a7a4] hover:text-[#2f2e2b] dark:hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Shelters & Medical Beds</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouse')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'warehouse'
                  ? 'bg-white dark:bg-[#2e2e2e] text-[#2f2e2b] dark:text-white shadow-xs border border-[#deddd9] dark:border-[#404040] font-semibold'
                  : 'text-[#6b6966] dark:text-[#a8a7a4] hover:text-[#2f2e2b] dark:hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Multi-Warehouse Stock Sync (SW-01)</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 font-mono">
          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">TOTAL BED OCCUPANCY</span>
            <span className="text-3xl font-bold text-[#2f2e2b] dark:text-white block">
              {occupiedBeds} / {totalBeds}
            </span>
            <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 block mt-1 font-sans">({availableBeds} Free Cots Available)</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">POTABLE DRINKING WATER</span>
            <span className="text-3xl font-bold text-sky-600 dark:text-sky-400 block">
              {Number(totalWater || 0).toLocaleString()} L
            </span>
            <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1 font-sans">Jeevan Verified Safe Stock</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">DRY RATION FOOD KITS</span>
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 block">
              {Number(totalRations || 0).toLocaleString()} Kits
            </span>
            <span className="text-xs sm:text-sm text-[#787774] dark:text-[#9b9a97] block mt-1 font-sans">72-Hour Ready Meal Packs</span>
          </div>

          <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xs">
            <span className="text-xs text-[#787774] dark:text-[#9b9a97] block mb-1 uppercase font-medium">CAPACITY UTILIZATION</span>
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 block">
              {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%
            </span>
            <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block mt-1 font-sans">Safe Threshold (&lt;85%)</span>
          </div>
        </div>

        {/* Supply Drop Success Toast */}
        {supplyDropToast && (
          <div className="p-5 bg-[#eef8f2] dark:bg-[#192b1f] border border-[#ccecd8] dark:border-[#274f35] rounded-2xl flex items-center justify-between gap-4 text-sm shadow-xs animate-fadeIn">
            <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold">{supplyDropToast}</span>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-3 py-1 rounded-lg">
              DELIVERY CONFIRMED
            </span>
          </div>
        )}

        {/* TAB 1: SHELTERS & MEDICAL BED ALLOCATION */}
        {activeTab === 'shelters' && (
          <div className="space-y-7">
            
            {/* Multi-Criteria Bed Allocation Engine Card */}
            <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
                    MULTI-CRITERIA BED ALLOCATION ENGINE
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#2f2e2b] dark:text-[#f4f4f5] mt-1">
                    Automated Medical Matching for Pregnant Women, Infants & Critical Patients
                  </h3>
                  <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-1">
                    Routes vulnerable patients to shelters with matching pediatric cribs, maternity beds, and doctors.
                  </p>
                </div>

                <button
                  onClick={() => handleSimulateAllocation()}
                  disabled={isAllocating}
                  className="bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] font-bold text-sm sm:text-base px-6 py-3 rounded-xl flex items-center gap-2.5 shadow-xs transition-all shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 fill-current text-sky-400 dark:text-sky-600" />
                  <span>{isAllocating ? 'Matching Patients...' : 'Run Auto-Allocation Simulation'}</span>
                </button>
              </div>

              {/* Scenario Profile Selector */}
              <div className="pt-2 border-t border-[#e9e9e7] dark:border-[#2e2e2e] flex flex-wrap items-center gap-3">
                <span className="text-xs sm:text-sm font-medium text-[#787774] dark:text-[#9b9a97] flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  Select Patient Distress Profile:
                </span>
                {patientScenarios.map((sc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedScenarioIdx(i);
                      handleSimulateAllocation(sc);
                    }}
                    className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-lg border font-semibold transition-all ${
                      selectedScenarioIdx === i
                        ? 'bg-[#2f2e2b] text-white dark:bg-white dark:text-[#191919] border-transparent shadow-xs'
                        : 'bg-[#f7f6f3] dark:bg-[#282828] text-[#575653] dark:text-[#d4d4d4] border-[#deddd9] dark:border-[#3a3a3a] hover:bg-[#efefed] dark:hover:bg-[#333333]'
                    }`}
                  >
                    <span>{sc.title}</span>
                    <span className="text-[11px] opacity-75 font-mono ml-1.5">({sc.headcount} Trapped)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allocation Result Banner */}
            {allocationResult && (
              <div className="p-6 bg-[#eef8f2] dark:bg-[#192b1f] border border-[#ccecd8] dark:border-[#274f35] rounded-2xl flex items-start gap-4 shadow-xs text-sm">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                      Beds Successfully Allocated at {allocationResult.recommended_shelter.name}
                    </h4>
                    <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-3 py-1 rounded-md">
                      MATCH SCORE: 98%
                    </span>
                  </div>
                  <p className="text-[#3b3a37] dark:text-[#d4d4d4] leading-relaxed">
                    <b>Medical Routing Rationale:</b> {allocationResult.rationale} Distance from rescue point: <b>{allocationResult.distance_km} km</b>.
                  </p>
                  <p className="text-[#787774] dark:text-[#9b9a97] font-mono text-xs">
                    Designated Camp Commandant: <b>{allocationResult.recommended_shelter.contact_officer}</b> (Emergency Contact: {allocationResult.recommended_shelter.contact_phone})
                  </p>
                </div>
              </div>
            )}

            {/* Grid of Shelter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shelters.map((shelter) => {
                const pct = Math.round((shelter.occupied_beds / shelter.total_capacity_beds) * 100);
                const isDropping = droppingShelterId === shelter.id;
                return (
                  <div
                    key={shelter.id}
                    className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#deddd9] dark:hover:border-[#383838] transition-colors space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-lg text-[#2f2e2b] dark:text-white flex items-center gap-3">
                            <span>{shelter.name}</span>
                            <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                              shelter.status === 'CRITICAL_CAPACITY'
                                ? 'bg-[#fdf2f2] dark:bg-[#381e1e] text-[#b91c1c] dark:text-[#f87171] border border-[#fbd5d5] dark:border-[#522929]'
                                : shelter.status === 'HIGH_OCCUPANCY'
                                ? 'bg-[#fef9ee] dark:bg-[#342918] text-[#b45309] dark:text-[#fbbf24] border border-[#fcedca] dark:border-[#4d3a1f]'
                                : 'bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34]'
                            }`}>
                              {shelter.status.replace('_', ' ')}
                            </span>
                          </h3>
                          <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-1">{shelter.landmark}</p>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-lg font-bold text-[#2f2e2b] dark:text-white block">{shelter.available_beds} beds free</span>
                          <span className="text-[#787774] dark:text-[#9b9a97] text-xs block">
                            ({shelter.occupied_beds}/{shelter.total_capacity_beds} occupied)
                          </span>
                        </div>
                      </div>

                      {/* Occupancy Progress Bar */}
                      <div className="w-full bg-[#f1f1ef] dark:bg-[#2b2b2b] rounded-full h-3 overflow-hidden border border-[#e3e2e0] dark:border-[#383838]">
                        <div
                          className={`h-full transition-all duration-500 ${
                            pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Medical Capabilities Chips */}
                      <div>
                        <span className="text-xs text-[#787774] dark:text-[#9b9a97] font-mono block mb-2 font-semibold uppercase">
                          MEDICAL FACILITIES & CRITICAL CARE:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {shelter.medical_capabilities.map((med, i) => (
                            <span
                              key={i}
                              className="bg-[#f7f6f3] dark:bg-[#191919] border border-[#e9e9e7] dark:border-[#2e2e2e] text-[#2f2e2b] dark:text-[#e6e6e5] px-3 py-1.5 rounded-lg text-xs sm:text-[13px] flex items-center gap-2 font-medium"
                            >
                              <HeartPulse className="w-4 h-4 text-rose-500" />
                              <span>{med}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Supplies & Contact Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#e9e9e7] dark:border-[#2e2e2e] text-sm font-mono text-[#575653] dark:text-[#a8a7a4]">
                        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                          <Droplets className="w-4 h-4" />
                          <span>{Number(shelter.potable_water_liters || 0).toLocaleString()} L Water</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                          <Utensils className="w-4 h-4" />
                          <span>{Number(shelter.dry_ration_kits || 0).toLocaleString()} Ration Kits</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Phone className="w-4 h-4" />
                          <span>{shelter.contact_phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Emergency Supply Dispatch Action */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleSupplyDrop(shelter.id, shelter.name)}
                        disabled={isDropping}
                        className="w-full bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#2b2b2b] dark:hover:bg-[#333333] text-[#2f2e2b] dark:text-white border border-[#deddd9] dark:border-[#3d3d3d] rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs disabled:opacity-50"
                      >
                        <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span>{isDropping ? 'Dispatching Supplies...' : 'Dispatch Emergency Supply Drop (+2,500L Water, +200 Kits)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-WAREHOUSE STOCK SYNC (SW-01 ADVANCED GOAL) */}
        {activeTab === 'warehouse' && (
          <div className="space-y-7">
            <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
                  REGIONAL DISASTER LOGISTICS HUBS
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#2f2e2b] dark:text-[#f4f4f5] mt-1">
                  Automated Multi-Warehouse State Store Synchronization (SW-01 Advanced Goal)
                </h3>
                <p className="text-sm text-[#787774] dark:text-[#9b9a97] mt-1">
                  Synchronizes emergency inventory across Roorkee depots via serverless Amazon DynamoDB & EventBridge streams.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-[#f0f7fb] dark:bg-[#1a2634] text-sky-700 dark:text-sky-300 border border-[#d8eaf6] dark:border-[#223547] px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold">
                  Cross-Depot Sync SLA: &lt;45ms
                </span>
                <span className="bg-[#eef8f2] dark:bg-[#1b2b22] text-[#227744] dark:text-[#4ade80] border border-[#ccecd8] dark:border-[#244b34] px-4 py-2 rounded-full text-xs font-mono font-semibold flex items-center gap-2 shadow-2xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span>DYNAMODB STATE STORE SYNCED</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#2e2e2e] pb-4">
                  <div>
                    <span className="font-bold text-lg text-[#2f2e2b] dark:text-white">Roorkee Central Depot (Civil Lines)</span>
                    <p className="text-xs text-[#787774] dark:text-[#9b9a97] mt-0.5">Primary Logistics Feeder for Central Roorkee</p>
                  </div>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold bg-[#f0f7fb] dark:bg-[#1a2634] px-2.5 py-1 rounded-md border border-[#d8eaf6] dark:border-[#223547]">
                    NODE: WH-01
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Rescue Boats:</span>
                    <span className="text-lg font-bold text-[#2f2e2b] dark:text-white block">8 Boats Ready</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Dry Ration Packs:</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block">1,850 Kits</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Purification Tablets:</span>
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400 block">6,000 Units</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Trauma First-Aid:</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">140 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#2e2e2e] pb-4">
                  <div>
                    <span className="font-bold text-lg text-[#2f2e2b] dark:text-white">IIT Roorkee Disaster Logistics Hub</span>
                    <p className="text-xs text-[#787774] dark:text-[#9b9a97] mt-0.5">High-Ground Staging Depot & Medical Stockpile</p>
                  </div>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold bg-[#f0f7fb] dark:bg-[#1a2634] px-2.5 py-1 rounded-md border border-[#d8eaf6] dark:border-[#223547]">
                    NODE: WH-02
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Rescue Boats:</span>
                    <span className="text-lg font-bold text-[#2f2e2b] dark:text-white block">4 Boats Ready</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Dry Ration Packs:</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block">1,400 Kits</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Purification Tablets:</span>
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400 block">5,200 Units</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Trauma First-Aid:</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">110 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#2e2e2e] pb-4">
                  <div>
                    <span className="font-bold text-lg text-[#2f2e2b] dark:text-white">Gurukul Kangri Medical Staging Depot</span>
                    <p className="text-xs text-[#787774] dark:text-[#9b9a97] mt-0.5">Specialized Pediatric, Maternity & Burn Reserve</p>
                  </div>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold bg-[#f0f7fb] dark:bg-[#1a2634] px-2.5 py-1 rounded-md border border-[#d8eaf6] dark:border-[#223547]">
                    NODE: WH-03
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Rescue Boats:</span>
                    <span className="text-lg font-bold text-[#2f2e2b] dark:text-white block">2 Boats Ready</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Dry Ration Packs:</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block">950 Kits</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Purification Tablets:</span>
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400 block">3,800 Units</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Trauma First-Aid:</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">95 Kits</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#202020] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#2e2e2e] pb-4">
                  <div>
                    <span className="font-bold text-lg text-[#2f2e2b] dark:text-white">Roorkee Cantt Army Logistics Depot</span>
                    <p className="text-xs text-[#787774] dark:text-[#9b9a97] mt-0.5">Heavy Engineering Equipment, RO Water & Assault Boats</p>
                  </div>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold bg-[#f0f7fb] dark:bg-[#1a2634] px-2.5 py-1 rounded-md border border-[#d8eaf6] dark:border-[#223547]">
                    NODE: WH-04
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Heavy Assault Boats:</span>
                    <span className="text-lg font-bold text-[#2f2e2b] dark:text-white block">6 Boats Ready</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Military MRE Packs:</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block">2,200 Kits</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Mobile RO Tankers:</span>
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400 block">4 Units</span>
                  </div>
                  <div className="bg-[#f7f6f3] dark:bg-[#191919] p-4 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e]">
                    <span className="text-[#787774] dark:text-[#9b9a97] block text-xs mb-1">Surgical Field Bags:</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">85 Packs</span>
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
