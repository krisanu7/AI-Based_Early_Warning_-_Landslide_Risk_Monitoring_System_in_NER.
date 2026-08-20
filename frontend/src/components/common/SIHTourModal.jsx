import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Activity, ShieldCheck, Map, Users, ChevronRight, ChevronLeft, CheckCircle2, Award, Zap, Heart } from 'lucide-react';

export const SIHTourModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Problem Statement & Rural Northeast India Context",
      tag: "Smart India Hackathon 2026",
      icon: Award,
      content: "Water-borne diseases (Diarrhea, Cholera, Typhoid, Hepatitis A) cause recurring seasonal outbreaks in rural Northeast India following monsoon flooding and Brahmaputra inundation. Delayed reporting from remote tribal and island villages (e.g. Majuli) leads to preventable hospitalizations.",
      highlight: "SwasthyaJal NER bridges the last-mile gap by uniting field health workers, AI surveillance, and rapid sanitary response.",
      metrics: [
        { label: "Region Coverage", val: "8 Northeast States" },
        { label: "Monitored Nodes", val: "21+ Hotspot Villages" },
        { label: "Core Policy", val: "Surveillance, NOT Diagnosis" }
      ]
    },
    {
      title: "Step 1: Grassroots Offline-First Field Surveillance",
      tag: "ASHA & ANM Health Workers",
      icon: Users,
      content: "ASHA and ANM workers in remote hills and riverine chars log syndromic case counts and drinking water physical tests (turbidity, H2S vial coliform test). When internet is unavailable, submissions queue securely in local browser IndexedDB storage and auto-synchronize when network connectivity resumes.",
      highlight: "Includes permanent 🛡️ Disease Safety Guide with WHO-approved DOs/DONTs and 1-click Healthcare Facility emergency contacts.",
      metrics: [
        { label: "Offline Queue", val: "Auto-Sync on Online" },
        { label: "Water Parameters", val: "NTU, pH, H2S, Chlorine" },
        { label: "Reporting Velocity", val: "<60s Form Entry" }
      ]
    },
    {
      title: "Step 2: AI Outbreak Risk & Geospatial Cluster Engine",
      tag: "Random Forest + Haversine Geospatial",
      icon: Activity,
      content: "The backend Scikit-Learn Random Forest model integrates real-time syndromic velocity, 24h precipitation spikes, and water quality telemetry to predict a 0–100 risk score with explainable contributing drivers. Haversine distance spatial clustering flags multi-village clusters within a 25km radius in 48-72 hours.",
      highlight: "Zero black-box obscurity: Judges can inspect XAI Gini feature importance breakdown directly on the live Leaflet map.",
      metrics: [
        { label: "ML Engine", val: "Random Forest (n=100)" },
        { label: "Cluster Radius", val: "<25 km Multi-Village" },
        { label: "Explainability", val: "Real-time XAI Bar Chart" }
      ]
    },
    {
      title: "Step 3: Medical Officer Field Triage & IDSP Form S",
      tag: "Primary Health Centre (PHC) & Authority",
      icon: ShieldCheck,
      content: "PHC Medical Officers receive prioritized alerts for clinical investigation and water sampling. Upon verification, District Surveillance Officers confirm the alert and generate official Integrated Disease Surveillance Programme (IDSP Form S) outbreak dossiers with 1-click PDF/print export.",
      highlight: "Calculates emergency ORS sachet quotas and chlorine tablet disinfection requirements automatically based on village census.",
      metrics: [
        { label: "Government Form", val: "IDSP Form-S Export" },
        { label: "Logistics Forecast", val: "ORS & Chlorine Quota" },
        { label: "Citizen Alert", val: "Verified Advisories" }
      ]
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-teal-200 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 block">
                {step.tag}
              </span>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">{step.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0"
            title="Close Tour"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-700 dark:text-slate-200">
          <p className="text-xs sm:text-sm leading-relaxed font-normal">
            {step.content}
          </p>

          <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 font-semibold leading-relaxed flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>{step.highlight}</span>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {step.metrics.map((m, idx) => (
              <div key={idx} className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">{m.label}</span>
                <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5 block">{m.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === i ? 'w-6 bg-teal-600' : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center gap-1 hover:bg-slate-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
              >
                <span>Next Pillar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
              >
                <span>Start Exploring App</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
