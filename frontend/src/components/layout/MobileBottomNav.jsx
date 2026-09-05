import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  ClipboardEdit, 
  Megaphone, 
  Menu,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav = ({ onOpenMenu, onOpenSIHTour }) => {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { to: '/dashboard', label: t('navDashboard') || 'Dashboard', icon: LayoutDashboard },
    { to: '/map', label: t('navLiveMap') || 'GIS Map', icon: Map },
    { to: '/field-report', label: t('navFieldReport') || 'Report', icon: ClipboardEdit },
    { to: '/public-warnings', label: t('navPublicWarnings') || 'Advisories', icon: Megaphone },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-2xl px-1.5 py-1.5 flex items-center justify-around">

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span className="truncate max-w-[55px]">{item.label.split(' ')[0]}</span>
          </NavLink>
        );
      })}

      {/* SIH 2026 Tour Direct Quick Button */}
      <button
        onClick={onOpenSIHTour}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all border border-rose-500/20"
      >
        <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
        <span>SIH Tour</span>
      </button>

      {/* Menu Button to trigger full drawer sidebar */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
      >
        <Menu className="w-4 h-4 text-amber-500" />
        <span>Menu</span>
      </button>
    </div>
  );
};

