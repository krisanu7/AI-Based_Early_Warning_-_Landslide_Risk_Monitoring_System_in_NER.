import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Mountain, 
  Sun, 
  Moon, 
  Globe, 
  UserCheck, 
  Sparkles,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  User,
  Menu
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

export const Navbar = ({ onOpenSIHTour, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { user, logout, switchDemoRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentRoleObj = DEMO_ROLES.find(r => r.id === user?.role) || DEMO_ROLES[2];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand & Mobile Hamburger Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform shrink-0">
              <Mountain className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  NER Landslide AI
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  SafeSlope NER
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Action Controls & Switchers */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">

          {/* SIH Pitch Tour Button (Mobile + Desktop) */}
          <button
            onClick={onOpenSIHTour}
            className="flex px-2 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-[10px] sm:text-xs shadow-md shadow-rose-500/20 items-center gap-1 transition-all hover:scale-105 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
            <span className="hidden xs:inline sm:inline">{t('sihTour')}</span>
            <span className="xs:hidden sm:hidden">SIH Tour</span>
          </button>


          {/* 1. Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => { setLangMenuOpen(!langMenuOpen); setRoleMenuOpen(false); setUserMenuOpen(false); }}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all shadow-sm"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="uppercase text-[11px] sm:text-xs font-black">{language}</span>
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

          {/* 2. Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all shadow-sm shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* 3. Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => { setRoleMenuOpen(!roleMenuOpen); setUserMenuOpen(false); setLangMenuOpen(false); }}
              className="px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden lg:inline">{currentRoleObj.label.split('(')[0]}</span>
              <span className="lg:hidden truncate max-w-[45px] sm:max-w-none">{user?.role || 'ROLE'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
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

          {/* 4. User Account / Login Dropdown */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setRoleMenuOpen(false); setLangMenuOpen(false); }}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                >
                  <User className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="hidden sm:inline font-black truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-rose-400 hidden sm:inline" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                    <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                        {user.designation || user.role}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                        {user.email}
                      </div>
                    </div>

                    <div className="px-2 space-y-1">
                      <Link
                        to="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Register New Account</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Logout Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  to="/login"
                  className="px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
