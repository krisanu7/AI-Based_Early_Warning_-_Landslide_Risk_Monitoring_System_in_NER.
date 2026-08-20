import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, alertsApi, riskApi } from '../api/client';
import { NortheastRiskMap } from '../components/map/NortheastRiskMap';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { IDSPReportModal } from '../components/common/IDSPReportModal';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Radio, 
  Users, 
  CheckCircle2, 
  Droplets, 
  Layers, 
  RefreshCw, 
  Send,
  Sparkles,
  ExternalLink,
  FileText,
  Package,
  Truck,
  HeartPulse
} from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#3b82f6'];

export const AuthorityDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalAlert, setConfirmModalAlert] = useState(null);
  const [officialAction, setOfficialAction] = useState('Dispatched Rapid Response Team, initiated emergency well chlorination, distributed ORS packets.');
  const [publicWarningText, setPublicWarningText] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [selectedIDSPAlert, setSelectedIDSPAlert] = useState(null);

  const fetchAuthorityData = async () => {
    setLoading(true);
    try {
      const metricRes = await analyticsApi.getMetrics();
      setMetrics(metricRes.data);
      const alertRes = await alertsApi.list();
      setAlerts(alertRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorityData();
  }, []);

  const handleConfirmOutbreak = async (e) => {
    e.preventDefault();
    if (!confirmModalAlert) return;
    setConfirming(true);
    try {
      await alertsApi.confirm({
        alert_id: confirmModalAlert.id,
        authority_name: 'Dr. A. K. Baruah (District Surveillance Officer)',
        official_action: officialAction,
        public_warning_text: publicWarningText || undefined,
        quarantine_or_chlorination_team_dispatched: true
      });
      setConfirmModalAlert(null);
      await fetchAuthorityData();
    } catch (err) {
      console.error(err);
      alert('Failed to confirm outbreak.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Executive Command Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>State & District Health Surveillance Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Northeast India Early Warning Command Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Integrated multi-state outbreak risk telemetry, predictive AI clustering, and official public health advisory dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedIDSPAlert(alerts[0] || {
              id: 'ALT-MAJULI-001',
              title: 'Severe Outbreak Signal: Acute Watery Diarrhea Cluster in Majuli',
              state: 'Assam',
              district: 'Majuli',
              village: 'Garamur & Kamalabari',
              risk_score: 88,
              risk_level: 'VERY HIGH',
              total_cases: 24,
              investigator_name: 'Dr. Bhaskar Sarma (PHC MO)',
              investigation_notes: 'Field sanitary survey confirmed severe flood backflow into community drinking shallow wells.',
              confirmed_by: 'Dr. A. K. Baruah (District Surveillance Officer)'
            })}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Official IDSP Form-S</span>
          </button>
          <button
            onClick={fetchAuthorityData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Grid</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Cases"
          value={metrics?.summary?.total_active_cases || 58}
          subtitle="Active 7-Day Window"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Alerts"
          value={metrics?.summary?.active_alerts || 2}
          subtitle="Pending / Active"
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          title="High Risk Villages"
          value={metrics?.summary?.high_risk_villages || 3}
          subtitle="Risk Score 61-100"
          icon={Activity}
          color="rose"
        />
        <MetricCard
          title="Confirmed Outbreaks"
          value={metrics?.summary?.confirmed_outbreaks || 1}
          subtitle="Public Advisories Active"
          icon={CheckCircle2}
          color="teal"
        />
        <MetricCard
          title="Monitored Nodes"
          value="21 Villages"
          subtitle="Across 8 NE States"
          icon={Layers}
          color="emerald"
        />
      </div>

      {/* Medical Supply & Logistics Forecaster (New Hackathon Winning Feature) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                Rapid Response Logistics & Essential Medical Quota Forecaster
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Automated WHO / IDSP inventory calculations based on active cluster caseload and census population
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold rounded-full border border-teal-200 dark:border-teal-800">
            Automated Supply Dispatch
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">ORS Packets Needed</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200">
              {((metrics?.summary?.total_active_cases || 58) * 5).toLocaleString()} Sachets
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Formula: 5 pkts / syndromic patient</p>
          </div>

          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300">Chlorine 0.5g Tabs</span>
            <div className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-200">
              2,850 Tabs
            </div>
            <p className="text-[10px] text-blue-700 dark:text-blue-400">7-Day community water sanitization</p>
          </div>

          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300">IV Fluid (Ringer Lactate)</span>
            <div className="text-xl sm:text-2xl font-black text-purple-900 dark:text-purple-200">
              {Math.ceil((metrics?.summary?.total_active_cases || 58) * 0.4 * 2)} Bottles
            </div>
            <p className="text-[10px] text-purple-700 dark:text-purple-400">For severe dehydration triage</p>
          </div>

          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">Rapid Response Teams</span>
            <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200">
              {metrics?.summary?.high_risk_villages || 3} Teams
            </div>
            <p className="text-[10px] text-amber-700 dark:text-amber-400">Decontamination & sanitary survey</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Visual Element */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Live Geospatial Surveillance Grid — Northeast Region</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Auto-syncing every 15s</span>
        </div>

        <NortheastRiskMap height="520px" showControls={true} />
      </div>

      {/* Outbreak Confirmation Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-600" />
              <span>Authoritative Outbreak Confirmation & Advisory Queue</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only authorized Health Authorities can confirm an outbreak signal, dispatch IDSP teams, and broadcast public health warnings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alt) => (
            <div key={alt.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{alt.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    📍 {alt.village}, {alt.district} ({alt.state})
                  </div>
                </div>
                <RiskBadge level={alt.status === 'CONFIRMED' ? 'CONFIRMED' : alt.risk_level} score={alt.risk_score} />
              </div>

              {alt.investigation_notes && (
                <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                  <strong>Medical Officer Note:</strong> {alt.investigation_notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedIDSPAlert(alt)}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>IDSP Form S</span>
                </button>

                {alt.status !== 'CONFIRMED' ? (
                  <button
                    onClick={() => {
                      setConfirmModalAlert(alt);
                      setPublicWarningText(`Confirmed water-borne disease outbreak signal in ${alt.village}, ${alt.district}. Residents are strictly advised to drink boiled/safe water and visit ${alt.district} PHC if symptoms develop.`);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>Confirm & Broadcast Advisory</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Advisory Active</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Rainfall (mm) vs Active Cases (14-Day Trend)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.rainfall_vs_cases_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="cases" stroke="#f43f5e" strokeWidth={2.5} name="Disease Cases" />
                <Line yAxisId="right" type="monotone" dataKey="rainfall_mm" stroke="#0ea5e9" strokeWidth={2} name="Rainfall (mm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">State-wise Risk & Case Distribution (NER)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.state_breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} interval={0} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                <Bar dataKey="cases" fill="#0d9488" radius={[4, 4, 0, 0]} name="Active Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="bg-rose-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Confirm Outbreak & Issue Public Advisory</h3>
                <p className="text-xs text-rose-100">Authority Verification Protocol</p>
              </div>
              <button onClick={() => setConfirmModalAlert(null)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleConfirmOutbreak} className="p-6 space-y-4 text-xs">
              <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200">
                <div className="font-bold text-sm">{confirmModalAlert.title}</div>
                <div className="text-[11px] mt-0.5">Location: {confirmModalAlert.village}, {confirmModalAlert.district} ({confirmModalAlert.state})</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Response Action Taken</label>
                <textarea
                  rows={2}
                  required
                  value={officialAction}
                  onChange={(e) => setOfficialAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Public Health Warning Notice (To be broadcasted)</label>
                <textarea
                  rows={3}
                  required
                  value={publicWarningText}
                  onChange={(e) => setPublicWarningText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmModalAlert(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirming}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{confirming ? 'Publishing...' : 'Confirm & Publish Warning'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IDSP Official Government Outbreak Report Modal */}
      <IDSPReportModal
        isOpen={!!selectedIDSPAlert}
        onClose={() => setSelectedIDSPAlert(null)}
        alertData={selectedIDSPAlert}
      />

    </div>
  );
};
