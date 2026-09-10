/**
 * Smart Multi-Lingual DOM Translator Engine for Northeast Landslide Portal
 * Provides instantaneous 0ms client-side translation for all pages, sidebars,
 * buttons, and telemetry, paired with Google Translate Website Engine bridge.
 */

export const DICTIONARY = {
  // Navigation & Branding
  "NER Landslide AI": {
    as: "এন.ই.আৰ ভূমিস্খলন এ.আই",
    bn: "এন.ই.আর ভূমিধস এ.আই",
    hi: "एनईआर भूस्खलन एआई"
  },
  "Command Dashboard": {
    as: "নিয়ন্ত্ৰণ ডেচবৰ্ড",
    bn: "কমান্ড ড্যাশবোর্ড",
    hi: "कमांड डैशबोर्ड"
  },
  "Live GIS Map": {
    as: "লাইভ জি.আই.এছ মানচিত্ৰ",
    bn: "লাইভ জিআইএস মানচিত্র",
    hi: "लाइव जीआईएस मैप"
  },
  "Field Reporting": {
    as: "ক্ষেত্ৰ প্ৰতিবেদন",
    bn: "মাঠপর্যায়ের রিপোর্ট",
    hi: "फील्ड रिपोर्टिंग"
  },
  "AI Visual Inspector": {
    as: "এআই দৃশ্য পৰিদৰ্শক",
    bn: "এআই ভিজ্যুয়াল পরিদর্শক",
    hi: "एआई विजुअल इंस्पेक्टर"
  },
  "Incident Triage": {
    as: "ঘটনা পৰীক্ষণ",
    bn: "ঘটনা তদন্ত ও যাচাই",
    hi: "घटना सत्यापन"
  },
  "Disaster Logistics": {
    as: "দুৰ্যোগ সঁহাৰি লজিষ্টিকছ",
    bn: "ত্রাণ ও উদ্ধার লজিস্টিকস",
    hi: "आपदा राहत लॉजिस्टिक्स"
  },
  "Road & Infra Risk": {
    as: "ৰাস্তা আৰু আন্তঃগাঁথনি",
    bn: "সড়ক ও পরিকাঠামো ঝুঁকি",
    hi: "सड़क व पुल जोखिम"
  },
  "Evacuation Centers": {
    as: "আশ্ৰয় শিবিৰ",
    bn: "আশ্রয় কেন্দ্র",
    hi: "आश्रय केंद्र"
  },
  "Public Advisories": {
    as: "ৰাজহুৱা সতৰ্কবাৰ্তা",
    bn: "সর্বসাধারণের সতর্কতা",
    hi: "सार्वजनिक चेतावनियां"
  },
  "Historical Trends": {
    as: "ঐতিহাসিক তথ্য বিশ্লেষণ",
    bn: "ঐতিহাসিক প্রবণতা",
    hi: "ऐतिहासिक आंकड़े"
  },
  "AI Model & Health": {
    as: "এ.আই মডেল নিৰীক্ষণ",
    bn: "এআই মডেল স্বাস্থ্য",
    hi: "एআই मॉडल स्थिति"
  },
  "RAG AI Safety & SOPs": {
    as: "সুৰক্ষা আৰু প্ৰস্তুতি",
    bn: "নিরাপত্তা ও প্রস্তুতি গাইড",
    hi: "सुरक्षा व तैयारी निर्देश"
  },
  "Auth / Persona Sign In": {
    as: "লগইন / ভূমিকা বাছক",
    bn: "লগইন / ভূমিকা নির্বাচন",
    hi: "लॉगिन / भूमिका चयन"
  },
  "SIH 2026 Pitch Tour": {
    as: "এছ.আই.এইচ ২০২৬ প্ৰদৰ্শন",
    bn: "এসআইএইচ ২০২৬ উপস্থাপনা",
    hi: "एसआईएच 2026 प्रेजेंटेशन टूर"
  },
  "SIH 2026 Pitch Architecture Tour • InnovateX": {
    as: "এছ.আই.এইচ ২০২৬ আৰ্কিটেকচাৰ প্ৰদৰ্শন • ইনোভেটএক্স",
    bn: "এসআইএইচ ২০২৬ আর্কিটেকচার ট্যুর • ইনোভেটএক্স",
    hi: "एसआईएच 2026 आर्किटेक्चर टूर • इनोवेटएक्स"
  },
  "Key Engineering Innovations:": {
    as: "মুখ্য অভিযান্ত্ৰিক উদ্ভাৱনসমূহ:",
    bn: "মূল প্রকৌশল উদ্ভাবনসমূহ:",
    hi: "प्रमुख इंजीनियरिंग नवाचार:"
  },
  "Next Pillar": {
    as: "পৰৱৰ্তী স্তম্ভ",
    bn: "পরবর্তী স্তম্ভ",
    hi: "अगला स्तंभ"
  },
  "Complete Tour": {
    as: "প্ৰদৰ্শন সমাপ্ত কৰক",
    bn: "ট্যুর সমাপ্ত করুন",
    hi: "टूर समाप्त करें"
  },
  "Previous": {
    as: "পূৰ্বৱৰ্তী",
    bn: "পূর্ববর্তী",
    hi: "पिछला"
  },
  "View Command Dashboard": {
    as: "কমাণ্ড ডেচবৰ্ড চাওক",
    bn: "কমান্ড ড্যাশবোর্ড দেখুন",
    hi: "कमांड डैशबोर्ड देखें"
  },
  "Inspect Model Telemetry": {
    as: "মডেল টেলিমেট্ৰি নিৰীক্ষণ কৰক",
    bn: "মডেল টেলিমেট্রি পর্যবেক্ষণ করুন",
    hi: "मॉडल टेलीमेट्री निरीक्षण करें"
  },
  "Open AI Visual Inspector": {
    as: "এআই দৃশ্য পৰিদৰ্শক খোলক",
    bn: "এআই ভিজ্যুয়াল পরিদর্শক খুলুন",
    hi: "एआई विजुअल इंस्पेक्टर खोलें"
  },
  "View Public Advisories": {
    as: "ৰাজহুৱা সতৰ্কবাৰ্তা চাওক",
    bn: "জনস্বার্থ সতর্কতা দেখুন",
    hi: "सार्वजनिक चेतावनियां देखें"
  },
  "Open Disaster Logistics": {
    as: "দুৰ্যোগ সাহায্য লজিষ্টিকছ খোলক",
    bn: "ত্রাণ লজিস্টিকস খুলুন",
    hi: "आपदा रसद खोलें"
  },
  "Demo Role": {
    as: "ভূমিকা সলনি কৰক",
    bn: "ভূমিকা পরিবর্তন",
    hi: "डेमो भूमिका बदलें"
  },
  "Sign In": {
    as: "ছাইন ইন কৰক",
    bn: "সাইন ইন করুন",
    hi: "साइन इन करें"
  },
  "Logout Persona": {
    as: "লগ আউট কৰক",
    bn: "লগ আউট করুন",
    hi: "লগ আউট करें"
  },
  "Active Persona": {
    as: "সক্ৰিয় ভূমিকা",
    bn: "সক্রিয় ভূমিকা",
    hi: "सक्रिय भूमिका"
  },
  "System Preferences": {
    as: "ব্যৱস্থা পছন্দসমূহ",
    bn: "সিস্টেম পছন্দ",
    hi: "सिस्टम प्राथमिकताएं"
  },
  "Appearance Mode": {
    as: "ৰূপৰেখা মোড",
    bn: "অ্যাপিয়ারেন্স মোড",
    hi: "अपीयरेंस मोड"
  },
  "Regional Language": {
    as: "আঞ্চলিক ভাষা",
    bn: "আঞ্চলিক ভাষা",
    hi: "क्षेत्रीय भाषा"
  },
  "24x7 State EOC Hotline": {
    as: "২৪x৭ ৰাজ্যিক জৰুৰীকালীন হটলাইন",
    bn: "২৪x৭ রাজ্য জরুরি হটলাইন",
    hi: "24x7 राज्य आपातकालीन हेल्पलाइन"
  },

  // AI Visual Inspector Page Elements
  "Multimodal Vision Copilot • Powered by Google Gemini 3.1 Flash Lite": {
    as: "মাল্টিমডেল ভিজন কপাইলট • গুগল জেমিনি ৩.১ ফ্লেশ লাইট চালিত",
    bn: "মাল্টিমোডাল ভিশন কোপাইলট • গুগল জেমিনি ৩.১ ফ্ল্যাশ লাইট চালিত",
    hi: "मल्टीमॉडल विजन कोपायलट • गूगल जेमिनी 3.1 फ्लैश लाइट द्वारा संचालित"
  },
  "AI Visual Landslide & Road/Field Inspector": {
    as: "এআই দৃশ্যমান ভূমিস্খলন আৰু পথ/ক্ষেত্ৰ পৰিদৰ্শক",
    bn: "এআই ভিজ্যুয়াল ভূমিধস ও সড়ক/মাঠ পরিদর্শক",
    hi: "एआई विजुअल भूस्खलन एवं सड़क/खेत निरीक्षक"
  },
  "1-Click Test Scenarios (Northeast Corridors)": {
    as: "১-ক্লিক পৰীক্ষামূলক দৃশ্যপটসমূহ (উত্তৰ-পূব কৰিডৰ)",
    bn: "১-ক্লিক পরীক্ষার দৃশ্যপট (উত্তর-পূর্ব করিডোর)",
    hi: "1-क्लिक परीक्षण परिदृश्य (पूर्वोत्तर गलियारे)"
  },
  "Select to test": {
    as: "পৰীক্ষাৰ বাবে বাছক",
    bn: "পরীক্ষা করতে নির্বাচন করুন",
    hi: "परीक्षण के लिए चुनें"
  },
  "Upload Field or Highway Image": {
    as: "ক্ষেত্ৰ বা ঘাইপথৰ ছবি আপলোড কৰক",
    bn: "মাঠ বা মহাসড়কের ছবি আপলোড করুন",
    hi: "फील्ड या राजमार्ग की तस्वीर अपलोड करें"
  },
  "Analyze Terrain with Gemini AI": {
    as: "জেমিনি এআইৰে ভূখণ্ড বিশ্লেষণ কৰক",
    bn: "জেমিনি এআই দিয়ে ভূখণ্ড বিশ্লেষণ করুন",
    hi: "जेमिनी एआई से इलाके का विश्लेषण करें"
  },
  "Analyzing with Gemini 3.1 Vision...": {
    as: "জেমিনি ভিজনৰ সহায়ত বিশ্লেষণ চলি আছে...",
    bn: "জেমিনি ভিশন দিয়ে বিশ্লেষণ করা হচ্ছে...",
    hi: "जेमिनी विजन द्वारा विश्लेषण जारी है..."
  },
  "Clear Image": {
    as: "ছবি মচক",
    bn: "ছবি মুছুন",
    hi: "छवि हटाएं"
  },
  "Location & Field Metadata": {
    as: "স্থান আৰু ক্ষেত্ৰ মেটাডাটা",
    bn: "অবস্থান ও মাঠের মেটাডাটা",
    hi: "स्थान और फील्ड मेटाडेटा"
  },
  "State / Province": {
    as: "ৰাজ্য / প্ৰদেশ",
    bn: "রাজ্য / প্রদেশ",
    hi: "राज्य / प्रांत"
  },
  "District": {
    as: "জিলা",
    bn: "জেলা",
    hi: "जिला"
  },
  "Village / Highway Landmark": {
    as: "গাঁও / ঘাইপথ ল্যান্ডমাৰ্ক",
    bn: "গ্রাম / মহাসড়ক ল্যান্ডমার্ক",
    hi: "गांव / राजमार्ग स्थल"
  },
  "Latitude": {
    as: "অক্ষাংশ",
    bn: "অক্ষাংশ",
    hi: "अक्षांश"
  },
  "Longitude": {
    as: "দ্ৰাঘিমাংশ",
    bn: "দ্রাঘিমাংশ",
    hi: "देशांतर"
  },
  "Reporter Name": {
    as: "প্ৰতিবেদকৰ নাম",
    bn: "রিপোর্টারের নাম",
    hi: "रिपोर्टर का नाम"
  },
  "Reporter Role": {
    as: "প্ৰতিবেদকৰ ভূমিকা",
    bn: "রিপোর্টারের ভূমিকা",
    hi: "रिपोर्टर की भूमिका"
  },
  "Detailed Geological Findings": {
    as: "বিশদ ভূতাত্ত্বিক ফলাফল",
    bn: "বিস্তারিত ভূতাত্ত্বিক পর্যবেক্ষণ",
    hi: "विस्तृत भूवैज्ञानिक निष्कर्ष"
  },
  "Mitigation & Action Guidance": {
    as: "প্ৰশমন আৰু জৰুৰী পদক্ষেপ নিৰ্দেশনা",
    bn: "প্রতিরোধ ও জরুরি পদক্ষেপ নির্দেশিকা",
    hi: "रोकथाम और कार्रवाई निर्देश"
  },
  "Dispatch Verified Alert": {
    as: "সত্যাপিত সতৰ্কবাৰ্তা প্ৰেৰণ কৰক",
    bn: "যাচাইকৃত সতর্কতা জারি করুন",
    hi: "सत्यापित अलर्ट जारी करें"
  },
  "Landslide Probability": {
    as: "ভূমিস্খলনৰ সম্ভাৱনা",
    bn: "ভূমিধসের সম্ভাবনা",
    hi: "भूस्खलन की संभावना"
  },
  "Terrain Classification": {
    as: "ভূখণ্ড বৰ্গীকৰণ",
    bn: "ভূখণ্ড শ্রেণীবদ্ধকরণ",
    hi: "भूभाग वर्गीकरण"
  },
  "Confidence Score": {
    as: "বিশ্বাসৰ স্ক'ৰ",
    bn: "কনফিডেন্স স্কোর",
    hi: "कॉन्फिडेंस स्कोर"
  },
  "Tension Cracks Detected": {
    as: "টান ফাঁট চিনাক্ত হৈছে",
    bn: "টান ফাটল শনাক্ত হয়েছে",
    hi: "तनाव दरारें पहचानी गईं"
  },
  "Soil Mudflow Risk": {
    as: "মাটিৰ বোকাস্ৰোতৰ আশংকা",
    bn: "মাটির কাদা প্রবাহের ঝুঁকি",
    hi: "मिट्टी मलबे का बहाव जोखिम"
  },
  "Vegetation Loss": {
    as: "উদ্ভিদৰ ক্ষতি",
    bn: "উদ্ভিদের ক্ষতি",
    hi: "वनस्पति की हानि"
  },
  "Highway Blockage Risk": {
    as: "ঘাইপথ বন্ধ হোৱাৰ আশংকা",
    bn: "মহাসড়ক বন্ধ হওয়ার ঝুঁকি",
    hi: "राजमार्ग अवरोध जोखिम"
  },
  "Human Hazard Level": {
    as: "মানৱ সংকট স্তৰ",
    bn: "মানব জীবনের ঝুঁকি স্তর",
    hi: "मानव संकट स्तर"
  },

  // Telemetry & Model Performance
  "AI Model Lifecycle & System Health Telemetry": {
    as: "এআই মডেল জীৱনচক্ৰ আৰু ব্যৱস্থা স্বাস্থ্য টেলিমেট্ৰি",
    bn: "এআই মডেল লাইফসাইকেল ও সিস্টেম স্বাস্থ্য টেলিমেট্রি",
    hi: "एआई मॉडल लाइफसाइकिल और सिस्टम स्वास्थ्य टेलीमेट्री"
  },
  "Random Forest Engine Metrics & Audit Logs": {
    as: "ৰেণ্ডম ফৰেষ্ট ইঞ্জিন মেট্ৰিক্স আৰু অডিট লগ",
    bn: "র‍্যান্ডম ফরেস্ট ইঞ্জিন মেট্রিক্স ও অডিট লগ",
    hi: "रैंडम फॉरेस्ट इंजन मेट्रिक्स और ऑडिट लॉग"
  },
  "Model Accuracy": {
    as: "মডেলৰ সঠিকতা",
    bn: "মডেলের নির্ভুলতা",
    hi: "मॉडल सटीकता"
  },
  "Precision Score": {
    as: "পৰিশুদ্ধতা স্ক'ৰ",
    bn: "নির্ভুলতার স্কোর",
    hi: "परिशुद्धता स्कोर"
  },
  "Recall / Sensitivity": {
    as: "ৰিকল / সংবেদনশীলতা",
    bn: "রিকল / সংবেদনশীলতা",
    hi: "रिकॉल / संवेदनशीलता"
  },
  "ROC-AUC Score": {
    as: "ROC-AUC স্ক'ৰ",
    bn: "ROC-AUC স্কোর",
    hi: "ROC-AUC स्कोर"
  },
  "Test Partition Evaluation": {
    as: "পৰীক্ষামূলক বিভাজন মূল্যায়ন",
    bn: "টেস্ট পার্টিশন মূল্যায়ন",
    hi: "परीक्षण विभाजन मूल्यांकन"
  },
  "Low False Alarm Rate": {
    as: "কম ভুল সতৰ্কবাৰ্তাৰ হাৰ",
    bn: "কম মিথ্যা সতর্কতার হার",
    hi: "कम गलत चेतावनी दर"
  },
  "Hazard Detection Coverage": {
    as: "বিপদ চিনাক্তকৰণ কভাৰেজ",
    bn: "বিপদ শনাক্তকরণ কভারেজ",
    hi: "जोखिम पहचान कवरेज"
  },
  "Discriminative Separation": {
    as: "পৃথকীকৰণ ক্ষমতা",
    bn: "পৃথকীকরণ ক্ষমতা",
    hi: "विभेदक पृथक्करण"
  },
  "Refresh Telemetry": {
    as: "তথ্য সতেজ কৰক",
    bn: "তথ্য রিফ্রেশ করুন",
    hi: "डेटा रीफ्रेश करें"
  },
  "Core Microservices & Subsystem Status": {
    as: "মূল মাইক্ৰ'চাৰ্ভিচ আৰু চাবচিষ্টেমৰ স্থিতি",
    bn: "মূল মাইক্রোসার্ভিস ও সাবসিস্টেমের অবস্থা",
    hi: "कोर माइक्रोसर्विसेज और सबसिस्टम स्थिति"
  },
  "All Systems Operational": {
    as: "সকলো ব্যৱস্থা কাৰ্যক্ষম",
    bn: "সকল ব্যবস্থা সচল",
    hi: "सभी प्रणालियां चालू हैं"
  },
  "Immutable System Audit Logs": {
    as: "অপৰিৱৰ্তনীয় ছিষ্টেম অডিট লগ",
    bn: "অপরিবর্তনযোগ্য সিস্টেম অডিট লগ",
    hi: "अपरिवर्तनीय सिस्टम ऑडिट लॉग"
  },

  // Risk Levels & Common Badges
  "LOW RISK": {
    as: "কম বিপদাশংকা (LOW)",
    bn: "কম ঝুঁকি (LOW)",
    hi: "कम जोखिम (LOW)"
  },
  "MODERATE RISK": {
    as: "মধ্যম বিপদাশংকা (MODERATE)",
    bn: "মাঝারি ঝুঁকি (MODERATE)",
    hi: "मध्यम जोखिम (MODERATE)"
  },
  "HIGH RISK": {
    as: "উচ্চ বিপদাশংকা (HIGH)",
    bn: "উচ্চ ঝুঁকি (HIGH)",
    hi: "उच्च जोखिम (HIGH)"
  },
  "CRITICAL RISK": {
    as: "জৰুৰী / সংকটজনক (CRITICAL)",
    bn: "সংকটজনক / জরুরি (CRITICAL)",
    hi: "गंभीर / आपातकालीन (CRITICAL)"
  },
  "Low Risk": {
    as: "কম বিপদাশংকা",
    bn: "কম ঝুঁকি",
    hi: "कम जोखिम"
  },
  "Moderate Risk": {
    as: "মধ্যম বিপদাশংকা",
    bn: "মাঝারি ঝুঁকি",
    hi: "मध्यम जोखिम"
  },
  "High Risk": {
    as: "উচ্চ বিপদাশংকা",
    bn: "উচ্চ ঝুঁকি",
    hi: "उच्च जोखिम"
  },
  "Critical Risk": {
    as: "সংকটজনক বিপদ",
    bn: "সংকটজনক ঝুঁকি",
    hi: "गंभीर जोखिम"
  },
  "Recommended": {
    as: "পৰামৰ্শিত",
    bn: "পরামর্শ দেওয়া হয়েছে",
    hi: "अनुशंसित"
  },
  "Required Immediately": {
    as: "তৎক্ষণাৎ আৱশ্যক",
    bn: "অবিলম্বে আবশ্যক",
    hi: "तत्काल आवश्यक"
  },
  "Normal Monitoring": {
    as: "স্বাভাৱিক নিৰীক্ষণ",
    bn: "স্বাভাবিক পর্যবেক্ষণ",
    hi: "सामान्य निगरानी"
  }
};

/**
 * Synchronize with Google Website Translation Engine
 */
export function syncGoogleTranslate(langCode) {
  try {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const domain = parts.length > 1 ? `.${parts.slice(-2).join('.')}` : hostname;
    
    // Cookie formatting for Google Translate
    if (langCode === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain}; path=/;`;
      document.cookie = `googtrans=/en/en; path=/;`;
      document.cookie = `googtrans=/en/en; domain=${domain}; path=/;`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; domain=${domain}; path=/;`;
    }

    // Try finding Google Translate combobox
    const triggerCombo = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        const val = langCode === 'en' ? '' : langCode;
        if (select.value !== val) {
          select.value = val;
          select.dispatchEvent(new Event('change'));
        }
        return true;
      }
      return false;
    };

    if (!triggerCombo()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (triggerCombo() || attempts > 20) {
          clearInterval(interval);
        }
      }, 150);
    }
  } catch (err) {
    console.warn('Google Translate sync error:', err);
  }
}

// Automatically build reverse lookup map (Vernacular -> English original phrase)
export const REVERSE_DICTIONARY = {};
Object.entries(DICTIONARY).forEach(([enKey, langMap]) => {
  if (langMap) {
    Object.values(langMap).forEach((val) => {
      if (typeof val === 'string' && val.trim()) {
        REVERSE_DICTIONARY[val.trim()] = enKey;
      }
    });
  }
});

/**
 * Instant Client-Side DOM Walker
 * Recursively traverses text nodes and translates matched phrases in 0ms.
 * Robustly handles English <-> Vernacular bidirectional reversion.
 */
export function applyInstantDomTranslation(langCode, rootNode = document.body) {
  if (!rootNode) return;

  const isEnglish = langCode === 'en';

  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE') {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest('.notranslate') || parent.closest('#google_translate_element')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode.nodeValue;
    const trimmed = text.trim();

    if (isEnglish) {
      // 1. Restore saved original text if available
      if (currentNode.__origText !== undefined) {
        currentNode.nodeValue = currentNode.__origText;
        delete currentNode.__origText;
      } else if (trimmed && REVERSE_DICTIONARY[trimmed]) {
        // 2. Reverse lookup from dictionary back to English
        const enText = REVERSE_DICTIONARY[trimmed];
        currentNode.nodeValue = text.replace(trimmed, enText);
      }
    } else {
      // Find the English phrase to translate from (either it's already English, or reverse-lookup it)
      let basePhrase = trimmed;
      if (!DICTIONARY[basePhrase] && REVERSE_DICTIONARY[trimmed]) {
        basePhrase = REVERSE_DICTIONARY[trimmed];
      }

      if (basePhrase && DICTIONARY[basePhrase] && DICTIONARY[basePhrase][langCode]) {
        if (currentNode.__origText === undefined) {
          currentNode.__origText = text;
        }
        const translated = DICTIONARY[basePhrase][langCode];
        // preserve surrounding whitespace
        currentNode.nodeValue = text.replace(trimmed, translated);
      }
    }
    currentNode = walker.nextNode();
  }
}
