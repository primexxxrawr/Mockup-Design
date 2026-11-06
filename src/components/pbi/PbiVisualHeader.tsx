import React, { useState, useRef, useEffect } from 'react';
import { Filter, Maximize2, MoreVertical, Download, Copy, ArrowUpDown, Info } from 'lucide-react';

interface PbiVisualHeaderProps {
  title: string;
  subtitle?: string;
  caraMembaca?: string;
  onFocus?: () => void;
  onExportCsv?: () => void;
  activeFilterCount?: number;
  className?: string;
}

export const PbiVisualHeader: React.FC<PbiVisualHeaderProps> = ({
  title,
  subtitle,
  caraMembaca,
  onFocus,
  onExportCsv,
  activeFilterCount = 0,
  className = '',
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyVisual = () => {
    setCopiedNotification(true);
    setMenuOpen(false);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className={`flex items-start justify-between px-3.5 pt-3 pb-1 relative select-none ${className}`}>
      {/* Title, Info Icon & Subtitle */}
      <div className="flex flex-col min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[12px] font-semibold text-[#1F2937] leading-tight truncate tracking-tight">
            {title}
          </h3>
          {caraMembaca && (
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="text-[#6B7280] hover:text-[#003A70] p-0.5 rounded transition-colors"
                title="Cara membaca visual ini"
              >
                <Info className="w-3.5 h-3.5 text-[#003A70]" />
              </button>
              {showInfoTooltip && (
                <div className="absolute left-0 top-5 z-50 w-64 bg-[#1F2937] text-white text-[11px] leading-relaxed py-1.5 px-2.5 rounded-[2px] shadow-lg pointer-events-none border border-[#374151]">
                  <span className="font-semibold text-[#F5A800]">Cara membaca: </span>
                  {caraMembaca}
                </div>
              )}
            </div>
          )}
        </div>
        {subtitle && (
          <span className="text-[10.5px] text-[#6B7280] truncate mt-0.5 leading-tight">
            {subtitle}
          </span>
        )}
      </div>

      {/* Visual Action Icons (Power BI Style Header Action Icons) */}
      <div className="flex items-center gap-0.5 text-[#605E5C] opacity-75 hover:opacity-100 transition-opacity shrink-0">
        {/* Active Filter Indicator */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowFilterTooltip(true)}
            onMouseLeave={() => setShowFilterTooltip(false)}
            className={`p-1 rounded hover:bg-[#EDEBE9] hover:text-[#323130] transition-colors relative ${
              activeFilterCount > 0 ? 'text-[#0078D4]' : ''
            }`}
            title="Filter aktif"
          >
            <Filter className="w-3.5 h-3.5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#0078D4] rounded-full" />
            )}
          </button>
          {showFilterTooltip && (
            <div className="absolute right-0 top-6 z-50 bg-[#252423] text-white text-[11px] py-1 px-2 rounded shadow-md whitespace-nowrap pointer-events-none">
              {activeFilterCount > 0 ? `${activeFilterCount} filter diterapkan ke visual ini` : 'Semua data ditampilkan (tanpa filter ketat)'}
            </div>
          )}
        </div>

        {/* Focus Mode */}
        {onFocus && (
          <button
            type="button"
            onClick={onFocus}
            className="p-1 rounded hover:bg-[#EDEBE9] hover:text-[#323130] transition-colors"
            title="Mode fokus (Fokus visual)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* More Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded hover:bg-[#EDEBE9] hover:text-[#323130] transition-colors"
            title="Opsi lainnya"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 z-50 w-48 bg-white border border-[#E1DFDD] shadow-lg rounded-[2px] py-1 text-[11px] text-[#323130]">
              {onExportCsv && (
                <button
                  type="button"
                  onClick={() => {
                    onExportCsv();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F2F1] text-left transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#605E5C]" />
                  <span>Ekspor data (.csv)</span>
                </button>
              )}
              {onFocus && (
                <button
                  type="button"
                  onClick={() => {
                    onFocus();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F2F1] text-left transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#605E5C]" />
                  <span>Mode fokus</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyVisual}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F2F1] text-left transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#605E5C]" />
                <span>Salin visual sebagai gambar</span>
              </button>
              <div className="h-px bg-[#E1DFDD] my-1" />
              <div className="px-3 py-1 text-[10px] text-[#8A8886] flex items-center gap-1.5">
                <Info className="w-3 h-3 text-[#0078D4]" />
                <span>Visual Standar Power BI</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {copiedNotification && (
        <div className="absolute top-2 right-12 z-50 bg-[#107C41] text-white text-[10px] px-2 py-0.5 rounded shadow">
          Visual disalin ke clipboard!
        </div>
      )}
    </div>
  );
};
