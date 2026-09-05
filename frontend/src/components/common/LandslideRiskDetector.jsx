import React, { useState, useEffect } from 'react';
import { predictionsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  CloudRain, 
  Mountain, 
  Droplets, 
  Trees, 
  Activity, 
  Waves, 
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Send,
  Code2,
  Sliders,
  Play,
  Lock,
  UserCheck
} from 'lucide-react';

export const LandslideRiskDetector = ({ onDetectionSaved }) => {
  const { user, switchDemoRole } = useAuth();
  const isPublic = user?.role === 'PUBLIC';
  const [mode, setMode] = useState('form'); // 'form' or 'json'

  
  const defaultSamplePayload = {
    Rainfall_mm: [180],
    Slope_Angle: [30],
    Soil_Saturation: [0.90],
    Vegetation_Cover: [0.15],
    Earthquake_Activity: [4.5],
    Proximity_to_Water: [1.0],
    Soil_Type_Gravel: [0],
    Soil_Type_Sand: [0],
    Soil_Type_Silt: [1]
  };

  const [formValues, setFormValues] = useState({
    Rainfall_mm: 180,
    Slope_Angle: 30,
    Soil_Saturation: 0.90,
    Vegetation_Cover: 0.15,
    Earthquake_Activity: 4.5,
    Proximity_to_Water: 1.0,
    Soil_Type_Gravel: 0,
    Soil_Type_Sand: 0,
    Soil_Type_Silt: 1
  });

  const [jsonText, setJsonText] = useState(JSON.stringify(defaultSamplePayload, null, 4));
  const [jsonError, setJsonError] = useState('');
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (overridePayload) => {
    setLoading(true);
    setJsonError('');
    let payloadToSend = {};

    if (overridePayload) {
      payloadToSend = overridePayload;
    } else if (mode === 'json') {
      try {
        payloadToSend = JSON.parse(jsonText);
      } catch (err) {
        setJsonError('Invalid JSON format: Please ensure valid JSON structure.');
        setLoading(false);
        return;
      }
    } else {
      payloadToSend = {
        Rainfall_mm: [parseFloat(formValues.Rainfall_mm) || 0],
        Slope_Angle: [parseFloat(formValues.Slope_Angle) || 0],
        Soil_Saturation: [parseFloat(formValues.Soil_Saturation) || 0],
        Vegetation_Cover: [parseFloat(formValues.Vegetation_Cover) || 0],
        Earthquake_Activity: [parseFloat(formValues.Earthquake_Activity) || 0],
        Proximity_to_Water: [parseFloat(formValues.Proximity_to_Water) || 0],
        Soil_Type_Gravel: [parseInt(formValues.Soil_Type_Gravel) || 0],
        Soil_Type_Sand: [parseInt(formValues.Soil_Type_Sand) || 0],
        Soil_Type_Silt: [parseInt(formValues.Soil_Type_Silt) || 0]
      };
    }

    try {
      const res = await predictionsApi.predict(payloadToSend);
      setPrediction(res.data);
      if (onDetectionSaved) {
        onDetectionSaved(res.data);
      }

    } catch (err) {
      console.error('Failed to run landslide prediction model:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only run prediction when user explicitly clicks Submit & Detect Risk button
  const handleFormInputChange = (field, val) => {

    setFormValues(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const loadSamplePreset = (presetName) => {
    let p = {};
    if (presetName === 'user_sample') {
      p = {
        Rainfall_mm: 180,
        Slope_Angle: 30,
        Soil_Saturation: 0.90,
        Vegetation_Cover: 0.15,
        Earthquake_Activity: 4.5,
        Proximity_to_Water: 1.0,
        Soil_Type_Gravel: 0,
        Soil_Type_Sand: 0,
        Soil_Type_Silt: 1
      };
    } else if (presetName === 'baseline') {
      p = {
        Rainfall_mm: 15,
        Slope_Angle: 12,
        Soil_Saturation: 0.25,
        Vegetation_Cover: 0.85,
        Earthquake_Activity: 0.0,
        Proximity_to_Water: 500.0,
        Soil_Type_Gravel: 1,
        Soil_Type_Sand: 0,
        Soil_Type_Silt: 0
      };
    } else if (presetName === 'critical_monsoon') {
      p = {
        Rainfall_mm: 250,
        Slope_Angle: 50,
        Soil_Saturation: 0.95,
        Vegetation_Cover: 0.10,
        Earthquake_Activity: 3.5,
        Proximity_to_Water: 5.0,
        Soil_Type_Gravel: 0,
        Soil_Type_Sand: 1,
        Soil_Type_Silt: 0
      };
    }
    setFormValues(p);
    const jsonFormatted = {
      Rainfall_mm: [p.Rainfall_mm],
      Slope_Angle: [p.Slope_Angle],
      Soil_Saturation: [p.Soil_Saturation],
      Vegetation_Cover: [p.Vegetation_Cover],
      Earthquake_Activity: [p.Earthquake_Activity],
      Proximity_to_Water: [p.Proximity_to_Water],
      Soil_Type_Gravel: [p.Soil_Type_Gravel],
      Soil_Type_Sand: [p.Soil_Type_Sand],
      Soil_Type_Silt: [p.Soil_Type_Silt]
    };
    setJsonText(JSON.stringify(jsonFormatted, null, 4));
    handleSubmit(jsonFormatted);
  };

  const getRiskStyle = (score, level) => {
    if (score >= 81 || (level && level.includes('Critical'))) {
      return {
        bg: 'from-rose-600 via-red-600 to-rose-700',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        glow: 'shadow-rose-500/20'
      };
    } else if (score >= 61 || (level && level.includes('High'))) {
      return {
        bg: 'from-orange-500 via-amber-600 to-orange-600',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        glow: 'shadow-orange-500/20'
      };
    } else if (score >= 31 || (level && level.includes('Moderate'))) {
      return {
        bg: 'from-amber-500 via-yellow-600 to-amber-600',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        glow: 'shadow-amber-500/20'
      };
    } else {
      return {
        bg: 'from-emerald-500 via-teal-600 to-emerald-600',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        glow: 'shadow-emerald-500/20'
      };
    }
  };

  const score = prediction?.risk_score ?? 87;
  const riskLevel = prediction?.risk_level ?? 'Critical (81–100)';
  const style = getRiskStyle(score, riskLevel);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Model: landslide_model.pkl</span>
            </div>
            {isPublic && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-black uppercase">
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span>Public Citizen Mode (Inference Restricted)</span>
              </div>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Landslide Risk Detector & Model Inference Tool
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            {isPublic 
              ? 'Public citizens can watch all risk detection records in the Permanent AI Risk Detection Database log below. Live model inference execution is restricted.'
              : 'Input environmental parameters below and click Submit & Detect Risk to compute output from your model.'}
          </p>
        </div>

        {/* Input Mode Selector + Presets (Disabled for Public) */}
        {!isPublic && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setMode('form')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'form' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Form Fields</span>
              </button>
              <button
                onClick={() => setMode('json')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'json' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON Raw Payload</span>
              </button>
            </div>

            <button
              onClick={() => loadSamplePreset('user_sample')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800/60 transition-all cursor-pointer"
            >
              Load User Sample [180, 30, 0.9...]
            </button>
          </div>
        )}
      </div>

      {isPublic ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/50 rounded-3xl p-6 sm:p-8 border-2 border-rose-500/30 text-white shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Model Inference Tool Restricted to Authorized Personnel
                </h3>
                <p className="text-xs text-rose-200/80">
                  Public Citizen Access Security Policy
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm shrink-0 self-start sm:self-center">
              Public Portal Mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Restricted Action:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                Public citizens cannot run custom model inferences or manipulate ML input parameters in the Landslide Risk Detector tool.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Allowed Public Feature:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                Public citizens can freely watch, inspect, and monitor all official risk detection records stored in the <strong>Permanent AI Risk Detection Database</strong> directly below.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-semibold text-center sm:text-left">
              Evaluator Demo Mode: Want to test the Landslide Risk Detector tool?
            </span>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => switchDemoRole('FIELD_WORKER')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch to Field Worker Persona</span>
              </button>
              <button
                onClick={() => switchDemoRole('DISTRICT_OFFICER')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch to District Officer</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Input Form / JSON Payload Editor */}
        <div className="lg:col-span-7 space-y-6">
          
          {mode === 'form' ? (
            <div className="space-y-4">
              
              {/* Row 1: Rainfall & Slope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                      <span>Rainfall_mm</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. 180</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formValues.Rainfall_mm}
                    onChange={(e) => handleFormInputChange('Rainfall_mm', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mountain className="w-3.5 h-3.5 text-rose-500" />
                      <span>Slope_Angle</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. 30°</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formValues.Slope_Angle}
                    onChange={(e) => handleFormInputChange('Slope_Angle', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 2: Soil Saturation & Vegetation Cover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Soil_Saturation</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. 0.90</span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formValues.Soil_Saturation}
                    onChange={(e) => handleFormInputChange('Soil_Saturation', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Trees className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Vegetation_Cover</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. 0.15</span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formValues.Vegetation_Cover}
                    onChange={(e) => handleFormInputChange('Vegetation_Cover', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Earthquake Activity & Proximity to Water */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-500" />
                      <span>Earthquake_Activity</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. 4.5</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.Earthquake_Activity}
                    onChange={(e) => handleFormInputChange('Earthquake_Activity', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-blue-400" />
                      <span>Proximity_to_Water</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. 1.0m</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formValues.Proximity_to_Water}
                    onChange={(e) => handleFormInputChange('Proximity_to_Water', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 4: One-Hot Soil Type Flags */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Soil Type One-Hot Indicators (Gravel / Sand / Silt)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Soil_Type_Gravel</span>
                    <select
                      value={formValues.Soil_Type_Gravel}
                      onChange={(e) => handleFormInputChange('Soil_Type_Gravel', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                    >
                      <option value={0}>0 (No)</option>
                      <option value={1}>1 (Yes)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Soil_Type_Sand</span>
                    <select
                      value={formValues.Soil_Type_Sand}
                      onChange={(e) => handleFormInputChange('Soil_Type_Sand', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                    >
                      <option value={0}>0 (No)</option>
                      <option value={1}>1 (Yes)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Soil_Type_Silt</span>
                    <select
                      value={formValues.Soil_Type_Silt}
                      onChange={(e) => handleFormInputChange('Soil_Type_Silt', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                    >
                      <option value={0}>0 (No)</option>
                      <option value={1}>1 (Yes)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Paste Raw JSON Input Payload</span>
                <span className="text-[10px] text-indigo-500 font-mono">Supports array [180] or scalar 180</span>
              </label>
              <textarea
                rows={12}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
              />
              {jsonError && (
                <div className="text-rose-500 text-xs font-bold p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                  {jsonError}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Submit & Detect Risk</span>
              </>
            )}
          </button>

        </div>

        {/* Right 5 Cols: Model Output Display */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {!prediction ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-8 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[340px]">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <Gauge className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Awaiting Risk Detection Submission
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  Enter parameter values on the left (or paste JSON) and click <strong className="text-indigo-600 dark:text-indigo-400">"Submit & Detect Risk"</strong> to compute prediction and save it permanently to MongoDB.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className={`rounded-3xl p-6 bg-gradient-to-br ${style.bg} text-white shadow-2xl ${style.glow} relative overflow-hidden flex flex-col items-center text-center space-y-4`}>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Model Prediction Output</span>
                </div>

                {/* Risk Gauge Circle */}
                <div className="relative w-36 h-36 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="white"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-black tracking-tight">{score}%</span>
                    <span className="text-[10px] uppercase font-bold text-white/80">Risk Score</span>
                  </div>
                </div>

                {/* Category Output Badge */}
                <div className="space-y-1">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-white/80 block">
                    Detected Risk Category:
                  </span>
                  <div className="inline-block px-4 py-2 bg-white text-slate-900 font-black text-base rounded-2xl shadow-xl">
                    {riskLevel}
                  </div>
                </div>

                <p className="text-xs text-white/90 font-medium pt-1">
                  Confidence: <strong className="font-bold">{prediction?.model_confidence ?? 87}%</strong>
                </p>
              </div>

              {/* Active Risk Triggers List */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Model Detected Triggers</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {prediction?.active_triggers?.map((trig, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{trig}</span>
                    </li>
                  )) || (
                    <li className="text-slate-400 italic">Press Submit & Detect Risk to compute triggers.</li>
                  )}
                </ul>
              </div>

              {/* Parsed Input Echo */}
              {prediction?.input_parameters && (
                <div className="bg-slate-900 text-slate-300 p-3.5 rounded-2xl text-[11px] font-mono space-y-1 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Evaluated Parameter Array:</div>
                  <div className="text-emerald-400 truncate">
                    R={prediction.input_parameters.Rainfall_mm} | S={prediction.input_parameters.Slope_Angle} | Sat={prediction.input_parameters.Soil_Saturation} | Veg={prediction.input_parameters.Vegetation_Cover} | EQ={prediction.input_parameters.Earthquake_Activity} | Water={prediction.input_parameters.Proximity_to_Water}m
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>
      )}

    </div>
  );
};
