import React, { useState, useEffect } from 'react';
import { dashboardApi, mapApi, predictionsApi } from '../api/client';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { LandslideRiskDetector } from '../components/common/LandslideRiskDetector';
import { NERLandslideMap } from '../components/map/NERLandslideMap';
import { XAIExplanationModal } from '../components/modals/XAIExplanationModal';
import { IncidentVerificationModal } from '../components/modals/IncidentVerificationModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  CloudRain, 
  Users, 
  Mountain, 
  Route, 
  Sparkles, 
  BellRing, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Trash2,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  FileCode,
  CheckCircle2
} from 'lucide-react';

import { Link } from 'react-router-dom';

export const MainDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [mapData, setMapData] = useState({ locations: [], clusters: [], infrastructure: [], evacuation_centers: [] });
  const [storedRiskRecords, setStoredRiskRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [xaiModalOpen, setXaiModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [incidentToVerify, setIncidentToVerify] = useState(null);

  // Database Search, Filter & Pagination state
  const [dbSearch, setDbSearch] = useState('');
  const [dbCategory, setDbCategory] = useState('ALL');
  const [dbSort, setDbSort] = useState('NEWEST');
  const [dbPage, setDbPage] = useState(1);
  const rowsPerPage = 10;

  const fetchRiskRecords = async () => {
    try {
      const res = await predictionsApi.getRecords();
      setStoredRiskRecords(res.data || []);
    } catch (e) {
      console.error('Failed to load stored landslide_risk records', e);
    }
  };

  const handleClearRiskRecords = async () => {
    if (window.confirm('Are you sure you want to clear all saved landslide risk detection records from MongoDB?')) {
      try {
        await predictionsApi.clearRecords();
        setStoredRiskRecords([]);
      } catch (e) {
        console.error('Failed to clear landslide_risk records', e);
      }
    }
  };

  const handleExportCSV = () => {
    if (!storedRiskRecords || storedRiskRecords.length === 0) {
      alert('No risk records available to export.');
      return;
    }
    const headers = [
      'Record_ID',
      'Timestamp_UTC',
      'Risk_Level',
      'Risk_Score_Pct',
      'Confidence_Pct',
      'Rainfall_24h_mm',
      'Slope_Angle_Deg',
      'Soil_Saturation',
      'Vegetation_Cover',
      'Earthquake_Activity',
      'Proximity_to_Water_m',
      'Detected_By'
    ];
    const rows = filteredRecords.map(r => {
      const p = r.input_parameters || {};
      return [
        `"${r.id || ''}"`,
        `"${r.created_at || ''}"`,
        `"${r.risk_level_code || r.risk_level || ''}"`,
        r.risk_score || 0,
        r.model_confidence || 90,
        p.Rainfall_mm || 0,
        p.Slope_Angle || 0,
        p.Soil_Saturation || 0,
        p.Vegetation_Cover || 0,
        p.Earthquake_Activity || 0,
        p.Proximity_to_Water || 0,
        `"${r.detected_by || 'Public Citizen'}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `landslide_ai_risk_database_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!storedRiskRecords || storedRiskRecords.length === 0) {
      alert('No risk records available to export.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `landslide_ai_database_records_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };


  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, mapRes, recRes] = await Promise.all([
        dashboardApi.getSummary(),
        mapApi.getRiskNodes(),
        predictionsApi.getRecords()
      ]);
      setSummary(dashRes.data);
      setMapData(mapRes.data);
      setStoredRiskRecords(recRes.data || []);
      if (mapRes.data?.locations?.length > 0) {
        setSelectedLocation(mapRes.data.locations[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute filtered, sorted, and paginated records for Permanent AI Risk Database
  const filteredRecords = storedRiskRecords.filter(rec => {
    const matchesCategory = 
      dbCategory === 'ALL' ||
      (dbCategory === 'CRITICAL' && (rec.risk_score >= 81 || (rec.risk_level && rec.risk_level.includes('Critical')))) ||
      (dbCategory === 'HIGH' && rec.risk_score >= 61 && rec.risk_score < 81) ||
      (dbCategory === 'MODERATE' && rec.risk_score >= 31 && rec.risk_score < 61) ||
      (dbCategory === 'LOW' && rec.risk_score < 31);

    if (!matchesCategory) return false;

    if (!dbSearch.trim()) return true;
    const q = dbSearch.toLowerCase();
    const paramsStr = JSON.stringify(rec.input_parameters || {}).toLowerCase();
    const userStr = (rec.detected_by || '').toLowerCase();
    const levelStr = (rec.risk_level || '').toLowerCase();
    const idStr = (rec.id || '').toLowerCase();
    return paramsStr.includes(q) || userStr.includes(q) || levelStr.includes(q) || idStr.includes(q);
  }).sort((a, b) => {
    if (dbSort === 'NEWEST') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (dbSort === 'OLDEST') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (dbSort === 'HIGHEST') return (b.risk_score || 0) - (a.risk_score || 0);
    if (dbSort === 'LOWEST') return (a.risk_score || 0) - (b.risk_score || 0);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const paginatedRecords = filteredRecords.slice((dbPage - 1) * rowsPerPage, dbPage * rowsPerPage);

  const avgRiskScore = filteredRecords.length > 0 
    ? Math.round(filteredRecords.reduce((acc, r) => acc + (r.risk_score || 0), 0) / filteredRecords.length) 
    : 0;
  
  const peakRainfallInSet = filteredRecords.length > 0
    ? Math.max(...filteredRecords.map(r => r.input_parameters?.Rainfall_mm || 0))
    : 0;

  const handleOpenXAI = (loc) => {
    setSelectedLocation(loc);
    setXaiModalOpen(true);
  };

  const handleOpenVerify = (alert) => {
    setIncidentToVerify(alert);
    setVerifyModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase">
            <Mountain className="w-3.5 h-3.5" />
            <span>Northeast Regional Early Warning Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('cmdCenterTitle')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            {t('cmdCenterSub')}
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('refreshTelemetry')}</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('kpiCriticalRisk')}
          value={summary?.summary?.critical_risk_zones ?? 4}
          subtitle="Slopes with Risk Score ≥ 81"
          icon={ShieldAlert}
          color="rose"
          alert={true}
        />
        <MetricCard
          title={t('kpiActiveWarnings')}
          value={summary?.summary?.active_official_warnings ?? 3}
          subtitle="Approved Public Alerts"
          icon={BellRing}
          color="amber"
        />
        <MetricCard
          title={t('kpiRainfallTriggers')}
          value={summary?.summary?.rainfall_threshold_alerts ?? 5}
          subtitle=">100mm/24h Rain Surge"
          icon={CloudRain}
          color="blue"
        />
        <MetricCard
          title={t('kpiPopAtRisk')}
          value={(summary?.summary?.total_population_at_risk ?? 42500).toLocaleString()}
          subtitle="In High/Critical Slope Zones"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Main Grid: GIS Map + Active Early Warnings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Interactive GIS Map */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {t('liveGridTitle')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('liveGridSub')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800/60"
            >
              <span>{isMapFullscreen ? 'Exit Full Screen' : t('fullScreen')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <NERLandslideMap
            locations={mapData.locations}
            clusters={mapData.clusters}
            infrastructure={mapData.infrastructure}
            evacuationCenters={mapData.evacuation_centers}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onOpenXAI={(loc) => handleOpenXAI(loc)}
            onOpenCascading={(loc) => setSelectedLocation(loc)}
            isFullscreen={isMapFullscreen}
            onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
          />
        </div>

        {/* Right 4 Cols: Active Alerts Feed & Quick XAI Inspector */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Alerts Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-500" />
                <span>{t('earlyWarningFeed')}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-600 border border-rose-500/30">
                {summary?.recent_alerts?.length || 0} Alerts
              </span>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {(summary?.recent_alerts || []).map((alert, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-black text-slate-900 dark:text-white">
                      {alert.village}, {alert.district}
                    </span>
                    <RiskBadge level={alert.status} score={alert.risk_score} size="sm" />
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {alert.public_warning_message || alert.title}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                    <span className="text-slate-400">{t('rainfall24h')}: <strong>{alert.rainfall_24h_mm} mm</strong></span>
                    <button
                      onClick={() => handleOpenVerify(alert)}
                      className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                    >
                      {t('verifyIncident')} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Selected Slope Telemetry */}
          {selectedLocation && (
            <div className="bg-gradient-to-br from-purple-900/15 to-indigo-900/10 rounded-3xl p-5 border border-purple-500/30 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                    Selected Slope Telemetry
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedLocation.village}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedLocation.district}, {selectedLocation.state}
                  </p>
                </div>
                <RiskBadge level={selectedLocation.risk_level} score={selectedLocation.risk_score} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">{t('rainfall24h')}:</span>
                  <strong className="text-blue-600 font-black">{selectedLocation.rainfall_24h || 0} mm</strong>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">{t('slopeAngle')}:</span>
                  <strong className="text-slate-900 dark:text-white font-black">{selectedLocation.slope_degrees || 0}°</strong>
                </div>
              </div>

              <button
                onClick={() => setXaiModalOpen(true)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inspect AI Feature Weights</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Interactive Landslide Model Risk Detector */}
      <LandslideRiskDetector onDetectionSaved={fetchRiskRecords} />

      {/* Feature 2: Permanent AI Detected Risk Database with Advanced Search, Filter & CSV Export */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Section Top Header & Export Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MongoDB Collection: landslide_risk</span>
            </div>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Permanent AI Risk Detection Database ({storedRiskRecords.length} Saved Records)
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              Auditable permanent log of all risk assessments detected by users and sensors. Fully searchable, filterable, and exportable for public monitoring and research.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Download filtered records as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {/* Export JSON Button */}
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-800/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Download filtered records as raw JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Export JSON</span>
            </button>

            {/* Refresh Log */}
            <button
              onClick={fetchRiskRecords}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
              <span>Refresh</span>
            </button>

            {/* Clear Log (Restricted for Public) */}
            {storedRiskRecords.length > 0 && user?.role !== 'PUBLIC' && (
              <button
                onClick={handleClearRiskRecords}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Search, Filter & Sorter Toolbar */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dbSearch}
                onChange={(e) => { setDbSearch(e.target.value); setDbPage(1); }}
                placeholder="Search by parameters (e.g. R:180), user persona, risk level, or ID..."
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {dbSearch && (
                <button
                  onClick={() => { setDbSearch(''); setDbPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Sort:</span>
              <select
                value={dbSort}
                onChange={(e) => setDbSort(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer outline-none"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="HIGHEST">Highest Risk Score</option>
                <option value="LOWEST">Lowest Risk Score</option>
              </select>
            </div>

          </div>

          {/* Filter Category Tabs & Telemetry Summary Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'ALL', label: 'All Records', count: storedRiskRecords.length },
                { id: 'CRITICAL', label: 'Critical (≥81%)', count: storedRiskRecords.filter(r => r.risk_score >= 81 || (r.risk_level && r.risk_level.includes('Critical'))).length },
                { id: 'HIGH', label: 'High (61–80%)', count: storedRiskRecords.filter(r => r.risk_score >= 61 && r.risk_score < 81).length },
                { id: 'MODERATE', label: 'Moderate (31–60%)', count: storedRiskRecords.filter(r => r.risk_score >= 31 && r.risk_score < 61).length },
                { id: 'LOW', label: 'Low (0–30%)', count: storedRiskRecords.filter(r => r.risk_score < 31).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setDbCategory(tab.id); setDbPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    dbCategory === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${dbCategory === tab.id ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sub-summary pills */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 shrink-0">
              <span>Showing: <strong className="text-slate-900 dark:text-white">{filteredRecords.length}</strong></span>
              <span>•</span>
              <span>Avg Risk: <strong className="text-rose-600 dark:text-rose-400">{avgRiskScore}%</strong></span>
              <span>•</span>
              <span>Peak Rain: <strong className="text-blue-600 dark:text-blue-400">{peakRainfallInSet} mm</strong></span>
            </div>
          </div>

        </div>

        {/* Database Table */}
        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs italic space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <div>No matching risk detection records found in the database.</div>
              {dbSearch && (
                <button
                  onClick={() => { setDbSearch(''); setDbCategory('ALL'); }}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Clear search filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Risk Level Category</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3">Evaluated Parameters (Rain | Slope | Sat | Veg | EQ | Water)</th>
                  <th className="py-3 px-3">Source / User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {paginatedRecords.map((rec, idx) => (
                  <tr key={rec.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors font-medium">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {rec.created_at ? new Date(rec.created_at).toLocaleString() : 'Just now'}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={rec.risk_level_code || rec.risk_level} score={rec.risk_score} size="sm" showScore={false} />
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900 dark:text-white font-mono text-xs">
                      {rec.risk_score}%
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-slate-600 dark:text-slate-300 max-w-md truncate">
                      {rec.input_parameters ? (
                        <span>
                          R:<strong className="text-blue-600 dark:text-blue-400">{rec.input_parameters.Rainfall_mm}mm</strong> | 
                          S:<strong className="text-rose-600 dark:text-rose-400">{rec.input_parameters.Slope_Angle}°</strong> | 
                          Sat:<strong>{rec.input_parameters.Soil_Saturation}</strong> | 
                          Veg:<strong>{rec.input_parameters.Vegetation_Cover}</strong> | 
                          EQ:<strong>{rec.input_parameters.Earthquake_Activity}</strong> | 
                          W:<strong>{rec.input_parameters.Proximity_to_Water}m</strong>
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                      {rec.detected_by || 'Public User'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredRecords.length > rowsPerPage && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">
              Page <strong>{dbPage}</strong> of <strong>{totalPages}</strong> ({filteredRecords.length} total records)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDbPage(p => Math.max(1, p - 1))}
                disabled={dbPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                onClick={() => setDbPage(p => Math.min(totalPages, p + 1))}
                disabled={dbPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>


      {/* State Risk Rankings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              State-by-State Landslide Vulnerability Rankings (All 8 Northeast States)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated from live slope sensor telemetry, precipitation accumulation, and AI predictions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Peak Risk Score</th>
                <th className="py-2.5 px-3">Monitored Slopes</th>
                <th className="py-2.5 px-3">Peak 24h Rain</th>
                <th className="py-2.5 px-3">Pop. Exposed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {(summary?.state_ranking || []).map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors font-medium">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{st.state}</td>
                  <td className="py-3 px-3">
                    <RiskBadge level={st.highest_risk_level} score={st.max_risk_score} size="sm" showScore={false} />
                  </td>
                  <td className="py-3 px-3 font-black text-slate-900 dark:text-white font-mono">{st.max_risk_score}/100</td>
                  <td className="py-3 px-3">{st.monitored_slopes} Slopes</td>
                  <td className="py-3 px-3 font-bold text-blue-600">{st.peak_rainfall_24h_mm} mm</td>
                  <td className="py-3 px-3 font-semibold">{st.population_at_risk.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <XAIExplanationModal
        isOpen={xaiModalOpen}
        onClose={() => setXaiModalOpen(false)}
        location={selectedLocation}
      />

      <IncidentVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        incident={incidentToVerify}
        onVerified={fetchData}
      />

    </div>
  );
};
