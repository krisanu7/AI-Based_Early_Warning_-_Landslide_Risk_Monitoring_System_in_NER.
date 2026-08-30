import React, { useState, useEffect } from 'react';
import { alertsApi } from '../../api/client';
import { AlertTriangle, ChevronRight, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const DisasterSafetyBanner = () => {
  const { t, language } = useLanguage();
  const [criticalAlert, setCriticalAlert] = useState(null);

  useEffect(() => {
    const fetchTopAlert = async () => {
      try {
        const res = await alertsApi.getPublicWarnings();
        if (res.data?.active_public_warnings?.length > 0) {
          setCriticalAlert(res.data.active_public_warnings[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTopAlert();
  }, []);

  if (!criticalAlert) return null;

  const headline = t('advisory1Title') || criticalAlert.public_warning_headline || `High Landslide Vulnerability in ${criticalAlert.village}`;

  return (
    <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white px-4 py-2 text-xs font-bold shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
          <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider shrink-0">
            🚨 {t('riskCritical')}
          </span>
          <span className="truncate">
            {headline}
          </span>
        </div>

        <Link
          to="/public-warnings"
          className="shrink-0 flex items-center gap-1 text-white hover:underline text-[11px] font-black uppercase bg-white/20 px-2.5 py-1 rounded-lg hover:bg-white/30 transition-all"
        >
          <span>{t('viewAdvisory')}</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
