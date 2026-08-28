import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend = null, alert = false }) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    rose: 'from-rose-500/15 to-rose-600/5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    teal: 'from-teal-500/10 to-teal-600/5 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60',
    purple: 'from-purple-500/10 to-purple-600/5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
  };

  const iconBgMap = {
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl p-5 border bg-gradient-to-br bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${colorMap[color] || colorMap.blue} ${alert ? 'ring-2 ring-rose-500/50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBgMap[color] || iconBgMap.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
            {subtitle}
          </span>
          {trend && (
            <span className="font-bold text-rose-500 flex items-center gap-0.5">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
