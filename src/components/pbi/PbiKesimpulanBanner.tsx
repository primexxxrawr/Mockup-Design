import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface PbiKesimpulanBannerProps {
  periodLabel: string;
  totalRows: number;
  countSesuai: number;
  countSelisih: number;
  countBelumDicek: number;
  totalNominalSelisihIdr: number;
  matchRate: number;
  highlightCategory?: string;
  principalName?: 'Visa' | 'Mastercard' | 'Semua';
}

export const PbiKesimpulanBanner: React.FC<PbiKesimpulanBannerProps> = ({
  periodLabel,
  countSesuai,
  countSelisih,
  countBelumDicek,
  totalNominalSelisihIdr,
  matchRate,
  highlightCategory,
  principalName = 'Semua',
}) => {
  // Determine traffic-light status
  // Green: matchRate >= 85% and few critical selisih
  // Yellow/Orange: 70% <= matchRate < 85%
  // Red: matchRate < 70%
  let statusTone: 'green' | 'yellow' | 'red' = 'green';
  if (matchRate < 70 || countSelisih > 35) {
    statusTone = 'red';
  } else if (matchRate < 85 || countSelisih > 10) {
    statusTone = 'yellow';
  }

  // Construct plain-language executive conclusion sentence
  const formattedNominal = `Rp ${(totalNominalSelisihIdr / 1000000).toLocaleString('id-ID', {
    maximumFractionDigits: 1,
  })} juta`;

  let conclusionText = '';
  if (statusTone === 'green') {
    conclusionText = `${periodLabel}: Kondisi penagihan ${
      principalName !== 'Semua' ? principalName : 'Principal'
    } dalam kondisi sangat baik. ${Math.round(
      matchRate
    )}% baris tagihan (${countSesuai} baris) telah sesuai toleransi. Hanya terdapat ${countSelisih} baris dengan total selisih ${formattedNominal} yang perlu diverifikasi rutin.`;
  } else if (statusTone === 'yellow') {
    conclusionText = `${periodLabel}: Sebagian besar tagihan telah sesuai (${Math.round(
      matchRate
    )}% sesuai). Namun, terdapat ${countSelisih} baris dengan selisih nominal ${formattedNominal} yang perlu ditinjau, terutama pada kategori ${
      highlightCategory || 'Interchange'
    }.`;
  } else {
    conclusionText = `${periodLabel}: Perlu perhatian manajemen. Ditemukan ${countSelisih} baris tagihan yang memiliki selisih dengan total deviasi ${formattedNominal} (${Math.round(
      matchRate
    )}% baris sesuai). Tim operasional sedang melakukan penelusuran detail.`;
  }

  if (countBelumDicek > 0) {
    conclusionText += ` (${countBelumDicek} baris masih dalam status belum dicek).`;
  }

  return (
    <div
      className={`border rounded-[2px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-start gap-3 transition-colors ${
        statusTone === 'green'
          ? 'bg-[#F2F9F5] border-[#1E8E5A]/30 text-[#1E8E5A]'
          : statusTone === 'yellow'
          ? 'bg-[#FFF9EE] border-[#F5A800]/50 text-[#8F5200]'
          : 'bg-[#FDF3F2] border-[#C62828]/30 text-[#C62828]'
      }`}
    >
      {/* Traffic-light Icon paired with text */}
      <div className="shrink-0 mt-0.5">
        {statusTone === 'green' && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1E8E5A] text-white shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        {statusTone === 'yellow' && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F5A800] text-white shadow-sm">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
        {statusTone === 'red' && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C62828] text-white shadow-sm">
            <XCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-[2px] bg-white border border-current shadow-xs">
            Kesimpulan Eksekutif
          </span>
          <span className="text-[11px] font-semibold text-[#1F2937]">
            {periodLabel}
          </span>
        </div>
        <p className="text-[12.5px] font-medium leading-relaxed text-[#1F2937]">
          {conclusionText}
        </p>
      </div>

      <div className="hidden lg:flex flex-col items-end shrink-0 pl-2 border-l border-current/20 text-right">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
          Tingkat Kesesuaian
        </span>
        <span
          className={`text-[17px] font-bold font-mono ${
            statusTone === 'green'
              ? 'text-[#1E8E5A]'
              : statusTone === 'yellow'
              ? 'text-[#8F5200]'
              : 'text-[#C62828]'
          }`}
        >
          {matchRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
