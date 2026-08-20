import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'teal' }) => {
  const colorMap = {
    teal: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</div>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.teal}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          {trend && <span className="font-semibold">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
