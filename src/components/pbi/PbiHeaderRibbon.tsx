import React from 'react';
import { ScreenTab, ViewportMode } from '../../types';
import {
  FileSpreadsheet,
  Maximize,
  Minimize,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Info,
  Upload,
} from 'lucide-react';

interface PbiHeaderRibbonProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onExportAllCsv?: () => void;
  onOpenImportModal?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const PbiHeaderRibbon: React.FC<PbiHeaderRibbonProps> = ({
  currentTab,
  onTabChange,
  viewportMode,
  onViewportChange,
  onRefreshData,
  isRefreshing = false,
  onExportAllCsv,
  onOpenImportModal,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  const tabs: { id: ScreenTab; label: string; badgeColor?: string }[] = [
    { id: 'Ringkasan', label: 'Ringkasan' },
    { id: 'Visa', label: 'Visa', badgeColor: '#1A1F71' },
    { id: 'Mastercard', label: 'Mastercard', badgeColor: '#EB001B' },
    { id: 'Detail Deviasi', label: 'Detail Deviasi' },
  ];

  return (
    <header className="bg-white border-b border-[#E1DFDD] select-none shrink-0 z-30">
      {/* Top Application Bar (Power BI Web / Service Style) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#FAF9F8] border-b border-[#EDEBE9]">
        {/* Left: Brand & Report Title */}
        <div className="flex items-center gap-3">
          {/* Power BI Brand Bar Logo */}
          <div className="w-6 h-6 rounded-[2px] bg-[#F2C811] flex items-end p-0.5 gap-0.5 shadow-sm shrink-0" title="Microsoft Power BI">
            <span className="w-1 h-2 bg-[#323130] rounded-[0.5px]" />
            <span className="w-1 h-3.5 bg-[#323130] rounded-[0.5px]" />
            <span className="w-1 h-5 bg-[#323130] rounded-[0.5px]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-[#323130] tracking-tight whitespace-nowrap">
              Dashboard Rekonsiliasi Billing Principal
            </span>
            <span className="text-[#8A8886] hidden sm:inline">|</span>
            <span className="text-[11px] text-[#605E5C] hidden sm:inline">
              Bank Mandiri · Card Scheme Reconciliation
            </span>
          </div>
        </div>

        {/* Right: Actions & Viewport Controls */}
        <div className="flex items-center gap-2 text-[11px]">
          {/* Refresh Action */}
          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2 py-1 text-[#323130] hover:bg-[#EDEBE9] rounded-[2px] border border-[#E1DFDD] transition-colors"
              title="Perbarui data dari core ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0078D4] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh Data</span>
            </button>
          )}

          {/* Import / Upload File Button */}
          {onOpenImportModal && (
            <button
              type="button"
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[#0078D4] hover:bg-[#F0F6FF] rounded-[2px] border border-[#0078D4] font-semibold transition-colors"
              title="Unggah file .ZIP, Excel, atau CSV untuk ditampilkan langsung"
            >
              <Upload className="w-3.5 h-3.5 text-[#0078D4]" />
              <span>Unggah File (.ZIP / Excel)</span>
            </button>
          )}

          {/* Export CSV */}
          {onExportAllCsv && (
            <button
              type="button"
              onClick={onExportAllCsv}
              className="flex items-center gap-1.5 px-2 py-1 text-[#323130] hover:bg-[#EDEBE9] rounded-[2px] border border-[#E1DFDD] transition-colors"
              title="Ekspor seluruh data rekonsiliasi ke CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#107C41]" />
              <span className="hidden md:inline">Ekspor Excel/CSV</span>
            </button>
          )}

          {/* Viewport Scale Mode Switcher (Standard Power BI View Options) */}
          <div className="hidden lg:flex items-center border border-[#E1DFDD] rounded-[2px] overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => onViewportChange('fit-page')}
              className={`px-2 py-1 text-[10px] font-medium transition-colors ${
                viewportMode === 'fit-page'
                  ? 'bg-[#0078D4] text-white'
                  : 'text-[#605E5C] hover:bg-[#F3F2F1]'
              }`}
              title="Skala proporsional 16:9 Fit to Page"
            >
              16:9 Fit
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('fit-width')}
              className={`px-2 py-1 text-[10px] font-medium transition-colors border-l border-[#E1DFDD] ${
                viewportMode === 'fit-width'
                  ? 'bg-[#0078D4] text-white'
                  : 'text-[#605E5C] hover:bg-[#F3F2F1]'
              }`}
              title="Sesuaikan lebar layar penuh"
            >
              Fit Width
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('native-1080')}
              className={`px-2 py-1 text-[10px] font-medium transition-colors border-l border-[#E1DFDD] ${
                viewportMode === 'native-1080'
                  ? 'bg-[#0078D4] text-white'
                  : 'text-[#605E5C] hover:bg-[#F3F2F1]'
              }`}
              title="Resolusi asli 1920x1080 canvas"
            >
              1080p
            </button>
          </div>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 text-[#605E5C] hover:text-[#323130] hover:bg-[#EDEBE9] rounded-[2px] border border-[#E1DFDD] transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (16:9 Presentation)'}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Page Navigation Tabs (Power BI Standard Top Page Tabs) */}
      <nav className="flex items-center px-4 bg-white border-b border-[#E1DFDD] overflow-x-auto">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'text-[#0078D4] bg-[#FAF9F8]'
                    : 'text-[#605E5C] hover:text-[#323130] hover:bg-[#F3F2F1]'
                }`}
              >
                {tab.badgeColor && (
                  <span
                    className="w-2 h-2 rounded-[1px] shrink-0"
                    style={{ backgroundColor: tab.badgeColor }}
                  />
                )}
                <span>{tab.label}</span>

                {/* Active Underline Bar */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2.5px]"
                    style={{
                      backgroundColor:
                        tab.id === 'Visa'
                          ? '#1A1F71'
                          : tab.id === 'Mastercard'
                          ? '#EB001B'
                          : '#0078D4',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
