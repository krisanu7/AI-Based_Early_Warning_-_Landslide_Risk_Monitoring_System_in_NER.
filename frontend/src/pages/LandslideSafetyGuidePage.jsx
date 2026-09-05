import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Phone
} from 'lucide-react';

import { RAGDisasterAssistant } from '../components/rag/RAGDisasterAssistant';

export const LandslideSafetyGuidePage = () => {
  const { t } = useLanguage();

  const EMERGENCY_CONTACTS = [
    { title: "National Emergency Response (All Emergencies)", number: "112", desc: "Toll-Free 24x7 Centralized Emergency Dispatch" },
    { title: "National Disaster Management Authority (NDMA)", number: "1078", desc: "National Disaster Helpline & Control Room" },
    { title: "State Disaster Management Authority (Assam SDMA)", number: "1070 / 1079", desc: "State Disaster Operations Center, Dispur" },
    { title: "Meghalaya SDMA Emergency Control Room", number: "0364-2502098 / 1070", desc: "Secretariat Hills, Shillong" },
    { title: "Sikkim SDMA Helpline", number: "03592-202720", desc: "Tashiling Secretariat, Gangtok" },
    { title: "Arunachal Pradesh Disaster Control", number: "0360-2212233", desc: "Civil Secretariat, Itanagar" },
    { title: "National Highway Emergency Support (NHAI)", number: "1033", desc: "Toll-Free 24x7 Road Obstruction & Recovery" },
    { title: "Emergency Ambulance & Medical Care", number: "108", desc: "24x7 Free Rural Emergency Ambulance" }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('guideOfficialBadge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('guideMainTitle')}
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm">
            {t('guideMainSub')}
          </p>
        </div>
      </div>

      {/* RAG AI Disaster Assistant Component */}
      <RAGDisasterAssistant />


      {/* 4 Stage Safety Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stage 1: Before a Landslide */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-black">
              01
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {t('beforeLandslide')}
              </h2>
              <p className="text-xs text-slate-500">{t('beforeLandslideSub')}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('beforeLandslideP1')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('beforeLandslideP2')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('beforeLandslideP3')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('beforeLandslideP4')}</span>
            </div>
          </div>
        </div>

        {/* Stage 2: During Heavy Rainfall */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-black">
              02
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {t('duringRainfall')}
              </h2>
              <p className="text-xs text-slate-500">{t('duringRainfallSub')}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{t('duringRainfallP1')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{t('duringRainfallP2')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{t('duringRainfallP3')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{t('duringRainfallP4')}</span>
            </div>
          </div>
        </div>

        {/* Stage 3: During a Landslide */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center font-black">
              03
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {t('duringLandslide')}
              </h2>
              <p className="text-xs text-slate-500">{t('duringLandslideSub')}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{t('duringLandslideP1')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{t('duringLandslideP2')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{t('duringLandslideP3')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{t('duringLandslideP4')}</span>
            </div>
          </div>
        </div>

        {/* Stage 4: After a Landslide */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-black">
              04
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {t('afterLandslide')}
              </h2>
              <p className="text-xs text-slate-500">{t('afterLandslideSub')}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('afterLandslideP1')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('afterLandslideP2')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('afterLandslideP3')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t('afterLandslideP4')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Emergency Helpline Contacts Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-600" />
              <span>{t('emergencyDirectoryTitle')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {t('emergencyDirectorySub')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EMERGENCY_CONTACTS.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{c.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">{c.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <a
                  href={`tel:${c.number.split('/')[0].trim()}`}
                  className="font-mono text-sm font-black text-rose-600 dark:text-rose-400 hover:underline"
                >
                  📞 {c.number}
                </a>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                  24x7
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
