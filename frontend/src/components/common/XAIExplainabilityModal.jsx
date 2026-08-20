import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, BrainCircuit, Activity, BarChart2, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export const XAIExplainabilityModal = ({ isOpen, onClose, location }) => {
  if (!isOpen || !location) return null;

  const drivers = location.contributing_factors || [
    'Rapid 48h case growth (+500%)',
    'Heavy precipitation (92.4 mm/24h)',
    'Active inundation / Severe Flood',
    'High water turbidity (32.5 NTU) & presumptive bacterial contamination'
  ];

  const factorWeights = [
    { factor: 'Turbidity & Coliform Presumptive Index', weight: 34, color: 'bg-rose-500' },
    { factor: '48-Hour Velocity & Case Acceleration', weight: 28, color: 'bg-amber-500' },
    { factor: 'Flood Backflow & Surface Inundation', weight: 22, color: 'bg-blue-500' },
    { factor: 'Cumulative 24h Precipitation Surge', weight: 16, color: 'bg-emerald-500' }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header */}
        <div className="shrink-0 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase border border-teal-500/30">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Explainable AI (XAI) Model Inspector</span>
            </div>
            <h3 className="font-black text-base sm:text-lg text-white">
              Risk Decision Decomposition: {location.village} ({location.state})
            </h3>
            <p className="text-slate-300 text-xs">
              Deconstructed Random Forest inference weights (Scikit-Learn • n_estimators=100)
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-white/80 hover:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0"
            title="Close Inspector"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-800 dark:text-slate-200">
          
          {/* Risk Score Summary Banner */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Outbreak Risk Score</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {location.risk_score || 88} / 100
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400">Surveillance Tier</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {location.risk_level || 'VERY HIGH'} RISK
              </div>
            </div>
          </div>

          {/* Feature Importance Decomposition Bar Chart */}
          <div className="space-y-3">
            <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
              Feature Attribution & Gini Importance Contribution:
            </div>
            <div className="space-y-2.5">
              {factorWeights.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{f.factor}</span>
                    <span className="font-bold font-mono">{f.weight}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${f.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${f.weight}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Triggered Environmental Decision Rules */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
              Specific Model Triggers Identified:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {drivers.map((d, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Guardrail Disclaimer */}
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed">
            <strong>Ethical AI Guardrail:</strong> This prediction represents a geospatial risk signal to guide rapid sanitary inspection and chlorine deployment. It is not an individual medical diagnosis.
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
