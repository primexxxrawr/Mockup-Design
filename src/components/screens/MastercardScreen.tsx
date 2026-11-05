import React, { useMemo } from 'react';
import { MastercardRecord, MastercardFilterState, PipelineStep } from '../../types';
import { PbiKpiCard } from '../pbi/PbiKpiCard';
import { PbiClusteredColumnChart, GenericClusteredItem } from '../pbi/PbiClusteredColumnChart';
import { PbiLineChart, LineChartPoint } from '../pbi/PbiLineChart';
import { PbiPenyebabSelisihChart, CauseItem } from '../pbi/PbiPenyebabSelisihChart';
import { PbiMastercardKeyTable } from '../pbi/PbiMastercardKeyTable';
import { PbiProcessStrip } from '../pbi/PbiProcessStrip';
import {
  SERVICE_KATEGORI_MASTERCARD,
  PERIODS,
  formatCompactRupiah,
  formatNumber,
  formatPercentage,
  formatRupiah,
} from '../../data/mockData';

interface MastercardScreenProps {
  records: MastercardRecord[];
  allRecords: MastercardRecord[];
  filters: MastercardFilterState;
  pipelineSteps: PipelineStep[];
  onRefreshPipeline: () => void;
  isRefreshingPipeline: boolean;
  onSelectRecord: (record: MastercardRecord) => void;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onExportCsv: (visualName: string) => void;
}

export const MastercardScreen: React.FC<MastercardScreenProps> = ({
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
    const totalChargeMc = records.reduce((acc, r) => acc + r['CHARGE MASTERCARD'], 0);
    const totalMc = records.reduce((acc, r) => acc + r['TOTAL MASTERCARD'], 0);
    const countMatch = records.filter((r) => r.STATUS === 'Match').length;
    const countDeviasi = records.filter((r) => r.STATUS === 'Deviasi').length;
    const totalNominalSelisih = records.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);
    const totalRows = records.length || 1;
    const matchRate = (countMatch / totalRows) * 100;

    return {
      totalChargeMc,
      totalMc,
      countMatch,
      countDeviasi,
      totalNominalSelisih,
      matchRate,
      totalRows,
    };
  }, [records]);

  // 2. Clustered Column: Total Mandiri vs Total Mastercard per Service Kategori
  const clusteredCategoryData = useMemo((): GenericClusteredItem[] => {
    return SERVICE_KATEGORI_MASTERCARD.map((kat) => {
      const katRecords = records.filter((r) => r['SERVICE KATEGORI'] === kat);
      const valMandiri = katRecords.reduce((acc, r) => acc + r['TOTAL MANDIRI'], 0);
      const valMc = katRecords.reduce((acc, r) => acc + r['TOTAL MASTERCARD'], 0);

      return {
        category: kat,
        val1: valMandiri,
        val2: valMc,
      };
    });
  }, [records]);

  // 3. Line Chart: Tren Selisih per Bulan
  const lineChartData = useMemo((): LineChartPoint[] => {
    const dataSource = filters.periode === 'Semua' ? records : allRecords;

    return PERIODS.map((period) => {
      const pRecords = dataSource.filter((r) => r.PERIODE === period);
      const selisih = pRecords.reduce((acc, r) => acc + Math.abs(r.SELISIH), 0);

      return {
        period,
        singleValue: selisih,
      };
    });
  }, [records, allRecords, filters.periode]);

  // 4. Bar Chart: Penyebab Selisih (Qty, Rate, Tax)
  const causesData = useMemo((): CauseItem[] => {
    const totalQtyDiff = records.reduce((acc, r) => acc + (r.penyebabQty || 0), 0);
    const totalRateDiff = records.reduce((acc, r) => acc + (r.penyebabRate || 0), 0);
    const totalTaxDiff = records.reduce((acc, r) => acc + (r.penyebabTax || 0), 0);

    return [
      {
        id: 'qty',
        name: 'Selisih Volume (Qty)',
        nominal: totalQtyDiff,
        color: '#0078D4',
        keterangan: 'Perbedaan hitungan jumlah transaksi Mandiri vs Mastercard',
      },
      {
        id: 'rate',
        name: 'Selisih Tarif (Rate)',
        nominal: totalRateDiff,
        color: '#EB001B',
        keterangan: 'Perbedaan tier rate atau rate per event fee',
      },
      {
        id: 'tax',
        name: 'Selisih Pajak (Tax)',
        nominal: totalTaxDiff,
        color: '#F79E1B',
        keterangan: 'Selisih pembulatan tarif PPN (11%) pada billing',
      },
    ];
  }, [records]);

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="bg-[#EB001B] text-white px-4 py-2 rounded-[2px] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#EB001B] border border-white" />
            <span className="w-4 h-4 rounded-full bg-[#F79E1B] border border-white opacity-90" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold leading-tight">
              Rekonsiliasi Billing Mastercard (IDR)
            </h2>
            <p className="text-[10px] text-red-100">
              Evaluasi komparasi tagihan QTY, RATE, CHARGE, dan TAX pembukuan Mandiri vs Mastercard
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] font-medium hidden sm:block">
          <span className="text-red-100">Aksen:</span> Merah &amp; Oranye (#EB001B / #F79E1B)
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
          title="Total Charge Mastercard"
          value={formatCompactRupiah(kpis.totalChargeMc)}
          subtext={`Total Bill: ${formatCompactRupiah(kpis.totalMc)}`}
          trendText="Sebelum Pajak"
          trendType="neutral"
          accentColor="#EB001B"
          onFocus={() =>
            onOpenFocus(
              'Total Charge Mastercard',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#EB001B] font-mono">
                  {formatRupiah(kpis.totalChargeMc)}
                </span>
                <p className="text-xs text-[#605E5C] mt-2">
                  Total nominal CHARGE MASTERCARD yang ditagihkan sebelum komponen TAX (PPN).
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
          accentColor="#EB001B"
          onFocus={() =>
            onOpenFocus(
              'Jumlah Baris Deviasi',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#EB001B] font-mono">
                  {formatNumber(kpis.countDeviasi)}
                </span>
              </div>
            )
          }
        />

        <PbiKpiCard
          title="Total Nominal Selisih"
          value={formatCompactRupiah(kpis.totalNominalSelisih)}
          subtext="Absolut Selisih"
          trendText="TOTAL MC - MANDIRI"
          trendType="negative"
          accentColor="#EB001B"
          onFocus={() =>
            onOpenFocus(
              'Total Nominal Selisih',
              <div className="p-4 text-center">
                <span className="text-4xl font-bold text-[#EB001B] font-mono">
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

      {/* 3 Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Visual 1: Clustered Column: Total Mandiri vs Total Mastercard per Service Kategori */}
        <div className="lg:col-span-5 flex flex-col">
          <PbiClusteredColumnChart
            title="Total Mandiri vs Total Mastercard per Service Kategori"
            subtitle="Perbandingan Nilai Buku Mandiri vs Tagihan Mastercard"
            data={clusteredCategoryData}
            series1Name="Total Mandiri"
            series1Color="#0078D4"
            series2Name="Total Mastercard"
            series2Color="#EB001B"
            currency="IDR"
            onFocus={() =>
              onOpenFocus(
                'Total Mandiri vs Total Mastercard per Service Kategori',
                <PbiClusteredColumnChart
                  title="Total Mandiri vs Total Mastercard per Service Kategori"
                  data={clusteredCategoryData}
                  series1Name="Total Mandiri"
                  series1Color="#0078D4"
                  series2Name="Total Mastercard"
                  series2Color="#EB001B"
                  currency="IDR"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Mandiri_vs_Mastercard_Kategori')}
            className="h-full"
          />
        </div>

        {/* Visual 2: Line Chart: Tren Selisih per Bulan */}
        <div className="lg:col-span-4 flex flex-col">
          <PbiLineChart
            title="Tren Selisih per Bulan (Mastercard)"
            subtitle="Nominal Deviasi Bulanan (Jan - Okt 2026)"
            data={lineChartData}
            mode="mc-only"
            onFocus={() =>
              onOpenFocus(
                'Tren Selisih per Bulan',
                <PbiLineChart
                  title="Tren Selisih per Bulan (Mastercard)"
                  data={lineChartData}
                  mode="mc-only"
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Tren_Selisih_Bulan_MC')}
            className="h-full"
          />
        </div>

        {/* Visual 3: Bar Chart: Penyebab Selisih (Qty, Rate, Tax) */}
        <div className="lg:col-span-3 flex flex-col">
          <PbiPenyebabSelisihChart
            title="Penyebab Selisih (Qty, Rate, Tax)"
            subtitle="Dekomposisi asal mula deviasi tagihan"
            causes={causesData}
            onFocus={() =>
              onOpenFocus(
                'Penyebab Selisih (Qty, Rate, Tax)',
                <PbiPenyebabSelisihChart
                  title="Penyebab Selisih (Qty, Rate, Tax)"
                  causes={causesData}
                  className="w-full h-full border-0 shadow-none"
                />
              )
            }
            onExportCsv={() => onExportCsv('Penyebab_Selisih_MC')}
            className="h-full"
          />
        </div>
      </div>

      {/* Table: Matrix with KEY columns only */}
      <PbiMastercardKeyTable
        title="Daftar Rekonsiliasi Mastercard (Kolom Kunci)"
        subtitle="Klik baris mana pun untuk melihat seluruh 20 kolom audit trail"
        records={records}
        onSelectRecord={onSelectRecord}
        onFocus={() =>
          onOpenFocus(
            'Daftar Rekonsiliasi Mastercard (Kolom Kunci)',
            <PbiMastercardKeyTable
              title="Daftar Rekonsiliasi Mastercard (Kolom Kunci)"
              records={records}
              onSelectRecord={onSelectRecord}
              className="w-full h-full border-0 shadow-none"
            />
          )
        }
        onExportCsv={() => onExportCsv('Mastercard_Key_Columns')}
      />
    </div>
  );
};
