import React, { useMemo } from 'react';
import {
  MastercardRecord,
  VisaRecord,
  OverviewFilterState,
  PipelineStep,
  usdToIdr,
  STANDARD_CATEGORIES,
  getStatusDisplayLabel,
} from '../../types';
import { PbiKpiCard } from '../pbi/PbiKpiCard';
import { PbiClusteredColumnChart, GenericClusteredItem } from '../pbi/PbiClusteredColumnChart';
import { PbiLineChart, LineChartPoint } from '../pbi/PbiLineChart';
import { PbiDonutChart, DonutSlice } from '../pbi/PbiDonutChart';
import { PbiProcessStrip } from '../pbi/PbiProcessStrip';
import { PbiKesimpulanBanner } from '../pbi/PbiKesimpulanBanner';
import { PbiPerluPerhatianTable, PerluPerhatianItem } from '../pbi/PbiPerluPerhatianTable';
import {
  PERIODS,
  WEEKS,
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
  onRefreshPipeline?: () => void;
  isRefreshingPipeline?: boolean;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onExportCsv: (visualName: string) => void;
  onDrillThroughItem?: (item: PerluPerhatianItem) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  filteredMc,
  allMc,
  filteredVisa,
  allVisa,
  filters,
  onOpenFocus,
  onExportCsv,
  onDrillThroughItem,
}) => {
  const isFiltered = filters.periode !== 'Semua';

  // 1. KPI Calculations (Aggregated across both principals in USD-equivalent, displayed in IDR)
  const kpis = useMemo(() => {
    // Total Billing: MC Total in IDR + Visa Total in IDR (via usdToIdr(totalUsd))
    const mcBilling = filteredMc.reduce((acc, r) => acc + r['TOTAL MASTERCARD'], 0);
    const visaBillingIdr = filteredVisa.reduce(
      (acc, r) => acc + usdToIdr(r.totalUsd),
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
      (acc, r) => acc + Math.abs(r.selisihIdr),
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
      selisihMc,
      selisihVisaIdr,
    };
  }, [filteredMc, filteredVisa]);

  // Informative Metrics for Selected Period Analysis
  const informativeAnalytics = useMemo(() => {
    // Top Category deviation in this period
    let topCat = 'Interchange';
    let topVal = 0;
    STANDARD_CATEGORIES.forEach((cat) => {
      const vVisa = filteredVisa
        .filter((r) => r['Fee Category'] === cat)
        .reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);
      const vMc = filteredMc
        .filter((r) => r['SERVICE KATEGORI'] === cat)
        .reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
      const totalCat = vVisa + vMc;
      if (totalCat > topVal) {
        topVal = totalCat;
        topCat = cat;
      }
    });

    return {
      topCat,
      topVal,
    };
  }, [filteredVisa, filteredMc]);

  // 2. Main Clustered Column:
  // When filtered: shows the 4 STANDARD CATEGORIES for that month (sorted largest to smallest)
  // When 'Semua': shows the 10 MONTHS side by side (Visa #2B6CB0 vs Mastercard #E8832A)
  const clusteredMonthlyData = useMemo((): GenericClusteredItem[] => {
    if (isFiltered) {
      const items = STANDARD_CATEGORIES.map((cat) => {
        const catVisa = filteredVisa.filter((r) => r['Fee Category'] === cat);
        const catMc = filteredMc.filter((r) => r['SERVICE KATEGORI'] === cat);

        const selisihVisaIdr = catVisa.reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);
        const selisihMc = catMc.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);

        return {
          category: cat,
          val1: selisihVisaIdr,
          val2: selisihMc,
        };
      });

      // Sort categories from largest total selisih to smallest
      return items.sort((a, b) => (b.val1 + b.val2) - (a.val1 + a.val2));
    }

    // All months overview
    return PERIODS.map((period) => {
      const pMc = allMc.filter((r) => r.Bulan === period);
      const pVisa = allVisa.filter((r) => r['Billing Period'] === period);

      const selisihMc = pMc.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
      const selisihVisaIdr = pVisa.reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);

      return {
        category: period.split(' ')[0], // Jan, Feb, Mar...
        val1: selisihVisaIdr,
        val2: selisihMc,
      };
    });
  }, [isFiltered, filteredVisa, filteredMc, allMc, allVisa]);

  // 3. Supporting Visual - Line Chart:
  // When filtered: shows WEEKLY progression within that specific month
  // When 'Semua': shows 10 MONTHS trend
  const lineChartData = useMemo((): LineChartPoint[] => {
    if (isFiltered) {
      const monthWeeks = WEEKS.filter((w) => w.month === filters.periode);
      const totalVisaMonth = filteredVisa.reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);
      const visaWeeklyBenchmark = Math.round(totalVisaMonth / (monthWeeks.length || 1));

      return monthWeeks.map((w) => {
        const wMc = filteredMc.filter((r) => r.Minggu === w.weekCode);
        const mcSelisih = wMc.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);

        return {
          period: `${w.weekCode} (${w.startDate})`,
          visaValue: visaWeeklyBenchmark,
          mcValue: mcSelisih,
        };
      });
    }

    return PERIODS.map((period) => {
      const pMc = allMc.filter((r) => r.Bulan === period);
      const pVisa = allVisa.filter((r) => r['Billing Period'] === period);

      const selisihMc = pMc.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
      const selisihVisaIdr = pVisa.reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);

      return {
        period,
        visaValue: selisihVisaIdr,
        mcValue: selisihMc,
      };
    });
  }, [isFiltered, filters.periode, filteredVisa, filteredMc, allMc, allVisa]);

  // 4. Supporting Visual - Donut Chart: Komposisi Status Rekonsiliasi (Sesuai / Ada Selisih / Belum Dicek)
  const donutData = useMemo((): DonutSlice[] => {
    return [
      {
        label: 'Sesuai',
        value: kpis.countMatch,
        color: '#1E8E5A', // Green reserved for Sesuai
      },
      {
        label: 'Ada Selisih',
        value: kpis.countDeviasi,
        color: '#C62828', // Red reserved for Ada Selisih
      },
      {
        label: 'Belum Dicek',
        value: kpis.countUnreconciled,
        color: '#8A93A0', // Grey reserved for Belum Dicek
      },
    ];
  }, [kpis]);

  // 5. Perlu Perhatian List: Top 5 Largest Deviations with Drill-through support
  const topDeviations = useMemo((): PerluPerhatianItem[] => {
    const visaItems: PerluPerhatianItem[] = filteredVisa
      .filter((r) => r.STATUS === 'Deviasi')
      .map((r) => ({
        id: `${r['Invoice ID']}-${r['Fee Name']}`,
        rank: 0,
        kategori: r['Fee Category'],
        subDeskripsi: `${r['Fee Name']} · Inv: ${r['Invoice ID']}`,
        periode: r['Billing Period'],
        selisihIdr: r.selisihIdr,
        status: r.STATUS,
        principal: 'Visa' as const,
        rawRecord: r,
      }));

    const mcItems: PerluPerhatianItem[] = filteredMc
      .filter((r) => r.STATUS === 'Deviasi')
      .map((r) => ({
        id: `${r['EVENT ID']}-${r.NO}`,
        rank: 0,
        kategori: r['SERVICE KATEGORI'],
        subDeskripsi: `${r.DESC} · Event ID: ${r['EVENT ID']}`,
        periode: r.Minggu,
        selisihIdr: r.SELISIH,
        status: r.STATUS,
        principal: 'Mastercard' as const,
        rawRecord: r,
      }));

    const combined = [...visaItems, ...mcItems].sort(
      (a, b) => Math.abs(b.selisihIdr) - Math.abs(a.selisihIdr)
    );

    return combined.slice(0, 5).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [filteredVisa, filteredMc]);

  return (
    <div className="space-y-3.5">
      {/* 1. Kesimpulan Banner (Answer First - 5-Second Rule) */}
      <PbiKesimpulanBanner
        periodLabel={isFiltered ? filters.periode : 'Januari - Oktober 2026'}
        totalRows={kpis.totalRows}
        countSesuai={kpis.countMatch}
        countSelisih={kpis.countDeviasi}
        countBelumDicek={kpis.countUnreconciled}
        totalNominalSelisihIdr={kpis.totalNominalSelisih}
        matchRate={kpis.matchRate}
        highlightCategory={informativeAnalytics.topCat}
        principalName="Semua"
      />

      {/* 2. Simplified 4-Step Data Progress Strip */}
      <PbiProcessStrip />

      {/* 3. Four KPI Cards (Plain Language, Large Number, Neutral Comparison) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Billing */}
        <PbiKpiCard
          title="Total Billing"
          plainExplanation="Total nilai tagihan resmi dari principal (Visa & Mastercard)"
          value={formatCompactRupiah(kpis.totalBilling)}
          subtext={`${formatNumber(kpis.totalRows)} baris transaksi`}
          comparisonText="Ekuivalen IDR"
          comparisonDirection="flat"
          accentColor="#003A70"
          caraMembaca="Akumulasi seluruh kewajiban tagihan fee principal yang disetarakan dalam mata uang Rupiah."
          onFocus={() =>
            onOpenFocus(
              'Total Billing (Agregat)',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#003A70] font-mono">
                  {formatRupiah(kpis.totalBilling)}
                </span>
                <p className="text-xs text-[#6B7280] mt-2">
                  Total tagihan gabungan kartu kredit Visa dan Mastercard dalam USD-equivalent basis.
                </p>
              </div>
            )
          }
        />

        {/* KPI 2: Jumlah Baris Sesuai */}
        <PbiKpiCard
          title="Jumlah Sesuai"
          plainExplanation="Berapa baris yang angkanya cocok dengan hitungan internal Mandiri"
          value={formatNumber(kpis.countMatch)}
          subtext="Item tagihan tervalidasi"
          comparisonText="Toleransi Rp0"
          comparisonDirection="flat"
          accentColor="#1E8E5A"
          caraMembaca="Jumlah transaksi di mana tagihan principal persis sama dengan perhitungan internal Bank Mandiri."
          onFocus={() =>
            onOpenFocus(
              'Baris Sesuai (Match)',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#1E8E5A] font-mono">
                  {formatNumber(kpis.countMatch)} Baris
                </span>
                <p className="text-xs text-[#6B7280] mt-2">
                  Telah sesuai dengan toleransi sistem tanpa perbedaan tarif maupun volume.
                </p>
              </div>
            )
          }
        />

        {/* KPI 3: Jumlah Ada Selisih */}
        <PbiKpiCard
          title="Ada Selisih"
          plainExplanation="Berapa baris yang angkanya berbeda dan perlu ditinjau tim operasional"
          value={formatNumber(kpis.countDeviasi)}
          subtext={`Total selisih ${formatCompactRupiah(kpis.totalNominalSelisih)}`}
          comparisonText="Perlu Investigasi"
          comparisonDirection="up"
          isDeviationMetric={true}
          accentColor="#C62828"
          caraMembaca="Jumlah baris transaksi yang memerlukan rekonsiliasi lanjutan karena terdapat selisih nominal."
          onFocus={() =>
            onOpenFocus(
              'Baris Ada Selisih',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#C62828] font-mono">
                  {formatNumber(kpis.countDeviasi)} Baris
                </span>
                <p className="text-xs text-[#6B7280] mt-2">
                  Total nominal selisih: {formatRupiah(kpis.totalNominalSelisih)}
                </p>
              </div>
            )
          }
        />

        {/* KPI 4: % Kesesuaian */}
        <PbiKpiCard
          title="Persentase Sesuai"
          plainExplanation="Persentase baris yang angkanya sama persis"
          value={formatPercentage(kpis.matchRate)}
          subtext={kpis.matchRate >= 85 ? 'Kondisi sehat' : 'Di bawah batas nyaman'}
          comparisonText={kpis.matchRate >= 85 ? 'Memenuhi Standar' : 'Perlu Perhatian'}
          comparisonDirection={kpis.matchRate >= 85 ? 'up' : 'down'}
          isDeviationMetric={false}
          accentColor={kpis.matchRate >= 85 ? '#1E8E5A' : '#F5A800'}
          caraMembaca="Rasio baris sesuai dibagi total baris tagihan. Target operasional adalah minimal 85%."
          onFocus={() =>
            onOpenFocus(
              'Persentase Sesuai (% Match)',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#003A70] font-mono">
                  {formatPercentage(kpis.matchRate)}
                </span>
              </div>
            )
          }
        />
      </div>

      {/* 4. Visual Row: Main Visual + Supporting Line & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Visual 1: Main Story Clustered Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <PbiClusteredColumnChart
            title={
              isFiltered
                ? `Selisih Terbesar Ada di Kategori ${informativeAnalytics.topCat}`
                : 'Komparasi Selisih Bulanan: Visa vs Mastercard'
            }
            subtitle={
              isFiltered
                ? `Rincian 4 kategori baku untuk periode ${filters.periode} (Rp)`
                : 'Perbandingan deviasi nominal per bulan pelaporan dalam Rupiah'
            }
            caraMembaca="Membandingkan selisih tagihan Visa (biru) vs Mastercard (oranye). Batang lebih tinggi menandakan selisih nominal lebih besar."
            data={clusteredMonthlyData}
            series1Name="Visa (Rp)"
            series1Color="#2B6CB0"
            series2Name="Mastercard (Rp)"
            series2Color="#E8832A"
            currency="IDR"
            onFocus={() =>
              onOpenFocus(
                isFiltered
                  ? `Selisih Kategori · ${filters.periode}`
                  : 'Komparasi Selisih Bulanan: Visa vs Mastercard',
                <PbiClusteredColumnChart
                  title={
                    isFiltered
                      ? `Selisih Terbesar Ada di Kategori ${informativeAnalytics.topCat}`
                      : 'Komparasi Selisih Bulanan: Visa vs Mastercard'
                  }
                  data={clusteredMonthlyData}
                  series1Name="Visa (Rp)"
                  series1Color="#2B6CB0"
                  series2Name="Mastercard (Rp)"
                  series2Color="#E8832A"
                  currency="IDR"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() =>
              onExportCsv(
                isFiltered
                  ? `Selisih_Kategori_${filters.periode.replace(/\s+/g, '_')}`
                  : 'Selisih_Bulanan_Visa_vs_MC'
              )
            }
            className="h-full"
          />
        </div>

        {/* Visual 2: Supporting Line Chart (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <PbiLineChart
            title={
              isFiltered
                ? `Tren Deviasi Mingguan Periode ${filters.periode}`
                : 'Tren Nominal Selisih per Bulan (Jan - Okt 2026)'
            }
            subtitle={
              isFiltered
                ? `Fluktuasi minggu pelaporan pada bulan ${filters.periode}`
                : 'Pergerakan selisih nominal sepanjang tahun 2026'
            }
            caraMembaca="Garis biru menunjukkan Visa dan garis oranye menunjukkan Mastercard. Titik puncak menandakan lonjakan deviasi pada minggu/bulan terkait."
            data={lineChartData}
            mode="dual"
            onFocus={() =>
              onOpenFocus(
                isFiltered
                  ? `Tren Deviasi Mingguan · ${filters.periode}`
                  : 'Tren Nominal Selisih per Bulan',
                <PbiLineChart
                  title={
                    isFiltered
                      ? `Tren Deviasi Mingguan Periode ${filters.periode}`
                      : 'Tren Nominal Selisih per Bulan'
                  }
                  data={lineChartData}
                  mode="dual"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() =>
              onExportCsv(
                isFiltered
                  ? `Tren_Mingguan_${filters.periode.replace(/\s+/g, '_')}`
                  : 'Tren_Deviasi_Bulanan'
              )
            }
            className="h-full"
          />
        </div>

        {/* Visual 3: Supporting Donut Chart (3 cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <PbiDonutChart
            title="Komposisi Status Tagihan"
            subtitle={`Porsi baris Sesuai, Ada Selisih, dan Belum Dicek (${filters.periode})`}
            caraMembaca="Menunjukkan pembagian porsi status tagihan. Bagian hijau menandakan transaksi yang telah terverifikasi cocok."
            data={donutData}
            centerLabel="Total Baris"
            centerValue={formatNumber(kpis.totalRows)}
            onFocus={() =>
              onOpenFocus(
                'Komposisi Status Tagihan',
                <PbiDonutChart
                  title="Komposisi Status Tagihan"
                  data={donutData}
                  centerLabel="Total Baris"
                  centerValue={formatNumber(kpis.totalRows)}
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Komposisi_Status_Tagihan')}
            className="h-full"
          />
        </div>
      </div>

      {/* 5. Perlu Perhatian List: Top 5 Deviasi Terbesar with Drill-through */}
      <PbiPerluPerhatianTable
        items={topDeviations}
        title="Perlu Perhatian: 5 Deviasi Terbesar"
        subtitle={`Transaksi dengan nominal selisih tertinggi yang memerlukan konfirmasi segera (${filters.periode})`}
        onDrillThrough={(item) => onDrillThroughItem && onDrillThroughItem(item)}
        onFocus={() =>
          onOpenFocus(
            'Perlu Perhatian: 5 Deviasi Terbesar',
            <PbiPerluPerhatianTable
              items={topDeviations}
              onDrillThrough={(item) => onDrillThroughItem && onDrillThroughItem(item)}
              className="w-full h-full border-0 shadow-none"
            />
          )
        }
        onExportCsv={() => onExportCsv('Perlu_Perhatian_Top5_Deviasi')}
      />
    </div>
  );
};
