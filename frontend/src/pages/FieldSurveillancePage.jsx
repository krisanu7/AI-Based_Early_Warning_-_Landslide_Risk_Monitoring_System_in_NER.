import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fieldReportsApi } from '../api/client';
import { 
  ClipboardEdit, 
  MapPin, 
  Camera, 
  Send, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Mountain,
  Route,
  Home,
  Users,
  Sparkles,
  Eye
} from 'lucide-react';

export const FieldSurveillancePage = () => {
  const { user, isOnline, offlinePendingCount, manualSync, refreshOfflineCount, syncStatus } = useAuth();

  const [formData, setFormData] = useState({
    state: user?.state || 'Assam',
    district: user?.district || 'Dima Hasao',
    village: user?.village || 'Haflong Hill Cut',
    latitude: 25.1697,
    longitude: 93.0182,
    observation_date: new Date().toISOString().split('T')[0],
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: false,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: 'SEVERE',
    approx_people_affected: 150,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: 'HEAVY',
    photograph_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop',
    field_notes: '15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.',
    reporter_name: user?.name || 'Arun Bordoloi (Ground Surveyor)',
    reporter_role: user?.role || 'FIELD_WORKER'
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [locating, setLocating] = useState(false);

  const fetchRecent = async () => {
    try {
      const res = await fieldReportsApi.list({ district: user?.district || 'Dima Hasao' });
      setRecentReports(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [user]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(position.coords.latitude.toFixed(4)),
          longitude: parseFloat(position.coords.longitude.toFixed(4))
        }));
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your current location. Using preset GPS coordinates.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await fieldReportsApi.create(formData);
      await refreshOfflineCount();

      if (res.data?.offline) {
        setSubmissionResult({
          offline: true,
          message: 'Saved to local device offline storage (IndexedDB). Will automatically synchronize when online.'
        });
      } else {
        setSubmissionResult({
          success: true,
          message: 'Field landslide observation report uploaded to District Disaster Management EOC queue.'
        });
        await fetchRecent();
      }

      // Partial reset
      setFormData(prev => ({
        ...prev,
        visible_cracks: false,
        soil_mud_movement: false,
        field_notes: ''
      }));
    } catch (err) {
      console.error(err);
      setSubmissionResult({
        error: true,
        message: 'Failed to submit report. Stored to offline queue fallback.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase">
            <ClipboardEdit className="w-3.5 h-3.5" />
            <span>Field Surveillance & Rapid Scout Unit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Grassroots Field Landslide Reporting (&lt;60s Form)
          </h1>
          <p className="text-amber-100/90 text-xs sm:text-sm">
            Assigned Hill Sector: <strong>{user?.village || 'Haflong'}</strong>, {user?.district || 'Dima Hasao'} ({user?.state || 'Assam'})
          </p>
        </div>

        {/* Offline Queue Status Card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 flex items-center gap-4 shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-200">
              {isOnline ? 'Online Grid' : 'Offline Queue Mode'}
            </div>
            <div className="font-bold text-sm text-white">
              {offlinePendingCount} Reports Pending
            </div>
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

      {syncStatus && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Gemini 3.1 Flash Lite Visual Inspector Callout */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-700/40 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm text-white flex items-center gap-2">
              <span>Have Road or Field Photos? Let Gemini 3.1 Flash Lite Analyze Automatically</span>
            </div>
            <p className="text-[11px] text-indigo-200">
              Drag & drop any terrain image to detect landslides, evaluate chance/accuracy, and auto-dispatch alerts to Public, DDMA & Field Teams.
            </p>
          </div>
        </div>
        <Link
          to="/visual-inspector"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 shrink-0 transition-all hover:scale-105"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Launch AI Visual Inspector</span>
        </Link>
      </div>

      {/* Main Grid: Form + Recent Local Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Fast Reporting Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardEdit className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Rapid Landslide / Slope Movement Observation</span>
            </h2>
            <p className="text-xs text-slate-500">
              Record visible ground tension cracks, mudflows, road blockages, and damage for immediate verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Location Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Village / Sector</label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* GPS Coordinates with 1-Click Locator */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Latitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Longitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{locating ? 'Acquiring GPS...' : '📍 Auto-GPS'}</span>
              </button>
            </div>

            {/* Critical Field Sign Checklist */}
            <div className="space-y-2 pt-1">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Visible Slope Instability Indicators (Check all matching):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  formData.visible_cracks ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.visible_cracks}
                    onChange={(e) => setFormData({ ...formData, visible_cracks: e.target.checked })}
                    className="rounded text-rose-600 w-4 h-4"
                  />
                  <span>Tension Cracks</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  formData.soil_mud_movement ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.soil_mud_movement}
                    onChange={(e) => setFormData({ ...formData, soil_mud_movement: e.target.checked })}
                    className="rounded text-rose-600 w-4 h-4"
                  />
                  <span>Soil / Mud Movement</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  formData.rockfall_observed ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.rockfall_observed}
                    onChange={(e) => setFormData({ ...formData, rockfall_observed: e.target.checked })}
                    className="rounded text-rose-600 w-4 h-4"
                  />
                  <span>Rockfall Falling</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  formData.water_seepage_present ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.water_seepage_present}
                    onChange={(e) => setFormData({ ...formData, water_seepage_present: e.target.checked })}
                    className="rounded text-amber-600 w-4 h-4"
                  />
                  <span>Heavy Water Seepage</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  formData.road_blocked ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.road_blocked}
                    onChange={(e) => setFormData({ ...formData, road_blocked: e.target.checked })}
                    className="rounded text-rose-600 w-4 h-4"
                  />
                  <span>Road Blockage</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  formData.house_damage ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.house_damage}
                    onChange={(e) => setFormData({ ...formData, house_damage: e.target.checked })}
                    className="rounded text-rose-600 w-4 h-4"
                  />
                  <span>House / Structure Hit</span>
                </label>
              </div>
            </div>

            {/* Severity, People, Rainfall */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Severity Level</label>
                <select
                  value={formData.estimated_severity}
                  onChange={(e) => setFormData({ ...formData, estimated_severity: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="MINOR">Minor Slope Slump</option>
                  <option value="MODERATE">Moderate Debris Slide</option>
                  <option value="SEVERE">Severe Mudflow / Blockage</option>
                  <option value="CATASTROPHIC">Catastrophic Avalanche</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">People in Path</label>
                <input
                  type="number"
                  min="0"
                  value={formData.approx_people_affected}
                  onChange={(e) => setFormData({ ...formData, approx_people_affected: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Rainfall Intensity</label>
                <select
                  value={formData.rainfall_intensity_observed}
                  onChange={(e) => setFormData({ ...formData, rainfall_intensity_observed: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="NONE">No Rain Currently</option>
                  <option value="LIGHT">Light Drizzle</option>
                  <option value="MODERATE">Moderate Steady Rain</option>
                  <option value="HEAVY">Heavy Continuous Rain</option>
                  <option value="TORRENTIAL">Torrential Downpour / Cloudburst</option>
                </select>
              </div>
            </div>

            {/* Field Notes */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Field Surveyor Notes & Debris Flow Details
              </label>
              <textarea
                rows={2}
                value={formData.field_notes}
                onChange={(e) => setFormData({ ...formData, field_notes: e.target.value })}
                placeholder="Describe ground cracks, slope face movement, highway blockage location..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 text-white font-black rounded-2xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all text-xs hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Uploading to District EOC Queue...' : 'Submit Field Report to Disaster Grid'}</span>
            </button>

          </form>
        </div>

        {/* Right 5 Cols: Recent Local Submissions */}
        <div className="lg:col-span-5 space-y-6">
          
          {submissionResult && (
            <div className={`p-5 rounded-3xl border shadow-sm space-y-2 animate-in fade-in ${
              submissionResult.offline 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{submissionResult.offline ? 'Queued in Offline Storage' : 'Report Uploaded Successfully'}</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">{submissionResult.message}</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent District Field Logs</h3>
              <span className="text-[11px] text-slate-400">{recentReports.length} records</span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {recentReports.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-6">
                  No previous field reports logged for this sector.
                </div>
              ) : (
                recentReports.map((rep, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{rep.village}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        rep.status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      {rep.field_notes || 'Tension cracks reported.'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                      <span>Severity: <strong>{rep.estimated_severity}</strong></span>
                      <span>•</span>
                      <span>By: {rep.reporter_name}</span>
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
