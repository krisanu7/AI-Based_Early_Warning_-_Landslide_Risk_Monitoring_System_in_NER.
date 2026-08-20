import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, TRANSLATED_GUIDELINES } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('swasthya_lang') || 'EN';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('swasthya_lang', newLang);
  };

  const t = (key) => {
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      return TRANSLATIONS[lang][key];
    }
    if (TRANSLATIONS.EN && TRANSLATIONS.EN[key]) {
      return TRANSLATIONS.EN[key];
    }
    return key;
  };

  const getDiseaseContent = (diseaseName, fallback) => {
    const dKey = diseaseName?.trim() || 'Diarrhea';
    if (TRANSLATED_GUIDELINES[dKey] && TRANSLATED_GUIDELINES[dKey][lang]) {
      return TRANSLATED_GUIDELINES[dKey][lang];
    }
    return fallback;
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis is not supported by your browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set appropriate BCP 47 language code
    if (lang === 'AS' || lang === 'BN') {
      utterance.lang = 'bn-IN'; // Bengali/Assamese voice model
    } else if (lang === 'HI') {
      utterance.lang = 'hi-IN'; // Hindi voice model
    } else {
      utterance.lang = 'en-IN'; // English (India)
    }

    utterance.rate = 0.95; // Slightly slower for clarity in rural broadcast
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getDiseaseContent, speak, stopSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
