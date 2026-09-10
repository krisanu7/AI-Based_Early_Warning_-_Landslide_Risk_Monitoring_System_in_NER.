import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  Map, 
  ClipboardEdit, 
  ShieldAlert, 
  Truck, 
  Route, 
  Building2, 
  Megaphone, 
  BarChart3, 
  Cpu, 
  BookOpen,
  AlertTriangle,
  Eye,
  LogOut,
  LogIn,
  X,
  Mountain,
  Globe,
  Sun,
  Moon,
  UserCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'as', name: 'অসমীয়া' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'hi', name: 'हिंदी' }
];

export const Sidebar = ({ isOpenMobile, onCloseMobile, onOpenSIHTour }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();


  const NAV_ITEMS = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard, roles: ['ALL'] },
    { to: '/map', label: t('navLiveMap'), icon: Map, roles: ['ALL'] },
    { to: '/field-report', label: t('navFieldReport'), icon: ClipboardEdit, roles: ['FIELD_WORKER', 'BLOCK_OFFICER', 'ADMIN', 'PUBLIC'] },
    { to: '/visual-inspector', label: t('navVisualInspector'), icon: Eye, roles: ['ALL'] },
    { to: '/investigation', label: t('navInvestigation'), icon: ShieldAlert, roles: ['BLOCK_OFFICER', 'DISTRICT_OFFICER', 'AUTHORITY', 'ADMIN'] },
    { to: '/response', label: t('navResponse'), icon: Truck, roles: ['DISTRICT_OFFICER', 'AUTHORITY', 'ADMIN'] },
    { to: '/infrastructure', label: t('navInfrastructure'), icon: Route, roles: ['ALL'] },
    { to: '/evacuation', label: t('navEvacuation'), icon: Building2, roles: ['ALL'] },
    { to: '/public-warnings', label: t('navPublicWarnings'), icon: Megaphone, roles: ['ALL'] },
    { to: '/analytics', label: t('navAnalytics'), icon: BarChart3, roles: ['ALL'] },
    { to: '/model-monitoring', label: t('navModelMonitoring'), icon: Cpu, roles: ['DISTRICT_OFFICER', 'AUTHORITY', 'ADMIN'] },
    { to: '/safety-guide', label: t('navSafetyGuide'), icon: BookOpen, roles: ['ALL'] },
    { to: '/login', label: t('navSignIn'), icon: LogIn, roles: ['ALL'] },
  ];

  const currentRole = user?.role || 'PUBLIC';
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes('ALL') || item.roles.includes(currentRole));

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/login');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full p-4 space-y-6">
      <div className="space-y-5">
        
        {/* Mobile Header title inside drawer */}
        <div className="lg:hidden flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="InnovateX Logo" 
              className="h-8 w-auto object-contain rounded-lg shrink-0" 
            />
            <span className="font-black text-sm text-slate-900 dark:text-white">
              {t('appName')}
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIH 2026 Pitch Architecture Tour Banner Button */}
        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            if (onOpenSIHTour) onOpenSIHTour();
          }}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-rose-600/20 flex items-center justify-between gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin shrink-0" />
            <span>{t('sihTour')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
        </button>


        {/* Quick Mobile Controls (Language & Theme Mode) */}
        <div className="lg:hidden p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {t('systemPreferences')}
          </div>

          {/* Language Selector Grid */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('languageLabel')} ({language.toUpperCase()})</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    language === l.code
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{t('appearanceMode')}</span>
            </span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-amber-400 shadow-sm"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>

        {/* Active Role Indicator Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>{t('activePersona')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
            {user?.name || 'Authorized Officer'}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate">
            {user?.designation || user?.role}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {user?.district}, {user?.state}
          </div>

          {user && (
            <button
              onClick={handleLogout}
              className="w-full mt-1 pt-1.5 border-t border-slate-200 dark:border-slate-700/60 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center justify-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>{t('logoutPersona')}</span>
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onCloseMobile && onCloseMobile()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

      </div>

      {/* Emergency Control Room Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-center">
          <div className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{t('eocHotline')}</span>
          </div>
          <p className="text-sm font-black text-rose-700 dark:text-rose-300 font-mono">
            Dial 112 / 1070
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside 
        style={{ minHeight: 'calc(100vh - 4rem - var(--gt-offset, 0px))' }}
        className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 transition-colors hidden lg:block"
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay Sidebar */}
      {isOpenMobile && (
        <div style={{ top: 'var(--gt-offset, 0px)' }} className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 h-full overflow-y-auto animate-in slide-in-from-left duration-300">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};
