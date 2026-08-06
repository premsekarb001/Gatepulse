'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { WalkinDrive } from '@gatepulse/shared';

interface AdminPasteBoxProps {
  onDriveParsed: (newDrive: WalkinDrive) => void;
  apiBaseUrl: string;
}

const SAMPLE_NOTICES = [
  {
    label: 'TCS Bangalore Walkin',
    text: `URGENT WALK-IN DRIVE AT TCS BANGALORE
Company: Tata Consultancy Services (TCS)
Role: Java Full Stack Developer & Microservices
Experience: 1 to 4 Years
Date: 12th August 2026 (Wednesday)
Time: 9:00 AM - 1:00 PM
Location: Manyata Tech Park, Nagavara Outer Ring Road, Bengaluru.
Landmark: Gate 3 Main Visitor Entrance, Block N1 Reception.
Requirements: Bring updated resume, 2 passport photos, and govt ID. No registration fee required.`
  },
  {
    label: 'Fraud Notice Demo',
    text: `MEGA HIRING FOR FRESHERS IN PUNE
Company: Tech Horizon Consultancy
Position: Software Trainee & QA
Experience: 0-1 Years (Freshers Allowed)
Walkin Date: 15th August 2026
Venue: EON Free Zone, Kharadi, Pune. Gate 2 Entrance.
NOTE: Mandatory registration charge of Rs 2500 for interview slot confirmation and training badge.`
  }
];

export const AdminPasteBox: React.FC<AdminPasteBoxProps> = ({ onDriveParsed, apiBaseUrl }) => {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<WalkinDrive | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/ingest/parse-and-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText.trim() }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse notice');
      }

      setSuccessResult(json.data);
      onDriveParsed(json.data);
      setRawText('');
    } catch (err: any) {
      setError(err?.message || 'Error connecting to API server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-sky-500/20 shadow-xl mb-8">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Admin Ingestion Engine
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">POST /api/v1/ingest/parse-and-save</span>
            </h2>
            <p className="text-xs text-slate-400">Paste unformatted WhatsApp / Telegram / LinkedIn job notices for instant Gemini AI structure extraction</p>
          </div>
        </div>
        <button className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 border border-slate-700">
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Raw Drive Notice Text:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Try Sample:</span>
                {SAMPLE_NOTICES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRawText(sample.text)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw walkin drive announcement here... (e.g., 'TCS Walkin at Manyata Tech Park Gate 3 for Java Devs...')"
              className="w-[#100%] w-full p-3 text-sm bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              * Automatically extracts Company, Gate Landmark, City, IT Park, Trust Score &amp; Payment Demand warnings.
            </p>
            <button
              type="submit"
              disabled={loading || !rawText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing with Gemini 1.5...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Parse &amp; Publish Drive
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Drive Successfully Parsed &amp; Saved!
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1 font-mono">
                <div>Company: <span className="text-white font-semibold">{successResult.company_name}</span></div>
                <div>City: <span className="text-white font-semibold">{successResult.city}</span></div>
                <div>IT Park: <span className="text-white font-semibold">{successResult.it_park_name}</span></div>
                <div>Landmark Gate: <span className="text-white font-semibold">{successResult.landmark_gate}</span></div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
