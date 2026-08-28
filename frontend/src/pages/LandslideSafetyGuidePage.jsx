import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mountain, 
  CloudRain,
  Home,
  Navigation
} from 'lucide-react';

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
            <span>Official Community Disaster Preparedness Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Landslide Safety & Community Preparedness Guide
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm">
            Government of India & NDMA approved action plans for families and communities living near steep hill slopes in Northeast India.
          </p>
        </div>
      </div>

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
              <p className="text-xs text-slate-500">Pre-monsoon preparedness & family planning</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Know your local evacuation routes and identify nearby designated safe shelters.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Monitor official weather advisories and rainfall radar alerts during monsoon months.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Keep an emergency grab-bag ready with essential medicines, torch, battery radio, and documents.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Avoid building houses directly beneath steep, unreinforced highway cut-slopes or cliff edges.</span>
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
              <p className="text-xs text-slate-500">Continuous rainfall & high-saturation window</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Listen to public early-warning bulletins and check for soil movement near retaining walls.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Stay alert for unusual sounds like cracking trees, rolling boulders, or sudden water muddying.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Avoid non-essential travel along vulnerable National Highway hill corridors (NH-27, NH-6, NH-10).</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Be prepared to evacuate immediately if local disaster authorities issue an alert.</span>
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
              <p className="text-xs text-slate-500">Immediate life-safety actions</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span><strong>Move quickly away</strong> from the path of the landslide or mudflow to stable high ground.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>If escape is not possible, curl into a tight ball and protect your head with arms under sturdy furniture.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Do NOT attempt to drive through mud debris or waterlogged hill roads.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Stay away from damaged electrical poles and loose transmission wires.</span>
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
              <p className="text-xs text-slate-500">Post-event recovery & secondary hazard avoidance</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Stay away from the slide area. Secondary landslides often occur hours after the first failure.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Check for trapped or injured neighbors without directly entering the active slide zone.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Report broken utility lines and road blockages immediately to emergency authorities (Dial 112).</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Do not return to damaged homes until local engineers officially declare the structure safe.</span>
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
              <span>24x7 Northeast Disaster Emergency Directory</span>
            </h2>
            <p className="text-xs text-slate-500">
              Verified official disaster response hotlines across India and the 8 Northeast states.
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
