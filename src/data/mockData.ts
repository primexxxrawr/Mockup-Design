import {
  MastercardRecord,
  VisaRecord,
  PipelineStep,
  RECONCILIATION_TOLERANCE,
} from '../types';

export const PERIODS = [
  'Jan 2026',
  'Feb 2026',
  'Mar 2026',
  'Apr 2026',
  'Mei 2026',
  'Jun 2026',
  'Jul 2026',
  'Agu 2026',
  'Sep 2026',
  'Okt 2026',
];

export const SERVICE_KATEGORI_MASTERCARD = [
  'Kategori A',
  'Kategori B',
  'Kategori C',
  'Kategori D',
];

export const TIER_EVENT_MASTERCARD = ['Tier 1', 'Tier 2', 'Tier 3'];

export const BILLABLE_ICA_MASTERCARD = ['ICA 001', 'ICA 002', 'ICA 003', 'ICA 004'];

export const FEE_CATEGORY_VISA = [
  'Kategori A',
  'Kategori B',
  'Kategori C',
  'Kategori D',
];

export const FEE_GROUP_VISA = ['Grup 1', 'Grup 2', 'Grup 3'];

export const TYPE_VISA = ['Type 1', 'Type 2', 'Type 3'];

// 1. Generate Mastercard Dummy Records (Jan - Okt 2026)
export const generateMastercardData = (): MastercardRecord[] => {
  const records: MastercardRecord[] = [];
  let no = 1;

  PERIODS.forEach((period, pIdx) => {
    const monthNum = (pIdx + 1).toString().padStart(2, '0');

    // 12 rows per period for rich granularity
    for (let i = 0; i < 12; i++) {
      const day = ((i * 2 + 3) % 28 + 1).toString().padStart(2, '0');
      const tanggal = `2026-${monthNum}-${day}`;
      const eventId = `EVT-${(1000 + (pIdx * 12) + i)}`;
      const tierEvent = TIER_EVENT_MASTERCARD[i % TIER_EVENT_MASTERCARD.length];
      const desc = `Deskripsi Transaksi ${(i + 1).toString().padStart(2, '0')}`;
      const bySvByQty: 'BY SV' | 'BY QTY' = i % 3 === 0 ? 'BY SV' : 'BY QTY';
      const serviceKategori = SERVICE_KATEGORI_MASTERCARD[i % SERVICE_KATEGORI_MASTERCARD.length];
      const billableIca = BILLABLE_ICA_MASTERCARD[i % BILLABLE_ICA_MASTERCARD.length];

      // Seed for deterministic variety
      const seed = (pIdx * 19 + i * 7 + 13) % 100;

      // Base Quantities and Rates
      const qtyBase = 12000 + (seed * 450);
      const rateBase = bySvByQty === 'BY QTY' ? 4500 + ((seed % 10) * 250) : 1;

      // Determine match vs deviation vs unreconciled
      let isUnreconciled = false;
      let isDeviasi = false;

      // In Okt 2026, 2 rows have empty Mandiri values -> Belum Direkonsiliasi
      if (pIdx === 9 && (i === 10 || i === 11)) {
        isUnreconciled = true;
      } else if (seed > 84) {
        // ~15% deviation => ~85% match rate
        isDeviasi = true;
      }

      let qtyMandiri = qtyBase;
      let rateMandiri = rateBase;
      let qtyMastercard = qtyBase;
      let rateMastercard = rateBase;

      // Penyebab deviasi components
      let penyebabQty = 0;
      let penyebabRate = 0;
      let penyebabTax = 0;

      if (isUnreconciled) {
        qtyMandiri = 0;
        rateMandiri = 0;
        qtyMastercard = qtyBase;
        rateMastercard = rateBase;
      } else if (isDeviasi) {
        const diffType = seed % 3; // 0: Qty diff, 1: Rate diff, 2: Tax diff
        if (diffType === 0) {
          const deltaQty = ((seed % 5) + 1) * 350;
          qtyMastercard = qtyBase + deltaQty;
          penyebabQty = deltaQty * rateMandiri;
        } else if (diffType === 1) {
          const deltaRate = ((seed % 4) + 1) * 150;
          rateMastercard = rateBase + deltaRate;
          penyebabRate = qtyMastercard * deltaRate;
        } else {
          // Tax discrepancy simulated below
        }
      }

      // Calculations
      const chargeMandiri = bySvByQty === 'BY QTY' ? qtyMandiri * rateMandiri : (qtyMandiri > 0 ? 55000000 + (seed * 1000000) : 0);
      const taxMandiri = Math.round(chargeMandiri * 0.11);
      const totalMandiri = chargeMandiri + taxMandiri;

      const chargeMastercard = bySvByQty === 'BY QTY' ? qtyMastercard * rateMastercard : (55000000 + (seed * 1000000));
      let taxMastercard = Math.round(chargeMastercard * 0.11);
      if (isDeviasi && seed % 3 === 2) {
        const deltaTax = 1250000 + (seed * 15000);
        taxMastercard += deltaTax;
        penyebabTax = deltaTax;
      }
      const totalMastercard = chargeMastercard + taxMastercard;

      const selisih = totalMastercard - totalMandiri;
      const persentaseSelisih = totalMandiri !== 0 ? (selisih / totalMandiri) * 100 : (totalMastercard > 0 ? 100 : 0);

      // Status assignment
      let status: MastercardRecord['STATUS'] = 'Match';
      if (isUnreconciled) {
        status = 'Belum Direkonsiliasi';
      } else if (Math.abs(selisih) <= RECONCILIATION_TOLERANCE) {
        status = 'Match';
      } else {
        status = 'Deviasi';
      }

      records.push({
        NO: no++,
        TANGGAL: tanggal,
        'EVENT ID': eventId,
        'TIER EVENT': tierEvent,
        DESC: desc,
        'BY SV / BY QTY': bySvByQty,
        'QTY MANDIRI': qtyMandiri,
        'RATE MANDIRI': rateMandiri,
        'CHARGE MANDIRI': chargeMandiri,
        'TAX MANDIRI': taxMandiri,
        'TOTAL MANDIRI': totalMandiri,
        'QTY MASTERCARD': qtyMastercard,
        'RATE MASTERCARD': rateMastercard,
        'CHARGE MASTERCARD': chargeMastercard,
        'TAX MASTERCARD': taxMastercard,
        'TOTAL MASTERCARD': totalMastercard,
        SELISIH: selisih,
        'PERSENTASE SELISIH': Number(persentaseSelisih.toFixed(2)),
        'SERVICE KATEGORI': serviceKategori,
        'BILLABLE ICA': billableIca,
        STATUS: status,
        CATATAN: '', // Left empty per prompt instruction
        PERIODE: period,
        penyebabQty: isDeviasi ? Math.abs(penyebabQty) : 0,
        penyebabRate: isDeviasi ? Math.abs(penyebabRate) : 0,
        penyebabTax: isDeviasi ? Math.abs(penyebabTax) : 0,
      });
    }
  });

  return records;
};

// 2. Generate Visa Dummy Records (Jan - Okt 2026)
export const generateVisaData = (): VisaRecord[] => {
  const records: VisaRecord[] = [];

  PERIODS.forEach((period, pIdx) => {
    const monthNum = (pIdx + 1).toString().padStart(2, '0');

    // 12 rows per period
    for (let i = 0; i < 12; i++) {
      const day = ((i * 2 + 5) % 28 + 1).toString().padStart(2, '0');
      const invoiceDate = `2026-${monthNum}-${day}`;
      const invoiceId = `INV-VSA-2026${monthNum}-${(i + 1).toString().padStart(2, '0')}`;
      const currentOrPrev: 'Current' | 'Previous' = i % 4 === 0 ? 'Previous' : 'Current';
      const mapping = `Mapping ${(i % 3 + 1).toString().padStart(2, '0')}`;
      const settlementId = `SETTLE-${(800 + (pIdx * 12) + i)}`;
      const feeCategory = FEE_CATEGORY_VISA[i % FEE_CATEGORY_VISA.length];
      const feeGroup = FEE_GROUP_VISA[i % FEE_GROUP_VISA.length];
      const feeName = `Fee Name ${(i + 1).toString().padStart(2, '0')}`;
      const billingLine = `Line ${(i + 1).toString().padStart(3, '0')}`;
      const invoiceDesc = `Deskripsi Invoice ${(i + 1).toString().padStart(2, '0')}`;
      const customDesc = `Custom Desc ${(i + 1).toString().padStart(2, '0')}`;
      const type = TYPE_VISA[i % TYPE_VISA.length];
      const rateType = i % 2 === 0 ? 'Tiered' : 'Flat';
      const billingCurrency = i % 5 === 0 ? 'IDR' : 'USD';
      const rateCur = billingCurrency;
      const forexRate = 16250;

      const seed = (pIdx * 23 + i * 11 + 7) % 100;

      // Base units and rates
      let units = billingCurrency === 'USD' ? 45000 + (seed * 850) : 150000 + (seed * 2500);
      let rate = billingCurrency === 'USD' ? 0.085 + ((seed % 6) * 0.005) : 1250;

      let isUnreconciled = false;
      let isDeviasi = false;

      // In Okt 2026, 2 rows have empty Mandiri values
      if (pIdx === 9 && (i === 10 || i === 11)) {
        isUnreconciled = true;
      } else if (seed > 84) {
        // ~15% deviation => ~85% match rate
        isDeviasi = true;
      }

      let unitsBmri = units;
      let totalFeeBmri = 0;

      if (isUnreconciled) {
        unitsBmri = 0;
        totalFeeBmri = 0;
      } else if (isDeviasi) {
        // Unit discrepancy or rate rounding discrepancy
        const deltaUnits = ((seed % 4) + 1) * 450;
        unitsBmri = units - deltaUnits;
      }

      const totalVisa = Number((units * rate).toFixed(2));
      if (!isUnreconciled) {
        totalFeeBmri = Number((unitsBmri * rate).toFixed(2));
      }

      const selisih = Number((totalVisa - totalFeeBmri).toFixed(2));
      const persentaseSelisih = totalFeeBmri > 0 ? (selisih / totalFeeBmri) * 100 : (totalVisa > 0 ? 100 : 0);

      // Status
      let status: VisaRecord['STATUS'] = 'Match';
      if (isUnreconciled) {
        status = 'Belum Direkonsiliasi';
      } else if (Math.abs(selisih) <= RECONCILIATION_TOLERANCE) {
        status = 'Match';
      } else {
        status = 'Deviasi';
      }

      records.push({
        'Billing Period': period,
        'Invoice Date': invoiceDate,
        'Invoice ID': invoiceId,
        'Current or Previous': currentOrPrev,
        Mapping: mapping,
        'Settlement ID': settlementId,
        'Fee Category': feeCategory,
        'Fee Group': feeGroup,
        'Fee Name': feeName,
        'Billing Line': billingLine,
        'Invoice Description': invoiceDesc,
        'Billing Line Custom Description': customDesc,
        Type: type,
        'Rate Type': rateType,
        Units: units,
        'Rate Cur': rateCur,
        Rate: Number(rate.toFixed(4)),
        'Foreign Exchange Rate': forexRate,
        'Billing Currency': billingCurrency,
        Total: totalVisa,
        'Jumlah Units BMRI': unitsBmri,
        'Total Fee BMRI': totalFeeBmri,
        Selisih: selisih,
        'Persentase Selisih': Number(persentaseSelisih.toFixed(2)),
        STATUS: status,
        CATATAN: '', // Left empty per prompt instruction
      });
    }
  });

  return records;
};

export const RAW_MASTERCARD_RECORDS = generateMastercardData();
export const RAW_VISA_RECORDS = generateVisaData();

// Process strip without fictional claims - clearly labeled placeholders
export const INITIAL_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'data_ditarik',
    name: '1. Data Ditarik',
    status: 'Selesai',
    primaryMetric: '31 Okt 2026',
    secondaryInfo: 'File tagihan & GL Mandiri',
  },
  {
    id: 'cleansing',
    name: '2. Cleansing Data',
    status: 'Selesai',
    primaryMetric: 'xxx.xxx Masuk',
    secondaryInfo: 'Filter format & kelengkapan',
  },
  {
    id: 'pivot',
    name: '3. Agregasi Pivot',
    status: 'Selesai',
    primaryMetric: 'xxx.xxx Baris',
    secondaryInfo: 'Mapping per kategori transaksi',
  },
  {
    id: 'komparasi',
    name: '4. Komparasi Aturan',
    status: 'Berjalan',
    primaryMetric: 'Proses Komparasi',
    secondaryInfo: 'Aturan toleransi: TBD',
  },
];

// Indonesian currency and number formatters
export const formatRupiah = (amount: number, withPrefix = true): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const prefix = withPrefix ? 'Rp ' : '';
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
};

export const formatCompactRupiah = (amount: number): string => {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  let formatted = '';
  if (absVal >= 1000000000000) {
    formatted = `${(absVal / 1000000000000).toFixed(1).replace('.', ',')} T`;
  } else if (absVal >= 1000000000) {
    formatted = `${(absVal / 1000000000).toFixed(1).replace('.', ',')} M`;
  } else if (absVal >= 1000000) {
    formatted = `${(absVal / 1000000).toFixed(1).replace('.', ',')} Jt`;
  } else if (absVal >= 1000) {
    formatted = `${(absVal / 1000).toFixed(0)} Rb`;
  } else {
    formatted = absVal.toString();
  }

  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
};

export const formatCurrencyVal = (amount: number, currency = 'USD'): string => {
  if (currency === 'IDR') {
    return formatRupiah(amount);
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-$${absAmount}` : `$${absAmount}`;
};

export const formatCompactVal = (amount: number, currency = 'USD'): string => {
  if (currency === 'IDR') {
    return formatCompactRupiah(amount);
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  let formatted = '';
  if (absVal >= 1000000) {
    formatted = `${(absVal / 1000000).toFixed(1)}M`;
  } else if (absVal >= 1000) {
    formatted = `${(absVal / 1000).toFixed(1)}K`;
  } else {
    formatted = absVal.toFixed(2);
  }
  return isNegative ? `-$${formatted}` : `$${formatted}`;
};

export const formatPercentage = (val: number): string => {
  return `${val.toFixed(2).replace('.', ',')}%`;
};

export const formatNumber = (val: number): string => {
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
