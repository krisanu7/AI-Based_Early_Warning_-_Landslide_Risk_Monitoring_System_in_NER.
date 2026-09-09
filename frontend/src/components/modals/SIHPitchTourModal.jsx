import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
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
  Building2,
  Eye,
  ArrowUpRight,
  Zap
} from 'lucide-react';

const PILLARS = [
  {
    step: "01",
    title: "DETECT • Ground Truth & Multi-Temporal Environmental Ingestion",
    icon: CloudRain,
    color: "from-blue-600 via-cyan-600 to-teal-600",
    badge: "1. Data Ingestion & Offline Ground Scouts",
    route: "/dashboard",
    routeLabel: "View Command Dashboard",
    description: "In the steep, cloud-covered hills of Northeast India, early detection is critical. The platform combines 1h/6h/24h/48h/72h rainfall radar monitoring with offline-first mobile field surveys (<60s) from remote mountain villages with zero connectivity.",
    highlights: [
      "Real-time precipitation surge monitoring (>100mm/24h flash threshold)",
      "IndexedDB offline field reporting for remote hill terrains with zero cellular network",
      "Automated sensor telemetry simulation (pore water pressure & soil saturation)",
      "Pre-calibrated GIS coverage for all 8 Northeast Indian states"
    ]
  },
  {
    step: "02",
    title: "PREDICT • Physics-Informed Random Forest & Geotechnical AI Engine",
    icon: Cpu,
    color: "from-purple-600 via-indigo-600 to-blue-600",
    badge: "2. Predictive AI & Susceptibility Modeling",
    route: "/model-monitoring",
    routeLabel: "Inspect Model Telemetry",
    description: "Evaluates geological susceptibility (slope steepness, elevation, lithology, NDVI) combined with dynamic meteorological trigger signals using a Scikit-Learn Random Forest Pipeline delivering 99.0% Accuracy, 98.77% Precision, and 99.0% Recall.",
    highlights: [
      "Validated 99.0% Model Accuracy, 98.77% Precision, and 99.0% Recall / Sensitivity",
      "Evaluates 13 physical, geomorphic, and rainfall features in real time",
      "Explainable AI (XAI) feature attribution inspector for geological engineers",
      "Dynamically calculates 0–100 Landslide Risk Score and Model Confidence"
    ]
  },
  {
    step: "03",
    title: "INSPECT • Gemini 3.1 Flash Vision Terrain & Highway Inspector",
    icon: Eye,
    color: "from-indigo-600 via-violet-600 to-pink-600",
    badge: "3. Multimodal Vision Copilot (Gemini 3.1 Flash)",
    route: "/visual-inspector",
    routeLabel: "Open AI Visual Inspector",
    description: "Empowers border scouts, highway engineers, and citizens to upload slope or road photos. Google Gemini 3.1 Flash Lite classifies the terrain, detects tension cracks and mudflows, and auto-dispatches emergency alerts to DDMA authorities.",
    highlights: [
      "1-Click photo diagnosis of tension fissures, rockfalls, and mud debris",
      "Instant highway obstruction & human hazard severity grading",
      "Pre-loaded with Northeast highway test presets (NH-54, NH-27, Tuirial Valley, Dzongu)",
      "Automated multi-stakeholder alert dispatch into MongoDB live grid"
    ]
  },
  {
    step: "04",
    title: "WARN • Geospatial Clustering & Multilingual Public Broadcast",
    icon: BellRing,
    color: "from-amber-600 via-orange-600 to-rose-600",
    badge: "4. Early Warning State Machine & Voice Tickers",
    route: "/public-warnings",
    routeLabel: "View Public Advisories",
    description: "Features a Haversine 25km spatial cluster detector and an early warning state machine (NORMAL → WATCH → WARNING → CRITICAL). Public citizens receive instant warnings translated into Assamese, Bengali, Hindi, and English with Web Speech audio synthesis.",
    highlights: [
      "Haversine 25km multi-slope corridor danger clustering",
      "Multilingual Web Speech audio broadcast for non-literate rural accessibility",
      "Strict Human-in-the-Loop verification gate before public alert dissemination",
      "Full-portal multilingual switching (English, অসমীয়া, বাংলা, हिंदी)"
    ]
  },
  {
    step: "05",
    title: "RESPOND • Cascading Impact Logistics & NDMA SOP RAG Assistant",
    icon: Truck,
    color: "from-rose-600 via-red-600 to-purple-600",
    badge: "5. Disaster Logistics & NDMA Safety Protocol",
    route: "/response",
    routeLabel: "Open Disaster Logistics",
    description: "Immediately analyzes cascading exposure to surrounding villages, NH highway cuts (NH-27, NH-6, NH-29), and bridges. Automatically estimates required rescue teams (SDRF/NDRF), heavy earthmovers (JCBs), and integrates official NDMA SOP guidelines.",
    highlights: [
      "Automated logistics quota calculator (SDRF teams, JCB earthmovers, relief rations)",
      "Evacuation shelter directory with live occupancy and nearest center finder",
      "Highway vulnerability monitoring with alternative bypass route recommendations",
      "AI Disaster Assistant grounded in official NDMA landslide standard operating procedures"
    ]
  }
];

export const SIHPitchTourModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Keyboard navigation (Escape, Left, Right)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentStep((prev) => Math.min(PILLARS.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pillar = PILLARS[currentStep];
  const Icon = pillar.icon;

  const handleNavigateToFeature = () => {
    onClose();
    navigate(pillar.route);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${pillar.color} p-5 sm:p-6 text-white relative flex items-center justify-between`}>
          <div className="space-y-1.5 max-w-[85%]">
            <div className="flex flex-wrap items-center gap-2">
              <img 
                src="/logo.png" 
                alt="InnovateX Logo" 
                className="h-7 sm:h-8 w-auto object-contain bg-white/10 backdrop-blur p-1 rounded-xl"
              />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>SIH 2026 Pitch Architecture Tour • InnovateX</span>
              </div>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {pillar.badge}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors shrink-0"
            title="Close Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {PILLARS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`py-2 px-2 rounded-xl border text-left transition-all ${
                  currentStep === idx
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-60">Pillar {p.step}</div>
                <div className="text-[11px] sm:text-xs font-bold truncate">{p.title.split('•')[0]}</div>
              </button>
            ))}
          </div>

          {/* Pillar Card Description */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{pillar.title}</span>
              </h3>

              {/* Direct Jump to Feature in Website */}
              <button
                onClick={handleNavigateToFeature}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{pillar.routeLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

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
                  <span className="leading-snug">{h}</span>
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
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 disabled:opacity-30 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-400">
            {currentStep + 1} of {PILLARS.length}
          </span>

          <div className="flex items-center gap-2">
            {currentStep < PILLARS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(PILLARS.length - 1, prev + 1))}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <span>Next Pillar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Tour</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
