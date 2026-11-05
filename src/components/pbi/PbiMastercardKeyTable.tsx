import React, { useState, useMemo } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { MastercardRecord, DeviationStatus } from '../../types';
import { formatNumber, formatPercentage, formatRupiah } from '../../data/mockData';
import { ArrowUpDown, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface PbiMastercardKeyTableProps {
  title: string;
  subtitle?: string;
  records: MastercardRecord[];
  onSelectRecord?: (record: MastercardRecord) => void;
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

type SortField =
  | 'TANGGAL'
  | 'EVENT ID'
  | 'DESC'
  | 'QTY MANDIRI'
  | 'QTY MASTERCARD'
  | 'TOTAL MANDIRI'
  | 'TOTAL MASTERCARD'
  | 'SELISIH'
  | 'PERSENTASE SELISIH'
  | 'SERVICE KATEGORI';

export const PbiMastercardKeyTable: React.FC<PbiMastercardKeyTableProps> = ({
  title,
  subtitle,
  records,
  onSelectRecord,
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [sortField, setSortField] = useState<SortField>('SELISIH');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'SELISIH') {
        aVal = Math.abs(a.SELISIH);
        bVal = Math.abs(b.SELISIH);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [records, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const currentRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

  // Totals calculations
  const totals = useMemo(() => {
    const totalQtyMandiri = records.reduce((acc, r) => acc + r['QTY MANDIRI'], 0);
    const totalQtyMc = records.reduce((acc, r) => acc + r['QTY MASTERCARD'], 0);
    const totalMandiri = records.reduce((acc, r) => acc + r['TOTAL MANDIRI'], 0);
    const totalMc = records.reduce((acc, r) => acc + r['TOTAL MASTERCARD'], 0);
    const totalSelisih = records.reduce((acc, r) => acc + r.SELISIH, 0);
    const avgPct = totalMandiri > 0 ? (totalSelisih / totalMandiri) * 100 : 0;
    return {
      totalQtyMandiri,
      totalQtyMc,
      totalMandiri,
      totalMc,
      totalSelisih,
      avgPct,
      count: records.length,
    };
  }, [records]);

  const handleExport = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    const headers = [
      'TANGGAL',
      'EVENT ID',
      'DESC',
      'QTY MANDIRI',
      'QTY MASTERCARD',
      'TOTAL MANDIRI',
      'TOTAL MASTERCARD',
      'SELISIH',
      'PERSENTASE SELISIH',
      'SERVICE KATEGORI',
      'STATUS',
    ];
    const rows = sortedRecords.map((r) => [
      r.TANGGAL,
      r['EVENT ID'],
      `"${r.DESC}"`,
      r['QTY MANDIRI'],
      r['QTY MASTERCARD'],
      r['TOTAL MANDIRI'],
      r['TOTAL MASTERCARD'],
      r.SELISIH,
      r['PERSENTASE SELISIH'],
      `"${r['SERVICE KATEGORI']}"`,
      r.STATUS,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `rekon_mastercard_key_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatus = (status: DeviationStatus) => {
    switch (status) {
      case 'Match':
        return (
          <span className="inline-flex items-center gap-1 text-[#107C41] font-semibold text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
            Match
          </span>
        );
      case 'Deviasi':
        return (
          <span className="inline-flex items-center gap-1 text-[#D13438] font-semibold text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D13438]" />
            Deviasi
          </span>
        );
      case 'Belum Direkonsiliasi':
        return (
          <span className="inline-flex items-center gap-1 text-[#605E5C] font-semibold text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A8886]" />
            Belum Rekon
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white border border-[#E1DFDD] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col relative transition-all hover:border-[#C8C6C4] ${className}`}
    >
      <PbiVisualHeader
        title={title}
        subtitle={subtitle}
        onFocus={onFocus}
        onExportCsv={handleExport}
      />

      {/* Pagination Bar */}
      <div className="px-3 py-1.5 border-b border-[#F3F2F1] flex items-center justify-between text-[11px] text-[#605E5C]">
        <span>
          Menampilkan <strong className="text-[#323130] tabular-nums">{records.length}</strong> baris transaksi
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-2 py-0.5 border border-[#E1DFDD] rounded-[2px] disabled:opacity-40 hover:bg-[#F3F2F1] text-[10px]"
          >
            Prev
          </button>
          <span className="text-[10px] tabular-nums">
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

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-[11px] text-left border-collapse select-none">
          <thead>
            <tr className="bg-[#FAF9F8] border-b border-[#E1DFDD] text-[#323130] font-semibold">
              <th
                onClick={() => handleSort('TANGGAL')}
                className="py-2 px-2.5 cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
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
              <th
                onClick={() => handleSort('EVENT ID')}
                className="py-2 px-2.5 cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>EVENT ID</span>
                  {sortField === 'EVENT ID' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-2.5 h-2.5 text-[#C8C6C4]" />
                  )}
                </div>
              </th>
              <th className="py-2 px-2.5 text-[#605E5C] whitespace-nowrap">DESC</th>
              <th
                onClick={() => handleSort('QTY MANDIRI')}
                className="py-2 px-2 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                QTY MANDIRI
              </th>
              <th
                onClick={() => handleSort('QTY MASTERCARD')}
                className="py-2 px-2 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                QTY MC
              </th>
              <th
                onClick={() => handleSort('TOTAL MANDIRI')}
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                TOTAL MANDIRI
              </th>
              <th
                onClick={() => handleSort('TOTAL MASTERCARD')}
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                TOTAL MC
              </th>
              <th
                onClick={() => handleSort('SELISIH')}
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>SELISIH</span>
                  {sortField === 'SELISIH' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-2.5 h-2.5 text-[#C8C6C4]" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('PERSENTASE SELISIH')}
                className="py-2 px-2 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                % SELISIH
              </th>
              <th
                onClick={() => handleSort('SERVICE KATEGORI')}
                className="py-2 px-2.5 cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                SERVICE KATEGORI
              </th>
              <th className="py-2 px-2 whitespace-nowrap">STATUS</th>
              <th className="py-2 px-2 text-center text-[#8A8886] w-8">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F2F1]">
            {currentRecords.map((r) => {
              const isDeviasi = r.STATUS === 'Deviasi' && r.SELISIH !== 0;

              return (
                <tr
                  key={r.NO}
                  onClick={() => onSelectRecord && onSelectRecord(r)}
                  className="hover:bg-[#F3F2F1] cursor-pointer transition-colors group"
                >
                  <td className="py-1.5 px-2.5 font-mono tabular-nums text-[#323130] whitespace-nowrap">
                    {r.TANGGAL}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-[#0078D4] font-medium whitespace-nowrap">
                    {r['EVENT ID']}
                  </td>
                  <td className="py-1.5 px-2.5 text-[#605E5C] max-w-[140px] truncate" title={r.DESC}>
                    {r.DESC}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums text-[#323130]">
                    {formatNumber(r['QTY MANDIRI'])}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums text-[#323130]">
                    {formatNumber(r['QTY MASTERCARD'])}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono tabular-nums text-[#323130]">
                    {formatRupiah(r['TOTAL MANDIRI'])}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono tabular-nums text-[#323130]">
                    {formatRupiah(r['TOTAL MASTERCARD'])}
                  </td>
                  {/* Selisih with conditional formatting */}
                  <td
                    className={`py-1.5 px-2.5 text-right font-mono tabular-nums font-semibold ${
                      isDeviasi ? 'bg-[#FDF3F3] text-[#A80000]' : 'text-[#107C41]'
                    }`}
                  >
                    {formatRupiah(r.SELISIH)}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-mono tabular-nums ${
                      isDeviasi ? 'text-[#D13438] font-medium' : 'text-[#605E5C]'
                    }`}
                  >
                    {formatPercentage(r['PERSENTASE SELISIH'])}
                  </td>
                  <td className="py-1.5 px-2.5 text-[#323130] whitespace-nowrap">
                    {r['SERVICE KATEGORI']}
                  </td>
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    {renderStatus(r.STATUS)}
                  </td>
                  <td className="py-1.5 px-2 text-center text-[#EB001B] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-[#EDEBE9] rounded" title="Lihat Semua Kolom">
                      <Eye className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Totals Row */}
          <tfoot>
            <tr className="bg-[#FAF9F8] border-t-2 border-[#C8C6C4] font-semibold text-[#323130]">
              <td colSpan={3} className="py-2 px-2.5 uppercase text-[10px] tracking-wider text-[#605E5C]">
                Total ({totals.count} baris)
              </td>
              <td className="py-2 px-2 text-right font-mono tabular-nums">
                {formatNumber(totals.totalQtyMandiri)}
              </td>
              <td className="py-2 px-2 text-right font-mono tabular-nums">
                {formatNumber(totals.totalQtyMc)}
              </td>
              <td className="py-2 px-2.5 text-right font-mono tabular-nums">
                {formatRupiah(totals.totalMandiri)}
              </td>
              <td className="py-2 px-2.5 text-right font-mono tabular-nums">
                {formatRupiah(totals.totalMc)}
              </td>
              <td
                className={`py-2 px-2.5 text-right font-mono tabular-nums font-bold ${
                  totals.totalSelisih !== 0 ? 'text-[#A80000] bg-[#FDF3F3]' : 'text-[#107C41]'
                }`}
              >
                {formatRupiah(totals.totalSelisih)}
              </td>
              <td className="py-2 px-2 text-right font-mono tabular-nums">
                {formatPercentage(totals.avgPct)}
              </td>
              <td colSpan={3} className="py-2 px-2.5 text-[10px] text-[#8A8886] font-normal">
                Ringkasan Kolom Utama
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
