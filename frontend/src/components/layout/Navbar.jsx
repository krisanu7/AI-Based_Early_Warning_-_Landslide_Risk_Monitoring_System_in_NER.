import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Mountain, 
  Sun, 
  Moon, 
  Globe, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  UserCheck, 
  Sparkles,
  Layers,
  ChevronDown,
  Bell
} from 'lucide-react';

const DEMO_ROLES = [
  { id: 'FIELD_WORKER', label: 'Field Worker (Ground Surveyor)', email: 'field@swasthyajal.gov.in', color: 'emerald' },
  { id: 'BLOCK_OFFICER', label: 'Block Disaster Officer', email: 'block@swasthyajal.gov.in', color: 'blue' },
  { id: 'DISTRICT_OFFICER', label: 'District Disaster Officer (DDMA)', email: 'district@swasthyajal.gov.in', color: 'amber' },
  { id: 'AUTHORITY', label: 'State / Regional Authority (SDMA)', email: 'authority@swasthyajal.gov.in', color: 'purple' },
  { id: 'ADMIN', label: 'System Administrator', email: 'admin@swasthyajal.gov.in', color: 'rose' },
  { id: 'PUBLIC', label: 'Public Citizen Portal', email: 'public@swasthyajal.gov.in', color: 'teal' }
];

const LANGUAGES = [
  { code: 'en', name: 'English (EN)' },
  { code: 'as', name: 'অসমীয়া (AS)' },
  { code: 'bn', name: 'বাংলা (BN)' },
  { code: 'hi', name: 'हिंदी (HI)' }
];

export const Navbar = ({ onOpenSIHTour }) => {
  const { user, switchDemoRole, isOnline, offlinePendingCount, manualSync } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentRoleObj = DEMO_ROLES.find(r => r.id === user?.role) || DEMO_ROLES[2];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                NER Landslide AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                SafeSlope NER
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate max-w-xs">
              SIH 2026 • AI Early Warning & Landslide Risk Monitoring
            </p>
          </div>
        </div>

        {/* Action Controls & Switchers */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* SIH Pitch Tour Button */}
          <button
            onClick={onOpenSIHTour}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden md:inline">{t('sihTour')}</span>
            <span className="md:hidden">SIH Pitch</span>
          </button>

          {/* 1-Click Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">{currentRoleObj.label.split('(')[0]}</span>
              <span className="lg:hidden">{user?.role || 'DISTRICT'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Select Demo Persona (No Auth Required)
                </div>
                {DEMO_ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      switchDemoRole(r.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      user?.role === r.id
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    {user?.role === r.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all shadow-sm"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                  Regional Language
                </div>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.name}</span>
                    {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

        </div>

      </div>
    </header>
  );
};
