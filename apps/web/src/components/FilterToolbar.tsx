'use client';

import React from 'react';
import { Search, MapPin, Building2, Briefcase, Filter } from 'lucide-react';

interface FilterToolbarProps {
  city: string;
  setCity: (city: string) => void;
  itPark: string;
  setItPark: (itPark: string) => void;
  experience: string;
  setExperience: (exp: string) => void;
  search: string;
  setSearch: (s: string) => void;
}

const EXPERIENCE_CHIPS = [
  { label: 'All Experience', value: '' },
  { label: 'Freshers (0-1 Yrs)', value: 'Freshers' },
  { label: '1 - 3 Yrs', value: '1-3' },
  { label: '3 - 5 Yrs', value: '3-5' },
  { label: '5+ Yrs', value: '5+' },
];

const CITIES = ['All Cities', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Noida'];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  city,
  setCity,
  itPark,
  setItPark,
  experience,
  setExperience,
  search,
  setSearch,
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 border border-slate-800 shadow-lg mb-6 space-y-4">
      {/* Search inputs row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* City Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4 text-sky-400" />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value === 'All Cities' ? '' : e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-100">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* IT Park Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <input
            type="text"
            value={itPark}
            onChange={(e) => setItPark(e.target.value)}
            placeholder="Filter by IT Park (e.g. Manyata, HITEC)..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Keyword Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-sky-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Company, Role, Landmark Gate..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Experience level filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
          <Briefcase className="w-3.5 h-3.5 text-sky-400" />
          Experience:
        </span>
        {EXPERIENCE_CHIPS.map((chip) => {
          const isActive = experience === chip.value;
          return (
            <button
              key={chip.label}
              onClick={() => setExperience(chip.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
