import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { riskApi, alertsApi } from '../api/client';
import { NortheastRiskMap } from '../components/map/NortheastRiskMap';
import { RiskBadge } from '../components/common/RiskBadge';
import { 
  ShieldCheck, 
  Activity, 
  Droplets, 
  WifiOff, 
  Radio, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Cpu, 
  Hospital, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const [summary, setSummary] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const mapRes = await riskApi.getMapData();
        setSummary(mapRes.data.summary);
        const warnRes = await alertsApi.getPublicWarnings();
        setWarnings(warnRes.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-4xl space-y-5">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Smart India Hackathon 2026
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Live Surveillance Grid: 8 Northeast States
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Smart Community Health & Early Warning System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Water-Borne Diseases</span> in Rural Northeast India
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Empowering grassroots ASHA/ANM health workers, PHC Medical Officers, and District Surveillance Units with predictive Random Forest ML risk signals, flood & water quality telemetry, spatial cluster detection, and resilient offline synchronization.
          </p>

          {/* Golden Rule Banner */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur max-w-2xl text-xs sm:text-sm text-teal-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold mb-0.5">Foundational Design Principle:</strong>
              &ldquo;AI detects the signal; healthcare professionals make the decision.&rdquo; AI provides outbreak-risk signals for authorized investigation without individual clinical diagnosis or prescription of medicines.
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              to="/dashboard/asha"
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <span>Access Surveillance Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/disease-safety-guide"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>🛡️ Disease Safety Guide</span>
            </Link>
            <Link
              to="/public-warnings"
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold text-xs sm:text-sm transition-all border border-slate-700"
            >
              Public Health Warnings ({warnings.length})
            </Link>
          </div>

        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Live Verified Warnings Ticker if any active */}
      {warnings.length > 0 && (
        <section className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
              <span>OFFICIAL PUBLIC HEALTH WARNING IN EFFECT</span>
            </div>
            <Link to="/public-warnings" className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1">
              <span>View All Advisories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {warnings.slice(0, 1).map((w) => (
            <div key={w.id} className="p-3.5 bg-white rounded-2xl border border-rose-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] uppercase font-black">CONFIRMED OUTBREAK</span>
                <span>{w.headline}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{w.message}</p>
              <div className="text-[11px] text-slate-500 font-medium pt-1 flex items-center gap-3">
                <span>Coverage: <strong>{w.area_covered}</strong></span>
                <span>Emergency: <strong className="text-rose-700">{w.emergency_contact}</strong></span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Live Northeast India Risk Map */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <span>Live Northeast India Geospatial Risk Grid</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Real-time village monitoring across Assam, Meghalaya, Arunachal Pradesh, Manipur, Mizoram, Nagaland, Tripura, and Sikkim</p>
          </div>
          <Link to="/map" className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">
            <span>Fullscreen GIS Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <NortheastRiskMap height="520px" showControls={true} />
      </section>

      {/* 8-Step System Architecture Flow */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            End-to-End Surveillance Lifecycle
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">How SwasthyaJal NER Operates</h2>
          <p className="text-xs text-slate-500 font-medium">Autonomous risk detection with strict human-in-the-loop medical authority confirmation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">1</div>
            <h3 className="font-bold text-slate-900">Grassroots Reporting</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              ASHA/ANM workers submit village syndromic counts and water quality tests with offline queueing support.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">2</div>
            <h3 className="font-bold text-slate-900">Telemetry & Cluster Engine</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              FastAPI backend aggregates rainfall mm, flood status, water turbidity, and geospatial multi-village cluster overlaps.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">3</div>
            <h3 className="font-bold text-slate-900">AI Risk Prediction (0–100)</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Random Forest model predicts outbreak risk score, classifying severity into Low, Medium, High, or Very High with explainable factors.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">4</div>
            <h3 className="font-bold text-slate-900">Medical Triage & Public Warning</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              PHC Medical Officer inspects field, Health Authority confirms alert, and verified public advisory broadcasts to citizens.
            </p>
          </div>

        </div>
      </section>

      {/* Role Personas Quick Access Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900">Role-Based System Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link to="/dashboard/asha" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded border border-teal-200">ASHA / ANM</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mt-3">Community Health Worker Portal</h3>
            <p className="text-slate-500 text-xs mt-1">Submit village case logs, record water source quality, and utilize offline sync storage.</p>
          </Link>

          <Link to="/dashboard/medical" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold rounded border border-blue-200">PHC / CHC DOCTOR</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mt-3">Medical Staff Triage</h3>
            <p className="text-slate-500 text-xs mt-1">Review AI risk signals, verify symptom patterns, and dispatch rapid response teams.</p>
          </Link>

          <Link to="/dashboard/authority" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-800 text-[10px] font-bold rounded border border-indigo-200">HEALTH AUTHORITY</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mt-3">District/State Surveillance</h3>
            <p className="text-slate-500 text-xs mt-1">Multi-district GIS map, outbreak confirmation workflow, and public advisory broadcasting.</p>
          </Link>

        </div>
      </section>

    </div>
  );
};
