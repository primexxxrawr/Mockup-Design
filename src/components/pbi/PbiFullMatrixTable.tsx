import React, { useState, useMemo } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { MastercardRecord, VisaRecord, DeviationStatus } from '../../types';
import {
  formatCurrencyVal,
  formatNumber,
  formatPercentage,
  formatRupiah,
  formatUSD,
} from '../../data/mockData';
import { ArrowUpDown, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface PbiFullMatrixTableProps {
  principalMode: 'Visa' | 'Mastercard';
  onTogglePrincipal: (p: 'Visa' | 'Mastercard') => void;
  visaRecords: VisaRecord[];
  mcRecords: MastercardRecord[];
  onSelectVisaRow: (row: VisaRecord) => void;
  onSelectMcRow: (row: MastercardRecord) => void;
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiFullMatrixTable: React.FC<PbiFullMatrixTableProps> = ({
  principalMode,
  onTogglePrincipal,
  visaRecords,
  mcRecords,
  onSelectVisaRow,
  onSelectMcRow,
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [sortField, setSortField] = useState<string>('Selisih');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Sort records
  const sortedVisa = useMemo(() => {
    return [...visaRecords].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let aVal = (a as any)[sortField];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let bVal = (b as any)[sortField];

      if (sortField === 'Selisih' || sortField === 'Total' || sortField === 'Total Fee BMRI' || sortField === 'selisihIdr') {
        aVal = Math.abs(Number(aVal) || 0);
        bVal = Math.abs(Number(bVal) || 0);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [visaRecords, sortField, sortOrder]);

  const sortedMc = useMemo(() => {
    return [...mcRecords].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let aVal = (a as any)[sortField];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let bVal = (b as any)[sortField];

      if (sortField === 'SELISIH' || sortField === 'TOTAL MASTERCARD' || sortField === 'TOTAL MANDIRI') {
        aVal = Math.abs(Number(aVal) || 0);
        bVal = Math.abs(Number(bVal) || 0);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [mcRecords, sortField, sortOrder]);

  const totalPages = Math.ceil(
    (principalMode === 'Visa' ? sortedVisa.length : sortedMc.length) / pageSize
  ) || 1;

  const currentVisaRows = sortedVisa.slice((page - 1) * pageSize, page * pageSize);
  const currentMcRows = sortedMc.slice((page - 1) * pageSize, page * pageSize);

  // Totals calculations (Baseline compliance: sum in USD-equivalent for Visa, Selisih in Rp)
  const visaTotals = useMemo(() => {
    const totalUnits = visaRecords.reduce((acc, r) => acc + (r.Units || 0), 0);
    const totalUnitsBmri = visaRecords.reduce((acc, r) => acc + (r['Jumlah Units BMRI'] || 0), 0);
    const totalUsd = visaRecords.reduce((acc, r) => acc + (r.totalUsd || 0), 0);
    const totalFeeBmriUsd = visaRecords.reduce((acc, r) => acc + (r.totalFeeBmriUsd || 0), 0);
    const selisihIdr = visaRecords.reduce((acc, r) => acc + (r.selisihIdr || 0), 0);

    return {
      totalUnits,
      totalUnitsBmri,
      totalUsd,
      totalFeeBmriUsd,
      selisihIdr,
    };
  }, [visaRecords]);

  const mcTotals = useMemo(() => {
    const qtyMandiri = mcRecords.reduce((acc, r) => acc + (r['QTY MANDIRI'] || 0), 0);
    const chargeMandiri = mcRecords.reduce((acc, r) => acc + (r['CHARGE MANDIRI'] || 0), 0);
    const taxMandiri = mcRecords.reduce((acc, r) => acc + (r['TAX MANDIRI'] || 0), 0);
    const totalMandiri = mcRecords.reduce((acc, r) => acc + (r['TOTAL MANDIRI'] || 0), 0);

    const qtyMc = mcRecords.reduce((acc, r) => acc + (r['QTY MASTERCARD'] || 0), 0);
    const chargeMc = mcRecords.reduce((acc, r) => acc + (r['CHARGE MASTERCARD'] || 0), 0);
    const taxMc = mcRecords.reduce((acc, r) => acc + (r['TAX MASTERCARD'] || 0), 0);
    const totalMc = mcRecords.reduce((acc, r) => acc + (r['TOTAL MASTERCARD'] || 0), 0);

    const selisih = mcRecords.reduce((acc, r) => acc + (r.SELISIH || 0), 0);

    return {
      qtyMandiri,
      chargeMandiri,
      taxMandiri,
      totalMandiri,
      qtyMc,
      chargeMc,
      taxMc,
      totalMc,
      selisih,
    };
  }, [mcRecords]);

  const renderStatus = (status: DeviationStatus) => {
    switch (status) {
      case 'Match':
        return (
          <span className="inline-flex items-center gap-1 text-[#1E8E5A] font-semibold text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E5A]" />
            Sesuai
          </span>
        );
      case 'Deviasi':
        return (
          <span className="inline-flex items-center gap-1 text-[#C62828] font-semibold text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
            Ada Selisih
          </span>
        );
      case 'Belum Direkonsiliasi':
        return (
          <span className="inline-flex items-center gap-1 text-[#8A93A0] font-semibold text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A93A0]" />
            Belum Dicek
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white border border-[#E1E5EB] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col relative transition-all hover:border-[#CBD5E1] ${className}`}
    >
      <PbiVisualHeader
        title={`Matriks Detail Seluruh Kolom (${principalMode})`}
        subtitle="Untuk analis dan operasional · 2 Kolom pertama dibekukan (frozen) · Geser horizontal untuk melihat seluruh kolom"
        caraMembaca="Tabel operasional lengkap yang memuat seluruh parameter teknis dan rumus perhitungan selisih antara bank dan principal."
        onFocus={onFocus}
        onExportCsv={onExportCsv}
      />

      {/* Control Bar: Principal Toggle & Pagination */}
      <div className="px-3.5 py-2 border-b border-[#F4F6F9] flex flex-wrap items-center justify-between gap-3 bg-[#F4F6F9]">
        {/* Toggle Visa | Mastercard */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#6B7280]">Pilih Skema:</span>
          <div className="flex items-center border border-[#E1E5EB] rounded-[2px] overflow-hidden bg-white shadow-xs">
            <button
              type="button"
              onClick={() => {
                onTogglePrincipal('Visa');
                setPage(1);
                setSortField('Selisih');
              }}
              className={`px-3 py-1 text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                principalMode === 'Visa'
                  ? 'bg-[#2B6CB0] text-white'
                  : 'text-[#1F2937] hover:bg-[#F4F6F9]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span>Visa (24 Kolom + Selisih Rp)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onTogglePrincipal('Mastercard');
                setPage(1);
                setSortField('SELISIH');
              }}
              className={`px-3 py-1 text-[11px] font-semibold transition-colors flex items-center gap-1.5 border-l border-[#E1E5EB] ${
                principalMode === 'Mastercard'
                  ? 'bg-[#E8832A] text-white'
                  : 'text-[#1F2937] hover:bg-[#F4F6F9]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span>Mastercard (20 Kolom + Periode)</span>
            </button>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 text-[11px] text-[#605E5C]">
          <span>
            Total:{' '}
            <strong className="text-[#323130] tabular-nums">
              {principalMode === 'Visa' ? visaRecords.length : mcRecords.length}
            </strong>{' '}
            baris
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2 py-0.5 border border-[#E1DFDD] rounded-[2px] disabled:opacity-40 hover:bg-[#F3F2F1] text-[10px]"
            >
              Prev
            </button>
            <span className="text-[10px] tabular-nums font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2 py-0.5 border border-[#E1DFDD] rounded-[2px] disabled:opacity-40 hover:bg-[#F3F2F1] text-[10px]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Main Table with Horizontal Scroll & Frozen 2 Columns */}
      <div className="overflow-x-auto flex-1 relative max-h-[580px]">
        {principalMode === 'Mastercard' ? (
          /* MASTERCARD FULL COLUMNS TABLE WITH MINGGU & BULAN */
          <table className="w-full text-[11px] text-left border-collapse select-none">
            <thead>
              <tr className="bg-[#FAF9F8] border-b border-[#E1DFDD] text-[#323130] font-semibold text-[10.5px]">
                {/* Frozen Col 1: NO */}
                <th className="sticky left-0 z-20 bg-[#FAF9F8] py-2 px-2.5 w-14 text-center border-r border-[#EDEBE9]">
                  NO
                </th>
                {/* Frozen Col 2: TANGGAL */}
                <th
                  onClick={() => handleSort('TANGGAL')}
                  className="sticky left-14 z-20 bg-[#FAF9F8] py-2 px-3 min-w-[95px] cursor-pointer hover:bg-[#EDEBE9] border-r-2 border-[#C8C6C4] shadow-[2px_0_4px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-1">
                    <span>TANGGAL</span>
                    {sortField === 'TANGGAL' ? (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-[#C8C6C4]" />
                    )}
                  </div>
                </th>
                {/* Derived Granularity Columns */}
                <th onClick={() => handleSort('Minggu')} className="py-2 px-2.5 whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9] font-mono text-[#0078D4]">
                  MINGGU
                </th>
                <th onClick={() => handleSort('Bulan')} className="py-2 px-2.5 whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9]">
                  BULAN
                </th>
                {/* Standard 20 Columns */}
                <th onClick={() => handleSort('EVENT ID')} className="py-2 px-2.5 whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9]">EVENT ID</th>
                <th className="py-2 px-2.5 whitespace-nowrap">TIER EVENT</th>
                <th className="py-2 px-2.5 whitespace-nowrap">DESC</th>
                <th className="py-2 px-2.5 whitespace-nowrap">BY SV / BY QTY</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">QTY MANDIRI</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">RATE MANDIRI</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">CHARGE MANDIRI</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">TAX MANDIRI</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap bg-[#F5F8FF]">TOTAL MANDIRI</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">QTY MASTERCARD</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">RATE MASTERCARD</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">CHARGE MASTERCARD</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">TAX MASTERCARD</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap bg-[#FFF5F5]">TOTAL MASTERCARD</th>
                <th onClick={() => handleSort('SELISIH')} className="py-2 px-2.5 text-right whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9] bg-[#FFF8EB]">SELISIH</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">% SELISIH</th>
                <th className="py-2 px-2.5 whitespace-nowrap">SERVICE KATEGORI</th>
                <th className="py-2 px-2.5 whitespace-nowrap">BILLABLE ICA</th>
                <th className="py-2 px-2.5 whitespace-nowrap">STATUS</th>
                <th className="py-2 px-2.5 whitespace-nowrap">CATATAN</th>
                <th className="py-2 px-2 text-center text-[#8A8886]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F2F1]">
              {currentMcRows.map((r) => {
                const isDeviasi = r.STATUS === 'Deviasi' && r.SELISIH !== 0;

                return (
                  <tr
                    key={r.NO}
                    onClick={() => onSelectMcRow(r)}
                    className="hover:bg-[#F3F2F1] cursor-pointer transition-colors group"
                  >
                    {/* Frozen Col 1 */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-[#F3F2F1] py-1.5 px-2.5 text-center font-mono tabular-nums text-[#8A8886] border-r border-[#EDEBE9]">
                      {r.NO}
                    </td>
                    {/* Frozen Col 2 */}
                    <td className="sticky left-14 z-10 bg-white group-hover:bg-[#F3F2F1] py-1.5 px-3 font-mono tabular-nums text-[#323130] whitespace-nowrap border-r-2 border-[#C8C6C4] shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                      {r.TANGGAL}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono text-[#0078D4] font-semibold whitespace-nowrap">{r.Minggu}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap text-[#605E5C]">{r.Bulan}</td>
                    <td className="py-1.5 px-2.5 font-mono text-[#323130] whitespace-nowrap">{r['EVENT ID']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['TIER EVENT']}</td>
                    <td className="py-1.5 px-2.5 text-[#605E5C] max-w-[150px] truncate" title={r.DESC}>{r.DESC}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['BY SV / BY QTY']}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatNumber(r['QTY MANDIRI'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatRupiah(r['RATE MANDIRI'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatRupiah(r['CHARGE MANDIRI'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatRupiah(r['TAX MANDIRI'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums font-semibold bg-[#F5F8FF]">{formatRupiah(r['TOTAL MANDIRI'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatNumber(r['QTY MASTERCARD'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatRupiah(r['RATE MASTERCARD'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatRupiah(r['CHARGE MASTERCARD'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatRupiah(r['TAX MASTERCARD'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums font-semibold bg-[#FFF5F5]">{formatRupiah(r['TOTAL MASTERCARD'])}</td>
                    <td className={`py-1.5 px-2.5 text-right font-mono tabular-nums font-bold ${
                      isDeviasi ? 'bg-[#FDF3F3] text-[#A80000]' : 'text-[#107C41]'
                    }`}>
                      {formatRupiah(r.SELISIH)}
                    </td>
                    <td className={`py-1.5 px-2.5 text-right font-mono tabular-nums ${
                      isDeviasi ? 'text-[#D13438] font-medium' : 'text-[#605E5C]'
                    }`}>
                      {formatPercentage(r['PERSENTASE SELISIH'])}
                    </td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['SERVICE KATEGORI']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap font-mono">{r['BILLABLE ICA']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{renderStatus(r.STATUS)}</td>
                    <td className="py-1.5 px-2.5 text-[#8A8886] italic whitespace-nowrap">-</td>
                    <td className="py-1.5 px-2 text-center text-[#EB001B] opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-[#EDEBE9] rounded" title="Lihat Detail Transaksi">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Row (Power BI Standard Matrix Total) */}
            <tfoot>
              <tr className="bg-[#FAF9F8] border-t-2 border-[#323130] font-bold text-[#323130] text-[11px]">
                <td className="sticky left-0 z-10 bg-[#FAF9F8] py-2 px-2.5 text-center border-r border-[#EDEBE9]" colSpan={2}>
                  Total ({mcRecords.length} baris)
                </td>
                <td className="py-2 px-2.5" colSpan={6}>-</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatNumber(mcTotals.qtyMandiri)}</td>
                <td className="py-2 px-2.5 text-right">-</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatRupiah(mcTotals.chargeMandiri)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatRupiah(mcTotals.taxMandiri)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums text-[#0078D4] bg-[#F5F8FF]">{formatRupiah(mcTotals.totalMandiri)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatNumber(mcTotals.qtyMc)}</td>
                <td className="py-2 px-2.5 text-right">-</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatRupiah(mcTotals.chargeMc)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatRupiah(mcTotals.taxMc)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums text-[#EB001B] bg-[#FFF5F5]">{formatRupiah(mcTotals.totalMc)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums text-[#A80000] bg-[#FFF8EB]">{formatRupiah(mcTotals.selisih)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums" colSpan={5}>-</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          /* VISA FULL COLUMNS TABLE WITH SELISIH (TAGIHAN) & SELISIH (RP) */
          <table className="w-full text-[11px] text-left border-collapse select-none">
            <thead>
              <tr className="bg-[#FAF9F8] border-b border-[#E1DFDD] text-[#323130] font-semibold text-[10.5px]">
                {/* Frozen Col 1: Billing Period */}
                <th className="sticky left-0 z-20 bg-[#FAF9F8] py-2 px-2.5 min-w-[90px] border-r border-[#EDEBE9]">
                  Billing Period
                </th>
                {/* Frozen Col 2: Invoice ID */}
                <th
                  onClick={() => handleSort('Invoice ID')}
                  className="sticky left-[90px] z-20 bg-[#FAF9F8] py-2 px-3 min-w-[130px] cursor-pointer hover:bg-[#EDEBE9] border-r-2 border-[#C8C6C4] shadow-[2px_0_4px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-1">
                    <span>Invoice ID</span>
                    {sortField === 'Invoice ID' ? (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-[#C8C6C4]" />
                    )}
                  </div>
                </th>
                {/* Columns 3 to 25 */}
                <th className="py-2 px-2.5 whitespace-nowrap">Invoice Date</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Current or Previous</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Mapping</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Settlement ID</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Fee Category</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Fee Group</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Fee Name</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Billing Line</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Invoice Description</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Custom Description</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Type</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Rate Type</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">Units</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Rate Cur</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">Rate</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">Forex Rate</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Billing Currency</th>
                <th onClick={() => handleSort('Total')} className="py-2 px-2.5 text-right whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9] bg-[#FFF5F5]">Total</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">Jumlah Units BMRI</th>
                <th onClick={() => handleSort('Total Fee BMRI')} className="py-2 px-2.5 text-right whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9] bg-[#F5F8FF]">Total Fee BMRI</th>
                <th onClick={() => handleSort('Selisih')} className="py-2 px-2.5 text-right whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9] bg-[#FFF8EB]">Selisih (Tagihan)</th>
                <th onClick={() => handleSort('selisihIdr')} className="py-2 px-2.5 text-right whitespace-nowrap cursor-pointer hover:bg-[#EDEBE9] bg-[#FFF0E6]">Selisih (Rp)</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">% Selisih</th>
                <th className="py-2 px-2.5 whitespace-nowrap">STATUS</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Catatan</th>
                <th className="py-2 px-2 text-center text-[#8A8886]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F2F1]">
              {currentVisaRows.map((r, idx) => {
                const isDeviasi = r.STATUS === 'Deviasi' && r.Selisih !== 0;

                return (
                  <tr
                    key={r['Invoice ID'] + idx}
                    onClick={() => onSelectVisaRow(r)}
                    className="hover:bg-[#F3F2F1] cursor-pointer transition-colors group"
                  >
                    {/* Frozen Col 1 */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-[#F3F2F1] py-1.5 px-2.5 font-medium text-[#323130] whitespace-nowrap border-r border-[#EDEBE9]">
                      {r['Billing Period']}
                    </td>
                    {/* Frozen Col 2 */}
                    <td className="sticky left-[90px] z-10 bg-white group-hover:bg-[#F3F2F1] py-1.5 px-3 font-mono font-semibold text-[#1A1F71] whitespace-nowrap border-r-2 border-[#C8C6C4] shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                      {r['Invoice ID']}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono tabular-nums whitespace-nowrap">{r['Invoice Date']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['Current or Previous']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r.Mapping}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap font-mono">{r['Settlement ID']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['Fee Category']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['Fee Group']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['Fee Name']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap font-mono">{r['Billing Line']}</td>
                    <td className="py-1.5 px-2.5 text-[#605E5C] max-w-[140px] truncate" title={r['Invoice Description']}>{r['Invoice Description']}</td>
                    <td className="py-1.5 px-2.5 text-[#605E5C] max-w-[140px] truncate" title={r['Billing Line Custom Description']}>{r['Billing Line Custom Description']}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r.Type}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{r['Rate Type']}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatNumber(r.Units)}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap font-mono">{r['Rate Cur']}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{r.Rate.toFixed(4)}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatNumber(r['Foreign Exchange Rate'])}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap font-semibold">{r['Billing Currency']}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums font-semibold bg-[#FFF5F5]">
                      {formatCurrencyVal(r.Total, r['Billing Currency'])}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatNumber(r['Jumlah Units BMRI'])}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums font-semibold bg-[#F5F8FF]">
                      {formatCurrencyVal(r['Total Fee BMRI'], r['Billing Currency'])}
                    </td>
                    <td className={`py-1.5 px-2.5 text-right font-mono tabular-nums font-bold ${
                      isDeviasi ? 'bg-[#FDF3F3] text-[#A80000]' : 'text-[#107C41]'
                    }`}>
                      {formatCurrencyVal(r.Selisih, r['Billing Currency'])}
                    </td>
                    <td className={`py-1.5 px-2.5 text-right font-mono tabular-nums font-bold bg-[#FFF0E6] ${
                      isDeviasi ? 'text-[#A80000]' : 'text-[#107C41]'
                    }`}>
                      {formatRupiah(r.selisihIdr)}
                    </td>
                    <td className={`py-1.5 px-2.5 text-right font-mono tabular-nums ${
                      isDeviasi ? 'text-[#D13438] font-medium' : 'text-[#605E5C]'
                    }`}>
                      {formatPercentage(r['Persentase Selisih'])}
                    </td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">{renderStatus(r.STATUS)}</td>
                    <td className="py-1.5 px-2.5 text-[#8A8886] italic whitespace-nowrap">-</td>
                    <td className="py-1.5 px-2 text-center text-[#1A1F71] opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-[#EDEBE9] rounded" title="Lihat Detail Transaksi">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Row (Power BI Standard Matrix Total - USD equivalent & Selisih Rp) */}
            <tfoot>
              <tr className="bg-[#FAF9F8] border-t-2 border-[#323130] font-bold text-[#323130] text-[11px]">
                <td className="sticky left-0 z-10 bg-[#FAF9F8] py-2 px-2.5 text-center border-r border-[#EDEBE9]" colSpan={2}>
                  Total ({visaRecords.length} baris)
                </td>
                <td className="py-2 px-2.5" colSpan={12}>-</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatNumber(visaTotals.totalUnits)}</td>
                <td className="py-2 px-2.5" colSpan={3}>-</td>
                <td className="py-2 px-2.5 font-mono text-[10px] text-[#0078D4]">Ekuiv. USD</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums text-[#1A1F71] bg-[#FFF5F5]">
                  {formatUSD(visaTotals.totalUsd)}
                </td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatNumber(visaTotals.totalUnitsBmri)}</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums text-[#0078D4] bg-[#F5F8FF]">
                  {formatUSD(visaTotals.totalFeeBmriUsd)}
                </td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums text-[#8A8886]">-</td>
                <td className="py-2 px-2.5 text-right font-mono tabular-nums text-[#A80000] bg-[#FFF0E6]">
                  {formatRupiah(visaTotals.selisihIdr)}
                </td>
                <td className="py-2 px-2.5" colSpan={4}>-</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-[#E1DFDD] bg-[#FAF9F8] text-[10px] text-[#8A8886] flex items-center justify-between">
        <span>* Kolom Catatan sengaja dikosongkan sesuai pedoman rekonsiliasi. Baris total: Visa dihitung dalam USD-equivalent, Selisih dalam Rupiah.</span>
        <span>Selisih: {principalMode === 'Mastercard' ? 'TOTAL MC - TOTAL MANDIRI (IDR)' : 'Total (Visa) - Total Fee BMRI'}</span>
      </div>
    </div>
  );
};
