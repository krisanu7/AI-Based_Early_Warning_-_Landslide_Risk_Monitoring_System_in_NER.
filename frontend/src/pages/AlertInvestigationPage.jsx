import React, { useState, useEffect } from 'react';
import { fieldReportsApi, alertsApi } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { IncidentVerificationModal } from '../components/modals/IncidentVerificationModal';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Megaphone, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export const AlertInvestigationPage = () => {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, aRes] = await Promise.all([
        fieldReportsApi.list(),
        alertsApi.list()
      ]);
      setReports(rRes.data || []);
      setAlerts(aRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenVerify = (item) => {
    setSelectedIncident(item);
    setVerifyModalOpen(true);
  };

  const filteredReports = reports.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Disaster Incident Investigation & Verification Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Human-in-the-Loop Triage & Warning Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Review ground scout field evidence, inspect photos, cross-examine AI risk signals, and publish authorized public warnings.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterStatus === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Reports ({reports.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING_VERIFICATION')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterStatus === 'PENDING_VERIFICATION'
              ? 'bg-amber-500 text-white'
              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          Pending Review ({reports.filter(r => r.status === 'PENDING_VERIFICATION').length})
        </button>
        <button
          onClick={() => setFilterStatus('VERIFIED')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterStatus === 'VERIFIED'
              ? 'bg-emerald-600 text-white'
              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          Verified Events ({reports.filter(r => r.status === 'VERIFIED').length})
        </button>
      </div>

      {/* Reports Investigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((rpt, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{rpt.id}</span>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {rpt.village}
                  </h3>
                  <p className="text-xs text-slate-500">{rpt.district}, {rpt.state}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  rpt.status === 'VERIFIED'
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 border border-amber-500/30 animate-pulse'
                }`}>
                  {rpt.status}
                </span>
              </div>

              {/* Photograph Evidence */}
              {rpt.photograph_url && (
                <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={rpt.photograph_url}
                    alt="Landslide Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-white font-mono">
                    📍 {rpt.latitude}° N, {rpt.longitude}° E
                  </div>
                </div>
              )}

              {/* Signs Badges */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {rpt.visible_cracks && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold">
                    Tension Cracks
                  </span>
                )}
                {rpt.soil_mud_movement && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold">
                    Active Mudflow
                  </span>
                )}
                {rpt.road_blocked && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                    Highway Blocked
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                "{rpt.field_notes || 'No description provided.'}"
              </p>

              <div className="text-[10px] text-slate-400 space-y-0.5">
                <div>Observed: <strong>{rpt.observation_date}</strong></div>
                <div>Scout: <strong>{rpt.reporter_name}</strong> ({rpt.reporter_role})</div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenVerify(rpt)}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.01]"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Verify & Broadcast Public Warning</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <IncidentVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        incident={selectedIncident}
        onVerified={fetchData}
      />

    </div>
  );
};
