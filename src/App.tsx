import React, { useState, useMemo } from 'react';
import {
  MastercardFilterState,
  MastercardRecord,
  OverviewFilterState,
  PipelineStep,
  ScreenTab,
  ViewportMode,
  VisaFilterState,
  VisaRecord,
} from './types';
import {
  INITIAL_PIPELINE_STEPS,
  RAW_MASTERCARD_RECORDS,
  RAW_VISA_RECORDS,
} from './data/mockData';
import { PbiHeaderRibbon } from './components/pbi/PbiHeaderRibbon';
import { PbiMastercardSlicers } from './components/pbi/PbiMastercardSlicers';
import { PbiVisaSlicers } from './components/pbi/PbiVisaSlicers';
import { PbiOverviewSlicers } from './components/pbi/PbiOverviewSlicers';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { VisaScreen } from './components/screens/VisaScreen';
import { MastercardScreen } from './components/screens/MastercardScreen';
import { DetailDeviasiScreen } from './components/screens/DetailDeviasiScreen';
import { FocusVisualModal } from './components/modals/FocusVisualModal';
import { DetailDrillModal } from './components/modals/DetailDrillModal';
import { ImportDataModal } from './components/modals/ImportDataModal';
import { PbiTermsGuideModal } from './components/pbi/PbiTermsGuideModal';
import { PbiFooter } from './components/pbi/PbiFooter';
import { PerluPerhatianItem } from './components/pbi/PbiPerluPerhatianTable';
import { ParseResult } from './utils/fileParser';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('Ringkasan');
  const [isTermsGuideOpen, setIsTermsGuideOpen] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('fit-width');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mastercard Slicers State
  const [mcFilters, setMcFilters] = useState<MastercardFilterState>({
    minggu: 'Semua',
    bulan: 'Semua',
    serviceKategori: 'Semua',
    tierEvent: 'Semua',
    bySvByQty: 'Semua',
    billableIca: 'Semua',
    status: 'Semua',
    searchQuery: '',
  });

  // Visa Slicers State
  const [visaFilters, setVisaFilters] = useState<VisaFilterState>({
    billingPeriod: 'Semua',
    invoiceId: 'Semua',
    currentOrPrevious: 'Semua',
    feeCategory: 'Semua',
    type: 'Semua',
    status: 'Semua',
    searchQuery: '',
  });

  // Overview / Detail Slicers State
  const [overviewFilters, setOverviewFilters] = useState<OverviewFilterState>({
    periode: 'Semua',
    status: 'Semua',
    searchQuery: '',
  });

  // Pipeline Status Steps (Generic placeholders)
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(INITIAL_PIPELINE_STEPS);
  const [isRefreshingPipeline, setIsRefreshingPipeline] = useState(false);

  // Dynamic Records State (Initialized with Mock, Overridable by Uploaded ZIP/Excel)
  const [mastercardData, setMastercardData] = useState<MastercardRecord[]>(RAW_MASTERCARD_RECORDS);
  const [visaData, setVisaData] = useState<VisaRecord[]>(RAW_VISA_RECORDS);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Focus Visual Modal State
  const [focusModal, setFocusModal] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: null,
  });

  // Drilldown Modal State
  const [selectedRecord, setSelectedRecord] = useState<{
    record: MastercardRecord | VisaRecord | null;
    type?: 'Mastercard' | 'Visa';
  }>({
    record: null,
  });

  // Handle uploaded data from ZIP / Excel / CSV
  const handleDataImported = (result: ParseResult) => {
    if (result.mastercardRecords.length > 0) {
      setMastercardData(result.mastercardRecords);
    }
    if (result.visaRecords.length > 0) {
      setVisaData(result.visaRecords);
    }
    // Update process strip metrics to reflect uploaded data
    setPipelineSteps((prev) =>
      prev.map((step) => {
        if (step.id === 'data_ditarik') {
          return { ...step, primaryMetric: 'File Diunggah', secondaryInfo: result.fileNames.slice(0, 2).join(', ') };
        }
        if (step.id === 'cleansing') {
          return {
            ...step,
            primaryMetric: `${result.mastercardRecords.length + result.visaRecords.length} Baris`,
            secondaryInfo: 'Data berhasil diekstrak dari file',
          };
        }
        return step;
      })
    );
  };

  // Filter Mastercard Records
  const filteredMastercardRecords = useMemo(() => {
    return mastercardData.filter((r) => {
      // If on Mastercard tab, use mcFilters
      if (currentTab === 'Mastercard') {
        if (mcFilters.minggu !== 'Semua' && r.Minggu !== mcFilters.minggu) return false;
        if (mcFilters.bulan !== 'Semua' && r.Bulan !== mcFilters.bulan) return false;
        if (mcFilters.serviceKategori !== 'Semua' && r['SERVICE KATEGORI'] !== mcFilters.serviceKategori) return false;
        if (mcFilters.tierEvent !== 'Semua' && r['TIER EVENT'] !== mcFilters.tierEvent) return false;
        if (mcFilters.bySvByQty !== 'Semua' && r['BY SV / BY QTY'] !== mcFilters.bySvByQty) return false;
        if (mcFilters.billableIca !== 'Semua' && r['BILLABLE ICA'] !== mcFilters.billableIca) return false;
        if (mcFilters.status !== 'Semua' && r.STATUS !== mcFilters.status) return false;
        if (mcFilters.searchQuery) {
          const q = mcFilters.searchQuery.toLowerCase();
          return (
            r['EVENT ID'].toLowerCase().includes(q) ||
            r.DESC.toLowerCase().includes(q) ||
            r['SERVICE KATEGORI'].toLowerCase().includes(q) ||
            r.Minggu.toLowerCase().includes(q)
          );
        }
        return true;
      }

      // If on Ringkasan or Detail tab, use overviewFilters
      if (overviewFilters.periode !== 'Semua' && r.Bulan !== overviewFilters.periode) return false;
      if (overviewFilters.status !== 'Semua' && r.STATUS !== overviewFilters.status) return false;
      if (overviewFilters.searchQuery) {
        const q = overviewFilters.searchQuery.toLowerCase();
        return (
          r['EVENT ID'].toLowerCase().includes(q) ||
          r.DESC.toLowerCase().includes(q) ||
          r['SERVICE KATEGORI'].toLowerCase().includes(q) ||
          r.Minggu.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [currentTab, mastercardData, mcFilters, overviewFilters]);

  // Filter Visa Records
  const filteredVisaRecords = useMemo(() => {
    return visaData.filter((r) => {
      // If on Visa tab, use visaFilters
      if (currentTab === 'Visa') {
        if (visaFilters.billingPeriod !== 'Semua' && r['Billing Period'] !== visaFilters.billingPeriod) return false;
        if (visaFilters.invoiceId !== 'Semua' && r['Invoice ID'] !== visaFilters.invoiceId) return false;
        if (visaFilters.currentOrPrevious !== 'Semua' && r['Current or Previous'] !== visaFilters.currentOrPrevious) return false;
        if (visaFilters.feeCategory !== 'Semua' && r['Fee Category'] !== visaFilters.feeCategory) return false;
        if (visaFilters.type !== 'Semua' && r.Type !== visaFilters.type) return false;
        if (visaFilters.status !== 'Semua' && r.STATUS !== visaFilters.status) return false;
        if (visaFilters.searchQuery) {
          const q = visaFilters.searchQuery.toLowerCase();
          return (
            r['Invoice ID'].toLowerCase().includes(q) ||
            r['Invoice Description'].toLowerCase().includes(q) ||
            r['Fee Category'].toLowerCase().includes(q)
          );
        }
        return true;
      }

      // If on Ringkasan or Detail tab, use overviewFilters
      if (overviewFilters.periode !== 'Semua' && r['Billing Period'] !== overviewFilters.periode) return false;
      if (overviewFilters.status !== 'Semua' && r.STATUS !== overviewFilters.status) return false;
      if (overviewFilters.searchQuery) {
        const q = overviewFilters.searchQuery.toLowerCase();
        return (
          r['Invoice ID'].toLowerCase().includes(q) ||
          r['Invoice Description'].toLowerCase().includes(q) ||
          r['Fee Category'].toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [currentTab, visaData, visaFilters, overviewFilters]);

  // Unique Invoice IDs for Visa slicer
  const uniqueVisaInvoiceIds = useMemo(() => {
    return Array.from(new Set(visaData.map((r) => r['Invoice ID'])));
  }, [visaData]);

  // Simulate Pipeline Refresh without fictional claims
  const handleRefreshPipeline = () => {
    setIsRefreshingPipeline(true);
    setPipelineSteps((prev) =>
      prev.map((step) =>
        step.id === 'komparasi'
          ? { ...step, status: 'Berjalan', secondaryInfo: 'Menghitung ulang deviasi...' }
          : step
      )
    );

    setTimeout(() => {
      setPipelineSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: 'Selesai',
          secondaryInfo:
            step.id === 'komparasi'
              ? 'Aturan toleransi: TBD'
              : step.secondaryInfo,
        }))
      );
      setIsRefreshingPipeline(false);
    }, 1000);
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Export CSV
  const handleExportAllCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (currentTab === 'Mastercard') {
      headers = [
        'NO',
        'TANGGAL',
        'MINGGU',
        'BULAN',
        'EVENT ID',
        'TIER EVENT',
        'DESC',
        'BY SV / BY QTY',
        'QTY MANDIRI',
        'RATE MANDIRI',
        'CHARGE MANDIRI',
        'TAX MANDIRI',
        'TOTAL MANDIRI',
        'QTY MASTERCARD',
        'RATE MASTERCARD',
        'CHARGE MASTERCARD',
        'TAX MASTERCARD',
        'TOTAL MASTERCARD',
        'SELISIH',
        'PERSENTASE SELISIH',
        'SERVICE KATEGORI',
        'BILLABLE ICA',
        'STATUS',
      ];
      rows = filteredMastercardRecords.map((r) => [
        r.NO,
        r.TANGGAL,
        r.Minggu,
        r.Bulan,
        r['EVENT ID'],
        `"${r['TIER EVENT']}"`,
        `"${r.DESC}"`,
        r['BY SV / BY QTY'],
        r['QTY MANDIRI'],
        r['RATE MANDIRI'],
        r['CHARGE MANDIRI'],
        r['TAX MANDIRI'],
        r['TOTAL MANDIRI'],
        r['QTY MASTERCARD'],
        r['RATE MASTERCARD'],
        r['CHARGE MASTERCARD'],
        r['TAX MASTERCARD'],
        r['TOTAL MASTERCARD'],
        r.SELISIH,
        r['PERSENTASE SELISIH'],
        `"${r['SERVICE KATEGORI']}"`,
        r['BILLABLE ICA'],
        r.STATUS,
      ]);
    } else {
      headers = [
        'Billing Period',
        'Invoice Date',
        'Invoice ID',
        'Current or Previous',
        'Mapping',
        'Settlement ID',
        'Fee Category',
        'Fee Group',
        'Fee Name',
        'Billing Line',
        'Invoice Description',
        'Billing Line Custom Description',
        'Type',
        'Rate Type',
        'Units',
        'Rate Cur',
        'Rate',
        'Foreign Exchange Rate',
        'Billing Currency',
        'Total',
        'Jumlah Units BMRI',
        'Total Fee BMRI',
        'Selisih (Tagihan)',
        'Selisih (Rp)',
        'Persentase Selisih',
        'STATUS',
      ];
      rows = filteredVisaRecords.map((r) => [
        r['Billing Period'],
        r['Invoice Date'],
        r['Invoice ID'],
        r['Current or Previous'],
        r.Mapping,
        r['Settlement ID'],
        `"${r['Fee Category']}"`,
        `"${r['Fee Group']}"`,
        `"${r['Fee Name']}"`,
        r['Billing Line'],
        `"${r['Invoice Description']}"`,
        `"${r['Billing Line Custom Description']}"`,
        r.Type,
        r['Rate Type'],
        r.Units,
        r['Rate Cur'],
        r.Rate,
        r['Foreign Exchange Rate'],
        r['Billing Currency'],
        r.Total,
        r['Jumlah Units BMRI'],
        r['Total Fee BMRI'],
        r.Selisih,
        r.selisihIdr,
        r['Persentase Selisih'],
        r.STATUS,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `rekon_billing_${currentTab.toLowerCase()}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenFocus = (title: string, content: React.ReactNode) => {
    setFocusModal({
      isOpen: true,
      title,
      content,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans select-text">
      {/* Power BI Header & Top Page Tabs */}
      <PbiHeaderRibbon
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenTermsGuide={() => setIsTermsGuideOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportAllCsv={handleExportAllCsv}
      />

      {/* Screen-Specific Slicers Bar */}
      {currentTab === 'Mastercard' && (
        <PbiMastercardSlicers
          filters={mcFilters}
          onChange={setMcFilters}
          onReset={() =>
            setMcFilters({
              minggu: 'Semua',
              bulan: 'Semua',
              serviceKategori: 'Semua',
              tierEvent: 'Semua',
              bySvByQty: 'Semua',
              billableIca: 'Semua',
              status: 'Semua',
              searchQuery: '',
            })
          }
        />
      )}

      {currentTab === 'Visa' && (
        <PbiVisaSlicers
          filters={visaFilters}
          onChange={setVisaFilters}
          onReset={() =>
            setVisaFilters({
              billingPeriod: 'Semua',
              invoiceId: 'Semua',
              currentOrPrevious: 'Semua',
              feeCategory: 'Semua',
              type: 'Semua',
              status: 'Semua',
              searchQuery: '',
            })
          }
          uniqueInvoiceIds={uniqueVisaInvoiceIds}
        />
      )}

      {currentTab === 'Ringkasan' && (
        <PbiOverviewSlicers
          filters={overviewFilters}
          onChange={setOverviewFilters}
          onReset={() =>
            setOverviewFilters({
              periode: 'Semua',
              status: 'Semua',
              searchQuery: '',
            })
          }
        />
      )}

      {currentTab === 'Detail Deviasi' && (
        <PbiOverviewSlicers
          filters={overviewFilters}
          onChange={setOverviewFilters}
          onReset={() =>
            setOverviewFilters({
              periode: 'Semua',
              status: 'Semua',
              searchQuery: '',
            })
          }
          placeholder="Cari transaksi, event ID, invoice ID, atau kategori..."
        />
      )}

      {/* Main Canvas Viewport Container */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1920px] mx-auto w-full">
        {/* Render Tab Screens */}
        {currentTab === 'Ringkasan' && (
          <OverviewScreen
            filteredMc={filteredMastercardRecords}
            allMc={mastercardData}
            filteredVisa={filteredVisaRecords}
            allVisa={visaData}
            filters={overviewFilters}
            pipelineSteps={pipelineSteps}
            onOpenFocus={handleOpenFocus}
            onExportCsv={handleExportAllCsv}
            onDrillThroughItem={(item) => {
              setCurrentTab('Detail Deviasi');
              const q = item.principal === 'Visa'
                ? (item.rawRecord?.['Invoice ID'] || item.id)
                : (item.rawRecord?.['EVENT ID'] || item.id);
              setOverviewFilters((prev) => ({ ...prev, searchQuery: q }));
            }}
          />
        )}

        {currentTab === 'Mastercard' && (
          <MastercardScreen
            records={filteredMastercardRecords}
            allRecords={mastercardData}
            filters={mcFilters}
            pipelineSteps={pipelineSteps}
            onSelectRecord={(rec) =>
              setSelectedRecord({ record: rec, type: 'Mastercard' })
            }
            onOpenFocus={handleOpenFocus}
            onExportCsv={handleExportAllCsv}
            onDrillThroughItem={(item) => {
              setCurrentTab('Detail Deviasi');
              const q = item.rawRecord?.['EVENT ID'] || item.id;
              setOverviewFilters((prev) => ({ ...prev, searchQuery: q }));
            }}
          />
        )}

        {currentTab === 'Visa' && (
          <VisaScreen
            records={filteredVisaRecords}
            allRecords={visaData}
            filters={visaFilters}
            pipelineSteps={pipelineSteps}
            onSelectRecord={(rec) =>
              setSelectedRecord({ record: rec, type: 'Visa' })
            }
            onOpenFocus={handleOpenFocus}
            onExportCsv={handleExportAllCsv}
            onDrillThroughItem={(item) => {
              setCurrentTab('Detail Deviasi');
              const q = item.rawRecord?.['Invoice ID'] || item.id;
              setOverviewFilters((prev) => ({ ...prev, searchQuery: q }));
            }}
          />
        )}

        {currentTab === 'Detail Deviasi' && (
          <DetailDeviasiScreen
            filteredVisa={filteredVisaRecords}
            filteredMc={filteredMastercardRecords}
            onSelectVisaRow={(row) =>
              setSelectedRecord({ record: row, type: 'Visa' })
            }
            onSelectMcRow={(row) =>
              setSelectedRecord({ record: row, type: 'Mastercard' })
            }
            onOpenFocus={handleOpenFocus}
            onExportCsv={handleExportAllCsv}
          />
        )}
      </main>

      {/* Enterprise Power BI Footer */}
      <PbiFooter />

      {/* Panduan Istilah (Terms Glossary Bookmark Overlay) */}
      <PbiTermsGuideModal
        isOpen={isTermsGuideOpen}
        onClose={() => setIsTermsGuideOpen(false)}
      />

      {/* Focus Modal */}
      <FocusVisualModal
        isOpen={focusModal.isOpen}
        title={focusModal.title}
        onClose={() => setFocusModal({ isOpen: false, title: '', content: null })}
      >
        {focusModal.content}
      </FocusVisualModal>

      {/* Drilldown Modal */}
      <DetailDrillModal
        record={selectedRecord.record}
        principalType={selectedRecord.type}
        isOpen={selectedRecord.record !== null}
        onClose={() => setSelectedRecord({ record: null })}
      />

      {/* Import File Modal (ZIP / Excel / CSV) */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDataLoaded={handleDataImported}
      />
    </div>
  );
}
