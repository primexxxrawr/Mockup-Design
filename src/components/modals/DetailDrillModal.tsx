import React from 'react';
import { MastercardRecord, VisaRecord } from '../../types';
import {
  formatCurrencyVal,
  formatNumber,
  formatPercentage,
  formatRupiah,
} from '../../data/mockData';
import { X, CheckCircle2, AlertTriangle, Clock, CreditCard } from 'lucide-react';

interface DetailDrillModalProps {
  record: MastercardRecord | VisaRecord | null;
  principalType?: 'Mastercard' | 'Visa';
  isOpen: boolean;
  onClose: () => void;
}

export const DetailDrillModal: React.FC<DetailDrillModalProps> = ({
  record,
  principalType,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  // Detect record type
  const isMastercard =
    principalType === 'Mastercard' || 'EVENT ID' in record;

  const mc = isMastercard ? (record as MastercardRecord) : null;
  const visa = !isMastercard ? (record as VisaRecord) : null;

  const status = isMastercard ? mc!.STATUS : visa!.STATUS;
  const isMatch = status === 'Match';
  const isDeviasi = status === 'Deviasi';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white border border-[#E1DFDD] rounded-[3px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[11.5px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF9F8] border-b border-[#E1DFDD]">
          <div className="flex items-center gap-2">
            <CreditCard
              className="w-4 h-4"
              style={{ color: isMastercard ? '#EB001B' : '#1A1F71' }}
            />
            <h3 className="font-bold text-[#323130] text-[13px]">
              Detail Audit Baris Tagihan · {isMastercard ? mc!['EVENT ID'] : visa!['Invoice ID']}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[#EDEBE9] text-[#605E5C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF9F8] border border-[#E1DFDD] rounded-[2px]">
            <div>
              <span className="text-[9.5px] text-[#8A8886] uppercase font-semibold">
                Skema Principal
              </span>
              <div className="font-bold text-[#323130] text-[13px] flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-[1px]"
                  style={{ backgroundColor: isMastercard ? '#EB001B' : '#1A1F71' }}
                />
                <span>
                  {isMastercard
                    ? `Mastercard · ${mc!['SERVICE KATEGORI']}`
                    : `Visa · ${visa!['Fee Category']}`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9.5px] text-[#8A8886] uppercase font-semibold">
                Status Rekon
              </span>
              <div>
                {isMatch && (
                  <span className="inline-flex items-center gap-1 text-[#107C41] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Match (Sesuai)
                  </span>
                )}
                {isDeviasi && (
                  <span className="inline-flex items-center gap-1 text-[#D13438] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Deviasi
                  </span>
                )}
                {!isMatch && !isDeviasi && (
                  <span className="inline-flex items-center gap-1 text-[#605E5C] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Belum Direkonsiliasi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Group 1: IDENTITAS */}
          <div className="border border-[#E1DFDD] rounded-[2px] p-3 bg-white">
            <h4 className="text-[11px] font-bold text-[#323130] uppercase tracking-wider mb-2 text-[#0078D4] border-b border-[#F3F2F1] pb-1">
              1. Identitas Transaksi / Invoice
            </h4>
            {isMastercard ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#605E5C]">
                <div>
                  <span className="text-[10px] text-[#8A8886] block">NO:</span>
                  <span className="font-semibold text-[#323130]">{mc!.NO}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">TANGGAL:</span>
                  <span className="font-semibold text-[#323130] font-mono">{mc!.TANGGAL}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">EVENT ID:</span>
                  <span className="font-semibold text-[#323130] font-mono">{mc!['EVENT ID']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">TIER EVENT:</span>
                  <span className="font-semibold text-[#323130]">{mc!['TIER EVENT']}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#8A8886] block">DESC:</span>
                  <span className="font-medium text-[#323130]">{mc!.DESC}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">BY SV / BY QTY:</span>
                  <span className="font-semibold text-[#323130]">{mc!['BY SV / BY QTY']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">BILLABLE ICA:</span>
                  <span className="font-semibold text-[#323130] font-mono">{mc!['BILLABLE ICA']}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#605E5C]">
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Billing Period:</span>
                  <span className="font-semibold text-[#323130]">{visa!['Billing Period']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Invoice Date:</span>
                  <span className="font-semibold text-[#323130] font-mono">{visa!['Invoice Date']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Invoice ID:</span>
                  <span className="font-semibold text-[#1A1F71] font-mono">{visa!['Invoice ID']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Current or Previous:</span>
                  <span className="font-semibold text-[#323130]">{visa!['Current or Previous']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Fee Category:</span>
                  <span className="font-semibold text-[#323130]">{visa!['Fee Category']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Fee Group:</span>
                  <span className="font-semibold text-[#323130]">{visa!['Fee Group']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Fee Name:</span>
                  <span className="font-semibold text-[#323130]">{visa!['Fee Name']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Billing Line:</span>
                  <span className="font-semibold text-[#323130] font-mono">{visa!['Billing Line']}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#8A8886] block">Invoice Description:</span>
                  <span className="font-medium text-[#323130]">{visa!['Invoice Description']}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Type:</span>
                  <span className="font-semibold text-[#323130]">{visa!.Type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8886] block">Billing Currency:</span>
                  <span className="font-bold text-[#323130]">{visa!['Billing Currency']}</span>
                </div>
              </div>
            )}
          </div>

          {/* Group 2 & 3: MANDIRI vs PRINCIPAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* MANDIRI */}
            <div className="border border-[#CCE4F7] bg-[#F5F8FF] rounded-[2px] p-3">
              <h4 className="text-[11px] font-bold text-[#0078D4] uppercase tracking-wider mb-2 border-b border-[#CCE4F7] pb-1">
                2. Data Pembukuan Mandiri
              </h4>
              {isMastercard ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">QTY MANDIRI:</span>
                    <span className="font-semibold text-[#323130]">{formatNumber(mc!['QTY MANDIRI'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">RATE MANDIRI:</span>
                    <span className="font-semibold text-[#323130]">{formatRupiah(mc!['RATE MANDIRI'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">CHARGE MANDIRI:</span>
                    <span className="font-semibold text-[#323130]">{formatRupiah(mc!['CHARGE MANDIRI'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">TAX MANDIRI:</span>
                    <span className="font-semibold text-[#323130]">{formatRupiah(mc!['TAX MANDIRI'])}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#CCE4F7] font-bold text-[#0078D4] text-[12px]">
                    <span>TOTAL MANDIRI:</span>
                    <span>{formatRupiah(mc!['TOTAL MANDIRI'])}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">Jumlah Units BMRI:</span>
                    <span className="font-semibold text-[#323130]">{formatNumber(visa!['Jumlah Units BMRI'])}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#CCE4F7] font-bold text-[#0078D4] text-[12px]">
                    <span>Total Fee BMRI:</span>
                    <span>{formatCurrencyVal(visa!['Total Fee BMRI'], visa!['Billing Currency'])}</span>
                  </div>
                </div>
              )}
            </div>

            {/* PRINCIPAL */}
            <div className="border border-[#FAD2D2] bg-[#FFF5F5] rounded-[2px] p-3">
              <h4
                className="text-[11px] font-bold uppercase tracking-wider mb-2 border-b border-[#FAD2D2] pb-1"
                style={{ color: isMastercard ? '#EB001B' : '#1A1F71' }}
              >
                3. Data Invoice Principal ({isMastercard ? 'Mastercard' : 'Visa'})
              </h4>
              {isMastercard ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">QTY MASTERCARD:</span>
                    <span className="font-semibold text-[#323130]">{formatNumber(mc!['QTY MASTERCARD'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">RATE MASTERCARD:</span>
                    <span className="font-semibold text-[#323130]">{formatRupiah(mc!['RATE MASTERCARD'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">CHARGE MASTERCARD:</span>
                    <span className="font-semibold text-[#323130]">{formatRupiah(mc!['CHARGE MASTERCARD'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">TAX MASTERCARD:</span>
                    <span className="font-semibold text-[#323130]">{formatRupiah(mc!['TAX MASTERCARD'])}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#FAD2D2] font-bold text-[#EB001B] text-[12px]">
                    <span>TOTAL MASTERCARD:</span>
                    <span>{formatRupiah(mc!['TOTAL MASTERCARD'])}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">Units (Visa):</span>
                    <span className="font-semibold text-[#323130]">{formatNumber(visa!.Units)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">Rate:</span>
                    <span className="font-semibold text-[#323130]">{visa!.Rate.toFixed(4)} ({visa!['Rate Cur']})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">Forex Rate:</span>
                    <span className="font-semibold text-[#323130]">{formatNumber(visa!['Foreign Exchange Rate'])}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#FAD2D2] font-bold text-[#1A1F71] text-[12px]">
                    <span>Total (Visa Invoice):</span>
                    <span>{formatCurrencyVal(visa!.Total, visa!['Billing Currency'])}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group 4: SELISIH & KOMPARASI */}
          <div className="border border-[#E1DFDD] rounded-[2px] p-3 bg-white">
            <h4 className="text-[11px] font-bold text-[#323130] uppercase tracking-wider mb-2 border-b border-[#F3F2F1] pb-1">
              4. Komparasi Selisih
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-2 font-mono text-[11.5px]">
              <div className="p-2 bg-[#FAF9F8] border border-[#EDEBE9] rounded-[2px]">
                <span className="text-[10px] text-[#8A8886] block">Nominal Selisih:</span>
                <span className={`font-bold text-[14px] ${isDeviasi ? 'text-[#D13438]' : 'text-[#107C41]'}`}>
                  {isMastercard
                    ? formatRupiah(mc!.SELISIH)
                    : formatCurrencyVal(visa!.Selisih, visa!['Billing Currency'])}
                </span>
              </div>
              <div className="p-2 bg-[#FAF9F8] border border-[#EDEBE9] rounded-[2px]">
                <span className="text-[10px] text-[#8A8886] block">Persentase Selisih:</span>
                <span className={`font-bold text-[14px] ${isDeviasi ? 'text-[#D13438]' : 'text-[#107C41]'}`}>
                  {isMastercard
                    ? formatPercentage(mc!['PERSENTASE SELISIH'])
                    : formatPercentage(visa!['Persentase Selisih'])}
                </span>
              </div>
            </div>

            {/* Note if Visa */}
            {!isMastercard && (
              <p className="text-[10px] text-[#8A8886] italic mb-1">
                * Catatan: Selisih dalam mata uang tagihan (asumsi)
              </p>
            )}

            {/* Catatan Field */}
            <div className="text-[10.5px] text-[#605E5C] bg-[#FAF9F8] p-2 rounded-[2px] border border-[#E1DFDD]">
              <span className="font-semibold text-[#323130]">Catatan: </span>
              <span className="text-[#8A8886] italic">(Kolom catatan dikosongkan)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#FAF9F8] border-t border-[#E1DFDD] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#E1DFDD] text-[#323130] font-medium rounded-[2px] hover:bg-[#F3F2F1] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
