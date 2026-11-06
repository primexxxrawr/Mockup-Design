import React, { useState, useRef, useEffect } from 'react';
import { MastercardFilterState, STANDARD_CATEGORIES } from '../../types';
import {
  WEEKS,
  PERIODS,
  TIER_EVENT_MASTERCARD,
  BILLABLE_ICA_MASTERCARD,
} from '../../data/mockData';
import { ChevronDown, RotateCcw, Filter, Check } from 'lucide-react';

interface PbiMastercardSlicersProps {
  filters: MastercardFilterState;
  onChange: (filters: MastercardFilterState) => void;
  onReset: () => void;
}

export const PbiMastercardSlicers: React.FC<PbiMastercardSlicersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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
    (filters.minggu !== 'Semua' ? 1 : 0) +
    (filters.bulan !== 'Semua' ? 1 : 0) +
    (filters.serviceKategori !== 'Semua' ? 1 : 0) +
    (filters.tierEvent !== 'Semua' ? 1 : 0) +
    (filters.bySvByQty !== 'Semua' ? 1 : 0) +
    (filters.billableIca !== 'Semua' ? 1 : 0) +
    (filters.status !== 'Semua' ? 1 : 0);

  return (
    <div
      ref={containerRef}
      className="bg-white border-b border-[#E1DFDD] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[#605E5C] font-semibold uppercase tracking-wider text-[10px] pr-1">
          <Filter className="w-3.5 h-3.5 text-[#EB001B]" />
          <span>Slicer:</span>
        </div>

        {/* 1. Minggu (Weekly Selector: W01 2026 .. W43 2026) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'minggu' ? null : 'minggu')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[110px] text-left hover:border-[#8A8886] transition-colors ${
              filters.minggu !== 'Semua' ? 'border-[#EB001B] bg-[#FFF5F5]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Minggu</span>
              <span className="font-semibold text-[#323130] truncate">{filters.minggu}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'minggu' && (
            <div className="absolute left-0 top-10 z-50 w-44 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1 max-h-56 overflow-y-auto">
              <button
                onClick={() => {
                  onChange({ ...filters, minggu: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.minggu === 'Semua' ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Minggu (W01-W43)</span>
                {filters.minggu === 'Semua' && <Check className="w-3 h-3 text-[#EB001B]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {WEEKS.map((w) => (
                <button
                  key={w.weekCode}
                  onClick={() => {
                    onChange({ ...filters, minggu: w.weekCode });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between font-mono text-[10.5px] ${
                    filters.minggu === w.weekCode ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                  }`}
                >
                  <span>{w.weekCode} ({w.startDate})</span>
                  {filters.minggu === w.weekCode && <Check className="w-3 h-3 text-[#EB001B]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Bulan Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'bulan' ? null : 'bulan')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[105px] text-left hover:border-[#8A8886] transition-colors ${
              filters.bulan !== 'Semua' ? 'border-[#EB001B] bg-[#FFF5F5]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Bulan</span>
              <span className="font-semibold text-[#323130] truncate">{filters.bulan}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'bulan' && (
            <div className="absolute left-0 top-10 z-50 w-36 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1 max-h-56 overflow-y-auto">
              <button
                onClick={() => {
                  onChange({ ...filters, bulan: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.bulan === 'Semua' ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Bulan</span>
                {filters.bulan === 'Semua' && <Check className="w-3 h-3 text-[#EB001B]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onChange({ ...filters, bulan: p });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.bulan === p ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                  }`}
                >
                  <span>{p}</span>
                  {filters.bulan === p && <Check className="w-3 h-3 text-[#EB001B]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Service Kategori Dropdown (Exactly 4 standard categories) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[125px] text-left hover:border-[#8A8886] transition-colors ${
              filters.serviceKategori !== 'Semua' ? 'border-[#EB001B] bg-[#FFF5F5]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Service Kategori</span>
              <span className="font-semibold text-[#323130] truncate">{filters.serviceKategori}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'kategori' && (
            <div className="absolute left-0 top-10 z-50 w-44 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1">
              <button
                onClick={() => {
                  onChange({ ...filters, serviceKategori: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.serviceKategori === 'Semua' ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Kategori</span>
                {filters.serviceKategori === 'Semua' && <Check className="w-3 h-3 text-[#EB001B]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {STANDARD_CATEGORIES.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    onChange({ ...filters, serviceKategori: k });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.serviceKategori === k ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                  }`}
                >
                  <span>{k}</span>
                  {filters.serviceKategori === k && <Check className="w-3 h-3 text-[#EB001B]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Tier Event Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'tier' ? null : 'tier')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[105px] text-left hover:border-[#8A8886] transition-colors ${
              filters.tierEvent !== 'Semua' ? 'border-[#EB001B] bg-[#FFF5F5]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Tier Event</span>
              <span className="font-semibold text-[#323130] truncate">{filters.tierEvent}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'tier' && (
            <div className="absolute left-0 top-10 z-50 w-36 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1">
              <button
                onClick={() => {
                  onChange({ ...filters, tierEvent: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.tierEvent === 'Semua' ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Tier</span>
                {filters.tierEvent === 'Semua' && <Check className="w-3 h-3 text-[#EB001B]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {TIER_EVENT_MASTERCARD.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onChange({ ...filters, tierEvent: t });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.tierEvent === t ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                  }`}
                >
                  <span>{t}</span>
                  {filters.tierEvent === t && <Check className="w-3 h-3 text-[#EB001B]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. By SV / By Qty Tile Buttons */}
        <div className="flex items-center border border-[#E1DFDD] rounded-[2px] overflow-hidden bg-[#FAF9F8]">
          <span className="text-[9px] text-[#8A8886] font-semibold uppercase px-2 py-1 border-r border-[#E1DFDD] bg-[#F3F2F1]">
            Type
          </span>
          {(['Semua', 'BY QTY', 'BY SV'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...filters, bySvByQty: mode })}
              className={`px-2 py-1 text-[10.5px] font-medium border-r last:border-r-0 border-[#E1DFDD] transition-colors ${
                filters.bySvByQty === mode ? 'bg-[#EB001B] text-white' : 'text-[#323130] hover:bg-[#EDEBE9]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* 6. Billable ICA Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'ica' ? null : 'ica')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[105px] text-left hover:border-[#8A8886] transition-colors ${
              filters.billableIca !== 'Semua' ? 'border-[#EB001B] bg-[#FFF5F5]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Billable ICA</span>
              <span className="font-semibold text-[#323130] truncate">{filters.billableIca}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'ica' && (
            <div className="absolute left-0 top-10 z-50 w-36 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1">
              <button
                onClick={() => {
                  onChange({ ...filters, billableIca: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.billableIca === 'Semua' ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                }`}
              >
                <span>Semua ICA</span>
                {filters.billableIca === 'Semua' && <Check className="w-3 h-3 text-[#EB001B]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {BILLABLE_ICA_MASTERCARD.map((ica) => (
                <button
                  key={ica}
                  onClick={() => {
                    onChange({ ...filters, billableIca: ica });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.billableIca === ica ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                  }`}
                >
                  <span>{ica}</span>
                  {filters.billableIca === ica && <Check className="w-3 h-3 text-[#EB001B]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 7. Status Slicer */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[115px] text-left hover:border-[#8A8886] transition-colors ${
              filters.status !== 'Semua' ? 'border-[#EB001B] bg-[#FFF5F5]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Status</span>
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
                    filters.status === st ? 'font-bold text-[#EB001B]' : 'text-[#323130]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {st === 'Match' && <span className="w-2 h-2 rounded-full bg-[#107C41]" />}
                    {st === 'Deviasi' && <span className="w-2 h-2 rounded-full bg-[#D13438]" />}
                    {st === 'Belum Direkonsiliasi' && <span className="w-2 h-2 rounded-full bg-[#8A8886]" />}
                    <span>{st}</span>
                  </div>
                  {filters.status === st && <Check className="w-3 h-3 text-[#EB001B]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <span className="text-[10px] text-[#EB001B] font-medium bg-[#FFF5F5] px-2 py-0.5 rounded-[2px] border border-[#FAD2D2]">
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
