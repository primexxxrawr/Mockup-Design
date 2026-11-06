import React, { useMemo } from 'react';
import { MastercardRecord, MastercardFilterState, PipelineStep, STANDARD_CATEGORIES } from '../../types';
import { PbiKpiCard } from '../pbi/PbiKpiCard';
import { PbiClusteredColumnChart, GenericClusteredItem } from '../pbi/PbiClusteredColumnChart';
import { PbiLineChart, LineChartPoint } from '../pbi/PbiLineChart';
import { PbiDonutChart, DonutSlice } from '../pbi/PbiDonutChart';
import { PbiProcessStrip } from '../pbi/PbiProcessStrip';
import { PbiKesimpulanBanner } from '../pbi/PbiKesimpulanBanner';
import { PbiPerluPerhatianTable, PerluPerhatianItem } from '../pbi/PbiPerluPerhatianTable';
import {
  WEEKS,
  formatCompactRupiah,
  formatNumber,
  formatPercentage,
  formatRupiah,
} from '../../data/mockData';

interface MastercardScreenProps {
  records: MastercardRecord[];
  allRecords: MastercardRecord[];
  filters: MastercardFilterState;
  pipelineSteps?: PipelineStep[];
  onRefreshPipeline?: () => void;
  isRefreshingPipeline?: boolean;
  onSelectRecord: (record: MastercardRecord) => void;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onExportCsv: (visualName: string) => void;
  onDrillThroughItem?: (item: PerluPerhatianItem) => void;
}

export const MastercardScreen: React.FC<MastercardScreenProps> = ({
  records,
  allRecords,
  filters,
  onOpenFocus,
  onExportCsv,
  onDrillThroughItem,
}) => {
  const isMonthFiltered = filters.bulan !== 'Semua';

  // 1. KPI Cards (in IDR)
  const kpis = useMemo(() => {
    const totalMc = records.reduce((acc, r) => acc + r['TOTAL MASTERCARD'], 0);
    const countMatch = records.filter((r) => r.STATUS === 'Match').length;
    const countDeviasi = records.filter((r) => r.STATUS === 'Deviasi').length;
    const countUnrec = records.filter((r) => r.STATUS === 'Belum Direkonsiliasi').length;
    const totalNominalSelisih = records.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
    const totalRows = records.length || 1;
    const matchRate = (countMatch / totalRows) * 100;

    return {
      totalMc,
      countMatch,
      countDeviasi,
      countUnrec,
      totalNominalSelisih,
      matchRate,
      totalRows,
    };
  }, [records]);

  // Top Category deviation in Mastercard
  const topMcCategory = useMemo(() => {
    let topCat = 'Interchange';
    let topVal = 0;
    STANDARD_CATEGORIES.forEach((cat) => {
      const val = records
        .filter((r) => r['SERVICE KATEGORI'] === cat)
        .reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
      if (val > topVal) {
        topVal = val;
        topCat = cat;
      }
    });
    return { topCat, topVal };
  }, [records]);

  // 2. Supporting Visual: Clustered Column per 4 Categories (Mandiri vs Mastercard in IDR)
  const clusteredCategoryData = useMemo((): GenericClusteredItem[] => {
    const items = STANDARD_CATEGORIES.map((kat) => {
      const katRecords = records.filter((r) => r['SERVICE KATEGORI'] === kat);
      const valMandiri = katRecords.reduce((acc, r) => acc + r['TOTAL MANDIRI'], 0);
      const valMc = katRecords.reduce((acc, r) => acc + r['TOTAL MASTERCARD'], 0);

      return {
        category: kat,
        val1: valMandiri,
        val2: valMc,
      };
    });

    return items.sort((a, b) => (b.val1 + b.val2) - (a.val1 + a.val2));
  }, [records]);

  // 3. Main Visual: Line Chart: Tren Selisih per Minggu (W01 - W43 2026 atau sesuai Bulan)
  const targetWeeks = useMemo(() => {
    if (isMonthFiltered) {
      return WEEKS.filter((w) => w.month === filters.bulan);
    }
    return WEEKS;
  }, [isMonthFiltered, filters.bulan]);

  const lineChartData = useMemo((): LineChartPoint[] => {
    return targetWeeks.map((w) => {
      const wRecords = allRecords.filter((r) => r.Minggu === w.weekCode);
      const selisih = wRecords.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);

      return {
        period: `${w.weekCode} (${w.startDate})`,
        singleValue: selisih,
      };
    });
  }, [targetWeeks, allRecords]);

  // 4. Supporting Visual: Donut: Komposisi Status Rekonsiliasi Mastercard
  const donutStatusData: DonutSlice[] = useMemo(() => {
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
        value: kpis.countUnrec,
        color: '#8A93A0', // Grey reserved for Belum Dicek
      },
    ];
  }, [kpis]);

  // 5. Perlu Perhatian List: Top 5 Mastercard Deviations with Drill-through
  const topDeviations = useMemo((): PerluPerhatianItem[] => {
    return records
      .filter((r) => r.STATUS === 'Deviasi')
      .sort((a, b) => Math.abs(b.SELISIH) - Math.abs(a.SELISIH))
      .slice(0, 5)
      .map((r, idx) => ({
        id: `${r['EVENT ID']}-${r.NO}`,
        rank: idx + 1,
        kategori: r['SERVICE KATEGORI'],
        subDeskripsi: `${r.DESC} · Event ID: ${r['EVENT ID']}`,
        periode: r.Minggu,
        selisihIdr: r.SELISIH,
        status: r.STATUS,
        principal: 'Mastercard',
        rawRecord: r,
      }));
  }, [records]);

  return (
    <div className="space-y-3.5">
      {/* 1. Kesimpulan Banner (Answer First - 5-Second Rule) */}
      <PbiKesimpulanBanner
        periodLabel={isMonthFiltered ? `Mastercard · ${filters.bulan}` : 'Mastercard · Jan - Okt 2026'}
        totalRows={kpis.totalRows}
        countSesuai={kpis.countMatch}
        countSelisih={kpis.countDeviasi}
        countBelumDicek={kpis.countUnrec}
        totalNominalSelisihIdr={kpis.totalNominalSelisih}
        matchRate={kpis.matchRate}
        highlightCategory={topMcCategory.topCat}
        principalName="Mastercard"
      />

      {/* 2. Simplified 4-Step Process Strip */}
      <PbiProcessStrip />

      {/* 3. 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Billing */}
        <PbiKpiCard
          title="Total Tagihan Mastercard"
          plainExplanation="Total nilai tagihan resmi mingguan yang ditagihkan Mastercard"
          value={formatCompactRupiah(kpis.totalMc)}
          subtext={`${formatNumber(kpis.totalRows)} transaksi mingguan`}
          comparisonText="Mata Uang IDR"
          comparisonDirection="flat"
          accentColor="#E8832A"
          caraMembaca="Total tagihan fee resmi dari Mastercard dalam mata uang Rupiah atas batch mingguan."
          onFocus={() =>
            onOpenFocus(
              'Total Tagihan Mastercard',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#E8832A] font-mono">
                  {formatRupiah(kpis.totalMc)}
                </span>
                <p className="text-xs text-[#6B7280] mt-2">
                  Total tagihan invoice fee Mastercard yang ditagihkan melalui ICA resmi.
                </p>
              </div>
            )
          }
        />

        {/* KPI 2: Jumlah Baris Sesuai */}
        <PbiKpiCard
          title="Jumlah Sesuai"
          plainExplanation="Baris tagihan Mastercard yang nominalnya cocok dengan hitungan internal"
          value={formatNumber(kpis.countMatch)}
          subtext="Item billing tervalidasi"
          comparisonText="Sesuai Toleransi"
          comparisonDirection="flat"
          accentColor="#1E8E5A"
          caraMembaca="Jumlah baris billing mingguan Mastercard yang terverifikasi sama persis dengan perhitungan internal Mandiri."
          onFocus={() =>
            onOpenFocus(
              'Baris Sesuai Mastercard',
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
          plainExplanation="Baris tagihan Mastercard yang nominalnya berbeda dengan perhitungan BMRI"
          value={formatNumber(kpis.countDeviasi)}
          subtext={`Total selisih ${formatCompactRupiah(kpis.totalNominalSelisih)}`}
          comparisonText="Perlu Investigasi"
          comparisonDirection="up"
          isDeviationMetric={true}
          accentColor="#C62828"
          caraMembaca="Jumlah item tagihan mingguan yang memiliki perbedaan nominal volume, tarif, atau PPN."
          onFocus={() =>
            onOpenFocus(
              'Baris Ada Selisih Mastercard',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#C62828] font-mono">
                  {formatNumber(kpis.countDeviasi)} Baris
                </span>
                <p className="text-xs text-[#6B7280] mt-2">
                  Total deviasi: {formatRupiah(kpis.totalNominalSelisih)}
                </p>
              </div>
            )
          }
        />

        {/* KPI 4: Persentase Sesuai */}
        <PbiKpiCard
          title="Persentase Sesuai"
          plainExplanation="Tingkat kesesuaian nilai invoice Mastercard terhadap hitungan Mandiri"
          value={formatPercentage(kpis.matchRate)}
          subtext={kpis.matchRate >= 85 ? 'Kondisi sehat' : 'Di bawah batas nyaman'}
          comparisonText={kpis.matchRate >= 85 ? 'Memenuhi Standar' : 'Perlu Perhatian'}
          comparisonDirection={kpis.matchRate >= 85 ? 'up' : 'down'}
          isDeviationMetric={false}
          accentColor={kpis.matchRate >= 85 ? '#1E8E5A' : '#F5A800'}
          caraMembaca="Rasio baris sesuai terhadap total baris penagihan Mastercard. Target acuan minimal 85%."
          onFocus={() =>
            onOpenFocus(
              'Persentase Sesuai Mastercard',
              <div className="p-5 text-center">
                <span className="text-4xl font-bold text-[#E8832A] font-mono">
                  {formatPercentage(kpis.matchRate)}
                </span>
              </div>
            )
          }
        />
      </div>

      {/* 4. Visual Row: Main Weekly Trend (7 cols) + Supporting Clustered (3 cols) + Supporting Donut (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Visual 1: Main Story Line Chart (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <PbiLineChart
            title={
              isMonthFiltered
                ? `Tren Deviasi Mingguan Bulan ${filters.bulan}`
                : 'Tren Nominal Selisih per Minggu (W01 - W43 2026)'
            }
            subtitle={
              isMonthFiltered
                ? `Pergerakan deviasi per minggu siklus penagihan ${filters.bulan} (Rp)`
                : 'Pergerakan deviasi nominal mingguan Mastercard sepanjang tahun 2026 (Rp)'
            }
            caraMembaca="Grafik garis memperlihatkan lonjakan selisih nominal per minggu pelaporan Mastercard."
            data={lineChartData}
            mode="mc-only"
            onFocus={() =>
              onOpenFocus(
                'Tren Selisih Mingguan Mastercard',
                <PbiLineChart
                  title={
                    isMonthFiltered
                      ? `Tren Deviasi Mingguan Bulan ${filters.bulan}`
                      : 'Tren Nominal Selisih per Minggu (W01 - W43 2026)'
                  }
                  data={lineChartData}
                  mode="mc-only"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Mastercard_Tren_Mingguan')}
            className="h-full min-h-[290px]"
          />
        </div>

        {/* Visual 2: Clustered Column per Service Kategori (3 cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <PbiClusteredColumnChart
            title={
              isMonthFiltered
                ? `Total Fee per Kategori (${filters.bulan})`
                : 'Total Tagihan per Kategori Layanan'
            }
            subtitle="Assessment, Authorization, Interchange, Settlement (Rp)"
            caraMembaca="Membandingkan total perhitungan Mandiri (navy) vs tagihan Mastercard (oranye) per kategori."
            data={clusteredCategoryData}
            series1Name="Hitungan BMRI"
            series1Color="#003A70"
            series2Name="Tagihan MC"
            series2Color="#E8832A"
            currency="IDR"
            onFocus={() =>
              onOpenFocus(
                'Komparasi Total per Kategori Mastercard',
                <PbiClusteredColumnChart
                  title="Total Tagihan per Kategori Layanan"
                  data={clusteredCategoryData}
                  series1Name="Hitungan BMRI"
                  series1Color="#003A70"
                  series2Name="Tagihan MC"
                  series2Color="#E8832A"
                  currency="IDR"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Mastercard_Mandiri_vs_MC_Kategori')}
            className="h-full"
          />
        </div>

        {/* Visual 3: Donut: Komposisi Status Tagihan Mastercard (2 cols) */}
        <div className="lg:col-span-2 flex flex-col">
          <PbiDonutChart
            title="Komposisi Status Tagihan"
            subtitle="Porsi Sesuai, Ada Selisih, Belum Dicek"
            caraMembaca="Porsi baris tagihan yang sudah sesuai vs yang masih memiliki perbedaan nominal."
            data={donutStatusData}
            centerLabel="Total Baris"
            centerValue={formatNumber(kpis.totalRows)}
            onFocus={() =>
              onOpenFocus(
                'Komposisi Status Mastercard',
                <PbiDonutChart
                  title="Komposisi Status Tagihan"
                  data={donutStatusData}
                  centerLabel="Total Baris"
                  centerValue={formatNumber(kpis.totalRows)}
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Mastercard_Status_Donut')}
            className="h-full"
          />
        </div>
      </div>

      {/* 5. Perlu Perhatian List: Top 5 Mastercard Deviasi with Drill-through */}
      <PbiPerluPerhatianTable
        items={topDeviations}
        title="Perlu Perhatian: 5 Deviasi Terbesar Mastercard"
        subtitle={`Transaksi mingguan dengan nominal selisih tertinggi (${filters.bulan})`}
        onDrillThrough={(item) => onDrillThroughItem && onDrillThroughItem(item)}
        onFocus={() =>
          onOpenFocus(
            'Perlu Perhatian: 5 Deviasi Terbesar Mastercard',
            <PbiPerluPerhatianTable
              items={topDeviations}
              onDrillThrough={(item) => onDrillThroughItem && onDrillThroughItem(item)}
              className="w-full h-full border-0 shadow-none"
            />
          )
        }
        onExportCsv={() => onExportCsv('Mastercard_Top5_Deviasi')}
      />
    </div>
  );
};
