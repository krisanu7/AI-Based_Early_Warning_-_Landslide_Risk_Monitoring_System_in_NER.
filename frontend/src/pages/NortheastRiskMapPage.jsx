import React from 'react';
import { NortheastRiskMap } from '../components/map/NortheastRiskMap';
import { Activity, ShieldCheck, MapPin } from 'lucide-react';

export const NortheastRiskMapPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold uppercase">
            <Activity className="w-3.5 h-3.5 text-teal-300" />
            <span>Interactive GIS Surveillance Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Northeast India Water-Borne Disease Risk Map
          </h1>
          <p className="text-teal-100/90 text-xs sm:text-sm">
            Live surveillance map covering 8 States: Assam, Meghalaya, Arunachal Pradesh, Manipur, Mizoram, Nagaland, Tripura, and Sikkim.
          </p>
        </div>

        <div className="text-right text-xs text-teal-200 bg-white/10 p-3 rounded-2xl border border-white/20">
          <div>🟢 Low (0-30) • 🟡 Med (31-60)</div>
          <div>🟠 High (61-80) • 🔴 Confirmed (81-100)</div>
        </div>
      </div>

      {/* Main Fullscreen Interactive Map */}
      <NortheastRiskMap height="680px" showControls={true} />

    </div>
  );
};
