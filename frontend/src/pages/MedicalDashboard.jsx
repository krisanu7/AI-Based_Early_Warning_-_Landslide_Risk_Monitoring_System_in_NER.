import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertsApi, riskApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { MetricCard } from '../components/common/MetricCard';
import { 
  Stethoscope, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  Sparkles,
  Layers,
  MapPin,
  Send
} from 'lucide-react';

export const MedicalDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [fieldFindings, setFieldFindings] = useState('Confirmed acute dehydration cases in under-5 cohort following well contamination.');
  const [recommendedStep, setRecommendedStep] = useState('CONFIRM');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const alertRes = await alertsApi.list();
      setAlerts(alertRes.data || []);
      const clusterRes = await riskApi.getClusters();
      setClusters(clusterRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvestigateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setSubmitLoading(true);
    try {
      await alertsApi.investigate({
        alert_id: selectedAlert.id,
        investigator_name: user?.name || 'Dr. Bhaskar Sarma',
        investigator_notes: investigationNotes,
        field_findings: fieldFindings,
        recommended_next_step: recommendedStep
      });
      setSelectedAlert(null);
      setInvestigationNotes('');
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to log investigation.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold uppercase">
            <Stethoscope className="w-3.5 h-3.5 text-blue-300" />
            <span>PHC / CHC Medical Officer Surveillance Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Clinical Triage & Field Investigation Portal
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm">
            Facility: <strong>{user?.facility_name || 'Garamur Primary Health Centre (PHC)'}</strong>
          </p>
        </div>

        <Link
          to="/alerts/investigation"
          className="px-5 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all shrink-0"
        >
          <span>Full Alert Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Field Alerts"
          value={alerts.filter(a => a.status === 'INVESTIGATION' || a.status === 'HIGH').length}
          subtitle="Pending Verification"
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          title="Suspected Multi-Village Clusters"
          value={clusters.length}
          subtitle="Spatial Proximity < 25km"
          icon={Layers}
          color="rose"
        />
        <MetricCard
          title="Confirmed Outbreaks"
          value={alerts.filter(a => a.status === 'CONFIRMED').length}
          subtitle="Public Advisories Active"
          icon={CheckCircle2}
          color="teal"
        />
      </div>

      {/* Suspected Clusters Radar */}
      {clusters.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
              <span>⚠️ Automated Spatial Cluster Anomaly Detected</span>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-200/60 px-2.5 py-0.5 rounded-full">
              {clusters.length} Cluster Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {clusters.map((c, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-rose-200 text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900">{c.cluster_id} — {c.district}, {c.state}</span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black">{c.total_cases} CASES</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{c.summary}</p>
                <div className="text-[10px] text-teal-800 font-semibold bg-teal-50 p-2 rounded-xl border border-teal-100">
                  Action: {c.recommended_action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Alerts Queue + Investigation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Active Alerts List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Outbreak Risk Signals Awaiting Clinical Review</span>
              </h2>
              <p className="text-xs text-slate-500">Click any alert card to conduct field investigation triage.</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => setSelectedAlert(alt)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                  selectedAlert?.id === alt.id
                    ? 'bg-teal-50/70 border-teal-500 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{alt.title}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      📍 {alt.village}, {alt.district} ({alt.state})
                    </span>
                  </div>
                  <RiskBadge level={alt.status === 'CONFIRMED' ? 'CONFIRMED' : alt.risk_level} score={alt.risk_score} />
                </div>

                {alt.contributing_factors && (
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    {alt.contributing_factors.slice(0, 2).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>Status: <strong className="text-slate-700">{alt.status}</strong></span>
                  <span className="text-teal-700 font-bold flex items-center gap-1">
                    <span>Investigate</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Investigation Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Field Verification Triage</span>
            </h3>
            <p className="text-xs text-slate-500">
              {selectedAlert ? `Investigating ${selectedAlert.id}` : 'Select an alert on the left to submit field findings.'}
            </p>
          </div>

          {selectedAlert ? (
            <form onSubmit={handleInvestigateSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Target Alert</div>
                <div className="font-bold text-slate-900">{selectedAlert.title}</div>
                <div className="text-[11px] text-teal-800 font-medium">
                  {selectedAlert.village}, {selectedAlert.district}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Clinical Findings & Stool/Water Samples</label>
                <textarea
                  rows={3}
                  required
                  value={fieldFindings}
                  onChange={(e) => setFieldFindings(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medical Officer Recommendation</label>
                <select
                  value={recommendedStep}
                  onChange={(e) => setRecommendedStep(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="CONFIRM">Recommend Outbreak Confirmation (Elevate to District Authority)</option>
                  <option value="CONTINUE_INVESTIGATION">Continue Active Syndromic Monitoring</option>
                  <option value="REJECT">Dismiss False Positive Signal / Isolated Baseline Event</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Action Notes</label>
                <textarea
                  rows={2}
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="e.g. Distributed 500 ORS packets and initiated super-chlorination of Garamur public well."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 transition-all text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{submitLoading ? 'Recording...' : 'Submit Field Investigation Record'}</span>
              </button>
            </form>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Stethoscope className="w-8 h-8 mx-auto text-slate-300" />
              <p>Select any high-risk outbreak alert from the list to log field findings.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
