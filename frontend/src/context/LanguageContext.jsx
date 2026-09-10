import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../i18n/translations';
import { syncGoogleTranslate, applyInstantDomTranslation } from '../utils/domTranslator';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('ner_landslide_language') || 'en';
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentAudioRef = useRef(null);

  // Synchronize Google Translate & Instant DOM Translation
  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('ner_landslide_language', newLang);
    syncGoogleTranslate(newLang);
    applyInstantDomTranslation(newLang);
    setTimeout(() => {
      applyInstantDomTranslation(newLang);
    }, 10);
    setTimeout(() => {
      applyInstantDomTranslation(newLang);
    }, 100);
  };

  useEffect(() => {
    localStorage.setItem('ner_landslide_language', language);
    syncGoogleTranslate(language);
    applyInstantDomTranslation(language);

    // Watch DOM mutations to auto-translate newly mounted React components/routes
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              applyInstantDomTranslation(language, node);
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen for URL route change events
    const handleLocationChange = () => {
      setTimeout(() => {
        applyInstantDomTranslation(language);
        syncGoogleTranslate(language);
      }, 100);
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [language]);

  // Continuously track Google Translate top banner height to adjust Navbar & layout
  useEffect(() => {
    const syncBannerOffset = () => {
      let offset = 0;

      // 1. Check Google Translate iframe
      const banner = document.querySelector('iframe.goog-te-banner-frame') ||
                     document.querySelector('iframe[id^=":"][id$=".container"]');
      
      if (banner && window.getComputedStyle(banner).display !== 'none' && banner.offsetHeight > 0) {
        offset = banner.offsetHeight;
      } else {
        // 2. Check if body top is pushed down by Google Translate
        const bodyTop = parseInt(document.body.style.top || '0', 10);
        if (bodyTop > 0) {
          offset = bodyTop;
        }
      }

      document.documentElement.style.setProperty('--gt-offset', `${offset}px`);
    };

    syncBannerOffset();
    const interval = setInterval(syncBannerOffset, 200);

    const observer = new MutationObserver(syncBannerOffset);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: false
    });

    window.addEventListener('resize', syncBannerOffset);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('resize', syncBannerOffset);
    };
  }, []);

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
