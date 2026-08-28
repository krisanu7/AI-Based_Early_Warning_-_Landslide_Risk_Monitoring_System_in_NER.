import React, { useState, useEffect } from 'react';
import { dashboardApi, mapApi } from '../api/client';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { NERLandslideMap } from '../components/map/NERLandslideMap';
import { XAIExplanationModal } from '../components/modals/XAIExplanationModal';
import { IncidentVerificationModal } from '../components/modals/IncidentVerificationModal';
import { useLanguage } from '../context/LanguageContext';
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
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MainDashboard = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [mapData, setMapData] = useState({ locations: [], clusters: [], infrastructure: [], evacuation_centers: [] });
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [xaiModalOpen, setXaiModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [incidentToVerify, setIncidentToVerify] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, mapRes] = await Promise.all([
        dashboardApi.getSummary(),
        mapApi.getRiskNodes()
      ]);
      setSummary(dashRes.data);
      setMapData(mapRes.data);
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
            Landslide Susceptibility & Early Warning Command Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Live AI slope instability modeling, multi-temporal rainfall surge tracking, and automated disaster logistics across the 8 Northeastern states.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
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
                  Live Northeast India Landslide Geospatial Grid
                </h2>
                <p className="text-xs text-slate-500">
                  Interactive slope nodes, rainfall radar, critical roads, and safe shelters.
                </p>
              </div>
            </div>

            <Link
              to="/map"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <NERLandslideMap
            locations={mapData.locations}
            clusters={mapData.clusters}
            infrastructure={mapData.infrastructure}
            evacuationCenters={mapData.evacuation_centers}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onOpenXAI={(loc) => handleOpenXAI(loc)}
            onOpenCascading={(loc) => setSelectedLocation(loc)}
          />
        </div>

        {/* Right 4 Cols: Active Alerts Feed & Quick XAI Inspector */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Alerts Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-500" />
                <span>Early Warning Feed</span>
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
                    <span className="text-slate-400">Rain: <strong>{alert.rainfall_24h_mm} mm</strong></span>
                    <button
                      onClick={() => handleOpenVerify(alert)}
                      className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                    >
                      Verify / Broadcast →
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
                  <span className="text-slate-400 text-[10px] block">24h Rain Surge:</span>
                  <strong className="text-blue-600 font-black">{selectedLocation.rainfall_24h || 0} mm</strong>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Slope Gradient:</span>
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
