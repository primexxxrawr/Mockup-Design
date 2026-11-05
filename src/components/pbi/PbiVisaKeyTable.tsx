import React, { useState, useMemo } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { VisaRecord, DeviationStatus } from '../../types';
import { formatNumber, formatPercentage, formatCurrencyVal } from '../../data/mockData';
import { ArrowUpDown, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface PbiVisaKeyTableProps {
  title: string;
  subtitle?: string;
  records: VisaRecord[];
  onSelectRecord?: (record: VisaRecord) => void;
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

type SortField =
  | 'Billing Period'
  | 'Invoice ID'
  | 'Fee Category'
  | 'Fee Name'
  | 'Units'
  | 'Jumlah Units BMRI'
  | 'Total'
  | 'Total Fee BMRI'
  | 'Selisih'
  | 'Persentase Selisih';

export const PbiVisaKeyTable: React.FC<PbiVisaKeyTableProps> = ({
  title,
  subtitle,
  records,
  onSelectRecord,
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [sortField, setSortField] = useState<SortField>('Selisih');
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

      if (sortField === 'Selisih') {
        aVal = Math.abs(a.Selisih);
        bVal = Math.abs(b.Selisih);
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
    const totalUnits = records.reduce((acc, r) => acc + r.Units, 0);
    const totalUnitsBmri = records.reduce((acc, r) => acc + r['Jumlah Units BMRI'], 0);
    const totalVisa = records.reduce((acc, r) => acc + r.Total, 0);
    const totalBmri = records.reduce((acc, r) => acc + r['Total Fee BMRI'], 0);
    const totalSelisih = records.reduce((acc, r) => acc + r.Selisih, 0);
    const avgPct = totalBmri > 0 ? (totalSelisih / totalBmri) * 100 : 0;
    return {
      totalUnits,
      totalUnitsBmri,
      totalVisa,
      totalBmri,
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
      'Billing Period',
      'Invoice ID',
      'Fee Category',
      'Fee Name',
      'Units',
      'Jumlah Units BMRI',
      'Total',
      'Total Fee BMRI',
      'Selisih',
      'Persentase Selisih',
      'STATUS',
    ];
    const rows = sortedRecords.map((r) => [
      r['Billing Period'],
      r['Invoice ID'],
      `"${r['Fee Category']}"`,
      `"${r['Fee Name']}"`,
      r.Units,
      r['Jumlah Units BMRI'],
      r.Total,
      r['Total Fee BMRI'],
      r.Selisih,
      r['Persentase Selisih'],
      r.STATUS,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `rekon_visa_key_${new Date().toISOString().slice(0, 10)}.csv`);
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
          Menampilkan <strong className="text-[#323130] tabular-nums">{records.length}</strong> baris invoice Visa
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
                onClick={() => handleSort('Billing Period')}
                className="py-2 px-2.5 cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Billing Period</span>
                  {sortField === 'Billing Period' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-2.5 h-2.5 text-[#C8C6C4]" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('Invoice ID')}
                className="py-2 px-2.5 cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
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
              <th
                onClick={() => handleSort('Fee Category')}
                className="py-2 px-2.5 cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                Fee Category
              </th>
              <th
                onClick={() => handleSort('Fee Name')}
                className="py-2 px-2.5 cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                Fee Name
              </th>
              <th
                onClick={() => handleSort('Units')}
                className="py-2 px-2 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                Units
              </th>
              <th
                onClick={() => handleSort('Jumlah Units BMRI')}
                className="py-2 px-2 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                Units BMRI
              </th>
              <th
                onClick={() => handleSort('Total')}
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                Total (Visa)
              </th>
              <th
                onClick={() => handleSort('Total Fee BMRI')}
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                Total Fee BMRI
              </th>
              <th
                onClick={() => handleSort('Selisih')}
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Selisih</span>
                  {sortField === 'Selisih' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-2.5 h-2.5 text-[#C8C6C4]" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('Persentase Selisih')}
                className="py-2 px-2 text-right cursor-pointer hover:bg-[#EDEBE9] whitespace-nowrap"
              >
                % Selisih
              </th>
              <th className="py-2 px-2 whitespace-nowrap">Status</th>
              <th className="py-2 px-2 text-center text-[#8A8886] w-8">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F2F1]">
            {currentRecords.map((r, idx) => {
              const isDeviasi = r.STATUS === 'Deviasi' && r.Selisih !== 0;

              return (
                <tr
                  key={r['Invoice ID'] + idx}
                  onClick={() => onSelectRecord && onSelectRecord(r)}
                  className="hover:bg-[#F3F2F1] cursor-pointer transition-colors group"
                >
                  <td className="py-1.5 px-2.5 font-medium text-[#323130] whitespace-nowrap">
                    {r['Billing Period']}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-[#1A1F71] font-semibold whitespace-nowrap">
                    {r['Invoice ID']}
                  </td>
                  <td className="py-1.5 px-2.5 text-[#323130] whitespace-nowrap">
                    {r['Fee Category']}
                  </td>
                  <td className="py-1.5 px-2.5 text-[#605E5C] whitespace-nowrap">
                    {r['Fee Name']}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums text-[#323130]">
                    {formatNumber(r.Units)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums text-[#323130]">
                    {formatNumber(r['Jumlah Units BMRI'])}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono tabular-nums text-[#323130]">
                    {formatCurrencyVal(r.Total, r['Billing Currency'])}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono tabular-nums text-[#323130]">
                    {formatCurrencyVal(r['Total Fee BMRI'], r['Billing Currency'])}
                  </td>
                  {/* Selisih with conditional formatting */}
                  <td
                    className={`py-1.5 px-2.5 text-right font-mono tabular-nums font-semibold ${
                      isDeviasi ? 'bg-[#FDF3F3] text-[#A80000]' : 'text-[#107C41]'
                    }`}
                  >
                    {formatCurrencyVal(r.Selisih, r['Billing Currency'])}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-mono tabular-nums ${
                      isDeviasi ? 'text-[#D13438] font-medium' : 'text-[#605E5C]'
                    }`}
                  >
                    {formatPercentage(r['Persentase Selisih'])}
                  </td>
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    {renderStatus(r.STATUS)}
                  </td>
                  <td className="py-1.5 px-2 text-center text-[#1A1F71] opacity-0 group-hover:opacity-100 transition-opacity">
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
              <td colSpan={4} className="py-2 px-2.5 uppercase text-[10px] tracking-wider text-[#605E5C]">
                Total ({totals.count} baris)
              </td>
              <td className="py-2 px-2 text-right font-mono tabular-nums">
                {formatNumber(totals.totalUnits)}
              </td>
              <td className="py-2 px-2 text-right font-mono tabular-nums">
                {formatNumber(totals.totalUnitsBmri)}
              </td>
              <td className="py-2 px-2.5 text-right font-mono tabular-nums">
                {formatCurrencyVal(totals.totalVisa, 'USD')}
              </td>
              <td className="py-2 px-2.5 text-right font-mono tabular-nums">
                {formatCurrencyVal(totals.totalBmri, 'USD')}
              </td>
              <td
                className={`py-2 px-2.5 text-right font-mono tabular-nums font-bold ${
                  totals.totalSelisih !== 0 ? 'text-[#A80000] bg-[#FDF3F3]' : 'text-[#107C41]'
                }`}
              >
                {formatCurrencyVal(totals.totalSelisih, 'USD')}
              </td>
              <td className="py-2 px-2 text-right font-mono tabular-nums">
                {formatPercentage(totals.avgPct)}
              </td>
              <td colSpan={2} className="py-2 px-2.5 text-[10px] text-[#8A8886] font-normal">
                Ringkasan Kolom Utama
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
