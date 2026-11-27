'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface TourStep {
  id: number;
  route: string;
  stageName: string;
  badge: string;
  title: string;
  subtitle: string;
  storyline: string;
  technicalHighlights: string[];
  actionHint: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    route: '/flood',
    stageName: 'Stage 1 of 6 • Pre-Disaster Prediction',
    badge: 'HYDRODYNAMIC MESH',
    title: 'Upstream Haridwar Surge & Saint-Venant 2D Inundation',
    subtitle: 'Solani River Stage Cresting at 5.42m (Danger Mark: 6.20m)',
    storyline:
      'A 35 mm/hr cloudburst in Haridwar triggers 24,500 cusecs discharge through Ganga Barrage. Saint-Venant shallow-water differential equations calculate 2D hydraulic flood propagation in real-time, forecasting Solani River embankment breach within 90 minutes across 470 hectares.',
    technicalHighlights: ['Saint-Venant 2D Hydraulic Model', 'Haridwar Barrage Real-time Discharge', '540 Ha Inundation Polygon'],
    actionHint: 'Adjust the rainfall intensity and discharge sliders on this page to watch the hydrodynamic flood mesh expand in real-time.'
  },
  {
    id: 2,
    route: '/siren',
    stageName: 'Stage 2 of 6 • Early Warning Broadcast',
    badge: 'ITU-T / OASIS CAP 1.2',
    title: 'NDMA SACHET Bilingual CAP Siren & Cell Broadcast',
    subtitle: 'Targeting 42 Cell Towers & 68,400 Citizens in the Inundation Path',
    storyline:
      'As flood sensors cross the 5.4m warning mark, ClimaGrid automatically formats an OASIS CAP v1.2 alert. The system generates Hindi and English lockscreen emergency notifications across 42 local telecom towers and synthesizes the official 853Hz + 960Hz dual-frequency acoustic siren with zero app install needed.',
    technicalHighlights: ['OASIS CAP v1.2 Standard XML', 'Web Audio 853Hz+960Hz Siren Synthesizer', 'Bilingual Hindi + English'],
    actionHint: 'Click "Test 853Hz+960Hz Acoustic Siren" to hear the emergency siren, or click "Copy Memorandum" to inspect the raw OASIS XML.'
  },
  {
    id: 3,
    route: '/citizen',
    stageName: 'Stage 3 of 6 • Vernacular Citizen Distress',
    badge: 'OFFLINE MESH & VISION',
    title: 'Citizen SOS Portal, Vision Depth Gauge & Offline Queue',
    subtitle: 'Stranded Family on Roof in Solani Basin with Elderly & Infant',
    storyline:
      'Cut off by water, a family trapped on a roof sends an emergency SOS in colloquial Hindi. When local cell towers fail, the IndexedDB offline sync queue safely caches the distress beacon. The onboard AI Vision Depth Gauge analyzes rooftop photos to determine water depth (6.8 ft) and identifies high-risk vulnerable individuals.',
    technicalHighlights: ['Web Speech API Vernacular NLP', 'Computer Vision Waterline Depth Gauge', 'IndexedDB Offline Resilience'],
    actionHint: 'Click "Vision Depth Gauge" to estimate water depth from photo, or switch to the WhatsApp AI Emergency Bot tab.'
  },
  {
    id: 4,
    route: '/',
    stageName: 'Stage 4 of 6 • Bedrock AI Triage & Safe Route',
    badge: 'BEDROCK AI & CORRIDOR',
    title: 'AAPDA360 Multimodal Triage & Submerged Bridge Bypass',
    subtitle: 'Sub-1.2s NLP Scoring (P1 Critical) & High-Ground Detour',
    storyline:
      'At the EOC Command Hub, Amazon Bedrock (Claude 3.5 Sonnet) extracts entities in 884ms, scoring the Solani incident P1 Critical (Score: 0.753). Rather than directing rescue crafts into the submerged Brij Bridge (5.5ft flood current), ClimaGrid plots a safe 2.27 km high-ground extraction corridor, dispatching NDRF-BOAT-04.',
    technicalHighlights: ['Amazon Bedrock (Claude 3.5 Sonnet) <1.2s SLA', 'Auditable MCDM Priority Matrix', 'Obstacle Bypass Routing (Avoids Brij Bridge 5.5ft flood)'],
    actionHint: 'Click "Preview Route" on the first incident to visualize the safe high-ground corridor on the Leaflet tactical map.'
  },
  {
    id: 5,
    route: '/shelters',
    stageName: 'Stage 5 of 6 • Medical Matching & Water Safety',
    badge: 'SW-01 & JEEVAN MESH',
    title: 'Relief Camp Allocation & JEEVAN Water Potability Shield',
    subtitle: 'Pediatric ICU Shelter Assignment & Municipal Boil-Water Alert',
    storyline:
      'The multi-warehouse optimizer matches the family to Civil Lines School based on pediatric cots and oxygen concentrators. Concurrently, JEEVAN optical water sensors detect an acute silt spike (46.1 NTU) from flood runoff, triggering an automated boil-water notice and dispatching a 10,000L emergency potable water tanker.',
    technicalHighlights: ['Dynamic Medical Facility Matching', 'Optical Turbidity & pH Sensor Mesh', 'Automated Boil-Water Advisories & Tanker Logistics'],
    actionHint: 'Click "Run Optimal Match" to simulate smart medical bed allocation, then explore the Water Safety module via the navbar.'
  },
  {
    id: 6,
    route: '/damage',
    stageName: 'Stage 6 of 6 • Drone Damage & SDRF Relief Claim',
    badge: 'MHA SDRF RECOVERY',
    title: 'Autonomous Drone Survey & Official SDRF Relief Memorandum',
    subtitle: '₹8.01 Cr Total Economic Loss & Official Ministry Grant Dossier',
    storyline:
      'Autonomous survey drones scan 470 flooded hectares. Computer vision classifies structural damage across 1,480 families and 7.8 km of road washouts. ClimaGrid applies Ministry of Home Affairs SDRF norms to compute ₹9.76 Cr in immediate state relief claims and compiles an auditable preliminary damage dossier ready for official submission.',
    technicalHighlights: ['Autonomous Drone Aerial Computer Vision', 'MHA SDRF Disbursement Rule Engine', 'Official 1-Click Government Memorandum Export'],
    actionHint: 'Click "Download Official SDRF (.txt)" to download the official Ministry of Home Affairs disaster grant memorandum.'
  }
];

interface DemoTourContextType {
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  startTour: (stepIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  stopTour: () => void;
  isAutoPlay: boolean;
  toggleAutoPlay: () => void;
}

const DemoTourContext = createContext<DemoTourContextType | undefined>(undefined);

export const DemoTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Read initial tour query or storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('climagrid_tour_active');
      const storedIdx = localStorage.getItem('climagrid_tour_step');
      if (stored === 'true') {
        setIsTourActive(true);
        if (storedIdx != null) {
          const idx = parseInt(storedIdx, 10);
          if (!isNaN(idx) && idx >= 0 && idx < TOUR_STEPS.length) {
            setCurrentStepIndex(idx);
          }
        }
      }
    }
  }, []);

  // Sync step changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('climagrid_tour_active', isTourActive ? 'true' : 'false');
      localStorage.setItem('climagrid_tour_step', currentStepIndex.toString());
    }
  }, [isTourActive, currentStepIndex]);

  // Handle Auto-Play timer
  useEffect(() => {
    if (!isTourActive || !isAutoPlay) return;

    const timer = setTimeout(() => {
      if (currentStepIndex < TOUR_STEPS.length - 1) {
        nextStep();
      } else {
        setIsAutoPlay(false);
      }
    }, 14000); // 14 seconds per step for comfortable reading

    return () => clearTimeout(timer);
  }, [isTourActive, isAutoPlay, currentStepIndex]);

  const currentStep = TOUR_STEPS[currentStepIndex];

  const startTour = (stepIndex: number = 0) => {
    setIsTourActive(true);
    setCurrentStepIndex(stepIndex);
    const targetRoute = TOUR_STEPS[stepIndex].route;
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const targetRoute = TOUR_STEPS[nextIdx].route;
      if (pathname !== targetRoute) {
        router.push(targetRoute);
      }
    } else {
      setIsAutoPlay(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const targetRoute = TOUR_STEPS[prevIdx].route;
      if (pathname !== targetRoute) {
        router.push(targetRoute);
      }
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
      const targetRoute = TOUR_STEPS[index].route;
      if (pathname !== targetRoute) {
        router.push(targetRoute);
      }
    }
  };

  const stopTour = () => {
    setIsTourActive(false);
    setIsAutoPlay(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('climagrid_tour_active', 'false');
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev);
  };

  return (
    <DemoTourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        goToStep,
        stopTour,
        isAutoPlay,
        toggleAutoPlay,
      }}
    >
      {children}
    </DemoTourContext.Provider>
  );
};

export const useDemoTour = () => {
  const context = useContext(DemoTourContext);
  if (!context) {
    throw new Error('useDemoTour must be used within a DemoTourProvider');
  }
  return context;
};
