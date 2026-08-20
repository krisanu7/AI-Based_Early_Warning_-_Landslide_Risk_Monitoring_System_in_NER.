import React from 'react';

export const RiskBadge = ({ level, score, showScore = true, size = 'md' }) => {
  let colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let dotColor = 'bg-emerald-500';
  let label = level || 'LOW';

  if (label === 'VERY HIGH' || score >= 81 || label === 'CONFIRMED') {
    colorClass = 'bg-rose-100 text-rose-800 border-rose-300';
    dotColor = 'bg-rose-600 animate-ping';
  } else if (label === 'HIGH' || (score >= 61 && score <= 80)) {
    colorClass = 'bg-amber-100 text-amber-900 border-amber-300';
    dotColor = 'bg-amber-500';
  } else if (label === 'MEDIUM' || (score >= 31 && score <= 60)) {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
    dotColor = 'bg-yellow-500';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : (size === 'lg' ? 'px-3.5 py-1.5 text-sm font-bold' : 'px-2.5 py-1 text-xs font-semibold');

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClass} ${sizeClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
      <span>{label}</span>
      {showScore && score !== undefined && score !== null && (
        <span className="opacity-75 font-mono text-[10px]">({score}/100)</span>
      )}
    </span>
  );
};
