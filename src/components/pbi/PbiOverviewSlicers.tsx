import React, { useState, useRef, useEffect } from 'react';
import { OverviewFilterState } from '../../types';
import { PERIODS } from '../../data/mockData';
import { ChevronDown, RotateCcw, Filter, Check, Search } from 'lucide-react';

interface PbiOverviewSlicersProps {
  filters: OverviewFilterState;
  onChange: (filters: OverviewFilterState) => void;
  onReset: () => void;
  placeholder?: string;
}

export const PbiOverviewSlicers: React.FC<PbiOverviewSlicersProps> = ({
  filters,
  onChange,
  onReset,
  placeholder = 'Cari event ID, deskripsi, atau kategori...',
}) => {
  const [openDropdown, setOpenDropdown] = useState<'periode' | 'status' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const activeCount =
    (filters.periode !== 'Semua' ? 1 : 0) +
    (filters.status !== 'Semua' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div
      ref={containerRef}
      className="bg-white border-b border-[#E1DFDD] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#605E5C] font-semibold uppercase tracking-wider text-[10px] pr-1">
          <Filter className="w-3.5 h-3.5 text-[#0078D4]" />
          <span>Slicer:</span>
        </div>

        {/* 1. Periode Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'periode' ? null : 'periode')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[120px] text-left hover:border-[#8A8886] transition-colors ${
              filters.periode !== 'Semua' ? 'border-[#0078D4] bg-[#F0F6FF]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Periode</span>
              <span className="font-semibold text-[#323130] truncate">{filters.periode}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'periode' && (
            <div className="absolute left-0 top-10 z-50 w-44 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1 max-h-56 overflow-y-auto">
              <button
                onClick={() => {
                  onChange({ ...filters, periode: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.periode === 'Semua' ? 'font-bold text-[#0078D4]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Periode</span>
                {filters.periode === 'Semua' && <Check className="w-3 h-3 text-[#0078D4]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onChange({ ...filters, periode: p });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.periode === p ? 'font-bold text-[#0078D4]' : 'text-[#323130]'
                  }`}
                >
                  <span>{p}</span>
                  {filters.periode === p && <Check className="w-3 h-3 text-[#0078D4]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[130px] text-left hover:border-[#8A8886] transition-colors ${
              filters.status !== 'Semua' ? 'border-[#0078D4] bg-[#F0F6FF]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Status Rekon</span>
              <span className="font-semibold text-[#323130] truncate">{filters.status}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'status' && (
            <div className="absolute left-0 top-10 z-50 w-44 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1">
              {(['Semua', 'Match', 'Deviasi', 'Belum Direkonsiliasi'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    onChange({ ...filters, status: st });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.status === st ? 'font-bold text-[#0078D4]' : 'text-[#323130]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {st === 'Match' && <span className="w-2 h-2 rounded-full bg-[#107C41]" />}
                    {st === 'Deviasi' && <span className="w-2 h-2 rounded-full bg-[#D13438]" />}
                    {st === 'Belum Direkonsiliasi' && <span className="w-2 h-2 rounded-full bg-[#8A8886]" />}
                    <span>{st}</span>
                  </div>
                  {filters.status === st && <Check className="w-3 h-3 text-[#0078D4]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Search Box */}
        <div className="relative min-w-[200px]">
          <Search className="w-3 h-3 text-[#8A8886] absolute left-2 top-2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder={placeholder}
            className="w-full pl-6 pr-2 py-1 text-[11px] bg-[#FAF9F8] border border-[#E1DFDD] rounded-[2px] focus:outline-none focus:border-[#0078D4] text-[#323130]"
          />
        </div>
      </div>

      {/* Reset */}
      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <span className="text-[10px] text-[#0078D4] font-medium bg-[#F0F6FF] px-2 py-0.5 rounded-[2px] border border-[#C7E0F4]">
            {activeCount} filter aktif
          </span>
        )}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#605E5C] hover:text-[#323130] hover:bg-[#EDEBE9] border border-[#E1DFDD] rounded-[2px] transition-colors"
          title="Reset semua slicer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Hapus Filter</span>
        </button>
      </div>
    </div>
  );
};
