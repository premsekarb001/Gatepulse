'use client';

import React, { useState, useEffect } from 'react';
import { WalkinDrive } from '@gatepulse/shared';
import { AdminPasteBox } from '@/components/AdminPasteBox';
import { FilterToolbar } from '@/components/FilterToolbar';
import { DriveCard } from '@/components/DriveCard';
import { Briefcase, MapPin, ShieldCheck, Sparkles, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [drives, setDrives] = useState<WalkinDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [city, setCity] = useState('');
  const [itPark, setItPark] = useState('');
  const [experience, setExperience] = useState('');
  const [search, setSearch] = useState('');

  const fetchDrives = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (city) queryParams.set('city', city);
      if (itPark) queryParams.set('it_park_name', itPark);
      if (experience) queryParams.set('experience', experience);
      if (search) queryParams.set('search', search);

      const res = await fetch(`${API_BASE_URL}/api/v1/drives?${queryParams.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setDrives(json.data || []);
      } else {
        throw new Error(json.error || 'Failed to fetch drives');
      }
    } catch (err: any) {
      console.warn('API fetch error, displaying fallback demo drives:', err);
      // Fallback local seed data if local API server is starting up or offline
      setDrives([
        {
          id: 'drive-101',
          company_name: 'TCS (Tata Consultancy Services)',
          job_title: 'Full Stack Java & Angular Developer',
          experience_range: '0-2 Years',
          experience_min: 0,
          experience_max: 2,
          walkin_start_date: '2026-08-10',
          walkin_end_date: '2026-08-11',
          time_slot: '09:00 AM - 01:00 PM',
          city: 'Bengaluru',
          it_park_name: 'Manyata Tech Park',
          landmark_gate: 'Gate 3 Main Visitor Entrance (Block N1)',
          trust_score: 96,
          contains_payment_demand: false,
          contact_email: 'campus.careers@tcs.com',
          venue_address: 'Manyata Tech Park, Nagavara, Outer Ring Rd, Bengaluru, Karnataka 560045',
          created_at: new Date('2026-08-05').toISOString()
        },
        {
          id: 'drive-102',
          company_name: 'Infosys Limited',
          job_title: 'System Engineer & Data Analyst',
          experience_range: '1-3 Years',
          experience_min: 1,
          experience_max: 3,
          walkin_start_date: '2026-08-12',
          walkin_end_date: '2026-08-12',
          time_slot: '09:30 AM - 02:00 PM',
          city: 'Hyderabad',
          it_park_name: 'HITEC City',
          landmark_gate: 'Gate 1 (Building 12 Security Desk)',
          trust_score: 92,
          contains_payment_demand: false,
          contact_email: 'walkin.hyd@infosys.com',
          venue_address: 'Survey No. 64, HITEC City, Madhapur, Hyderabad, Telangana 500081',
          created_at: new Date('2026-08-04').toISOString()
        },
        {
          id: 'drive-103',
          company_name: 'Tech Horizon Consultancy',
          job_title: 'Junior QA Automation Tester',
          experience_range: '0-1 Years',
          experience_min: 0,
          experience_max: 1,
          walkin_start_date: '2026-08-14',
          time_slot: '10:00 AM - 03:00 PM',
          city: 'Pune',
          it_park_name: 'EON Free Zone',
          landmark_gate: 'Gate 2 Entrance, Cluster C Lobby',
          trust_score: 42,
          contains_payment_demand: true,
          contact_email: 'hr@techhorizon-jobs.fake.com',
          venue_address: 'EON Free Zone, Kharadi, Pune, Maharashtra 411014',
          created_at: new Date('2026-08-06').toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [city, itPark, experience, search]);

  const handleDriveParsed = (newDrive: WalkinDrive) => {
    setDrives((prev) => [newDrive, ...prev]);
  };

  // Filter client side as well for instant responsiveness
  const filteredDrives = drives.filter((drive) => {
    if (city && !drive.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (itPark && !drive.it_park_name.toLowerCase().includes(itPark.toLowerCase())) return false;
    if (search) {
      const s = search.toLowerCase();
      const match =
        drive.company_name.toLowerCase().includes(s) ||
        drive.job_title.toLowerCase().includes(s) ||
        drive.landmark_gate.toLowerCase().includes(s) ||
        drive.city.toLowerCase().includes(s) ||
        drive.it_park_name.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  const verifiedCount = drives.filter((d) => d.trust_score >= 70).length;
  const fraudWarningCount = drives.filter((d) => d.contains_payment_demand).length;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/20 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 1.5 Flash AI Powered Notice Parser
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Find Walk-in Drives &amp; <span className="gradient-text">Landmark Gate Details</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Instant verified job walk-ins across Major IT Parks (Manyata, HITEC City, EON Free Zone, SEZs) with gate-specific entry instructions and automated fraud protection scoring.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span><strong>{drives.length}</strong> Active Drives</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span><strong>{verifiedCount}</strong> Verified High Trust</span>
            </div>
            {fraudWarningCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span><strong>{fraudWarningCount}</strong> Fraud Alerts Detected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Paste Box Section */}
      <AdminPasteBox onDriveParsed={handleDriveParsed} apiBaseUrl={API_BASE_URL} />

      {/* Filters Toolbar */}
      <FilterToolbar
        city={city}
        setCity={setCity}
        itPark={itPark}
        setItPark={setItPark}
        experience={experience}
        setExperience={setExperience}
        search={search}
        setSearch={setSearch}
      />

      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Active Walk-in Drives
          </h2>
          <p className="text-xs text-slate-400">Sorted by walk-in start date (Earliest first)</p>
        </div>

        <button
          onClick={fetchDrives}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card rounded-2xl p-6 border border-slate-800 animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-800/60 rounded w-1/2" />
              <div className="h-16 bg-slate-900 rounded" />
              <div className="h-8 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Walk-in Drives Match Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your City or IT Park filter, or paste a new raw drive notice using the Admin Ingestion engine above.
          </p>
          <button
            onClick={() => {
              setCity('');
              setItPark('');
              setExperience('');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/20 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}
    </div>
  );
}
