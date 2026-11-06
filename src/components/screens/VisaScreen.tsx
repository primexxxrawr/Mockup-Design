import React, { useMemo } from 'react';
import { VisaRecord, VisaFilterState, PipelineStep, STANDARD_CATEGORIES } from '../../types';
import { PbiKpiCard } from '../pbi/PbiKpiCard';
import { PbiClusteredColumnChart, GenericClusteredItem } from '../pbi/PbiClusteredColumnChart';
import { PbiSCurveLineClusteredColumnChart, SCurvePoint } from '../pbi/PbiSCurveLineClusteredColumnChart';
import { PbiDonutChart, DonutSlice } from '../pbi/PbiDonutChart';
import { PbiProcessStrip } from '../pbi/PbiProcessStrip';
import { PbiKesimpulanBanner } from '../pbi/PbiKesimpulanBanner';
import { PbiPerluPerhatianTable, PerluPerhatianItem } from '../pbi/PbiPerluPerhatianTable';
import {
  PERIODS,
  formatCompactVal,
  formatCurrencyVal,
  formatCompactRupiah,
  formatNumber,
  formatPercentage,
  formatRupiah,
  formatUSD,
} from '../../data/mockData';

interface VisaScreenProps {
  records: VisaRecord[];
  allRecords: VisaRecord[];
  filters: VisaFilterState;
  pipelineSteps?: PipelineStep[];
  onRefreshPipeline?: () => void;
  isRefreshingPipeline?: boolean;
  onSelectRecord: (record: VisaRecord) => void;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onExportCsv: (visualName: string) => void;
  onDrillThroughItem?: (item: PerluPerhatianItem) => void;
}

export const VisaScreen: React.FC<VisaScreenProps> = ({
  records,
  allRecords,
  filters,
  onOpenFocus,
  onExportCsv,
  onDrillThroughItem,
}) => {
  const isPeriodFiltered = filters.billingPeriod !== 'Semua';

  // 1. KPI Cards (Baseline: reconciliation calculated in USD-equivalent; deviation displayed in IDR)
  const kpis = useMemo(() => {
    const totalBillingUsd = records.reduce((acc, r) => acc + r.totalUsd, 0);
    const countMatch = records.filter((r) => r.STATUS === 'Match').length;
    const countDeviasi = records.filter((r) => r.STATUS === 'Deviasi').length;
    const countUnrec = records.filter((r) => r.STATUS === 'Belum Direkonsiliasi').length;
    const totalNominalSelisihIdr = records.reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);
    const totalRows = records.length || 1;
    const matchRate = (countMatch / totalRows) * 100;

    return {
      totalBillingUsd,
      countMatch,
      countDeviasi,
      countUnrec,
      totalNominalSelisihIdr,
      matchRate,
      totalRows,
    };
  }, [records]);

  // Top Category deviation in Visa
  const topVisaCategory = useMemo(() => {
    let topCat = 'Interchange';
    let topVal = 0;
    STANDARD_CATEGORIES.forEach((cat) => {
      const val = records
        .filter((r) => r['Fee Category'] === cat)
        .reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);
      if (val > topVal) {
        topVal = val;
        topCat = cat;
      }
    });
    return { topCat, topVal };
  }, [records]);

  // 2. Supporting Visual: Clustered Column per 4 Fee Categories (USD-equivalent)
  const clusteredCategoryData = useMemo((): GenericClusteredItem[] => {
    const items = STANDARD_CATEGORIES.map((cat) => {
      const catRecords = records.filter((r) => r['Fee Category'] === cat);
      const valVisaUsd = catRecords.reduce((acc, r) => acc + r.totalUsd, 0);
      const valBmriUsd = catRecords.reduce((acc, r) => acc + r.totalFeeBmriUsd, 0);

      return {
        category: cat,
        val1: valBmriUsd,
        val2: valVisaUsd,
      };
    });

    return items.sort((a, b) => (b.val1 + b.val2) - (a.val1 + a.val2));
  }, [records]);

  // 3. Main Visual: S-CURVE DATA: Kumulatif Fee Visa vs Fee BMRI (USD) & Deviasi Bulanan (Rp)
  const selectedPeriodIdx = isPeriodFiltered ? PERIODS.indexOf(filters.billingPeriod) : -1;
  const targetPeriods = useMemo(() => {
    if (isPeriodFiltered && selectedPeriodIdx !== -1) {
      return PERIODS.slice(0, selectedPeriodIdx + 1);
    }
    return PERIODS;
  }, [isPeriodFiltered, selectedPeriodIdx]);

  const sCurveData = useMemo((): SCurvePoint[] => {
    let cumVisa = 0;
    let cumBmri = 0;

    return targetPeriods.map((period) => {
      const pRecords = allRecords.filter((r) => r['Billing Period'] === period);
      const monthVisaUsd = pRecords.reduce((acc, r) => acc + r.totalUsd, 0);
      const monthBmriUsd = pRecords.reduce((acc, r) => acc + r.totalFeeBmriUsd, 0);
      const monthDeviasiIdr = pRecords.reduce((acc, r) => acc + Math.abs(r.selisihIdr), 0);

      cumVisa += monthVisaUsd;
      cumBmri += monthBmriUsd;

      return {
        period,
        monthlyDeviasiIdr: monthDeviasiIdr,
        cumVisaUsd: Math.round(cumVisa),
        cumBmriUsd: Math.round(cumBmri),
        cumGapUsd: Math.round(cumVisa - cumBmri),
      };
    });
  }, [allRecords, targetPeriods]);

  // 4. Supporting Visual: Donut: Current vs Previous (Labels "Current" and "Previous")
  const currentCount = records.filter((r) => r['Current or Previous'] === 'Current').length;
  const prevCount = records.filter((r) => r['Current or Previous'] === 'Previous').length;

  const donutCurrentPrev: DonutSlice[] = useMemo(() => {
    return [
      {
        label: 'Current',
        value: currentCount,
        color: '#2B6CB0', // Visa Blue
      },
      {
        label: 'Previous',
        value: prevCount,
        color: '#F5A800', // Gold highlight
      },
    ];
  }, [currentCount, prevCount]);

  // 5. Perlu Perhatian List: Top 5 Visa Deviations with Drill-through
  const topDeviations = useMemo((): PerluPerhatianItem[] => {
    return records
      .filter((r) => r.STATUS === 'Deviasi')
      .sort((a, b) => Math.abs(b.selisihIdr) - Math.abs(a.selisihIdr))
      .slice(0, 5)
      .map((r, idx) => ({
        id: `${r['Invoice ID']}-${r['Fee Name']}`,
        rank: idx + 1,
        kategori: r['Fee Category'],
        subDeskripsi: `${r['Fee Name']} · Inv: ${r['Invoice ID']}`,
        periode: r['Billing Period'],
        selisihIdr: r.selisihIdr,
        status: r.STATUS,
        principal: 'Visa',
        rawRecord: r,
      }));
  }, [records]);

  return (
    <div className="space-y-3.5">
      {/* 1. Kesimpulan Banner (Answer First - 5-Second Rule) */}
      <PbiKesimpulanBanner
        periodLabel={isPeriodFiltered ? `Visa · ${filters.billingPeriod}` : 'Visa · Jan - Okt 2026'}
        totalRows={kpis.totalRows}
        countSesuai={kpis.countMatch}
        countSelisih={kpis.countDeviasi}
        countBelumDicek={kpis.countUnrec}
        totalNominalSelisihIdr={kpis.totalNominalSelisihIdr}
        matchRate={kpis.matchRate}
        highlightCategory={topVisaCategory.topCat}
        principalName="Visa"
      />

      {/* 2. Simplified 4-Step Process Strip */}
      <PbiProcessStrip />

      {/* 3. 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Billing */}
        <PbiKpiCard
          title="Total Tagihan Visa"
          plainExplanation="Total nilai tagihan invoice resmi yang diterbitkan Visa"
          value={formatCompactVal(kpis.totalBillingUsd, 'USD')}
          subtext={`Rp ${(kpis.totalBillingUsd * 16250 / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} juta`}
          comparisonText="Ekuivalen USD"
          comparisonDirection="flat"
          accentColor="#2B6CB0"
          caraMembaca="Total tagihan fee dalam invoice Visa yang distandardisasi ke mata uang USD."
          onFocus={() =>
            onOpenFocus(
              'Total Tagihan Visa',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#2B6CB0] font-mono">
                  {formatCurrencyVal(kpis.totalBillingUsd, 'USD')}
                </span>
                <p className="text-xs text-[#6B7280] mt-2">
                  Total tagihan invoice Visa yang divalidasi ke hitungan internal Mandiri.
                </p>
              </div>
            )
          }
        />

        {/* KPI 2: Jumlah Baris Sesuai */}
        <PbiKpiCard
          title="Jumlah Sesuai"
          plainExplanation="Baris tagihan Visa yang nilainya cocok dengan hitungan internal"
          value={formatNumber(kpis.countMatch)}
          subtext="Item invoice tervalidasi"
          comparisonText="Sesuai Toleransi"
          comparisonDirection="flat"
          accentColor="#1E8E5A"
          caraMembaca="Jumlah baris tagihan Visa yang tidak memiliki selisih nominal terhadap perhitungan Bank Mandiri."
          onFocus={() =>
            onOpenFocus(
              'Baris Sesuai Visa',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#1E8E5A] font-mono">
                  {formatNumber(kpis.countMatch)} Baris
                </span>
              </div>
            )
          }
        />

        {/* KPI 3: Jumlah Ada Selisih */}
        <PbiKpiCard
          title="Ada Selisih"
          plainExplanation="Baris invoice Visa yang memiliki selisih nominal dengan fee internal"
          value={formatNumber(kpis.countDeviasi)}
          subtext={`Total selisih ${formatCompactRupiah(kpis.totalNominalSelisihIdr)}`}
          comparisonText="Perlu Verifikasi"
          comparisonDirection="up"
          isDeviationMetric={true}
          accentColor="#C62828"
          caraMembaca="Jumlah baris invoice yang membutuhkan investigasi lebih lanjut karena selisih perhitungan."
          onFocus={() =>
            onOpenFocus(
              'Baris Ada Selisih Visa',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#C62828] font-mono">
                  {formatNumber(kpis.countDeviasi)} Baris
                </span>
                <p className="text-xs text-[#6B7280] mt-2">
                  Total deviasi: {formatRupiah(kpis.totalNominalSelisihIdr)}
                </p>
              </div>
            )
          }
        />

        {/* KPI 4: Persentase Sesuai */}
        <PbiKpiCard
          title="Persentase Sesuai"
          plainExplanation="Tingkat kesesuaian nilai invoice Visa terhadap hitungan Mandiri"
          value={formatPercentage(kpis.matchRate)}
          subtext={kpis.matchRate >= 85 ? 'Kondisi sehat' : 'Di bawah batas nyaman'}
          comparisonText={kpis.matchRate >= 85 ? 'Memenuhi Standar' : 'Perlu Perhatian'}
          comparisonDirection={kpis.matchRate >= 85 ? 'up' : 'down'}
          isDeviationMetric={false}
          accentColor={kpis.matchRate >= 85 ? '#1E8E5A' : '#F5A800'}
          caraMembaca="Rasio baris sesuai terhadap total baris invoice Visa. Standar acuan adalah minimal 85%."
          onFocus={() =>
            onOpenFocus(
              'Persentase Sesuai Visa',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#2B6CB0] font-mono">
                  {formatPercentage(kpis.matchRate)}
                </span>
              </div>
            )
          }
        />
      </div>

      {/* 4. Visual Row: Main S-Curve Visual (7 cols) + Supporting Clustered (3 cols) + Supporting Donut (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Visual 1: S-CURVE CHART (widest visual, 7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <PbiSCurveLineClusteredColumnChart
            title={
              isPeriodFiltered
                ? `Kurva-S Fee Visa s.d. ${filters.billingPeriod}`
                : 'Kurva-S Akumulasi Fee Visa vs Hitungan Mandiri'
            }
            subtitle={
              isPeriodFiltered
                ? `Akumulasi progres fee hingga ${filters.billingPeriod} (USD) vs Deviasi Bulanan (Rp)`
                : 'Akumulasi Fee Visa (biru) vs BMRI (navy) dan Fluktuasi Selisih Bulanan (Rp)'
            }
            caraMembaca="Dua garis menunjukkan akumulasi tagihan Visa dan hitungan Mandiri. Semakin lebar jarak kedua garis, semakin besar selisihnya."
            data={sCurveData}
            onFocus={() =>
              onOpenFocus(
                'Kurva-S Fee Visa vs Fee BMRI',
                <PbiSCurveLineClusteredColumnChart
                  title={
                    isPeriodFiltered
                      ? `Kurva-S Fee Visa s.d. ${filters.billingPeriod}`
                      : 'Kurva-S Akumulasi Fee Visa vs Hitungan Mandiri'
                  }
                  data={sCurveData}
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Kurva_S_Fee_Visa_Kumulatif')}
            className="h-full min-h-[290px]"
          />
        </div>

        {/* Visual 2: Clustered Column per Fee Category (3 cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <PbiClusteredColumnChart
            title={
              isPeriodFiltered
                ? `Total Fee per Kategori (${filters.billingPeriod})`
                : 'Total Tagihan per Kategori Layanan'
            }
            subtitle={
              isPeriodFiltered
                ? `Komparasi 4 kategori untuk periode ${filters.billingPeriod} (USD)`
                : 'Assessment, Authorization, Interchange, Settlement (USD)'
            }
            caraMembaca="Membandingkan hitungan Mandiri (navy) vs invoice Visa (biru) per kategori transaksi."
            data={clusteredCategoryData}
            series1Name="Hitungan BMRI"
            series1Color="#003A70"
            series2Name="Invoice Visa"
            series2Color="#2B6CB0"
            currency="USD"
            onFocus={() =>
              onOpenFocus(
                'Total Fee per Kategori Visa',
                <PbiClusteredColumnChart
                  title="Total Fee per Kategori Layanan"
                  data={clusteredCategoryData}
                  series1Name="Hitungan BMRI"
                  series1Color="#003A70"
                  series2Name="Invoice Visa"
                  series2Color="#2B6CB0"
                  currency="USD"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Visa_BMRI_vs_Total_Category')}
            className="h-full"
          />
        </div>

        {/* Visual 3: Donut: Current vs Previous (2 cols) */}
        <div className="lg:col-span-2 flex flex-col">
          <PbiDonutChart
            title="Current vs Previous"
            subtitle="Porsi tagihan berjalan vs koreksi bulan lalu"
            caraMembaca="Menunjukkan porsi transaksi bulan berjalan (Current) dibandingkan klaim/penyesuaian dari bulan lalu (Previous)."
            data={donutCurrentPrev}
            centerLabel="Total Baris"
            centerValue={formatNumber(kpis.totalRows)}
            onFocus={() =>
              onOpenFocus(
                'Current vs Previous Tagihan Visa',
                <PbiDonutChart
                  title="Current vs Previous"
                  data={donutCurrentPrev}
                  centerLabel="Total Baris"
                  centerValue={formatNumber(kpis.totalRows)}
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Visa_Current_vs_Previous')}
            className="h-full"
          />
        </div>
      </div>

      {/* 5. Perlu Perhatian List: Top 5 Visa Deviasi with Drill-through */}
      <PbiPerluPerhatianTable
        items={topDeviations}
        title="Perlu Perhatian: 5 Deviasi Terbesar Visa"
        subtitle={`Daftar invoice Visa dengan nominal selisih tertinggi (${filters.billingPeriod})`}
        onDrillThrough={(item) => onDrillThroughItem && onDrillThroughItem(item)}
        onFocus={() =>
          onOpenFocus(
            'Perlu Perhatian: 5 Deviasi Terbesar Visa',
            <PbiPerluPerhatianTable
              items={topDeviations}
              onDrillThrough={(item) => onDrillThroughItem && onDrillThroughItem(item)}
              className="w-full h-full border-0 shadow-none"
            />
          )
        }
        onExportCsv={() => onExportCsv('Visa_Top5_Deviasi')}
      />
    </div>
  );
};
