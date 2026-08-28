import React, { useState, useEffect } from 'react';
import { evacuationApi } from '../api/client';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  CheckCircle2, 
  Navigation, 
  RefreshCw 
} from 'lucide-react';

export const EvacuationDirectoryPage = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const res = await evacuationApi.listShelters();
      setShelters(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Designated Safe Evacuation Shelters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Northeast Safe Shelter & Relief Camp Directory
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl">
            Pre-designated high-elevation indoor stadiums, secondary school halls, and cyclone/flood shelters equipped with backup generators, potable water, and medical triage.
          </p>
        </div>

        <button
          onClick={fetchShelters}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Shelters</span>
        </button>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shelters.map((sh, idx) => {
          const occupancyPct = Math.round(((sh.current_occupancy || 0) / (sh.capacity || 1)) * 100);
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-black">
                    {sh.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {occupancyPct}% Full
                  </span>
                </div>

                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {sh.name}
                </h3>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{sh.district}, {sh.state}</span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Occupancy:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {sh.current_occupancy || 0} / {sh.capacity} persons
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${occupancyPct > 80 ? 'bg-rose-500' : (occupancyPct > 50 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Facilities Available:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {sh.facilities || 'Potable water, solar generator, medical post.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-mono text-[11px] truncate max-w-[170px]">{sh.contact}</span>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${sh.latitude},${sh.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Route</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
