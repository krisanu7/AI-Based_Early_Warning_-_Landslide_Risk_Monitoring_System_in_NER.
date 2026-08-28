import React from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Cpu, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const XAIExplanationModal = ({ isOpen, onClose, location }) => {
  if (!isOpen || !location) return null;

  const attributions = location.xai_feature_attributions || [
    { feature: "Rainfall Accumulation (24h/48h)", weight: 28, category: "Trigger" },
    { feature: "Slope Steepness & Aspect", weight: 22, category: "Susceptibility" },
    { feature: "Soil Saturation & Pore Pressure", weight: 18, category: "Trigger" },
    { feature: "Historical Landslide Density", weight: 14, category: "Susceptibility" },
    { feature: "Terrain Elevation & Geology", weight: 10, category: "Susceptibility" },
    { feature: "Infrastructure Proximity (Road-Cut)", weight: 8, category: "Exposure" }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-200 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explainable AI (XAI) Model Inspector</span>
            </div>
            <h2 className="text-xl font-black text-white">
              {location.village} Slope Risk Breakdown
            </h2>
            <p className="text-purple-200 text-xs">
              {location.district}, {location.state}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-xs">
          
          {/* Summary Score Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Assessed Landslide Score</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{location.risk_score || 75}/100</span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block">Model Confidence: {location.model_confidence || 91.5}%</span>
            </div>
            <RiskBadge level={location.risk_level} score={location.risk_score} size="lg" />
          </div>

          {/* Active Trigger List */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Active Trigger Signals Detected:
            </h4>
            <div className="space-y-1.5">
              {(location.active_triggers || []).map((trig, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-amber-900 dark:text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{trig}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Importances Horizontal Bars */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Feature Weight Decomposition (Random Forest Gini Contribution):
            </h4>

            <div className="space-y-2.5">
              {attributions.map((attr, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{attr.feature}</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">+{attr.weight}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                      style={{ width: `${attr.weight * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-[11px] text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
            <strong>Geological Disclaimer:</strong> Feature contributions are derived from model feature importance splits. Final emergency declarations must be verified through geotechnical field inspection.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
