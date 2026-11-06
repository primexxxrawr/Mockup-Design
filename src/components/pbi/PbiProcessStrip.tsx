import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface SimpleStep {
  label: string;
  sublabel: string;
  status: 'Selesai' | 'Sedang Berjalan' | 'Siap';
}

const DEFAULT_STEPS: SimpleStep[] = [
  { label: 'Data Ditarik', sublabel: 'Jan–Okt 2026', status: 'Selesai' },
  { label: 'Dibersihkan', sublabel: 'Standardisasi Skema', status: 'Selesai' },
  { label: 'Dibandingkan', sublabel: 'Mandiri vs Principal', status: 'Selesai' },
  { label: 'Siap Dilaporkan', sublabel: 'Toleransi Rp0', status: 'Siap' },
];

interface PbiProcessStripProps {
  className?: string;
}

export const PbiProcessStrip: React.FC<PbiProcessStripProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-[#E1E5EB] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-4 py-2 ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-[#003A70] uppercase tracking-wider">
          Alur Rekonsiliasi Data
        </span>
        <span className="text-[10.5px] text-[#6B7280]">
          Status proses data otomatis harian
        </span>
      </div>

      {/* 4 Plain Horizontal Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {DEFAULT_STEPS.map((step, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-1.5 bg-[#F4F6F9] border border-[#E1E5EB] rounded-[2px]"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#003A70] text-[#F5A800] text-[10px] font-bold shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#1F2937] truncate">
                  {step.label}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-[#1E8E5A] bg-[#1E8E5A]/10 px-1 py-0.2 rounded-[1px]">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {step.status}
                </span>
              </div>
              <div className="text-[10px] text-[#6B7280] truncate">
                {step.sublabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

