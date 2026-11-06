import React from 'react';
import { ScreenTab } from '../../types';
import { HelpCircle, Upload, FileSpreadsheet } from 'lucide-react';

interface PbiHeaderRibbonProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  onOpenTermsGuide: () => void;
  onOpenImportModal?: () => void;
  onExportAllCsv?: () => void;
}

export const PbiHeaderRibbon: React.FC<PbiHeaderRibbonProps> = ({
  currentTab,
  onTabChange,
  onOpenTermsGuide,
  onOpenImportModal,
  onExportAllCsv,
}) => {
  // Page question titles & subtitles tailored for the 5-second rule
  const getPageTitleInfo = () => {
    switch (currentTab) {
      case 'Ringkasan':
        return {
          title: 'Apakah tagihan principal bulan ini sesuai?',
          subtitle: 'Ringkasan Eksekutif Rekonsiliasi Visa & Mastercard · Data per 31 Okt 2026',
        };
      case 'Visa':
        return {
          title: 'Bagaimana kondisi tagihan Visa?',
          subtitle: 'Evaluasi Tagihan Bulanan Visa vs Perhitungan Mandiri · Data per 31 Okt 2026',
        };
      case 'Mastercard':
        return {
          title: 'Bagaimana kondisi tagihan Mastercard?',
          subtitle: 'Evaluasi Tagihan Mingguan Mastercard vs Perhitungan Mandiri · Data per 31 Okt 2026',
        };
      case 'Detail Deviasi':
        return {
          title: 'Detail Data Rekonsiliasi Transaksi',
          subtitle: 'Matriks Lengkap Seluruh Kolom & Parameter Deviasi · Untuk Analis dan Operasional',
        };
    }
  };

  const { title, subtitle } = getPageTitleInfo();

  const tabs: {
    id: ScreenTab;
    label: string;
    isExecutive: boolean;
    badgeColor?: string;
  }[] = [
    { id: 'Ringkasan', label: 'Ringkasan', isExecutive: true },
    { id: 'Visa', label: 'Visa', isExecutive: true, badgeColor: '#2B6CB0' },
    { id: 'Mastercard', label: 'Mastercard', isExecutive: true, badgeColor: '#E8832A' },
    { id: 'Detail Deviasi', label: 'Detail Deviasi', isExecutive: false },
  ];

  return (
    <header className="bg-white border-b border-[#E1E5EB] select-none shrink-0 z-30">
      {/* 1. Full-width Enterprise Navy Band (#003A70) with Gold Accent Line */}
      <div className="bg-[#003A70] text-white px-5 py-3 relative border-b-2 border-[#F5A800]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: "Area logo" placeholder + Question Title */}
          <div className="flex items-center gap-3.5">
            {/* Empty rounded rectangle strictly labeled "Area logo" (no imitation of any logo) */}
            <div
              className="w-24 h-8 rounded-[4px] border border-white/40 bg-white/10 flex items-center justify-center text-[10px] font-semibold text-white/90 tracking-wide select-none"
              title="Area logo instansi"
            >
              Area logo
            </div>

            <div className="flex flex-col">
              <h1 className="text-[19px] sm:text-[21px] font-semibold text-white tracking-tight leading-tight">
                {title}
              </h1>
              <span className="text-[11.5px] text-blue-100 font-normal mt-0.5">
                {subtitle}
              </span>
            </div>
          </div>

          {/* Right: Period Tag, Data per date, and "?" Help Button */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col items-end text-right mr-1">
              <span className="text-[11px] font-semibold text-[#F5A800]">
                Jan - Okt 2026
              </span>
              <span className="text-[10px] text-blue-200">
                Data per 31 Okt 2026
              </span>
            </div>

            {/* Quick Actions (Upload Data / Export CSV) */}
            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-[2px] text-[11px] font-medium transition-colors"
                title="Unggah file data eksternal (.ZIP / Excel / CSV)"
              >
                <Upload className="w-3.5 h-3.5 text-[#F5A800]" />
                <span>Unggah Data</span>
              </button>
            )}

            {onExportAllCsv && (
              <button
                type="button"
                onClick={onExportAllCsv}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-[2px] text-[11px] font-medium transition-colors"
                title="Ekspor seluruh data rekonsiliasi"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E8E5A]" />
                <span>Ekspor CSV</span>
              </button>
            )}

            {/* "?" Help Button (Opens Panduan Istilah / Glossary Modal) */}
            <button
              type="button"
              onClick={onOpenTermsGuide}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#F5A800] hover:bg-[#E59C00] text-[#003A70] font-bold rounded-[2px] text-[11px] shadow-sm transition-colors"
              title="Buka Panduan Istilah (Glosarium Rekonsiliasi)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#003A70]" />
              <span className="font-semibold">Panduan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs with Gold Underline & Visual Separation for Operational tab */}
      <nav className="flex items-center justify-between px-5 bg-white overflow-x-auto">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative px-4 py-2.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'text-[#003A70] bg-[#F4F6F9]'
                    : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F4F6F9]'
                } ${
                  !tab.isExecutive
                    ? 'ml-4 pl-3 border-l-2 border-[#E1E5EB]'
                    : ''
                }`}
              >
                {tab.badgeColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-[1px] shrink-0"
                    style={{ backgroundColor: tab.badgeColor }}
                  />
                )}
                <span>{tab.label}</span>

                {/* Separation badge for Operational tab */}
                {!tab.isExecutive && (
                  <span className="text-[10px] font-normal px-1.5 py-0.2 bg-[#F4F6F9] text-[#6B7280] border border-[#E1E5EB] rounded-[2px]">
                    Untuk analis dan operasional
                  </span>
                )}

                {/* Selected tab marked by Brand Gold underline (#F5A800) */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#F5A800]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center text-[10.5px] text-[#6B7280] pr-2">
          <span>Microsoft Power BI Enterprise Layout</span>
        </div>
      </nav>
    </header>
  );
};

