import React from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { DeviationStatus, getStatusDisplayLabel } from '../../types';

export interface PerluPerhatianItem {
  id: string;
  rank: number;
  kategori: string;
  subDeskripsi?: string;
  periode: string; // Bulan / Minggu
  selisihIdr: number;
  status: DeviationStatus;
  principal: 'Visa' | 'Mastercard';
  rawRecord?: any;
}

interface PbiPerluPerhatianTableProps {
  items: PerluPerhatianItem[];
  title?: string;
  subtitle?: string;
  onDrillThrough?: (item: PerluPerhatianItem) => void;
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiPerluPerhatianTable: React.FC<PbiPerluPerhatianTableProps> = ({
  items,
  title = 'Perlu Perhatian: 5 Deviasi Terbesar',
  subtitle = 'Daftar item tagihan dengan nominal selisih tertinggi yang memerlukan konfirmasi segera',
  onDrillThrough,
  onFocus,
  onExportCsv,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-[#E1E5EB] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden ${className}`}
    >
      <PbiVisualHeader
        title={title}
        subtitle={subtitle}
        caraMembaca="Menampilkan 5 item dengan nominal selisih terbesar. Klik pada baris untuk drill-through ke tab Detail Deviasi."
        onFocus={onFocus}
        onExportCsv={onExportCsv}
      />

      <div className="p-3.5 pt-1 overflow-x-auto flex-1">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E1E5EB] text-[#6B7280] font-semibold text-[10px] uppercase tracking-wider">
              <th className="py-2 px-2 text-center w-8">#</th>
              <th className="py-2 px-2.5">Kategori / Deskripsi</th>
              <th className="py-2 px-2">Skema</th>
              <th className="py-2 px-2.5">Periode</th>
              <th className="py-2 px-3 text-right">Selisih (Rp)</th>
              <th className="py-2 px-2.5 text-center">Status</th>
              <th className="py-2 px-1 text-center w-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F6F9]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[#6B7280] text-xs">
                  Tidak ada deviasi yang memerlukan perhatian khusus pada filter ini.
                </td>
              </tr>
            ) : (
              items.slice(0, 5).map((item, idx) => {
                const isVisa = item.principal === 'Visa';
                return (
                  <tr
                    key={item.id || idx}
                    onClick={() => onDrillThrough && onDrillThrough(item)}
                    className="hover:bg-[#F4F6F9] cursor-pointer transition-colors group"
                    title="Klik untuk drill-through ke baris detail deviasi"
                  >
                    {/* Rank Badge */}
                    <td className="py-2 px-2 text-center font-bold text-[#6B7280]">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F4F6F9] border border-[#E1E5EB] text-[10px] group-hover:border-[#003A70] group-hover:text-[#003A70]">
                        {item.rank}
                      </span>
                    </td>

                    {/* Kategori & SubDeskripsi */}
                    <td className="py-2 px-2.5">
                      <div className="font-semibold text-[#1F2937] leading-tight">
                        {item.kategori}
                      </div>
                      {item.subDeskripsi && (
                        <div className="text-[10px] text-[#6B7280] truncate max-w-[220px]">
                          {item.subDeskripsi}
                        </div>
                      )}
                    </td>

                    {/* Skema Principal Badge */}
                    <td className="py-2 px-2">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded-[2px] text-[10px] font-bold ${
                          isVisa
                            ? 'bg-[#2B6CB0]/10 text-[#2B6CB0] border border-[#2B6CB0]/20'
                            : 'bg-[#E8832A]/10 text-[#E8832A] border border-[#E8832A]/20'
                        }`}
                      >
                        {item.principal}
                      </span>
                    </td>

                    {/* Periode */}
                    <td className="py-2 px-2.5 text-[#4B5563] font-medium whitespace-nowrap">
                      {item.periode}
                    </td>

                    {/* Selisih Rp */}
                    <td className="py-2 px-3 text-right font-mono font-semibold text-[#C62828] whitespace-nowrap">
                      Rp {Math.abs(item.selisihIdr).toLocaleString('id-ID')}
                    </td>

                    {/* Status with Icon */}
                    <td className="py-2 px-2.5 text-center whitespace-nowrap">
                      {item.status === 'Match' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#1E8E5A]/10 text-[#1E8E5A] border border-[#1E8E5A]/30 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{getStatusDisplayLabel(item.status)}</span>
                        </span>
                      )}
                      {item.status === 'Deviasi' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/30 text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          <span>{getStatusDisplayLabel(item.status)}</span>
                        </span>
                      )}
                      {item.status === 'Belum Direkonsiliasi' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#8A93A0]/10 text-[#8A93A0] border border-[#8A93A0]/30 text-[10px] font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{getStatusDisplayLabel(item.status)}</span>
                        </span>
                      )}
                    </td>

                    {/* Drill-through action link */}
                    <td className="py-2 px-1 text-center">
                      <span className="inline-flex items-center justify-center p-1 rounded text-[#6B7280] group-hover:text-[#003A70] group-hover:bg-white transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#F4F6F9] border-t border-[#E1E5EB] px-3.5 py-1.5 text-[10.5px] text-[#6B7280] flex items-center justify-between">
        <span>Klik baris untuk langsung membuka data transaksi di tab Detail Deviasi</span>
        <span className="font-semibold text-[#003A70]">Power BI Drill-through</span>
      </div>
    </div>
  );
};
