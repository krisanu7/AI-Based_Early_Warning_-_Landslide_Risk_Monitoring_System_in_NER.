import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard, roles: ['ALL'] },
    { to: '/map', label: t('navLiveMap'), icon: Map, roles: ['ALL'] },
    { to: '/field-report', label: t('navFieldReport'), icon: ClipboardEdit, roles: ['FIELD_WORKER', 'BLOCK_OFFICER', 'ADMIN', 'PUBLIC'] },
    { to: '/investigation', label: t('navInvestigation'), icon: ShieldAlert, roles: ['BLOCK_OFFICER', 'DISTRICT_OFFICER', 'AUTHORITY', 'ADMIN'] },
    { to: '/response', label: t('navResponse'), icon: Truck, roles: ['DISTRICT_OFFICER', 'AUTHORITY', 'ADMIN'] },
    { to: '/infrastructure', label: t('navInfrastructure'), icon: Route, roles: ['ALL'] },
    { to: '/evacuation', label: t('navEvacuation'), icon: Building2, roles: ['ALL'] },
    { to: '/public-warnings', label: t('navPublicWarnings'), icon: Megaphone, roles: ['ALL'] },
    { to: '/analytics', label: t('navAnalytics'), icon: BarChart3, roles: ['ALL'] },
    { to: '/model-monitoring', label: t('navModelMonitoring'), icon: Cpu, roles: ['DISTRICT_OFFICER', 'AUTHORITY', 'ADMIN'] },
    { to: '/safety-guide', label: t('navSafetyGuide'), icon: BookOpen, roles: ['ALL'] },
    { to: '/login', label: 'Auth / Persona Sign In', icon: LogIn, roles: ['ALL'] },
  ];

  const currentRole = user?.role || 'PUBLIC';
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes('ALL') || item.roles.includes(currentRole));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 shrink-0 transition-colors hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Active Role Indicator Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Active Persona</span>
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
              <span>Logout Persona</span>
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
            <span>24x7 State EOC Hotline</span>
          </div>
          <p className="text-sm font-black text-rose-700 dark:text-rose-300 font-mono">
            Dial 112 / 1070
          </p>
        </div>
      </div>

    </aside>
  );
};
