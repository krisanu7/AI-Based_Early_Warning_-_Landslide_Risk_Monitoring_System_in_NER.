import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Monitor, 
  Globe, 
  Sparkles, 
  ChevronDown, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  MapPin,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English (EN)' },
  { code: 'as', name: 'অসমীয়া (AS)' },
  { code: 'bn', name: 'বাংলা (BN)' },
  { code: 'hi', name: 'हिंदी (HI)' }
];

export const LandingNavbar = ({ onOpenSIHTour, onOpenReportModal }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#081014]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Brand + Status Dot + PS Code */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse" />
            <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              SafeSlope NER
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400/90 tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25">
              PS 26001
            </span>
          </Link>
        </div>

        {/* Center / Right Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <Link 
            to="/" 
            className="text-emerald-400 font-bold transition-colors hover:text-white"
          >
            Home
          </Link>
          
          <a 
            href="#about" 
            className="hover:text-emerald-400 transition-colors"
          >
            About
          </a>

          <Link 
            to="/map" 
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <span>Public Map</span>
          </Link>

          <Link 
            to="/field-report" 
            className="hover:text-emerald-400 transition-colors"
          >
            Citizen Signals
          </Link>

          <button
            onClick={onOpenSIHTour}
            className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 transition-all hover:bg-cyan-500/25"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SIH 2026</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Live Command Dashboard Monitor Shortcut */}
          <Link
            to="/dashboard"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-all group"
            title="Launch Command Radar Dashboard"
          >
            <Monitor className="w-4 h-4 group-hover:scale-110 transition-transform text-slate-300 group-hover:text-amber-400" />
          </Link>

          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'bg-amber-500/15 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.name}</span>
                    {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign In Button */}
          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center gap-1.5"
            >
              <span>Command Ops</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all"
            >
              Sign In
            </Link>
          )}

          {/* Register Solid Emerald Button */}
          <Link
            to="/register"
            className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Register
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg border border-slate-800 text-slate-300"
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
          </Link>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            {mobileNavOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 bg-[#081014] border-b border-slate-800 space-y-3 animate-in slide-in-from-top">
          <nav className="flex flex-col gap-2.5 text-sm font-semibold text-slate-300">
            <Link 
              to="/" 
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold"
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Command Radar</span>
              <span className="text-xs text-emerald-400">Launch →</span>
            </Link>
            <Link 
              to="/map" 
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              Public Map
            </Link>
            <Link 
              to="/field-report" 
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              Citizen Signal Reporter
            </Link>
            <a 
              href="#about" 
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              About
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <Link
              to="/login"
              onClick={() => setMobileNavOpen(false)}
              className="flex-1 py-2 text-center text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileNavOpen(false)}
              className="flex-1 py-2 text-center text-xs font-extrabold text-slate-950 bg-[#f59e0b] rounded-xl"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
