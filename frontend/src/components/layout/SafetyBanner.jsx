import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const SafetyBanner = () => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4 flex items-center justify-between shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold uppercase tracking-wider text-[10px] border border-teal-500/30">
            <Info className="w-3 h-3" /> Core Principle
          </span>
          <span className="font-medium text-slate-200">
            &ldquo;AI detects the signal; healthcare professionals make the decision.&rdquo;
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Surveillance risk signals for authorized triage — strictly no automated clinical diagnosis or medicine prescriptions.</span>
        </div>
      </div>
    </div>
  );
};
