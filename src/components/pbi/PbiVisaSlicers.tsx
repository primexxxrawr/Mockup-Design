import React, { useState, useRef, useEffect } from 'react';
import { VisaFilterState, STANDARD_CATEGORIES } from '../../types';
import { PERIODS, TYPE_VISA } from '../../data/mockData';
import { ChevronDown, RotateCcw, Filter, Check, Info } from 'lucide-react';

interface PbiVisaSlicersProps {
  filters: VisaFilterState;
  onChange: (filters: VisaFilterState) => void;
  onReset: () => void;
  uniqueInvoiceIds: string[];
}

export const PbiVisaSlicers: React.FC<PbiVisaSlicersProps> = ({
  filters,
  onChange,
  onReset,
  uniqueInvoiceIds,
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
    (filters.billingPeriod !== 'Semua' ? 1 : 0) +
    (filters.invoiceId !== 'Semua' ? 1 : 0) +
    (filters.currentOrPrevious !== 'Semua' ? 1 : 0) +
    (filters.feeCategory !== 'Semua' ? 1 : 0) +
    (filters.type !== 'Semua' ? 1 : 0) +
    (filters.status !== 'Semua' ? 1 : 0);

  return (
    <div
      ref={containerRef}
      className="bg-white border-b border-[#E1DFDD] px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-[#605E5C] font-semibold uppercase tracking-wider text-[10px] pr-1">
          <Filter className="w-3.5 h-3.5 text-[#1A1F71]" />
          <span>Slicer:</span>
        </div>

        {/* 1. Billing Period Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'period' ? null : 'period')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[120px] text-left hover:border-[#8A8886] transition-colors ${
              filters.billingPeriod !== 'Semua' ? 'border-[#1A1F71] bg-[#F0F2FF]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Billing Period</span>
              <span className="font-semibold text-[#323130] truncate">{filters.billingPeriod}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'period' && (
            <div className="absolute left-0 top-10 z-50 w-40 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1 max-h-56 overflow-y-auto">
              <button
                onClick={() => {
                  onChange({ ...filters, billingPeriod: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.billingPeriod === 'Semua' ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Period</span>
                {filters.billingPeriod === 'Semua' && <Check className="w-3 h-3 text-[#1A1F71]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onChange({ ...filters, billingPeriod: p });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.billingPeriod === p ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                  }`}
                >
                  <span>{p}</span>
                  {filters.billingPeriod === p && <Check className="w-3 h-3 text-[#1A1F71]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Invoice ID Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'invoice' ? null : 'invoice')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[130px] text-left hover:border-[#8A8886] transition-colors ${
              filters.invoiceId !== 'Semua' ? 'border-[#1A1F71] bg-[#F0F2FF]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Invoice ID</span>
              <span className="font-semibold text-[#323130] truncate">{filters.invoiceId}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'invoice' && (
            <div className="absolute left-0 top-10 z-50 w-52 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1 max-h-56 overflow-y-auto">
              <button
                onClick={() => {
                  onChange({ ...filters, invoiceId: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.invoiceId === 'Semua' ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Invoice</span>
                {filters.invoiceId === 'Semua' && <Check className="w-3 h-3 text-[#1A1F71]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {uniqueInvoiceIds.slice(0, 25).map((inv) => (
                <button
                  key={inv}
                  onClick={() => {
                    onChange({ ...filters, invoiceId: inv });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between font-mono text-[10px] ${
                    filters.invoiceId === inv ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                  }`}
                >
                  <span>{inv}</span>
                  {filters.invoiceId === inv && <Check className="w-3 h-3 text-[#1A1F71]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Current or Previous Tile Buttons */}
        <div className="flex items-center border border-[#E1DFDD] rounded-[2px] overflow-hidden bg-[#FAF9F8]">
          <span className="text-[9px] text-[#8A8886] font-semibold uppercase px-2 py-1 border-r border-[#E1DFDD] bg-[#F3F2F1]">
            Periode
          </span>
          {(['Semua', 'Current', 'Previous'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...filters, currentOrPrevious: mode })}
              className={`px-2 py-1 text-[10.5px] font-medium border-r last:border-r-0 border-[#E1DFDD] transition-colors ${
                filters.currentOrPrevious === mode ? 'bg-[#1A1F71] text-white' : 'text-[#323130] hover:bg-[#EDEBE9]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* 4. Fee Category Dropdown (Exactly 4 Categories) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[125px] text-left hover:border-[#8A8886] transition-colors ${
              filters.feeCategory !== 'Semua' ? 'border-[#1A1F71] bg-[#F0F2FF]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Fee Category</span>
              <span className="font-semibold text-[#323130] truncate">{filters.feeCategory}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'category' && (
            <div className="absolute left-0 top-10 z-50 w-44 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1">
              <button
                onClick={() => {
                  onChange({ ...filters, feeCategory: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.feeCategory === 'Semua' ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Kategori</span>
                {filters.feeCategory === 'Semua' && <Check className="w-3 h-3 text-[#1A1F71]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {STANDARD_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onChange({ ...filters, feeCategory: c });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.feeCategory === c ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                  }`}
                >
                  <span>{c}</span>
                  {filters.feeCategory === c && <Check className="w-3 h-3 text-[#1A1F71]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Type Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[95px] text-left hover:border-[#8A8886] transition-colors ${
              filters.type !== 'Semua' ? 'border-[#1A1F71] bg-[#F0F2FF]' : 'border-[#E1DFDD]'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-[#8A8886] uppercase font-semibold leading-none">Type</span>
              <span className="font-semibold text-[#323130] truncate">{filters.type}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#605E5C] shrink-0" />
          </button>
          {openDropdown === 'type' && (
            <div className="absolute left-0 top-10 z-50 w-36 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1">
              <button
                onClick={() => {
                  onChange({ ...filters, type: 'Semua' });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                  filters.type === 'Semua' ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                }`}
              >
                <span>Semua Type</span>
                {filters.type === 'Semua' && <Check className="w-3 h-3 text-[#1A1F71]" />}
              </button>
              <div className="h-px bg-[#E1DFDD] my-0.5" />
              {TYPE_VISA.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onChange({ ...filters, type: t });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F2F1] flex items-center justify-between ${
                    filters.type === t ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                  }`}
                >
                  <span>{t}</span>
                  {filters.type === t && <Check className="w-3 h-3 text-[#1A1F71]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 6. Status Slicer */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            className={`flex items-center justify-between gap-2 px-2.5 py-1 bg-[#FAF9F8] border rounded-[2px] min-w-[120px] text-left hover:border-[#8A8886] transition-colors ${
              filters.status !== 'Semua' ? 'border-[#1A1F71] bg-[#F0F2FF]' : 'border-[#E1DFDD]'
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
                    filters.status === st ? 'font-bold text-[#1A1F71]' : 'text-[#323130]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {st === 'Match' && <span className="w-2 h-2 rounded-full bg-[#107C41]" />}
                    {st === 'Deviasi' && <span className="w-2 h-2 rounded-full bg-[#D13438]" />}
                    {st === 'Belum Direkonsiliasi' && <span className="w-2 h-2 rounded-full bg-[#8A8886]" />}
                    <span>{st}</span>
                  </div>
                  {filters.status === st && <Check className="w-3 h-3 text-[#1A1F71]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Currency Note & Reset */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[10px] text-[#605E5C] bg-[#FAF9F8] border border-[#E1DFDD] px-2 py-0.5 rounded-[2px]">
          <Info className="w-3 h-3 text-[#1A1F71] shrink-0" />
          <span>Selisih dalam mata uang tagihan (asumsi)</span>
        </div>

        {activeCount > 0 && (
          <span className="text-[10px] text-[#1A1F71] font-medium bg-[#F0F2FF] px-2 py-0.5 rounded-[2px] border border-[#C5CDFF]">
            {activeCount} filter aktif
          </span>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#605E5C] hover:text-[#323130] hover:bg-[#EDEBE9] border border-[#E1DFDD] rounded-[2px] transition-colors"
          title="Reset semua slicer Visa"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Hapus Filter</span>
        </button>
      </div>
    </div>
  );
};
