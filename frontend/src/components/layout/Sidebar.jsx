import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Map, 
  Droplets, 
  ClipboardList, 
  AlertTriangle, 
  BarChart3, 
  Radio, 
  Settings, 
  FileText,
  Users
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAsha, isAnm, isDoctor, isAuthority, isAdmin, isPublic } = useAuth();
  const { t } = useLanguage();

  // Determine home dashboard path based on role
  let homePath = '/';
  let homeLabel = 'Public Overview';
  if (isAsha || isAnm) {
    homePath = '/dashboard/asha';
    homeLabel = isAsha ? 'ASHA Surveillance' : 'ANM Surveillance';
  } else if (isDoctor) {
    homePath = '/dashboard/medical';
    homeLabel = 'PHC Medical Triage';
  } else if (isAuthority) {
    homePath = '/dashboard/authority';
    homeLabel = 'Authority Surveillance';
  } else if (isAdmin) {
    homePath = '/dashboard/admin';
    homeLabel = 'Admin Command Center';
  }

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  const permanentHighlightClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
      isActive
        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
    }`;

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-6rem)] p-4 flex flex-col justify-between transition-colors duration-200">
      <div className="space-y-6">
        
        {/* Role Identity Tag */}
        <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('active_role')}</div>
          <div className="font-bold text-slate-800 dark:text-white text-xs mt-0.5">{user?.role || 'PUBLIC CITIZEN'}</div>
          <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium truncate mt-0.5">
            {user?.facility_name || user?.state || 'Northeast India Grid'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          
          {/* 1. Dashboard / Home Option */}
          <NavLink to={homePath} end className={navItemClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>{homeLabel}</span>
          </NavLink>

          {/* 2. Permanent 🛡️ Disease Safety Guide */}
          <NavLink to="/disease-safety-guide" className={permanentHighlightClass}>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="flex-1">{t('disease_safety_guide')}</span>
            <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded font-bold">{t('verified')}</span>
          </NavLink>

          {/* 3. Live Northeast Risk Map */}
          <NavLink to="/map" className={navItemClass}>
            <Map className="w-4 h-4" />
            <span>{t('northeast_risk_map')}</span>
          </NavLink>

          {/* 4. Public Health Warnings */}
          <NavLink to="/public-warnings" className={navItemClass}>
            <Radio className="w-4 h-4" />
            <span>{t('public_advisories')}</span>
          </NavLink>

          {/* Role specific operations */}
          {(isAsha || isAnm || isAdmin) && (
            <>
              <div className="pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                Field Health Worker
              </div>
              <NavLink to="/cases/report" className={navItemClass}>
                <ClipboardList className="w-4 h-4" />
                <span>{t('case_reporting')}</span>
              </NavLink>
              <NavLink to="/water/observation" className={navItemClass}>
                <Droplets className="w-4 h-4" />
                <span>{t('water_observation')}</span>
              </NavLink>
            </>
          )}

          {(isDoctor || isAuthority || isAdmin) && (
            <>
              <div className="pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                Clinical & Authority
              </div>
              <NavLink to="/alerts/investigation" className={navItemClass}>
                <AlertTriangle className="w-4 h-4" />
                <span>{t('alert_investigation')}</span>
              </NavLink>
              <NavLink to="/analytics" className={navItemClass}>
                <BarChart3 className="w-4 h-4" />
                <span>{t('regional_analytics')}</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <div className="pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                System Administration
              </div>
              <NavLink to="/dashboard/admin" className={navItemClass}>
                <Settings className="w-4 h-4" />
                <span>{t('admin_logs')}</span>
              </NavLink>
            </>
          )}

        </nav>
      </div>

      {/* Footer Support Tag */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
        <span>SwasthyaJal NER v1.0</span>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Smart India Hackathon 2026</div>
      </div>
    </aside>
  );
};
