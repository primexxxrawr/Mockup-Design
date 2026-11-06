import React from 'react';
import { X, BookOpen, HelpCircle } from 'lucide-react';

interface PbiTermsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermItem {
  term: string;
  category: string;
  definition: string;
  example?: string;
}

const GLOSSARY_TERMS: TermItem[] = [
  {
    term: 'Selisih (Discrepancy)',
    category: 'Rekonsiliasi',
    definition:
      'Perbedaan nominal antara hasil perhitungan mandiri Bank Mandiri dengan nilai tagihan resmi yang diterbitkan oleh Principal (Visa / Mastercard).',
    example: 'Selisih positif = tagihan Principal lebih besar dari hitungan Mandiri.',
  },
  {
    term: 'Ekuivalen USD',
    category: 'Mata Uang',
    definition:
      'Standardisasi nilai tagihan ke Dolar AS (asumsi kurs referensi Rp16.250) sehingga tagihan multicurrency Visa dan tagihan IDR Mastercard dapat diperbandingkan secara setara.',
  },
  {
    term: 'Tagihan Principal',
    category: 'Penagihan',
    definition:
      'Nilai kewajiban pembayaran fee yang ditagihkan oleh skema kartu (Visa/Mastercard) kepada Bank Mandiri atas penggunaan jaringan transaksi kartu.',
  },
  {
    term: 'Fee BMRI',
    category: 'Perhitungan Internal',
    definition:
      'Estimasi biaya transaksi yang dihitung secara independen oleh sistem internal Bank Mandiri berdasarkan log transaksi harian dan rate kesepakatan.',
  },
  {
    term: 'Current vs Previous',
    category: 'Siklus Tagihan',
    definition:
      'Current mengacu pada transaksi yang terjadi pada siklus berjalan, sedangkan Previous adalah rekonsiliasi susulan atau koreksi klaim dari bulan-bulan sebelumnya.',
  },
  {
    term: 'Billing Period / Periode Tagihan',
    category: 'Siklus Waktu',
    definition:
      'Siklus penutupan tagihan. Skema Visa ditagihkan secara bulanan (Jan–Okt 2026), sedangkan Mastercard dilaporkan dalam siklus mingguan (W01–W43 2026).',
  },
  {
    term: 'Toleransi Rekonsiliasi',
    category: 'Aturan Bisnis',
    definition:
      'Batas ambang selisih nominal yang dianggap wajar/diterima sistem. Saat ini toleransi diset 0 (nol), sehingga setiap selisih nominal dikategorikan "Ada Selisih".',
  },
  {
    term: 'Billable ICA',
    category: 'Mastercard',
    definition:
      'Interbank Card Association (ICA) ID penagihan resmi Mastercard yang menjadi rekening pembebanan settlement biaya Bank Mandiri.',
  },
];

export const PbiTermsGuideModal: React.FC<PbiTermsGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]">
      <div className="bg-white border border-[#E1E5EB] rounded-[3px] shadow-[0_8px_30px_rgba(0,0,0,0.18)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Bank Mandiri Deep Navy + Gold Accent */}
        <div className="bg-[#003A70] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#F5A800]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-white/10 rounded-[2px]">
              <BookOpen className="w-4 h-4 text-[#F5A800]" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white tracking-wide">
                Panduan Istilah Rekonsiliasi Billing
              </h3>
              <p className="text-[11px] text-blue-100">
                Glosarium ringkas bagi jajaran manajemen untuk memahami parameter laporan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-[2px] transition-colors"
            title="Tutup panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3.5 bg-[#F4F6F9]">
          <div className="bg-white p-3 border border-[#E1E5EB] rounded-[2px] text-xs text-[#1F2937] leading-relaxed">
            <span className="font-semibold text-[#003A70]">Prinsip 5-Detik:</span> Dashboard ini dirancang untuk menjawab kesesuaian tagihan Principal secara cepat. Gunakan panduan berikut jika menemukan istilah teknis penagihan.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GLOSSARY_TERMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E1E5EB] p-3 rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold text-[#003A70]">
                      {item.term}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-[#F4F6F9] text-[#6B7280] border border-[#E1E5EB] rounded-[2px]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    {item.definition}
                  </p>
                </div>
                {item.example && (
                  <div className="mt-2 pt-2 border-t border-[#F4F6F9] text-[10px] text-[#6B7280] italic">
                    {item.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-[#E1E5EB] px-5 py-2.5 flex items-center justify-between text-[11px] text-[#6B7280]">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#003A70]" />
            <span>Power BI Bookmark / Guide Overlay</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#003A70] hover:bg-[#002B54] text-white font-medium rounded-[2px] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
