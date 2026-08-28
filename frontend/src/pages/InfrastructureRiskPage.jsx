import React, { useState, useEffect } from 'react';
import { infrastructureApi } from '../api/client';
import { 
  Route, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  RefreshCw,
  Building,
  Hospital
} from 'lucide-react';

export const InfrastructureRiskPage = () => {
  const [infrastructure, setInfrastructure] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInfra = async () => {
    try {
      setLoading(true);
      const res = await infrastructureApi.list();
      setInfrastructure(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfra();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await infrastructureApi.updateStatus(id, { status: newStatus });
      fetchInfra();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase">
            <Route className="w-3.5 h-3.5" />
            <span>Critical Transport & Arterial Grid Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            National Highway & Lifeline Vulnerability Matrix
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl">
            Real-time status of critical Northeast transport arteries (NH-27, NH-6, NH-29, NH-10), railway tunnels, bridges, and bypass routes.
          </p>
        </div>

        <button
          onClick={fetchInfra}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Arteries</span>
        </button>
      </div>

      {/* Infrastructure Nodes Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infrastructure.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {item.type}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  item.status === 'BLOCKED'
                    ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30 animate-pulse'
                    : (item.status === 'VULNERABLE' ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30')
                }`}>
                  {item.status}
                </span>
              </div>

              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {item.name}
              </h3>
              
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{item.district}, {item.state}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Alternative Bypass Route:</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {item.alternative_route || 'Standard bypass available.'}
                </p>
              </div>
            </div>

            {/* Quick Status Toggles for Control Room */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
              <button
                onClick={() => handleUpdateStatus(item.id, 'OPERATIONAL')}
                className={`flex-1 py-1.5 rounded-xl font-bold border text-[11px] transition-all ${
                  item.status === 'OPERATIONAL'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                Clear
              </button>
              <button
                onClick={() => handleUpdateStatus(item.id, 'VULNERABLE')}
                className={`flex-1 py-1.5 rounded-xl font-bold border text-[11px] transition-all ${
                  item.status === 'VULNERABLE'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                At Risk
              </button>
              <button
                onClick={() => handleUpdateStatus(item.id, 'BLOCKED')}
                className={`flex-1 py-1.5 rounded-xl font-bold border text-[11px] transition-all ${
                  item.status === 'BLOCKED'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                Blocked
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
