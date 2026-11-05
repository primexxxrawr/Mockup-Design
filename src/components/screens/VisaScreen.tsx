import React, { useMemo } from 'react';
import { VisaRecord, VisaFilterState, PipelineStep } from '../../types';
import { PbiKpiCard } from '../pbi/PbiKpiCard';
import { PbiClusteredColumnChart, GenericClusteredItem } from '../pbi/PbiClusteredColumnChart';
import { PbiLineChart, LineChartPoint } from '../pbi/PbiLineChart';
import { PbiDonutChart, DonutSlice } from '../pbi/PbiDonutChart';
import { PbiVisaKeyTable } from '../pbi/PbiVisaKeyTable';
import { PbiProcessStrip } from '../pbi/PbiProcessStrip';
import {
  FEE_CATEGORY_VISA,
  PERIODS,
  formatCompactVal,
  formatCurrencyVal,
  formatNumber,
  formatPercentage,
} from '../../data/mockData';

interface VisaScreenProps {
  records: VisaRecord[];
  allRecords: VisaRecord[];
  filters: VisaFilterState;
  pipelineSteps: PipelineStep[];
  onRefreshPipeline: () => void;
  isRefreshingPipeline: boolean;
  onSelectRecord: (record: VisaRecord) => void;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onExportCsv: (visualName: string) => void;
}

export const VisaScreen: React.FC<VisaScreenProps> = ({
  records,
  allRecords,
  filters,
  pipelineSteps,
  onRefreshPipeline,
  isRefreshingPipeline,
  onSelectRecord,
  onOpenFocus,
  onExportCsv,
}) => {
  // 1. KPI Cards
  const kpis = useMemo(() => {
    const totalBilling = records.reduce((acc, r) => acc + r.Total, 0);
    const countMatch = records.filter((r) => r.STATUS === 'Match').length;
    const countDeviasi = records.filter((r) => r.STATUS === 'Deviasi').length;
    const totalNominalSelisih = records.reduce((acc, r) => acc + Math.abs(r.Selisih), 0);
    const totalRows = records.length || 1;
    const matchRate = (countMatch / totalRows) * 100;

    return {
      totalBilling,
      countMatch,
      countDeviasi,
      totalNominalSelisih,
      matchRate,
      totalRows,
    };
  }, [records]);

  // 2. Clustered Column: Total vs Total Fee BMRI per Fee Category
  const clusteredCategoryData = useMemo((): GenericClusteredItem[] => {
    return FEE_CATEGORY_VISA.map((cat) => {
      const catRecords = records.filter((r) => r['Fee Category'] === cat);
      const valVisa = catRecords.reduce((acc, r) => acc + r.Total, 0);
      const valBmri = catRecords.reduce((acc, r) => acc + r['Total Fee BMRI'], 0);

      return {
        category: cat,
        val1: valBmri,
        val2: valVisa,
      };
    });
  }, [records]);

  // 3. Line Chart: Tren Selisih per Billing Period
  const lineChartData = useMemo((): LineChartPoint[] => {
    const dataSource = filters.billingPeriod === 'Semua' ? records : allRecords;

    return PERIODS.map((period) => {
      const pRecords = dataSource.filter((r) => r['Billing Period'] === period);
      const selisih = pRecords.reduce((acc, r) => acc + Math.abs(r.Selisih), 0);

      return {
        period,
        singleValue: selisih,
      };
    });
  }, [records, allRecords, filters.billingPeriod]);

  // 4. Donut: Current vs Previous
  const donutCurrentPrev = useMemo((): DonutSlice[] => {
    const countCurrent = records.filter((r) => r['Current or Previous'] === 'Current').length;
    const countPrevious = records.filter((r) => r['Current or Previous'] === 'Previous').length;

    return [
      {
        label: 'Match' as const, // re-using visual slice schema
        value: countCurrent,
        color: '#1A1F71',
      },
      {
        label: 'Deviasi' as const,
        value: countPrevious,
        color: '#0078D4',
      },
    ];
  }, [records]);

  const currentCount = records.filter((r) => r['Current or Previous'] === 'Current').length;
  const prevCount = records.filter((r) => r['Current or Previous'] === 'Previous').length;

  return (
    <div className="space-y-3">
      {/* Visa Banner Header Accent */}
      <div className="bg-[#1A1F71] text-white px-4 py-2 rounded-[2px] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 bg-white text-[#1A1F71] font-black text-xs italic tracking-wider rounded-[1px]">
            VISA
          </div>
          <div>
            <h2 className="text-[13px] font-bold leading-tight">
              Laporan Rekonsiliasi Billing Scheme Visa
            </h2>
            <p className="text-[10px] text-blue-200">
              Komparasi Units &amp; Fee BMRI vs Invoice Total Visa · Catatan: Selisih dalam mata uang tagihan (asumsi)
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] font-medium hidden sm:block">
          <span className="text-blue-200">Warna Aksen:</span> Navy Blue (#1A1F71)
        </div>
      </div>

      {/* Data Process Strip */}
      <PbiProcessStrip
        steps={pipelineSteps}
        onRefresh={onRefreshPipeline}
        isRefreshing={isRefreshingPipeline}
      />

      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <PbiKpiCard
          title="Total Billing (Total)"
          value={formatCompactVal(kpis.totalBilling, 'USD')}
          subtext={`${formatNumber(kpis.totalRows)} baris invoice`}
          trendText="Tagihan Visa"
          trendType="neutral"
          accentColor="#1A1F71"
          onFocus={() =>
            onOpenFocus(
              'Total Billing (Total)',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#1A1F71] font-mono">
                  {formatCurrencyVal(kpis.totalBilling, 'USD')}
                </span>
                <p className="text-xs text-[#605E5C] mt-2">
                  Total tagihan invoice Visa yang divalidasi ke perhitungan fee internal Mandiri.
                </p>
              </div>
            )
          }
        />

        <PbiKpiCard
          title="Jumlah Baris Match"
          value={formatNumber(kpis.countMatch)}
          subtext="Item Tagihan Sesuai"
          trendText="Sesuai Toleransi (0)"
          trendType="positive"
          accentColor="#107C41"
          onFocus={() =>
            onOpenFocus(
              'Jumlah Baris Match',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#107C41] font-mono">
                  {formatNumber(kpis.countMatch)}
                </span>
              </div>
            )
          }
        />

        <PbiKpiCard
          title="Jumlah Baris Deviasi"
          value={formatNumber(kpis.countDeviasi)}
          subtext="Perlu Verifikasi"
          trendText={`${formatPercentage((kpis.countDeviasi / kpis.totalRows) * 100)} deviasi`}
          trendType="negative"
          accentColor="#D13438"
          onFocus={() =>
            onOpenFocus(
              'Jumlah Baris Deviasi',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#D13438] font-mono">
                  {formatNumber(kpis.countDeviasi)}
                </span>
              </div>
            )
          }
        />

        <PbiKpiCard
          title="Total Nominal Selisih"
          value={formatCompactVal(kpis.totalNominalSelisih, 'USD')}
          subtext="Total - Total Fee BMRI"
          trendText="Mata Uang Tagihan"
          trendType="negative"
          accentColor="#D13438"
          onFocus={() =>
            onOpenFocus(
              'Total Nominal Selisih',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#D13438] font-mono">
                  {formatCurrencyVal(kpis.totalNominalSelisih, 'USD')}
                </span>
              </div>
            )
          }
        />

        <PbiKpiCard
          title="% Match"
          value={formatPercentage(kpis.matchRate)}
          subtext="Tingkat Keselarasan"
          trendText="Target: ≥85%"
          trendType="positive"
          accentColor="#107C41"
          onFocus={() =>
            onOpenFocus(
              '% Match',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#107C41] font-mono">
                  {formatPercentage(kpis.matchRate)}
                </span>
              </div>
            )
          }
        />
      </div>

      {/* 3 Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Visual 1: Clustered Column: Total vs Total Fee BMRI per Fee Category */}
        <div className="lg:col-span-5 flex flex-col">
          <PbiClusteredColumnChart
            title="Total vs Total Fee BMRI per Fee Category"
            subtitle="Perbandingan Fee BMRI (Biru Muda) vs Total Visa (Navy)"
            data={clusteredCategoryData}
            series1Name="Total Fee BMRI"
            series1Color="#0078D4"
            series2Name="Total (Visa)"
            series2Color="#1A1F71"
            currency="USD"
            onFocus={() =>
              onOpenFocus(
                'Total vs Total Fee BMRI per Fee Category',
                <PbiClusteredColumnChart
                  title="Total vs Total Fee BMRI per Fee Category"
                  data={clusteredCategoryData}
                  series1Name="Total Fee BMRI"
                  series1Color="#0078D4"
                  series2Name="Total (Visa)"
                  series2Color="#1A1F71"
                  currency="USD"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Visa_BMRI_vs_Total_Category')}
            className="h-full"
          />
        </div>

        {/* Visual 2: Line Chart: Tren Selisih per Billing Period */}
        <div className="lg:col-span-4 flex flex-col">
          <PbiLineChart
            title="Tren Selisih per Billing Period (Visa)"
            subtitle="Nominal Deviasi Bulanan (Jan - Okt 2026)"
            data={lineChartData}
            mode="visa-only"
            onFocus={() =>
              onOpenFocus(
                'Tren Selisih per Billing Period',
                <PbiLineChart
                  title="Tren Selisih per Billing Period (Visa)"
                  data={lineChartData}
                  mode="visa-only"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Tren_Selisih_Period_Visa')}
            className="h-full"
          />
        </div>

        {/* Visual 3: Donut: Current vs Previous */}
        <div className="lg:col-span-3 flex flex-col">
          <PbiDonutChart
            title="Distribusi Current vs Previous"
            subtitle="Porsi tagihan berjalan vs penyesuaian lalu"
            data={[
              { label: 'Match', value: currentCount, color: '#1A1F71' },
              { label: 'Deviasi', value: prevCount, color: '#0078D4' },
            ]}
            centerLabel="Porsi Current"
            centerValue={formatPercentage((currentCount / (records.length || 1)) * 100)}
            onFocus={() =>
              onOpenFocus(
                'Distribusi Current vs Previous',
                <PbiDonutChart
                  title="Distribusi Current vs Previous"
                  data={[
                    { label: 'Match', value: currentCount, color: '#1A1F71' },
                    { label: 'Deviasi', value: prevCount, color: '#0078D4' },
                  ]}
                  centerLabel="Porsi Current"
                  centerValue={formatPercentage((currentCount / (records.length || 1)) * 100)}
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Distribusi_Current_vs_Previous')}
            className="h-full"
          />
        </div>
      </div>

      {/* Table: Matrix with KEY columns only */}
      <PbiVisaKeyTable
        title="Daftar Rekonsiliasi Visa (Kolom Kunci)"
        subtitle="Klik baris mana pun untuk melihat seluruh 24 kolom audit trail"
        records={records}
        onSelectRecord={onSelectRecord}
        onFocus={() =>
          onOpenFocus(
            'Daftar Rekonsiliasi Visa (Kolom Kunci)',
            <PbiVisaKeyTable
              title="Daftar Rekonsiliasi Visa (Kolom Kunci)"
              records={records}
              onSelectRecord={onSelectRecord}
              className="w-full h-full border-0 shadow-none"
            />
          )
        }
        onExportCsv={() => onExportCsv('Visa_Key_Columns')}
      />
    </div>
  );
};
