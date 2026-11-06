import React from 'react';

export const PbiFooter: React.FC = () => {
  return (
    <footer className="mt-auto py-2.5 px-6 border-t border-[#E1E5EB] bg-white text-[11px] text-[#6B7280] flex flex-wrap items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-[#003A70]">Mockup - data dummy</span>
        <span>•</span>
        <span>Sumber: hasil rekonsiliasi Mandiri vs Principal</span>
      </div>
      <div className="text-[10.5px] text-[#6B7280]">
        Desain Laporan Standar Microsoft Power BI · Bank Mandiri Card Scheme Reconciliation
      </div>
    </footer>
  );
};
