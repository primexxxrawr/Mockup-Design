export type DeviationStatus = 'Match' | 'Deviasi' | 'Belum Direkonsiliasi';

export type PipelineStatus = 'Selesai' | 'Berjalan' | 'Menunggu';

export interface PipelineStep {
  id: string;
  name: string;
  status: PipelineStatus;
  primaryMetric: string;
  secondaryInfo: string;
}

// 0) BASELINE CONSTANTS & HELPER FUNCTIONS
// Reference rate constant (assumption)
export const USD_IDR_RATE = 16250;

// Tolerance defined in ONE place (default 0)
export const RECONCILIATION_TOLERANCE = 0;

// Currency conversions
export const idrToUsd = (idr: number): number => idr / USD_IDR_RATE;
export const usdToIdr = (usd: number): number => usd * USD_IDR_RATE;

// 1) FOUR STANDARD CATEGORIES
export const STANDARD_CATEGORIES = [
  'Assessment',
  'Authorization',
  'Interchange',
  'Settlement',
] as const;

export type StandardCategory = (typeof STANDARD_CATEGORIES)[number];

// Display translations & tokens (retaining internal data model values)
export const getStatusDisplayLabel = (status: DeviationStatus): string => {
  switch (status) {
    case 'Match':
      return 'Sesuai';
    case 'Deviasi':
      return 'Ada Selisih';
    case 'Belum Direkonsiliasi':
      return 'Belum Dicek';
    default:
      return status;
  }
};

export const BRAND_COLORS = {
  navy: '#003A70',
  gold: '#F5A800',
  canvas: '#F4F6F9',
  card: '#FFFFFF',
  border: '#E1E5EB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  statusSesuai: '#1E8E5A',
  statusSelisih: '#C62828',
  statusBelumDicek: '#8A93A0',
  visaBlue: '#2B6CB0',
  mastercardOrange: '#E8832A',
} as const;

// Mastercard Record Schema - 20 exact columns + derived fields (Minggu, Bulan, Status, Catatan)
export interface MastercardRecord {
  NO: number;
  TANGGAL: string; // Week-start date (e.g. "2026-01-05")
  'EVENT ID': string;
  'TIER EVENT': string;
  DESC: string;
  'BY SV / BY QTY': 'BY SV' | 'BY QTY';
  'QTY MANDIRI': number;
  'RATE MANDIRI': number;
  'CHARGE MANDIRI': number;
  'TAX MANDIRI': number;
  'TOTAL MANDIRI': number;
  'QTY MASTERCARD': number;
  'RATE MASTERCARD': number;
  'CHARGE MASTERCARD': number;
  'TAX MASTERCARD': number;
  'TOTAL MASTERCARD': number;
  SELISIH: number; // in IDR: TOTAL MASTERCARD - TOTAL MANDIRI
  'PERSENTASE SELISIH': number;
  'SERVICE KATEGORI': StandardCategory;
  'BILLABLE ICA': string;
  // Derived metadata
  Minggu: string; // e.g. "W01 2026"
  Bulan: string; // e.g. "Jan 2026"
  selisihUsd: number; // USD-equivalent
  totalMandiriUsd: number;
  totalMcUsd: number;
  STATUS: DeviationStatus;
  CATATAN: string; // Empty per prompt instruction
  penyebabQty?: number;
  penyebabRate?: number;
  penyebabTax?: number;
}

// Visa Record Schema - 24 exact columns + derived fields
export interface VisaRecord {
  'Billing Period': string; // Monthly: "Jan 2026" ... "Okt 2026"
  'Invoice Date': string; // Monthly date e.g. "2026-01-20"
  'Invoice ID': string;
  'Current or Previous': 'Current' | 'Previous';
  Mapping: string;
  'Settlement ID': string;
  'Fee Category': StandardCategory; // Exactly one of the 4 standard categories
  'Fee Group': string; // e.g. "Grup 01"
  'Fee Name': string; // e.g. "Fee Name 01"
  'Billing Line': string;
  'Invoice Description': string;
  'Billing Line Custom Description': string;
  Type: string;
  'Rate Type': string;
  Units: number;
  'Rate Cur': string;
  Rate: number;
  'Foreign Exchange Rate': number; // e.g. 16250
  'Billing Currency': 'USD' | 'IDR'; // mostly USD, some IDR
  Total: number; // Visa invoice amount in Billing Currency
  'Jumlah Units BMRI': number;
  'Total Fee BMRI': number; // Mandiri calculated fee in Billing Currency
  Selisih: number; // Selisih in Billing Currency (Total - Total Fee BMRI)
  'Persentase Selisih': number;
  // Converted fields (Baseline rules)
  totalUsd: number; // USD-equivalent Total
  totalFeeBmriUsd: number; // USD-equivalent BMRI fee
  selisihUsd: number; // USD-equivalent Selisih
  selisihIdr: number; // Displayed Selisih in IDR
  STATUS: DeviationStatus;
  CATATAN: string; // Empty per prompt instruction
}

// Mastercard Slicers Filter State
export interface MastercardFilterState {
  minggu: string; // 'Semua' or "W01 2026" ... "W43 2026"
  bulan: string; // 'Semua' or "Jan 2026" ... "Okt 2026"
  serviceKategori: string; // 'Semua' or StandardCategory
  tierEvent: string; // 'Semua' or "Tier 1" ...
  bySvByQty: string; // 'Semua' | 'BY SV' | 'BY QTY'
  billableIca: string; // 'Semua' | "ICA 001" ...
  status: string; // 'Semua' | DeviationStatus
  searchQuery: string;
}

// Visa Slicers Filter State
export interface VisaFilterState {
  billingPeriod: string; // 'Semua' or "Jan 2026" ... "Okt 2026"
  invoiceId: string; // 'Semua' or "INV-..."
  currentOrPrevious: string; // 'Semua' | 'Current' | 'Previous'
  feeCategory: string; // 'Semua' or StandardCategory
  type: string; // 'Semua' | "Type 1" ...
  status: string; // 'Semua' | DeviationStatus
  searchQuery: string;
}

// Overview Slicers Filter State
export interface OverviewFilterState {
  periode: string; // 'Semua' | "Jan 2026" ... "Okt 2026"
  status: string; // 'Semua' | DeviationStatus
  searchQuery: string;
}

export type ScreenTab = 'Ringkasan' | 'Visa' | 'Mastercard' | 'Detail Deviasi';

export type ViewportMode = 'fit-page' | 'fit-width' | 'native-1080';
