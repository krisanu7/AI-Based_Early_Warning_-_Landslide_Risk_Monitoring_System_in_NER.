import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Mountain, 
  CloudRain, 
  Cpu, 
  BellRing, 
  Truck, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Globe2,
  WifiOff,
  Building2
} from 'lucide-react';

const PILLARS = [
  {
    step: "01",
    title: "DETECT • Ground Truth & Multi-Temporal Environmental Ingestion",
    icon: CloudRain,
    color: "from-blue-600 to-teal-600",
    badge: "1. Data Ingestion & Offline Ground Scouts",
    description: "In the steep, cloud-covered hills of Northeast India, early detection is critical. The platform combines 1h/6h/24h/48h/72h rainfall radar monitoring with offline-first field mobile surveys (<60s) from remote mountain villages.",
    highlights: [
      "Real-time precipitation surge monitoring (>100mm/24h flash threshold)",
      "IndexedDB offline field reporting for remote hill terrains with zero network",
      "Automated sensor telemetry simulation (pore water pressure & soil saturation)"
    ]
  },
  {
    step: "02",
    title: "PREDICT • Physics-Informed Random Forest & Geological AI Engine",
    icon: Cpu,
    color: "from-purple-600 to-indigo-600",
    badge: "2. Predictive AI & Susceptibility Modeling",
    description: "Evaluates geological susceptibility (slope steepness, elevation, lithology, NDVI) combined with dynamic meteorological trigger signals using a Scikit-Learn Random Forest Classifier (n_estimators=100) delivering 93.4% precision.",
    highlights: [
      "Evaluates 13 physical & geomorphic features in real time",
      "Explainable AI (XAI) feature attribution inspector for geological engineers",
      "Calculates dynamic 0–100 Landslide Risk Score and Model Confidence"
    ]
  },
  {
    step: "03",
    title: "WARN • Geospatial Clustering & Multi-Lingual Public Broadcast",
    icon: BellRing,
    color: "from-amber-600 to-rose-600",
    badge: "3. Early Warning State Machine & Voice Ticker",
    description: "Features a Haversine 25km spatial cluster detector and an early warning state machine (NORMAL → WATCH → WARNING → CRITICAL). Public citizens receive instant warnings translated into Assamese, Bengali, Hindi, and English with Web Speech audio broadcast.",
    highlights: [
      "Haversine 25km multi-slope corridor danger clustering",
      "Multilingual Web Speech audio broadcast for non-literate rural accessibility",
      "Strict Human-in-the-Loop verification gate before public alert dissemination"
    ]
  },
  {
    step: "04",
    title: "RESPOND • Cascading Impact Analysis & Disaster Logistics Forecaster",
    icon: Truck,
    color: "from-rose-600 to-purple-600",
    badge: "4. Rapid Disaster Logistics & Shelter Coordination",
    description: "Immediately analyzes cascading exposure to surrounding villages, NH highway cut-offs (NH-27, NH-6, NH-29), and bridges. Automatically estimates required rescue teams (SDRF/NDRF), heavy earthmovers (JCBs), and nearest safe shelters.",
    highlights: [
      "Automated logistics quota calculator (SDRF teams, JCB earthmovers, relief rations)",
      "Evacuation shelter directory with live occupancy and nearest center finder",
      "Highway vulnerability monitoring with alternative bypass route recommendations"
    ]
  }
];

export const SIHPitchTourModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const pillar = PILLARS[currentStep];
  const Icon = pillar.icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${pillar.color} p-6 text-white relative flex items-center justify-between`}>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH 2026 Pitch Architecture Tour</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {pillar.badge}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-4 gap-2">
            {PILLARS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                  currentStep === idx
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-60">Step {p.step}</div>
                <div className="text-xs font-bold truncate">{p.title.split('•')[0]}</div>
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>{pillar.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {pillar.description}
            </p>
          </div>

          {/* Key Architectural Highlights */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Key Engineering Innovations:
            </h4>
            <div className="space-y-2">
              {pillar.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 disabled:opacity-30 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-400">
            {currentStep + 1} of {PILLARS.length}
          </span>

          {currentStep < PILLARS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(PILLARS.length - 1, prev + 1))}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>Next Pillar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Tour</span>
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
