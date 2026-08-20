import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SIHTourModal } from '../common/SIHTourModal';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  Layers,
  BellRing,
  Sun,
  Moon,
  Award,
  Globe
} from 'lucide-react';

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'AS', label: 'অসমীয়া' },
  { code: 'BN', label: 'বাংলা' },
  { code: 'HI', label: 'हिंदी' }
];

export const Navbar = () => {
  const { user, logout, isOnline, offlinePendingCount, manualSync, loginDemo, loading } = useAuth();
  const { theme, isDark, setLight, setDark } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (roleKey) => {
    setRoleDropdownOpen(false);
    await loginDemo(roleKey);
    if (roleKey === 'ASHA') navigate('/dashboard/asha');
    else if (roleKey === 'ANM') navigate('/dashboard/asha');
    else if (roleKey === 'MEDICAL_STAFF') navigate('/dashboard/medical');
    else if (roleKey === 'AUTHORITY') navigate('/dashboard/authority');
    else if (roleKey === 'ADMIN') navigate('/dashboard/admin');
    else navigate('/public-warnings');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">{t('app_title')}</span>
              <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[11px] font-bold px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-700">NER</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none hidden sm:block">{t('app_subtitle')}</p>
          </div>
        </Link>

        {/* Right Section Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Global Multi-Lingual Selector Dropdown (English, অসমীয়া, বাংলা, हिंदी) */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-900 dark:text-teal-200 text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm transition-all"
              title="Change System Language"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{LANGUAGES.find(l => l.code === lang)?.label || 'Language'}</span>
              <ChevronDown className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Select Language
                </div>
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLang(item.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-teal-50 dark:hover:bg-slate-700/60 transition-colors ${
                      lang === item.code 
                        ? 'bg-teal-50/80 dark:bg-teal-950/60 font-black text-teal-900 dark:text-teal-200' 
                        : 'text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <span>{item.label}</span>
                    {lang === item.code && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SIH Hackathon Presentation Tour Button */}
          <button
            onClick={() => setIsTourOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95"
            title="Launch Smart India Hackathon Presentation Pitch Tour"
          >
            <Award className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{t('sih_tour')}</span>
          </button>

          {/* Online / Offline Status Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isOnline 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('grid_online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>{t('offline_mode')}</span>
              </>
            )}
          </div>

          {/* Pending Offline Queue Sync */}
          {offlinePendingCount > 0 && (
            <button
              onClick={manualSync}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all animate-pulse"
              title="Sync offline case reports"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync {offlinePendingCount}</span>
            </button>
          )}

          {/* ☀️ / 🌙 Light and Dark Mode Segmented Toggle Switch */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={setLight}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                !isDark
                  ? 'bg-white text-amber-600 shadow-sm border border-amber-200 ring-1 ring-amber-300/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Light Mode"
            >
              <Sun className={`w-4 h-4 ${!isDark ? 'text-amber-500 fill-amber-400' : ''}`} />
              <span className="sr-only">Light</span>
            </button>

            <button
              type="button"
              onClick={setDark}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                isDark
                  ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500 ring-1 ring-indigo-400/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Switch to Dark Mode"
            >
              <Moon className={`w-4 h-4 ${isDark ? 'text-white fill-indigo-200' : ''}`} />
              <span className="sr-only">Dark</span>
            </button>
          </div>

          {/* 1-Click Role Switcher for SIH Presentation */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden md:inline">{t('switch_role')}</span>
              <span className="text-teal-800 dark:text-teal-300 font-bold">{user?.role || 'PUBLIC'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Switch Role for Demonstration
                </div>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => handleRoleSwitch(acc.role)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-teal-50 dark:hover:bg-slate-700/60 transition-colors ${
                      user?.role === acc.role 
                        ? 'bg-teal-50/80 dark:bg-teal-950/50 font-bold text-teal-900 dark:text-teal-200' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{acc.label}</div>
                      <div className="text-[10px] text-slate-400">{acc.loc}</div>
                    </div>
                    {user?.role === acc.role && (
                      <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                      {user.facility_name || user.district}
                    </span>
                  </div>
                  <button
                    onClick={() => { setUserDropdownOpen(false); logout(); navigate('/'); }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('sign_out')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                {t('sign_in')}
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* SIH Hackathon Tour Modal */}
      <SIHTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </header>
  );
};
