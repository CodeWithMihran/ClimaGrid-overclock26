'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Waves, 
  Megaphone, 
  Smartphone, 
  MapPin, 
  Home, 
  Camera, 
  Cpu, 
  ExternalLink,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { useDemoTour, TOUR_STEPS } from '../context/DemoTourContext';

export const CrisisTourHUD: React.FC = () => {
  const {
    isTourActive,
    currentStepIndex,
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    stopTour,
    isAutoPlay,
    toggleAutoPlay,
  } = useDemoTour();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Keyboard navigation for presentation clickers and arrows
  React.useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, nextStep, prevStep, stopTour]);

  if (!isTourActive) return null;

  const stageIcons = [Waves, Megaphone, Smartphone, MapPin, Home, Camera];
  const StepIcon = stageIcons[currentStepIndex] || Sparkles;

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl transition-all duration-300 animate-fadeIn font-sans">
      <div className="bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-xl border border-[#deddd9] dark:border-[#383838] shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-[#2f2e2b] dark:text-[#f4f4f5] ring-1 ring-black/5 dark:ring-white/10">
        
        {/* Progress Bar & Stage Indicator Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {TOUR_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => goToStep(idx)}
                title={`Jump to Stage ${idx + 1}: ${step.title}`}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-sky-600 dark:bg-sky-400 ring-2 ring-sky-400/40'
                    : isCompleted
                    ? 'bg-emerald-500/80 dark:bg-emerald-400/80 hover:opacity-100'
                    : 'bg-[#e5e5e3] dark:bg-[#333333] hover:bg-[#deddd9] dark:hover:bg-[#444444]'
                }`}
              />
            );
          })}
        </div>

        {/* Minimized Compact Bar Mode */}
        {isMinimized ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-[#1a2634] text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <StepIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 uppercase mr-2">
                  Stage {currentStepIndex + 1}/6
                </span>
                <span className="text-sm font-bold truncate">{currentStep.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 rounded-lg text-[#787774] hover:text-[#2f2e2b] dark:text-[#9b9a97] dark:hover:text-white"
                title="Expand Guided Tour HUD"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={stopTour}
                className="p-1.5 rounded-lg text-[#787774] hover:text-rose-600 dark:text-[#9b9a97] dark:hover:text-rose-400"
                title="Exit Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded Guided Walkthrough HUD */
          <div className="space-y-3.5">
            {/* Header: Stage info, badges, and HUD controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-[#1a2634] border border-sky-200 dark:border-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
                  <StepIcon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                      {currentStep.stageName}
                    </span>
                    <span className="bg-[#f0f7fb] dark:bg-[#1a2634] text-sky-700 dark:text-sky-300 border border-[#d8eaf6] dark:border-[#223547] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                      {currentStep.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* HUD Window Controls */}
              <div className="flex items-center gap-2">
                {/* Auto-Play Toggle */}
                <button
                  type="button"
                  onClick={toggleAutoPlay}
                  className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                    isAutoPlay
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-[#f7f6f3] dark:bg-[#282828] text-[#575653] dark:text-[#a8a7a4] border-[#deddd9] dark:border-[#3a3a3a] hover:bg-[#efefed]'
                  }`}
                  title={isAutoPlay ? 'Pause Auto-Advance' : 'Auto-advance every 14 seconds'}
                >
                  {isAutoPlay ? <Pause className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoPlay ? 'Auto-Advancing' : 'Auto-Play'}</span>
                </button>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-lg text-[#787774] hover:text-[#2f2e2b] dark:text-[#9b9a97] dark:hover:text-white transition-colors"
                  title="Minimize Tour HUD"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={stopTour}
                  className="p-1.5 rounded-lg text-[#787774] hover:text-rose-600 dark:text-[#9b9a97] dark:hover:text-rose-400 transition-colors"
                  title="Exit Tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Crisis Storyline Narrative */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#2f2e2b] dark:text-white tracking-tight flex items-center gap-2">
                <span>{currentStep.title}</span>
              </h3>
              <p className="text-xs sm:text-[13px] text-[#575653] dark:text-[#d4d4d4] mt-1 leading-relaxed">
                {currentStep.storyline}
              </p>
            </div>

            {/* Action Hint & Under-the-Hood Badges */}
            <div className="bg-[#f7f6f3] dark:bg-[#181818] p-3 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2">
              <div className="flex items-start gap-2 text-xs text-[#2f2e2b] dark:text-[#e6e6e5]">
                <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <b className="font-semibold text-sky-700 dark:text-sky-400">Interactive Demo Cue:</b>{' '}
                  {currentStep.actionHint}
                </span>
              </div>

              {/* Technical Architecture Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#e3e2e0] dark:border-[#2a2a2a] text-[10px] font-mono text-[#787774] dark:text-[#9b9a97]">
                <span className="font-semibold text-[#2f2e2b] dark:text-white uppercase mr-1">Stack:</span>
                {currentStep.technicalHighlights.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-white dark:bg-[#252525] border border-[#deddd9] dark:border-[#383838] px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation Buttons Row */}
            <div className="flex items-center justify-between pt-1 gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#deddd9] dark:border-[#383838] bg-[#f7f6f3] hover:bg-[#efefed] dark:bg-[#282828] dark:hover:bg-[#333333] text-[#2f2e2b] dark:text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-all shadow-2xs font-mono"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-[11px] font-mono text-[#8c8a85] dark:text-[#787774] hidden md:inline">
                  Keys: <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">→</kbd> Next • <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">←</kbd> Prev • <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">Esc</kbd> Exit
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#787774] dark:text-[#9b9a97] hidden sm:inline">
                  {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>

                {currentStepIndex < TOUR_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2f2e2b] hover:bg-[#1a1918] dark:bg-white dark:hover:bg-[#f1f1ef] text-white dark:text-[#191919] flex items-center gap-2 shadow-xs transition-all font-mono"
                  >
                    <span>Next: {TOUR_STEPS[currentStepIndex + 1].badge}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/architecture"
                      onClick={stopTour}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-[#deddd9] dark:border-[#383838] bg-white dark:bg-[#262626] hover:bg-slate-50 text-[#2f2e2b] dark:text-white flex items-center gap-1.5 transition-all font-mono shadow-2xs"
                    >
                      <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Review Cloud Architecture</span>
                    </Link>

                    <button
                      type="button"
                      onClick={stopTour}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs transition-all font-mono"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Tour</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
