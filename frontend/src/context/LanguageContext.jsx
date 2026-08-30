import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ner_landslide_language') || 'en';
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('ner_landslide_language', language);
  }, [language]);

  const t = (key) => {
    if (!translations[language] || !translations[language][key]) {
      return translations.en[key] || key;
    }
    return translations[language][key];
  };

  const speak = (text, targetLang = null) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const activeLang = targetLang || language;
    
    // Target BCP-47 language codes for Indian regional speech engines
    const langMap = {
      en: 'en-IN',
      as: 'as-IN',
      bn: 'bn-IN',
      hi: 'hi-IN'
    };
    
    utterance.lang = langMap[activeLang] || 'en-IN';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    const findAndSetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const prefix = utterance.lang.split('-')[0];
      const matchingVoice = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(prefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    };

    findAndSetVoice();

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech Synthesis error', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, speak, stopSpeaking, isSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
