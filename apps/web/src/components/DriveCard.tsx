import React from 'react';
import { WalkinDrive } from '@gatepulse/shared';
import { TrustBadge } from './TrustBadge';
import { Calendar, Clock, MapPin, Building2, Navigation, AlertTriangle, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface DriveCardProps {
  drive: WalkinDrive;
}

export const DriveCard: React.FC<DriveCardProps> = ({ drive }) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${drive.it_park_name}, ${drive.landmark_gate}, ${drive.city}`
  )}`;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all pointer-events-none" />

      <div>
        {/* Header: Company & Trust Score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-100 group-hover:text-sky-300 transition-colors">
                {drive.company_name}
              </h3>
            </div>
            <p className="text-sm font-semibold text-sky-400 mt-0.5">{drive.job_title}</p>
          </div>
          <TrustBadge score={drive.trust_score} />
        </div>

        {/* FRAUD WARNING ALERT BANNER */}
        {drive.contains_payment_demand && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 shadow-lg shadow-rose-950/50 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase tracking-wide text-rose-400 block mb-0.5">
                ⚠️ FRAUD WARNING: Payment Demand Detected
              </span>
              This walk-in notice mentions registration, deposit, or training fees. Legitimate companies never charge candidates for job interviews!
            </div>
          </div>
        )}

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Date: <strong className="text-white">{drive.walkin_start_date}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{drive.time_slot || '09:00 AM - 01:00 PM'}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>City: <strong className="text-white">{drive.city}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exp: <strong className="text-white">{drive.experience_range}</strong></span>
          </div>
        </div>

        {/* IT Park & Landmark Gate Details */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Building2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>{drive.it_park_name}</span>
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-300 font-mono bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <Navigation className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-400 block text-[10px] uppercase tracking-wider">Gate Landmark &amp; Visitor Entry</span>
              {drive.landmark_gate}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          Posted: {drive.created_at ? new Date(drive.created_at).toLocaleDateString() : 'Active'}
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all"
        >
          Gate Directions
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
