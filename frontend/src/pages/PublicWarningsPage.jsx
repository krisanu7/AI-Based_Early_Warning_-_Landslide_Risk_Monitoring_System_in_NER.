import React, { useState, useEffect } from 'react';
import { alertsApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { 
  Megaphone, 
  Volume2, 
  VolumeX, 
  MapPin, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';

const STATE_MAP = {
  Assam: { bn: 'অসম', as: 'অসম', hi: 'असम' },
  Meghalaya: { bn: 'মেঘালয়', as: 'মেঘালয়', hi: 'मेघालय' },
  Manipur: { bn: 'মণিপুর', as: 'মণিপুৰ', hi: 'मणिपुर' },
  Mizoram: { bn: 'মিজোরাম', as: 'মিজোৰাম', hi: 'मिजोरम' },
  Sikkim: { bn: 'সিকিম', as: 'সিকিম', hi: 'सिक्किम' },
  'Arunachal Pradesh': { bn: 'অরুণাচল প্রদেশ', as: 'অৰুণাচল প্ৰদেশ', hi: 'अरुणाचल प्रदेश' },
  Nagaland: { bn: 'নাগাল্যান্ড', as: 'নাগালেণ্ড', hi: 'नागालैंड' },
  Tripura: { bn: 'ত্রিপুরা', as: 'ত্ৰিপুৰা', hi: 'त्रिपुरा' },
};

const translateState = (stateStr, lang) => {
  if (!stateStr || lang === 'en') return stateStr;
  return STATE_MAP[stateStr]?.[lang] || stateStr;
};

const OFFICER_MAP = {
  bn: 'জেলা দুর্যোগ ব্যবস্থাপনা কর্মকর্তা (DDMA)',
  as: 'জিলা দুৰ্যোগ ব্যৱস্থাপনা বিষয়া (DDMA)',
  hi: 'जिला आपदा प्रबंधन अधिकारी (DDMA)',
  en: 'District Disaster Management Officer (DDMA)'
};

const translateOfficer = (officerStr, lang) => {
  if (lang === 'en') return officerStr || 'DDMA Verification Officer';
  if (!officerStr || officerStr.includes('Officer') || officerStr.includes('Authority') || officerStr.includes('Verification')) {
    return OFFICER_MAP[lang] || officerStr;
  }
  return officerStr;
};

const PHRASE_DICTIONARY = {
  bn: [
    ['URGENT LANDSLIDE ADVISORY:', 'জরুরি ভূমিধস সতর্কতা:'],
    ['HIGH SLOPE ALERT:', 'উচ্চ পাহাড়ি ঢাল সতর্কতা:'],
    ['LANDSLIDE WARNING:', 'ভূমিধস সতর্কতা:'],
    ['OFFICIAL LANDSLIDE WARNING:', 'সরকারি ভূমিধস সতর্কতা:'],
    ['Continuous heavy rainfall', 'টানা ভারী বৃষ্টিপাত'],
    ['and unstable slope angle', 'এবং অস্থির পাহাড়ি ঢাল'],
    ['detected.', 'শনাক্ত হয়েছে।'],
    ['Authorities advise avoiding road travel along', 'কর্তৃপক্ষের পরামর্শ অনুযায়ী সড়কে যান চলাচল এড়িয়ে চলুন:'],
    ['Multi-temporal rainfall surge', 'অতিরিক্ত বৃষ্টিপাতের ফলে'],
    ['triggered soil saturation.', 'মাটি শিথিল হয়ে পড়েছে।'],
    ['Heavy vehicle traffic restricted along', 'ভারী যানবাহন চলাচল সীমিত করা হয়েছে:'],
    ['Debris flow risk detected at', 'ভূমিধসের ধ্বংসাবশেষ জমার ঝুঁকি দেখা দিয়েছে:'],
    ['Border Roads Organisation (BRO) emergency clearance teams deployed.', 'বর্ডার রোডস অর্গানাইজেশন (BRO) জরুরি উদ্ধারকারী দল মোতায়েন করা হয়েছে।'],
    ['State/District Disaster Management Authority warns residents of', 'জেলা দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষ এলাকার বাসিন্দাদের সতর্ক করছে:'],
    ['and surrounding transport corridors of high landslide potential due to heavy continuous precipitation.', 'এবং আশেপাশের সড়ক ও পরিবহন করিডোরে টানা বৃষ্টির কারণে উচ্চ ভূমিধসের ঝুঁকি রয়েছে।'],
    ['Avoid vulnerable slope zones and remain alert for official evacuation instructions.', 'ঝুঁকিপূর্ণ পাহাড়ি ঢাল এড়িয়ে চলুন এবং সরকারি সরিয়ে নেওয়ার নির্দেশের জন্য প্রস্তুত থাকুন।']
  ],
  as: [
    ['URGENT LANDSLIDE ADVISORY:', 'জৰুৰী ভূমিস্খলন নিৰ্দেশনা:'],
    ['HIGH SLOPE ALERT:', 'উচ্চ পাহাৰীয়া ঢাল সতৰ্কতা:'],
    ['LANDSLIDE WARNING:', 'ভূমিস্খলন সতৰ্কবাৰ্তা:'],
    ['OFFICIAL LANDSLIDE WARNING:', 'চৰকাৰী ভূমিস্খলন সতৰ্কবাৰ্তা:'],
    ['Continuous heavy rainfall', 'অবিৰাম ধাৰাষাৰ বৰষুণ'],
    ['and unstable slope angle', 'আৰু অস্থিৰ পাহাৰীয়া ঢাল'],
    ['detected.', 'ধৰা পৰিছে।'],
    ['Authorities advise avoiding road travel along', 'কৰ্তৃপক্ষই পথত যাতায়াত নকৰিবলৈ পৰামৰ্শ দিছে:'],
    ['Multi-temporal rainfall surge', 'অধিক বৰষুণৰ ফলত'],
    ['triggered soil saturation.', 'মাটি শিথিল হৈ পৰিছে।'],
    ['Heavy vehicle traffic restricted along', 'গধুৰ যানবাহন চলাচল সীমিত কৰা হৈছে:'],
    ['Debris flow risk detected at', 'ভূমিস্খলনৰ আৱৰ্জনা জমা হোৱাৰ সম্ভাৱনা:'],
    ['Border Roads Organisation (BRO) emergency clearance teams deployed.', 'সীমা পথ সংস্থা (BRO) জৰুৰীকালীন উদ্ধাৰকাৰী দল মোতায়েন কৰা হৈছে।'],
    ['State/District Disaster Management Authority warns residents of', 'জিলা দুৰ্যোগ ব্যৱস্থাপনা কৰ্তৃপক্ষই এলেকাৰ বাসিন্দা সকলক সতৰ্ক কৰিছে:'],
    ['and surrounding transport corridors of high landslide potential due to heavy continuous precipitation.', 'আৰু আশপাশৰ পথ সমূহত অবিৰাম বৰষুণৰ বাবে ভূমিস্খলনৰ অত্যন্ত সম্ভাৱনা আছে।'],
    ['Avoid vulnerable slope zones and remain alert for official evacuation instructions.', 'বিপজ্জনক পাহাৰীয়া ঢালৰ পৰা আতৰি থাকক আৰু চৰকাৰী আশ্ৰয় স্থানান্তৰ নিৰ্দেশৰ বাবে সতৰ্ক থাকক।']
  ],
  hi: [
    ['URGENT LANDSLIDE ADVISORY:', 'आपातकालीन भूस्खलन चेतावनी:'],
    ['HIGH SLOPE ALERT:', 'उच्च ढलान चेतावनी:'],
    ['LANDSLIDE WARNING:', 'भूस्खलन चेतावनी:'],
    ['OFFICIAL LANDSLIDE WARNING:', 'आधिकारिक भूस्खलन चेतावनी:'],
    ['Continuous heavy rainfall', 'लगातार भारी बारिश'],
    ['and unstable slope angle', 'और अस्थिर ढलान कोण'],
    ['detected.', 'दर्ज किया गया।'],
    ['Authorities advise avoiding road travel along', 'अधिकारियों ने मार्ग पर यात्रा से बचने की सलाह दी है:'],
    ['Multi-temporal rainfall surge', 'अत्यधिक बारिश से'],
    ['triggered soil saturation.', 'मिट्टी ढीली हो गई है।'],
    ['Heavy vehicle traffic restricted along', 'भारी वाहनों की आवाजाही प्रतिबंधित है:'],
    ['Debris flow risk detected at', 'मलबे के बहाव का खतरा:'],
    ['Border Roads Organisation (BRO) emergency clearance teams deployed.', 'सीमा सड़क संगठन (BRO) की आपातकालीन टीम तैनात की गई है।'],
    ['State/District Disaster Management Authority warns residents of', 'जिला आपदा प्रबंधन प्राधिकरण निवासियों को चेतावनी जारी करता है:'],
    ['and surrounding transport corridors of high landslide potential due to heavy continuous precipitation.', 'और आसपास के परिवहन गलियारों में लगातार बारिश के कारण भूस्खलन की उच्च संभावना है।'],
    ['Avoid vulnerable slope zones and remain alert for official evacuation instructions.', 'संवेदनशील ढलान क्षेत्रों से बचें और आधिकारिक निकासी निर्देशों के लिए सतर्क रहें।']
  ]
};

const translateDynamicText = (str, lang) => {
  if (!str || lang === 'en' || !PHRASE_DICTIONARY[lang]) return str;
  let result = str;
  PHRASE_DICTIONARY[lang].forEach(([enPhrase, localPhrase]) => {
    result = result.replaceAll(enPhrase, localPhrase);
  });
  return result;
};

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

    let rawTitle = t(titleKey) !== titleKey ? t(titleKey) : (warn.public_warning_headline || warn.title);
    let rawMsg = t(msgKey) !== msgKey ? t(msgKey) : warn.public_warning_message;

    return {
      title: translateDynamicText(rawTitle, language),
      message: translateDynamicText(rawMsg, language)
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
                      <span>{t('location') || 'Location'}: <strong>{warn.village || warn.title}</strong>, {warn.district} ({translateState(warn.state, language)})</span>
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
                  <span>{t('verifiedBy')} <strong>{translateOfficer(warn.verified_by, language)}</strong></span>
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
