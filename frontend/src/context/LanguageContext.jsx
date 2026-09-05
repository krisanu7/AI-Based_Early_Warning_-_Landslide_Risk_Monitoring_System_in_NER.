import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ner_landslide_language') || 'en';
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentAudioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ner_landslide_language', language);
  }, [language]);

  // Pre-warm browser voices on load
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const t = (key) => {
    if (!translations[language] || !translations[language][key]) {
      return translations.en[key] || key;
    }
    return translations[language][key];
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speak = (text, targetLang = null) => {
    // If currently speaking, stop
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    const activeLang = targetLang || language;
    
    // Check Web Speech API availability
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();

      let selectedVoice = null;
      let targetLocale = 'en-IN';

      if (activeLang === 'as') {
        // 1. Try to find explicit Assamese voice
        selectedVoice = voices.find(v => v.lang.startsWith('as') || v.name.toLowerCase().includes('assamese'));
        if (selectedVoice) {
          targetLocale = 'as-IN';
        } else {
          // 2. Fallback to Bengali voice (Eastern Nagari script phonetics read Assamese text fluently)
          selectedVoice = voices.find(v => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bengali') || v.lang === 'bn-IN');
          targetLocale = 'bn-IN';
        }
      } else if (activeLang === 'bn') {
        selectedVoice = voices.find(v => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bengali') || v.lang === 'bn-IN');
        targetLocale = 'bn-IN';
      } else if (activeLang === 'hi') {
        selectedVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.lang === 'hi-IN');
        targetLocale = 'hi-IN';
      } else {
        selectedVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
        targetLocale = 'en-IN';
      }

      // Final fallback to any available Indian or English voice if specific voice not found
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices.find(v => v.lang.includes('IN') || v.lang.startsWith('en')) || voices[0];
      }

      utterance.lang = targetLocale;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('Speech Synthesis error, initiating stream fallback...', e);
        setIsSpeaking(false);
        playOnlineTtsFallback(text, activeLang);
      };

      try {
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      } catch (err) {
        console.warn('speechSynthesis.speak exception', err);
        playOnlineTtsFallback(text, activeLang);
      }
    } else {
      playOnlineTtsFallback(text, activeLang);
    }
  };

  const playOnlineTtsFallback = (text, activeLang) => {
    try {
      const fallbackLang = (activeLang === 'as' || activeLang === 'bn') ? 'bn' : activeLang === 'hi' ? 'hi' : 'en';
      const cleanText = encodeURIComponent(text.slice(0, 190));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${cleanText}&tl=${fallbackLang}&client=tw-ob`;
      
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      setIsSpeaking(true);
      audio.play().catch(err => {
        console.error("Audio stream fallback error", err);
        setIsSpeaking(false);
      });
      
      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };
    } catch (e) {
      console.error("TTS Fallback Failed", e);
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
