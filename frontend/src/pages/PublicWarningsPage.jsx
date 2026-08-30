import React, { useState, useEffect } from 'react';
import { alertsApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { 
  Megaphone, 
  Volume2, 
  VolumeX, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Calendar,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export const PublicWarningsPage = () => {
  const { t, language, speak, stopSpeaking, isSpeaking } = useLanguage();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await alertsApi.getPublicWarnings();
      setWarnings(res.data?.active_public_warnings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, []);

  const getLocalizedWarning = (warn, idx) => {
    const titleKey = `advisory${idx + 1}Title`;
    const msgKey = `advisory${idx + 1}Message`;
    return {
      title: t(titleKey) !== titleKey ? t(titleKey) : (warn.public_warning_headline || warn.title),
      message: t(msgKey) !== msgKey ? t(msgKey) : warn.public_warning_message
    };
  };

  const handleAudioBroadcast = (warning, idx) => {
    const loc = getLocalizedWarning(warning, idx);
    const textToSpeak = `${loc.title}. ${loc.message}. ${t('disclaimerText')}`;
    speak(textToSpeak, language);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase">
            <Megaphone className="w-3.5 h-3.5" />
            <span>{t('navPublicWarnings')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('officialAdvisories')}
          </h1>
          <p className="text-rose-100/90 text-xs sm:text-sm max-w-2xl">
            {t('officialAdvisoriesSub')}
          </p>
        </div>

        <button
          onClick={fetchWarnings}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('refreshTelemetry')}</span>
        </button>
      </div>

      {/* Warnings List */}
      <div className="space-y-6">
        {warnings.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('kpiLowRisk')}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('disclaimerText')}
            </p>
          </div>
        ) : (
          warnings.map((warn, idx) => {
            const loc = getLocalizedWarning(warn, idx);
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-rose-500/40 shadow-xl space-y-6 animate-in fade-in"
              >
                {/* Warning Card Top */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white shadow-sm">
                        🚨 {t('riskCritical')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Ref: {warn.id || `ALT-NER-${idx+1}`}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
                      {loc.title}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{t('location') || 'Location'}: <strong>{warn.village}</strong>, {warn.district} ({warn.state})</span>
                    </p>
                  </div>

                  {/* Voice Speech Trigger Button */}
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : handleAudioBroadcast(warn, idx)}
                    className={`px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-md shrink-0 ${
                      isSpeaking
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white hover:scale-105'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? t('stopAudio') : `${t('listenWarning')} (${language.toUpperCase()})`}</span>
                  </button>
                </div>

                {/* Advisory Body */}
                <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2">
                  <span className="text-[10px] uppercase font-black text-rose-700 dark:text-rose-300 tracking-wider">
                    {t('officialPublicMessage')}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {loc.message}
                  </p>
                </div>

                {/* Environmental Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">{t('rainfall24h')}:</span>
                    <strong className="text-blue-600 text-sm font-black">{warn.rainfall_24h_mm || 150} mm</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">{t('slopeAngle')}:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm font-black">{warn.slope_degrees || 42}°</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">{t('popExposed')}:</span>
                    <strong className="text-rose-600 text-sm font-black">{(warn.population_exposed || 3500).toLocaleString()}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">{t('evacuationStatus')}:</span>
                    <strong className={`text-sm font-black ${warn.evacuation_recommended ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {warn.evacuation_recommended ? t('evacuationRecommended') : t('evacuationNormal')}
                    </strong>
                  </div>
                </div>

                {/* Authority Signature */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                  <span>{t('verifiedBy')} <strong>{warn.verified_by || 'DDMA Verification Officer'}</strong></span>
                  <span>{t('controlRoom')}: <strong className="text-rose-600 font-mono">112 / 1070</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
