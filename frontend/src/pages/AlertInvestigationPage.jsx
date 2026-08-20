import React, { useState, useEffect } from 'react';
import { alertsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Radio, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

export const AlertInvestigationPage = () => {
  const { user, isAuthority, isDoctor, isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertsApi.list({ status_filter: filterStatus !== 'ALL' ? filterStatus : undefined });
      setAlerts(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-300" />
            <span>Alert Lifecycle Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Outbreak Risk Alert & Investigation Protocol
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Standard workflow: LOW → MEDIUM → HIGH/SUSPECTED → INVESTIGATION → CONFIRMED → PUBLIC WARNING → CLOSED
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filter Alert Status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'HIGH', 'INVESTIGATION', 'CONFIRMED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === st
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Surveillance Incident Log</h2>
          <span className="text-xs text-slate-400">{alerts.length} Incidents</span>
        </div>

        <div className="divide-y divide-slate-100">
          {alerts.map((alt) => (
            <div key={alt.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {alt.id}
                  </span>
                  <RiskBadge level={alt.status === 'CONFIRMED' ? 'CONFIRMED' : alt.risk_level} score={alt.risk_score} size="sm" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{alt.title}</h3>
                <div className="text-[11px] text-slate-500 font-medium">
                  📍 {alt.village}, {alt.district} ({alt.state}) • Cases: <strong>{alt.total_cases || 0}</strong>
                </div>
                {alt.investigation_notes && (
                  <p className="text-[11px] text-slate-600 bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                    <strong>Investigation Log:</strong> {alt.investigation_notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-[11px]">
                  <span className="block font-bold text-slate-700">Status: {alt.status}</span>
                  <span className="text-slate-400">{alt.created_at?.split('T')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
