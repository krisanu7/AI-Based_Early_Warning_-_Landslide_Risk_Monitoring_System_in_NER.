import React from 'react';

export const RiskBadge = ({ level, score, showScore = true, size = 'normal' }) => {
  const lvl = (level || '').toUpperCase();
  
  let bg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-500';

  if (lvl.includes('CRITICAL') || (score !== undefined && score >= 81)) {
    bg = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-sm';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (lvl.includes('HIGH') || (score !== undefined && score >= 61)) {
    bg = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-500';
  } else if (lvl.includes('MODERATE') || lvl.includes('MEDIUM') || (score !== undefined && score >= 31)) {
    bg = 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/40';
    dotColor = 'bg-yellow-500';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : (size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs');

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-black border tracking-wider uppercase ${bg} ${padding}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{level || (score >= 81 ? 'CRITICAL' : score >= 61 ? 'HIGH' : score >= 31 ? 'MODERATE' : 'LOW')}</span>
      {showScore && score !== undefined && (
        <span className="opacity-90 font-mono font-bold">({score}/100)</span>
      )}
    </span>
  );
};
