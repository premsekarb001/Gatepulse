import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ score }) => {
  // Requirement: Green for >= 70%, Red for < 50%, Yellow for 50-69%
  if (score >= 70) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Verified Trust ({score}%)
      </span>
    );
  } else if (score >= 50) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        Moderate Trust ({score}%)
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
        <ShieldX className="w-3.5 h-3.5 text-rose-400" />
        Low Trust ({score}%)
      </span>
    );
  }
};
