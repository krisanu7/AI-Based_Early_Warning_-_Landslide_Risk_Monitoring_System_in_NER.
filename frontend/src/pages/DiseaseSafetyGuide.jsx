import React, { useState, useEffect } from 'react';
import { guidelinesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ContactFacilityModal } from '../components/common/ContactFacilityModal';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Droplets, 
  Sparkles, 
  HeartHandshake, 
  Utensils, 
  Trash2, 
  Flame, 
  ShieldAlert, 
  PhoneCall, 
  Edit3, 
  Save, 
  Info,
  Layers,
  ThermometerSnowflake,
  ExternalLink,
  Globe
} from 'lucide-react';

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'AS', label: 'অসমীয়া' },
  { code: 'BN', label: 'বাংলা' },
  { code: 'HI', label: 'हिंदी' }
];

export const DiseaseSafetyGuide = () => {
  const { isAuthority, isAdmin, user } = useAuth();
  const { lang, setLang, t, getDiseaseContent } = useLanguage();
  const [guidelines, setGuidelines] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('Diarrhea');
  const [activeGuideline, setActiveGuideline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const diseaseCategories = [
    'Diarrhea',
    'Cholera',
    'Typhoid',
    'Hepatitis A',
    'Dysentery',
    'Acute Gastroenteritis',
    'Other Water-Borne Diseases'
  ];

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const res = await guidelinesApi.getAll();
      setGuidelines(res.data || []);
      const current = res.data.find(g => g.disease.toLowerCase() === selectedDisease.toLowerCase());
      if (current) {
        setActiveGuideline(current);
      } else if (res.data.length > 0) {
        setActiveGuideline(res.data[0]);
      }
    } catch (e) {
      console.error('Error fetching disease safety guidelines', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  useEffect(() => {
    if (guidelines.length > 0) {
      const current = guidelines.find(g => g.disease.toLowerCase() === selectedDisease.toLowerCase());
      if (current) {
        setActiveGuideline(current);
      } else {
        const fallback = guidelines.find(g => g.disease.includes('Other')) || guidelines[0];
        setActiveGuideline(fallback);
      }
    }
  }, [selectedDisease, guidelines]);

  // Retrieve translated guideline content for the selected language
  const translatedContent = getDiseaseContent(selectedDisease, {
    do: activeGuideline?.do || ['Drink safe or boiled drinking water exclusively.'],
    dont: activeGuideline?.dont || ['Do not drink untreated flood water.'],
    warning_signs: activeGuideline?.warning_signs || ['Severe dehydration, sunken eyes, continuous vomiting.']
  });

  const handleOpenEdit = () => {
    if (!activeGuideline) return;
    setEditFormData({
      disease: activeGuideline.disease,
      do: activeGuideline.do?.join('\n') || '',
      dont: activeGuideline.dont?.join('\n') || '',
      warning_signs: activeGuideline.warning_signs?.join('\n') || '',
      prevention: activeGuideline.prevention?.join('\n') || '',
      safe_water_tips: activeGuideline.safe_water_tips?.join('\n') || '',
      approved_by: activeGuideline.approved_by || 'Health Authority'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        disease: editFormData.disease,
        do: editFormData.do.split('\n').filter(s => s.trim().length > 0),
        dont: editFormData.dont.split('\n').filter(s => s.trim().length > 0),
        warning_signs: editFormData.warning_signs.split('\n').filter(s => s.trim().length > 0),
        prevention: editFormData.prevention.split('\n').filter(s => s.trim().length > 0),
        safe_water_tips: editFormData.safe_water_tips.split('\n').filter(s => s.trim().length > 0),
        approved_by: `${user?.name || 'Authority'} (${user?.role || 'AUTHORITY'})`,
        updated_at: new Date().toISOString().split('T')[0],
        is_active: true
      };

      await guidelinesApi.save(payload);
      setIsEditModalOpen(false);
      setSaveSuccess(true);
      await fetchGuidelines();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving guideline', err);
      alert('Failed to save guideline updates. Please check authorization.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Public-Health Advisory Portal</span>
            </div>

            {/* Language Switcher Bar inside Header */}
            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur rounded-full p-1 border border-white/20">
              <Globe className="w-3.5 h-3.5 text-teal-300 ml-1.5" />
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                    lang === l.code
                      ? 'bg-white text-teal-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t('guide_title')}
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            {t('guide_subtitle')}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
            <Info className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{t('disclaimer_notice')}</span>
          </div>
        </div>

        {(isAuthority || isAdmin) && (
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-emerald-300" />
              <span>Authority: Edit Guidelines</span>
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Guideline successfully updated in national health registry and synchronized across all dashboards.</span>
        </div>
      )}

      {/* Disease Selection Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t('select_disease')}</span>
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {t('reviewed_by')} <strong className="text-slate-700 dark:text-slate-300">{activeGuideline?.approved_by || 'State Public Health Directorate (NER)'}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {diseaseCategories.map((diseaseName) => {
            const isSelected = selectedDisease.toLowerCase() === diseaseName.toLowerCase();
            return (
              <button
                key={diseaseName}
                onClick={() => setSelectedDisease(diseaseName)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{diseaseName}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 4 Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: ✅ WHAT TO DO */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-950/60 shadow-sm space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">{t('what_to_do')}</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('what_to_do_sub')}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
              DO
            </span>
          </div>

          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            {translatedContent?.do?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 2: ❌ WHAT NOT TO DO */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-rose-950/60 shadow-sm space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">{t('what_not_to_do')}</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('what_not_to_do_sub')}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 rounded-full text-[10px] font-bold border border-rose-200 dark:border-rose-800">
              DO NOT
            </span>
          </div>

          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            {translatedContent?.dont?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-rose-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Section 3: 🚨 WHEN TO SEEK MEDICAL HELP */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-amber-950/20 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('when_to_seek_help')}</h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                &ldquo;{t('when_to_seek_help_quote')}&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold text-xs rounded-2xl shadow-lg shadow-teal-700/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
          >
            <PhoneCall className="w-4 h-4 text-teal-300 animate-bounce" />
            <span>{t('contact_facility_btn')}</span>
          </button>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
            {t('warning_signs_for')} {selectedDisease}:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {translatedContent?.warning_signs?.map((sign, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/80 shadow-sm flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">{sign}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic border-t border-amber-200/60 dark:border-slate-800 pt-3">
          * Notice: SwasthyaJal NER does not prescribe medicines or provide individual diagnoses. Consult the nearest Primary Health Centre or Community Health Centre.
        </div>
      </div>

      {/* Section 4: 💧 SAFE WATER & HYGIENE VISUAL CARDS */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>{t('safe_water_hygiene')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('safe_water_sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('protocol_boil_title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('protocol_boil_desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <HeartHandshake className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('protocol_hand_title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('protocol_hand_desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Utensils className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('protocol_food_title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('protocol_food_desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Trash2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('protocol_sanitation_title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('protocol_sanitation_desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('protocol_storage_title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('protocol_storage_desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Droplets className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('protocol_avoid_title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('protocol_avoid_desc')}
            </p>
          </div>

        </div>
      </div>

      {/* Disease Information Card Footer */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">SwasthyaJal Protocol:</span>
          <span>&ldquo;These are general health and prevention guidelines. They do not replace advice from a qualified healthcare professional.&rdquo;</span>
        </div>
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="text-teal-700 dark:text-teal-400 hover:text-teal-900 font-bold flex items-center gap-1 text-xs shrink-0"
        >
          <span>{t('find_healthcare_centre')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Contact Healthcare Facility Modal */}
      <ContactFacilityModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      {/* Authority Edit Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="bg-teal-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Edit Health Guideline: {editFormData.disease}</h3>
                <p className="text-xs text-teal-200">Authority Controlled Public-Health Repository</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">✅ WHAT TO DO (One item per line)</label>
                <textarea
                  rows={4}
                  value={editFormData.do}
                  onChange={(e) => setEditFormData({ ...editFormData, do: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">❌ WHAT NOT TO DO (One item per line)</label>
                <textarea
                  rows={4}
                  value={editFormData.dont}
                  onChange={(e) => setEditFormData({ ...editFormData, dont: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">🚨 Common Warning Signs (One item per line)</label>
                <textarea
                  rows={3}
                  value={editFormData.warning_signs}
                  onChange={(e) => setEditFormData({ ...editFormData, warning_signs: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">💧 Safe Water Tips (One item per line)</label>
                <textarea
                  rows={3}
                  value={editFormData.safe_water_tips}
                  onChange={(e) => setEditFormData({ ...editFormData, safe_water_tips: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 font-sans"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Publish to Registry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
