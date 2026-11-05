import React, { useMemo } from 'react';
import { MastercardRecord, VisaRecord, OverviewFilterState, PipelineStep } from '../../types';
import { PbiKpiCard } from '../pbi/PbiKpiCard';
import { PbiClusteredColumnChart, GenericClusteredItem } from '../pbi/PbiClusteredColumnChart';
import { PbiLineChart, LineChartPoint } from '../pbi/PbiLineChart';
import { PbiDonutChart, DonutSlice } from '../pbi/PbiDonutChart';
import { PbiProcessStrip } from '../pbi/PbiProcessStrip';
import {
  PERIODS,
  formatCompactRupiah,
  formatNumber,
  formatPercentage,
  formatRupiah,
} from '../../data/mockData';

interface OverviewScreenProps {
  filteredMc: MastercardRecord[];
  allMc: MastercardRecord[];
  filteredVisa: VisaRecord[];
  allVisa: VisaRecord[];
  filters: OverviewFilterState;
  pipelineSteps: PipelineStep[];
  onRefreshPipeline: () => void;
  isRefreshingPipeline: boolean;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onExportCsv: (visualName: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  filteredMc,
  allMc,
  filteredVisa,
  allVisa,
  filters,
  pipelineSteps,
  onRefreshPipeline,
  isRefreshingPipeline,
  onOpenFocus,
  onExportCsv,
}) => {
  // 1. KPI Calculations (Aggregated across both principals)
  const kpis = useMemo(() => {
    // Total Billing: MC Total in IDR + Visa Total in IDR (using 16,250 FX)
    const mcBilling = filteredMc.reduce((acc, r) => acc + r['TOTAL MASTERCARD'], 0);
    const visaBillingIdr = filteredVisa.reduce(
      (acc, r) => acc + (r['Billing Currency'] === 'IDR' ? r.Total : r.Total * r['Foreign Exchange Rate']),
      0
    );
    const totalBilling = mcBilling + visaBillingIdr;

    const countMatchMc = filteredMc.filter((r) => r.STATUS === 'Match').length;
    const countMatchVisa = filteredVisa.filter((r) => r.STATUS === 'Match').length;
    const countMatch = countMatchMc + countMatchVisa;

    const countDeviasiMc = filteredMc.filter((r) => r.STATUS === 'Deviasi').length;
    const countDeviasiVisa = filteredVisa.filter((r) => r.STATUS === 'Deviasi').length;
    const countDeviasi = countDeviasiMc + countDeviasiVisa;

    const countUnrecMc = filteredMc.filter((r) => r.STATUS === 'Belum Direkonsiliasi').length;
    const countUnrecVisa = filteredVisa.filter((r) => r.STATUS === 'Belum Direkonsiliasi').length;
    const countUnreconciled = countUnrecMc + countUnrecVisa;

    const selisihMc = filteredMc.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
    const selisihVisaIdr = filteredVisa.reduce(
      (acc, r) => acc + Math.abs(r['Billing Currency'] === 'IDR' ? r.Selisih : r.Selisih * r['Foreign Exchange Rate']),
      0
    );
    const totalNominalSelisih = selisihMc + selisihVisaIdr;

    const totalRows = filteredMc.length + filteredVisa.length || 1;
    const matchRate = (countMatch / totalRows) * 100;

    return {
      totalBilling,
      countMatch,
      countDeviasi,
      countUnreconciled,
      totalNominalSelisih,
      matchRate,
      totalRows,
    };
  }, [filteredMc, filteredVisa]);

  // 2. Clustered Column: Visa vs Mastercard (Total Selisih per Bulan)
  const clusteredMonthlyData = useMemo((): GenericClusteredItem[] => {
    const dataSourceMc = filters.periode === 'Semua' ? filteredMc : allMc;
    const dataSourceVisa = filters.periode === 'Semua' ? filteredVisa : allVisa;

    return PERIODS.map((period) => {
      const pMc = dataSourceMc.filter((r) => r.PERIODE === period);
      const pVisa = dataSourceVisa.filter((r) => r['Billing Period'] === period);

      const selisihMc = pMc.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
      const selisihVisaIdr = pVisa.reduce(
        (acc, r) => acc + Math.abs(r['Billing Currency'] === 'IDR' ? r.Selisih : r.Selisih * r['Foreign Exchange Rate']),
        0
      );

      return {
        category: period.split(' ')[0], // Jan, Feb, Mar...
        val1: selisihVisaIdr,
        val2: selisihMc,
      };
    });
  }, [filteredMc, allMc, filteredVisa, allVisa, filters.periode]);

  // 3. Line Chart: Tren Nominal Selisih per Bulan (Two lines: Visa & Mastercard)
  const lineChartData = useMemo((): LineChartPoint[] => {
    const dataSourceMc = filters.periode === 'Semua' ? filteredMc : allMc;
    const dataSourceVisa = filters.periode === 'Semua' ? filteredVisa : allVisa;

    return PERIODS.map((period) => {
      const pMc = dataSourceMc.filter((r) => r.PERIODE === period);
      const pVisa = dataSourceVisa.filter((r) => r['Billing Period'] === period);

      const selisihMc = pMc.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
      const selisihVisaIdr = pVisa.reduce(
        (acc, r) => acc + Math.abs(r['Billing Currency'] === 'IDR' ? r.Selisih : r.Selisih * r['Foreign Exchange Rate']),
        0
      );

      return {
        period,
        visaValue: selisihVisaIdr,
        mcValue: selisihMc,
      };
    });
  }, [filteredMc, allMc, filteredVisa, allVisa, filters.periode]);

  // 4. Donut Chart: Komposisi Status Rekonsiliasi (Match / Deviasi / Belum Direkonsiliasi)
  const donutData = useMemo((): DonutSlice[] => {
    return [
      {
        label: 'Match' as const,
        value: kpis.countMatch,
        color: '#107C41',
      },
      {
        label: 'Deviasi' as const,
        value: kpis.countDeviasi,
        color: '#D13438',
      },
      {
        label: 'Belum Direkonsiliasi' as const,
        value: kpis.countUnreconciled,
        color: '#605E5C',
      },
    ];
  }, [kpis]);

  return (
    <div className="space-y-3">
      {/* Data Process Strip */}
      <PbiProcessStrip
        steps={pipelineSteps}
        onRefresh={onRefreshPipeline}
        isRefreshing={isRefreshingPipeline}
      />

      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <PbiKpiCard
          title="Total Billing (Agregat)"
          value={formatCompactRupiah(kpis.totalBilling)}
          subtext={`${formatNumber(kpis.totalRows)} baris tagihan`}
          trendText="Mandiri & Principal"
          trendType="neutral"
          onFocus={() =>
            onOpenFocus(
              'Total Billing (Agregat)',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#323130] font-mono">
                  {formatRupiah(kpis.totalBilling)}
                </span>
                <p className="text-xs text-[#605E5C] mt-2">
                  Total akumulasi beban tagihan kedua principal (Visa ekuivalen IDR &amp; Mastercard IDR).
                </p>
              </div>
            )
          }
        />

        <PbiKpiCard
          title="Jumlah Baris Match"
          value={formatNumber(kpis.countMatch)}
          subtext="Item Tagihan Sesuai"
          trendText="Toleransi (0)"
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
          value={formatCompactRupiah(kpis.totalNominalSelisih)}
          subtext="Net Absolut Selisih"
          trendText="Ekuivalen IDR"
          trendType="negative"
          accentColor="#D13438"
          onFocus={() =>
            onOpenFocus(
              'Total Nominal Selisih',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#D13438] font-mono">
                  {formatRupiah(kpis.totalNominalSelisih)}
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

      {/* 3 Main Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Visual 1: Clustered Column: Total Selisih per Bulan (Visa vs Mastercard) */}
        <div className="lg:col-span-5 flex flex-col">
          <PbiClusteredColumnChart
            title="Total Selisih per Bulan (Visa vs Mastercard)"
            subtitle="Perbandingan Deviasi Bulanan (Visa Biru Navy · MC Oranye/Merah)"
            data={clusteredMonthlyData}
            series1Name="Selisih Visa"
            series1Color="#1A1F71"
            series2Name="Selisih Mastercard"
            series2Color="#EB001B"
            currency="IDR"
            onFocus={() =>
              onOpenFocus(
                'Total Selisih per Bulan (Visa vs Mastercard)',
                <PbiClusteredColumnChart
                  title="Total Selisih per Bulan (Visa vs Mastercard)"
                  data={clusteredMonthlyData}
                  series1Name="Selisih Visa"
                  series1Color="#1A1F71"
                  series2Name="Selisih Mastercard"
                  series2Color="#EB001B"
                  currency="IDR"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Selisih_Bulanan_Visa_vs_MC')}
            className="h-full"
          />
        </div>

        {/* Visual 2: Line Chart: Tren Nominal Selisih per Bulan (Two lines: Visa & Mastercard) */}
        <div className="lg:col-span-4 flex flex-col">
          <PbiLineChart
            title="Tren Nominal Selisih per Bulan (Jan - Okt 2026)"
            subtitle="Dua garis tren: Visa (#1A1F71) & Mastercard (#F79E1B)"
            data={lineChartData}
            mode="dual"
            onFocus={() =>
              onOpenFocus(
                'Tren Nominal Selisih per Bulan',
                <PbiLineChart
                  title="Tren Nominal Selisih per Bulan (Jan - Okt 2026)"
                  data={lineChartData}
                  mode="dual"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Tren_Selisih_Kedua_Principal')}
            className="h-full"
          />
        </div>

        {/* Visual 3: Donut Chart: Komposisi Status Rekonsiliasi */}
        <div className="lg:col-span-3 flex flex-col">
          <PbiDonutChart
            title="Komposisi Status Rekonsiliasi"
            subtitle="Match / Deviasi / Belum Direkonsiliasi"
            data={donutData}
            centerLabel="Tingkat Match"
            centerValue={formatPercentage(kpis.matchRate)}
            onFocus={() =>
              onOpenFocus(
                'Komposisi Status Rekonsiliasi',
                <PbiDonutChart
                  title="Komposisi Status Rekonsiliasi"
                  data={donutData}
                  centerLabel="Tingkat Match"
                  centerValue={formatPercentage(kpis.matchRate)}
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Komposisi_Status_Agregat')}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};
