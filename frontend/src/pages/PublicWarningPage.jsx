import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertsApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { ContactFacilityModal } from '../components/common/ContactFacilityModal';
import { 
  Radio, 
  ShieldAlert, 
  AlertCircle, 
  Droplets, 
  Flame, 
  HeartHandshake, 
  Hospital, 
  PhoneCall, 
  ShieldCheck,
  ChevronRight,
  Volume2,
  VolumeX,
  Languages,
  Globe
} from 'lucide-react';

const ADVISORY_TRANSLATIONS = {
  AS: {
    title: "মাজুলী নদী দ্বীপত সতৰ্কবাৰ্তা: কলেৰা আৰু ডায়েৰিয়াৰ প্ৰাদুৰ্ভাৱৰ সংকেত",
    message: "ব্ৰহ্মপুত্ৰৰ বানপানীৰ পিছত মাজুলীৰ গড়মূৰ আৰু কমলাবাৰী অঞ্চলৰ খোৱাপানীৰ উৎস দূষিত হোৱাৰ তথ্য পোৱা গৈছে। সকলো নাগৰিকক কেৱল ১ মিনিট ভালদৰে উতলোৱা পানী বা ক্ল'ৰিনযুক্ত পানী খাবলৈ জনোৱা হ'ল। লক্ষণ দেখা পোৱাৰ লগে লগে গড়মূৰ প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰলৈ যাওক।",
    headline: "মাজুলীৰ কমলাবাৰীত ডায়েৰিয়াৰ জৰুৰী সতৰ্ক সংকেত",
    approved_by: "ডাঃ এ কে বৰুৱা (জিলা নিৰীক্ষণ বিষয়া, IDSP)"
  },
  BN: {
    title: "মাজুলী নদী দ্বীপে জরুরি সতর্কতা: ডায়রিয়া ও কলেরার প্রাদুর্ভাব সংকেত",
    message: "বন্যার পর মাজুলীর গড়মুর এবং কমলাবাড়ি এলাকার পানীয় জলের উৎস মারাত্মকভাবে দূষিত হওয়ার খবর পাওয়া গেছে। সমস্ত বাসিন্দাদের শুধুমাত্র ১ মিনিট টগবগ করে ফোটানো জল বা ক্লোরিনযুক্ত জল পান করার নির্দেশ দেওয়া হচ্ছে। বমি বা ডায়রিয়ার লক্ষণ দেখা দিলে অবিলম্বে গড়মুর প্রাথমিক স্বাস্থ্যকেন্দ্রে যোগাযোগ করুন।",
    headline: "মাজুলীর কমলাবাড়িতে ডায়রিয়া প্রাদুর্ভাবের সরকারি সতর্কতা",
    approved_by: "ডাঃ এ. কে. বরুয়া (জেলা সার্ভিল্যান্স অফিসার, IDSP)"
  },
  HI: {
    title: "माजुली नदी द्वीप में आपातकालीन जनस्वास्थ्य चेतावनी: हैजा व डायरिया का प्रकोप",
    message: "बाढ़ के बाद माजुली के गरमुड़ और कमलाबाड़ी क्षेत्र के पेयजल स्रोतों में अत्यधिक दूषित जल पाया गया है। सभी नागरिकों को केवल 1 मिनट तक उबला हुआ या क्लोरीन युक्त पानी पीने का निर्देश दिया जाता है। उल्टी या दस्त के लक्षण दिखने पर तुरंत प्राथमिक स्वास्थ्य केंद्र से संपर्क करें।",
    headline: "माजुली के कमलाबाड़ी में डायरिया प्रकोप की आधिकारिक चेतावनी",
    approved_by: "डॉ. ए. के. बरुआ (जिला निगरानी अधिकारी, IDSP)"
  }
};

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'AS', label: 'অসমীয়া' },
  { code: 'BN', label: 'বাংলা' },
  { code: 'HI', label: 'हिंदी' }
];

export const PublicWarningPage = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const { lang, setLang, t, speak, stopSpeaking } = useLanguage();

  useEffect(() => {
    const fetchWarnings = async () => {
      try {
        const res = await alertsApi.getPublicWarnings();
        setWarnings(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWarnings();
  }, []);

  const handleSpeak = (id, defaultHeadline, defaultMsg) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    let textToSpeak = `${defaultHeadline}. ${defaultMsg}`;
    if (lang !== 'EN' && ADVISORY_TRANSLATIONS[lang]) {
      textToSpeak = `${ADVISORY_TRANSLATIONS[lang].headline}. ${ADVISORY_TRANSLATIONS[lang].message}.`;
    }

    setSpeakingId(id);
    speak(textToSpeak);
    
    // Auto reset speaking icon after 15 seconds
    setTimeout(() => {
      setSpeakingId(null);
    }, 15000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-bold uppercase">
            <Radio className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>Official Citizen Health Advisory Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('advisories_title')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            {t('advisories_sub')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Vernacular Language Selector */}
          <div className="flex items-center p-1 bg-white/10 backdrop-blur rounded-2xl border border-white/20 text-xs">
            <Globe className="w-4 h-4 text-teal-300 ml-2 mr-1" />
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  lang === l.code ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all shrink-0"
          >
            <PhoneCall className="w-4 h-4 text-teal-200" />
            <span>{t('emergency_directory')}</span>
          </button>
        </div>
      </div>

      {/* Safety Guardrail Alert */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">{t('core_principle_badge')}</span>
          &ldquo;{t('core_disclaimer')}&rdquo;
        </div>
      </div>

      {/* Active Confirmed Advisories */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-rose-600" />
          <span>{t('active_warnings')} ({warnings.length})</span>
        </h2>

        {warnings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('no_active_warnings')}</p>
            <p>{t('no_active_warnings_sub')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {warnings.map((w) => {
              const translated = lang !== 'EN' && ADVISORY_TRANSLATIONS[lang] ? ADVISORY_TRANSLATIONS[lang] : null;
              const displayHeadline = translated ? translated.headline : w.headline;
              const displayMessage = translated ? translated.message : w.message;
              const displayApprovedBy = translated ? translated.approved_by : w.approved_by;

              return (
                <div key={w.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-rose-200 dark:border-rose-900/60 shadow-md space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-rose-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                        {t('official_advisory')}
                      </span>
                      <h3 className="font-black text-slate-900 dark:text-white text-base mt-2">{displayHeadline}</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {t('affected_area')} <strong className="text-slate-800 dark:text-slate-200">{w.area_covered}</strong> ({w.state})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(w.id, displayHeadline, displayMessage)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          speakingId === w.id
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Audio broadcast for rural accessibility"
                      >
                        {speakingId === w.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600" />}
                        <span>{speakingId === w.id ? t('stop_audio') : t('listen_advisory')}</span>
                      </button>
                      <span className="text-xs text-slate-400 font-mono">Issued: {w.issue_date}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium">
                    {displayMessage}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                    <div className="text-slate-500 dark:text-slate-400">
                      {t('authorized_by')} <strong className="text-slate-800 dark:text-slate-200">{displayApprovedBy}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-700 dark:text-rose-400">📞 {t('helpline')} {w.emergency_contact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prevention Banner to Disease Safety Guide */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('safe_water_hygiene')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">{t('safe_water_sub')}</p>
          </div>
        </div>
        <Link
          to="/disease-safety-guide"
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md"
        >
          <span>{t('disease_safety_guide')}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Contact Facility Modal */}
      <ContactFacilityModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
};
