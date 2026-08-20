import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { casesApi, waterApi, riskApi } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { MetricCard } from '../components/common/MetricCard';
import { getOfflineQueue } from '../utils/offlineQueue';
import {   
  ClipboardList, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Save, 
  Send,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

const SYMPTOM_OPTIONS = [
  "Acute Watery Diarrhea",
  "Severe Vomiting",
  "Stomach Cramps",
  "High Fever",
  "Dehydration & Lethargy",
  "Bloody Stool / Dysentery",
  "Nausea"
];

export const AshaDashboard = () => {
  const { user, isOnline, offlinePendingCount, manualSync, refreshOfflineCount } = useAuth();
  
  const [formData, setFormData] = useState({
    state: user?.state || 'Assam',
    district: user?.district || 'Majuli',
    village: user?.village || 'Garamur',
    date: new Date().toISOString().split('T')[0],
    symptoms: ["Acute Watery Diarrhea", "Severe Vomiting"],
    approx_cases: 3,
    age_group: '0-5',
    water_source: 'River/Stream',
    sanitation_status: 'Poor Sanitation',
    water_environment_notes: '',
    latitude: 26.9634,
    longitude: 94.2144
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [villageRisk, setVillageRisk] = useState(null);

  const fetchRecent = async () => {
    try {
      const res = await casesApi.list({ village: user?.village || 'Garamur' });
      setRecentReports(res.data || []);
      const mapRes = await riskApi.getMapData({ district: user?.district || 'Majuli' });
      const currentLoc = mapRes.data.locations?.find(l => l.village === (user?.village || 'Garamur'));
      setVillageRisk(currentLoc);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [user]);

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter(s => s !== symptom) : [...prev.symptoms, symptom]
      };
    });
  };

  const handleSubmitCase = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await casesApi.report(formData);
      refreshOfflineCount();
      
      if (res.data?.offline) {
        setSubmissionResult({
          offline: true,
          message: 'Saved to local device offline storage. Will automatically synchronize when online.'
        });
      } else {
        setSubmissionResult({
          success: true,
          risk_score: res.data.risk_score,
          risk_level: res.data.risk_level,
          factors: res.data.contributing_factors,
          message: res.data.message
        });
        await fetchRecent();
      }

      // Reset partial form
      setFormData(prev => ({
        ...prev,
        approx_cases: 1,
        water_environment_notes: ''
      }));
    } catch (err) {
      console.error(err);
      setSubmissionResult({
        error: true,
        message: 'Failed to submit report. Please check local connectivity.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold uppercase">
            <ClipboardList className="w-3.5 h-3.5 text-teal-300" />
            <span>Field Surveillance Unit (ASHA / ANM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Grassroots Community Case Reporting
          </h1>
          <p className="text-teal-100/90 text-xs sm:text-sm">
            Assigned Village: <strong>{user?.village || 'Garamur'}</strong>, {user?.district || 'Majuli'} ({user?.state || 'Assam'})
          </p>
        </div>

        {/* Offline Queue Status Card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 flex items-center gap-4 shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-teal-200">Offline Queue</div>
            <div className="font-bold text-sm text-white">{offlinePendingCount} Reports Pending</div>
          </div>
          {offlinePendingCount > 0 && (
            <button
              onClick={manualSync}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Assigned Village Risk"
          value={villageRisk ? `${villageRisk.risk_score}/100` : '28/100'}
          subtitle={villageRisk?.risk_level || 'LOW'}
          icon={ShieldAlert}
          color={villageRisk?.risk_level === 'HIGH' ? 'rose' : 'teal'}
        />
        <MetricCard
          title="Recent Active Cases"
          value={villageRisk?.active_cases || recentReports.reduce((acc, r) => acc + (r.approx_cases || 0), 0) || 4}
          subtitle="48-Hour Syndromic Window"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Water Quality Status"
          value={villageRisk?.water_quality || 'Clean'}
          subtitle={`Turbidity: ${villageRisk?.turbidity_ntu || 4.2} NTU`}
          icon={Droplets}
          color="amber"
        />
      </div>

      {/* Main Grid: Case Form + Result / Field Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Case Submission Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>New Community Health Case Report</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit aggregated syndromic symptoms and environmental conditions for AI outbreak-risk evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmitCase} className="space-y-4 text-xs">
            
            {/* Location Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Village</label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Date & Approx Case Count & Age Group */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Observation Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Approx. Case Count</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.approx_cases}
                  onChange={(e) => setFormData({ ...formData, approx_cases: parseInt(e.target.value) || 1 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-black text-sm shadow-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary Age Group</label>
                <select
                  value={formData.age_group}
                  onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm focus:ring-2 focus:ring-teal-500"
                >
                  <option value="0-5">0 - 5 Years (Infants / Toddlers)</option>
                  <option value="6-18">6 - 18 Years (Children / Teens)</option>
                  <option value="19-50">19 - 50 Years (Adults)</option>
                  <option value="50+">50+ Years (Elderly)</option>
                </select>
              </div>
            </div>

            {/* Symptoms Multi-Select */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Observed Syndromic Symptoms (Select all matching)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYMPTOM_OPTIONS.map((sym) => {
                  const isChecked = formData.symptoms.includes(sym);
                  return (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => handleSymptomToggle(sym)}
                      className={`p-2.5 rounded-xl text-[11px] font-bold text-left border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-200 shadow-sm ring-1 ring-teal-500/50'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span>{sym}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Water Source & Sanitation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary Drinking Water Source</label>
                <select
                  value={formData.water_source}
                  onChange={(e) => setFormData({ ...formData, water_source: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Handpump">Community Handpump</option>
                  <option value="Tube Well">Deep Tube Well</option>
                  <option value="River/Stream">River / Stream / Jharna</option>
                  <option value="Open Pond">Open Village Pond / Ring Well</option>
                  <option value="Piped Supply">Piped Tap Water (Jal Jeevan Mission)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Sanitation & Runoff Condition</label>
                <select
                  value={formData.sanitation_status}
                  onChange={(e) => setFormData({ ...formData, sanitation_status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Poor Sanitation">Poor Sanitation / Flood Inundation</option>
                  <option value="Pit Latrine">Pit Latrine near water source</option>
                  <option value="Open Defecation Free">Open Defecation Free (ODF)</option>
                </select>
              </div>
            </div>

            {/* Water / Environment Notes */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Field Observations & Environmental Context</label>
              <textarea
                rows={2}
                value={formData.water_environment_notes}
                onChange={(e) => setFormData({ ...formData, water_environment_notes: e.target.value })}
                placeholder="e.g. Brahmaputra backflow caused turbid waterlogging near Garamur school handpump."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 text-xs shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold rounded-2xl shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 transition-all text-xs hover:scale-[1.01] active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Evaluating AI Risk Engine...' : 'Submit Case Report to Health Grid'}</span>
            </button>
          </form>
        </div>

        {/* Right 5 Cols: AI Risk Feedback & Recent Village Logs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Submission Result / Live AI Risk Score Output */}
          {submissionResult && (
            <div className={`p-6 rounded-3xl border shadow-sm space-y-3 animate-in fade-in ${
              submissionResult.offline 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
                : 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-800'
            }`}>
              <div className="flex items-start justify-between">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>AI Risk Engine Output</span>
                </div>
                {!submissionResult.offline && (
                  <RiskBadge level={submissionResult.risk_level} score={submissionResult.risk_score} />
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {submissionResult.message}
              </p>
              {submissionResult.factors && (
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">Key Risk Drivers:</span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5 text-[11px]">
                    {submissionResult.factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recent Reports in Village */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Village Case Logs</h3>
              <span className="text-[11px] text-slate-400">{recentReports.length} records</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {recentReports.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-6">
                  No previous case logs recorded for this village.
                </div>
              ) : (
                recentReports.map((rep, idx) => (
                  <div key={idx} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-xs space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{rep.village} ({rep.approx_cases} Cases)</span>
                      <span className="text-[10px] text-slate-400 font-mono">{rep.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      Symptoms: {Array.isArray(rep.symptoms) ? rep.symptoms.join(', ') : rep.symptoms}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-teal-700 dark:text-teal-400 font-semibold pt-1">
                      <span>Source: {rep.water_source}</span>
                      <span>•</span>
                      <span>Age: {rep.age_group}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
