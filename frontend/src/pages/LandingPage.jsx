import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Mountain, 
  Sparkles, 
  Map, 
  ShieldAlert, 
  Cpu, 
  CloudRain, 
  BellRing, 
  Truck, 
  Route, 
  ArrowRight,
  Globe2,
  WifiOff,
  CheckCircle2
} from 'lucide-react';

export const LandingPage = ({ onOpenSIHTour }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 border border-slate-800 text-white p-8 sm:p-14 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Smart India Hackathon 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            AI-Based Early Warning & Landslide Risk Monitoring for Northeast India
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A comprehensive geospatial surveillance and disaster early-warning ecosystem. Integrates multi-temporal rainfall surge radar, geological slope susceptibility AI, offline field surveys, and automated emergency response logistics across all 8 Northeast Indian states.
          </p>

          {/* Core Philosophy Badge */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur text-xs font-semibold text-rose-200">
            <strong>Core Principle:</strong> "AI detects and predicts landslide risk signals; authorized disaster management authorities make final warning and response decisions."
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Launch Command Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/map"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Map className="w-4 h-4 text-amber-400" />
              <span>Explore Live GIS Map</span>
            </Link>

            <button
              onClick={onOpenSIHTour}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>SIH Pitch Presentation</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Background Accents */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-16 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      </section>

      {/* 4 Pillars Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            The 4-Pillar Surveillance Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            End-to-end disaster risk reduction from mountain slope sensors to citizen voice broadcasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-base">
              01
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Detect & Ingest
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-temporal precipitation radar (1h/6h/24h/48h/72h) + offline-first IndexedDB field surveys (&lt;60s) from remote mountain scouts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-base">
              02
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Predict & Explain
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Random Forest Landslide Susceptibility & Trigger Model (93.4% accuracy) with Explainable AI (XAI) feature attribution inspector.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-base">
              03
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Cluster & Warn
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Haversine 25km danger corridor detection and multi-lingual citizen audio broadcasts in English, Assamese, Bengali, and Hindi.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-base">
              04
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Coordinate & Respond
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cascading impact analysis for roads (NH-27, NH-6, NH-29) and automated logistics quotas (SDRF teams, earthmovers, shelters).
            </p>
          </div>

        </div>
      </section>

      {/* 8 Northeast States Coverage Banner */}
      <section className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Full Northeast Regional Coverage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active geospatial nodes across all 8 northeastern states.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black">
            20+ Active Hotspot Nodes Live
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Assam (Dima Hasao)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Meghalaya (Khasi Hills)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Arunachal (Tawang)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sikkim (Gangtok-Teesta)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Nagaland (Kohima Pass)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Manipur (Tupul-Noney)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Mizoram (Aizawl Slopes)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tripura (Jampui Hills)</span>
          </div>
        </div>
      </section>

    </div>
  );
};
