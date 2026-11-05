export type DeviationStatus = 'Match' | 'Deviasi' | 'Belum Direkonsiliasi';

export type PipelineStatus = 'Selesai' | 'Berjalan' | 'Menunggu';

export interface PipelineStep {
  id: string;
  name: string;
  status: PipelineStatus;
  primaryMetric: string;
  secondaryInfo: string;
}

// Tolerance defined in ONE place (default 0)
export const RECONCILIATION_TOLERANCE = 0;

// Mastercard Record Schema - 20 exact columns + Status & Catatan
export interface MastercardRecord {
  NO: number;
  TANGGAL: string;
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
  SELISIH: number;
  'PERSENTASE SELISIH': number;
  'SERVICE KATEGORI': string;
  'BILLABLE ICA': string;
  // Computed / metadata
  STATUS: DeviationStatus;
  CATATAN: string; // Left empty per prompt instruction
  PERIODE: string; // e.g. "Jan 2026"
  // Breakdown of causes for deviation
  penyebabQty?: number;
  penyebabRate?: number;
  penyebabTax?: number;
}

// Visa Record Schema - 24 exact columns + Status & Catatan
export interface VisaRecord {
  'Billing Period': string;
  'Invoice Date': string;
  'Invoice ID': string;
  'Current or Previous': 'Current' | 'Previous';
  Mapping: string;
  'Settlement ID': string;
  'Fee Category': string;
  'Fee Group': string;
  'Fee Name': string;
  'Billing Line': string;
  'Invoice Description': string;
  'Billing Line Custom Description': string;
  Type: string;
  'Rate Type': string;
  Units: number;
  'Rate Cur': string;
  Rate: number;
  'Foreign Exchange Rate': number;
  'Billing Currency': string; // mostly "USD", some "IDR"
  Total: number; // Visa total invoice amount
  'Jumlah Units BMRI': number;
  'Total Fee BMRI': number; // Mandiri total fee
  Selisih: number; // Total - Total Fee BMRI
  'Persentase Selisih': number;
  // Computed / metadata
  STATUS: DeviationStatus;
  CATATAN: string; // Left empty per prompt instruction
}

// Mastercard Slicers Filter State
export interface MastercardFilterState {
  periode: string; // 'Semua' or "Jan 2026" ...
  serviceKategori: string; // 'Semua' or "Kategori A" ...
  tierEvent: string; // 'Semua' or "Tier 1" ...
  bySvByQty: string; // 'Semua' | 'BY SV' | 'BY QTY'
  billableIca: string; // 'Semua' | "ICA 001" ...
  status: string; // 'Semua' | DeviationStatus
  searchQuery: string;
}

// Visa Slicers Filter State
export interface VisaFilterState {
  billingPeriod: string; // 'Semua' or "Jan 2026" ...
  invoiceId: string; // 'Semua' or "INV-..."
  currentOrPrevious: string; // 'Semua' | 'Current' | 'Previous'
  feeCategory: string; // 'Semua' | "Kategori A" ...
  type: string; // 'Semua' | "Type 1" ...
  status: string; // 'Semua' | DeviationStatus
  searchQuery: string;
}

// Overview Slicers Filter State
export interface OverviewFilterState {
  periode: string; // 'Semua' | "Jan 2026" ...
  status: string; // 'Semua' | DeviationStatus
  searchQuery: string;
}

export type ScreenTab = 'Ringkasan' | 'Visa' | 'Mastercard' | 'Detail Deviasi';

export type ViewportMode = 'fit-page' | 'fit-width' | 'native-1080';
