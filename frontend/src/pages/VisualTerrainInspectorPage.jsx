import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { visualInspectorApi } from '../api/client';
import { 
  UploadCloud, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  MapPin, 
  Mountain, 
  Route, 
  Trees, 
  Radio, 
  Send, 
  Database, 
  Activity, 
  Eye, 
  FileText, 
  ChevronRight, 
  Clock, 
  RefreshCw,
  HardHat,
  Building2,
  Megaphone,
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

// Curated high-res samples for 1-click test simulation
const SAMPLE_PRESETS = [
  {
    id: 'road_landslide',
    title: 'NH-54 Mountain Highway Landslide',
    terrain: 'Mountain Road / Highway Corridor',
    desc: 'Heavy rockfall & mudflow covering two-lane mountain highway.',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&auto=format&fit=crop&q=80',
    village: 'Haflong - Jatinga Cut (NH-54)',
    district: 'Dima Hasao',
    state: 'Assam',
    lat: 25.1697,
    lon: 93.0182
  },
  {
    id: 'terrace_field',
    title: 'Agricultural Terrace Field Mudflow',
    terrain: 'Agricultural Terrace Field',
    desc: 'Cultivation slope showing soil shear failure and water saturation.',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80',
    village: 'Tuirial Valley Slope',
    district: 'Aizawl',
    state: 'Mizoram',
    lat: 23.7271,
    lon: 92.7176
  },
  {
    id: 'safe_road',
    title: 'Clear Highway (Normal Transit)',
    terrain: 'Mountain Road / Highway Corridor',
    desc: 'Stable hillside cut with clear asphalt and unobstructed drainage.',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=80',
    village: 'Shillong Bypass Corridor',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.5788,
    lon: 91.8933
  },
  {
    id: 'steep_crack',
    title: 'Tension Cracks on Hillside Slope',
    terrain: 'Steep Forest Slope',
    desc: 'Crest tension fissure indicators signaling imminent debris slip.',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=80',
    village: 'Dzongu North Ridge',
    district: 'Mangan',
    state: 'Sikkim',
    lat: 27.5085,
    lon: 88.5292
  }
];

export const VisualTerrainInspectorPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [locationMeta, setLocationMeta] = useState({
    state: user?.state || 'Assam',
    district: user?.district || 'Dima Hasao',
    village: user?.village || 'Haflong Hill Cut',
    latitude: 25.1697,
    longitude: 93.0182,
    reporter_name: user?.name || 'Field Officer / Citizen Reporter',
    reporter_role: user?.role || 'FIELD_WORKER'
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('public');

  const fileInputRef = useRef(null);

  const scanSteps = [
    "Analyzing terrain morphology (Road vs. Field vs. Hillside)...",
    "Gemini 3.1 Flash Lite evaluating slope shear, mudflow & tension cracks...",
    "Computing landslide probability & confidence index...",
    "Triggering multi-stakeholder alert grid & MongoDB storage..."
  ];

  // Fetch recent visual inspections
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await visualInspectorApi.getHistory(6);
      if (res.data?.inspections) {
        setHistory(res.data.inspections);
      }
    } catch (e) {
      console.warn("Could not load inspection history:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // Default load sample 1 for quick initial preview
    handleSelectPreset(SAMPLE_PRESETS[0]);
  }, []);

  // Convert image URL to Base64 (for presets)
  const loadPresetAsBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      // Fallback tiny 1x1 image placeholder if external fetch blocked
      return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    }
  };

  const handleSelectPreset = async (preset) => {
    setImagePreview(preset.url);
    setLocationMeta(prev => ({
      ...prev,
      state: preset.state,
      district: preset.district,
      village: preset.village,
      latitude: preset.lat,
      longitude: preset.lon
    }));
    setResult(null);
    setErrorMsg(null);

    const b64 = await loadPresetAsBase64(preset.url);
    setImageBase64(b64);
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Perform Analysis
  const handleAnalyze = async () => {
    if (!imageBase64) {
      setErrorMsg("Please upload or select an image to analyze.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setResult(null);
    setScanStepIndex(0);

    // Progress animation ticker
    const timer = setInterval(() => {
      setScanStepIndex((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const payload = {
        image_base64: imageBase64,
        state: locationMeta.state,
        district: locationMeta.district,
        village: locationMeta.village,
        latitude: locationMeta.latitude,
        longitude: locationMeta.longitude,
        reporter_name: locationMeta.reporter_name,
        reporter_role: locationMeta.reporter_role
      };

      const res = await visualInspectorApi.analyze(payload);
      clearInterval(timer);
      setResult(res.data);
      loadHistory(); // refresh history
    } catch (err) {
      clearInterval(timer);
      console.error(err);
      setErrorMsg(err.response?.data?.detail || "Visual analysis service encountered an error. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getHazardBadge = (level, prob) => {
    if (level === 'CRITICAL' || prob >= 75) {
      return {
        label: 'CRITICAL LANDSLIDE DETECTED',
        badgeClass: 'bg-rose-500/20 border-rose-500/50 text-rose-700 dark:text-rose-300 font-black',
        dotClass: 'bg-rose-500',
        ringColor: '#f43f5e'
      };
    } else if (level === 'HIGH' || prob >= 60) {
      return {
        label: 'HIGH RISK SLOPE INSTABILITY',
        badgeClass: 'bg-orange-500/20 border-orange-500/50 text-orange-700 dark:text-orange-300 font-black',
        dotClass: 'bg-orange-500',
        ringColor: '#f97316'
      };
    } else if (level === 'WATCH' || prob >= 35) {
      return {
        label: 'MODERATE WATCH / TENSION OBSERVED',
        badgeClass: 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300 font-black',
        dotClass: 'bg-amber-500',
        ringColor: '#f59e0b'
      };
    } else {
      return {
        label: 'SAFE TERRAIN - NO SLIDE DETECTED',
        badgeClass: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-black',
        dotClass: 'bg-emerald-400',
        ringColor: '#10b981'
      };
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-indigo-900/40 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-8 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>{t('viBadge')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{t('viTitle')}</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t('viSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">MongoDB Persistence</div>
                <div className="text-xs font-black text-white">Live Alert Grid Sync</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Cols: Upload / Presets / Location Meta */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preset Quick Chooser */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>{t('viTestScenarios')}</span>
              </h3>
              <span className="text-[10px] text-slate-400">Select to test</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-2xl border text-left transition-all text-xs flex flex-col justify-between gap-1.5 ${
                    imagePreview === preset.url 
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm font-semibold' 
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold line-clamp-1">{preset.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{preset.village}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-rose-500" />
                <span>{t('viUploadImage')}</span>
              </label>
              {selectedFile && (
                <span className="text-[11px] text-slate-500 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full rounded-xl overflow-hidden aspect-video bg-black/5 flex items-center justify-center group">
                  <img
                    src={imagePreview}
                    alt="Terrain preview"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Radar Scanning Line Animation during analysis */}
                  {analyzing && (
                    <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-[bounce_2s_infinite] shadow-[0_0_15px_#22d3ee]" />
                      <div className="p-3 bg-slate-900/90 rounded-2xl border border-cyan-400/40 text-center shadow-xl space-y-1">
                        <Activity className="w-5 h-5 text-cyan-400 mx-auto animate-pulse" />
                        <div className="text-xs font-black text-white">Gemini 3.1 Flash Lite Scanning</div>
                        <div className="text-[10px] text-cyan-300 max-w-[220px] font-mono leading-tight">
                          {scanSteps[scanStepIndex]}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-mono backdrop-blur-sm">
                    Click to replace photo
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Drag & drop your photograph here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WebP from smartphones, drones, or CCTV cameras
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Target Location Metadata */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Corridor / Location Metadata</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">State:</span>
                  <input
                    type="text"
                    value={locationMeta.state}
                    onChange={(e) => setLocationMeta({ ...locationMeta, state: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">District:</span>
                  <input
                    type="text"
                    value={locationMeta.district}
                    onChange={(e) => setLocationMeta({ ...locationMeta, district: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Village / Cut Section:</span>
                  <input
                    type="text"
                    value={locationMeta.village}
                    onChange={(e) => setLocationMeta({ ...locationMeta, village: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scan Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !imageBase64}
              className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                analyzing || !imageBase64
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white shadow-indigo-600/30 hover:scale-[1.01]'
              }`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('viAnalyzing')}</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>{t('viAnalyzeBtn')}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right 7 Cols: Results Dashboard & Automated Multi-Stakeholder Dispatches */}
        <div className="lg:col-span-7 space-y-6">

          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
              
              {/* Primary Assessment Card */}
              {(() => {
                const badgeInfo = getHazardBadge(result.hazard_level, result.landslide_probability);
                return (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    
                    {/* Top Status & Hazard Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Gemini Vision Assessment Result</span>
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                          {result.terrain_type}
                        </div>
                      </div>

                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 ${badgeInfo.badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${badgeInfo.dotClass} animate-ping`} />
                        <span>{badgeInfo.label}</span>
                      </div>
                    </div>

                    {/* Probability Gauge & Key Visual Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Gauge Card */}
                      <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Landslide Probability</div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                          {result.landslide_probability}%
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${result.landslide_probability}%`,
                              backgroundColor: badgeInfo.ringColor
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                          Accuracy / Chance: {result.landslide_probability >= 65 ? 'High Risk' : 'Low / Nominal'}
                        </div>
                      </div>

                      {/* Road Blockage Status */}
                      <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Route className="w-3.5 h-3.5 text-amber-500" />
                          <span>Road Transit Status</span>
                        </div>
                        <div className="my-1">
                          {result.road_blocked ? (
                            <span className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              Blocked by Debris
                            </span>
                          ) : (
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              Passable / Clear
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Debris Volume: {result.estimated_debris_volume || 'None'}
                        </div>
                      </div>

                      {/* Model & Persistence Info */}
                      <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Database className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Database Storage</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-white my-1 font-mono">
                          MongoDB: #{result.id?.slice(-6) || 'SAVED'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                          Model: {result.model_used}
                        </div>
                      </div>

                    </div>

                    {/* Detected Geotechnical Features */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Identified Visual Indicators & Morphology:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.detected_features?.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technical Summary */}
                    <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                      <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Geotechnical Analysis:</span>
                      {result.summary}
                    </div>

                    {/* Action Recommendations */}
                    {result.action_recommendations?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">NDMA Standard Operating Procedure:</span>
                        <ul className="space-y-1">
                          {result.action_recommendations.map((act, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                );
              })()}

              {/* Automated Multi-Stakeholder Dispatch Card (Triggered when chance is high) */}
              {result.is_alert_dispatched && result.stakeholder_notifications ? (
                <div className="rounded-3xl border border-rose-400/40 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900 p-6 shadow-xl shadow-rose-600/5 space-y-5">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200 dark:border-rose-900/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                        <Radio className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-rose-900 dark:text-rose-200">
                          Automated Multi-Stakeholder Alert Grid Dispatched
                        </div>
                        <div className="text-[11px] text-rose-700 dark:text-rose-300">
                          Trigger: Landslide probability exceeds safety threshold (High Risk ≥ 65%)
                        </div>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black uppercase tracking-wider self-start sm:self-center">
                      Live Broadcast Active
                    </div>
                  </div>

                  {/* Stakeholder Tabs */}
                  <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                    <button
                      onClick={() => setActiveTab('public')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'public'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>1. Public Citizens</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('authority')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'authority'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>2. System Authority (DDMA)</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('field')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'field'
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <HardHat className="w-3.5 h-3.5" />
                      <span>3. Field Officers (QRT)</span>
                    </button>
                  </div>

                  {/* Tab 1: Public Alert Content */}
                  {activeTab === 'public' && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Broadcast Channel: {result.stakeholder_notifications.public_message?.channel}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          {result.stakeholder_notifications.public_message?.status}
                        </span>
                      </div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {result.stakeholder_notifications.public_message?.headline}
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                        {result.stakeholder_notifications.public_message?.message}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>Target: {result.stakeholder_notifications.public_message?.target_audience}</span>
                        <span className="font-mono">Alert ID: {result.alert_record_id}</span>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: System Authority / DDMA EOC Content */}
                  {activeTab === 'authority' && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Target: {result.stakeholder_notifications.authority_message?.details?.target_eoc}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                          {result.stakeholder_notifications.authority_message?.details?.priority}
                        </span>
                      </div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {result.stakeholder_notifications.authority_message?.headline}
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-mono">
                        {result.stakeholder_notifications.authority_message?.details?.directive}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <div>Incident Code: {result.stakeholder_notifications.authority_message?.details?.incident_code}</div>
                        <div>Status: {result.stakeholder_notifications.authority_message?.status}</div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Field Officer Ground QRT Content */}
                  {activeTab === 'field' && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Unit: {result.stakeholder_notifications.field_officer_message?.details?.assigned_unit}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          {result.stakeholder_notifications.field_officer_message?.status}
                        </span>
                      </div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {result.stakeholder_notifications.field_officer_message?.headline}
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {result.stakeholder_notifications.field_officer_message?.details?.field_instructions}
                      </div>
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[11px] text-rose-700 dark:text-rose-300 font-bold">
                        ⚠️ Protocol: {result.stakeholder_notifications.field_officer_message?.details?.safety_protocol}
                      </div>
                    </div>
                  )}

                  {/* MongoDB Confirmation Bar */}
                  <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Permanently logged in <b>MongoDB</b> (`ner_landslide_db.alerts` & `visual_inspections`)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Record #{result.mongodb_record_id?.slice(-8)}</span>
                  </div>

                </div>
              ) : (
                <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Low Landslide Probability — Safe Conditions Recorded</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                    The visual inspection was saved in MongoDB for ongoing surveillance logs. Since the estimated landslide probability is below the danger trigger threshold, emergency public alarms and authority dispatches remain on standby.
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 py-16">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                <Mountain className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Awaiting Photograph Analysis
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select a test scenario from the left or drag-and-drop a road, slope, or agricultural terrace photo to trigger the Gemini 3.1 Flash Lite geotechnical visual inspector.
                </p>
              </div>
            </div>
          )}

          {/* Recent Visual Inspections History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Recent Visual Inspections in MongoDB</span>
              </div>
              <span className="text-[11px] text-slate-400">{history.length} records</span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No past inspections recorded yet. Submit your first analysis above!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.village}, {item.district}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                        item.landslide_probability >= 65
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      }`}>
                        {item.landslide_probability}% Risk
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 font-medium">
                      {item.terrain_type}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>{item.analyzed_at?.split('T')[0] || 'Today'}</span>
                      <span className="font-mono">{item.model_used?.split(' ')[1] || 'gemini-3.1-flash-lite'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default VisualTerrainInspectorPage;
