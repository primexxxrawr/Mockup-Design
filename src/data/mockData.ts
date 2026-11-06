import {
  MastercardRecord,
  VisaRecord,
  PipelineStep,
  RECONCILIATION_TOLERANCE,
  USD_IDR_RATE,
  idrToUsd,
  usdToIdr,
  STANDARD_CATEGORIES,
  StandardCategory,
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

// Generate 43 reporting weeks for Jan-Okt 2026
export interface WeekInfo {
  weekCode: string; // e.g. "W01 2026"
  startDate: string; // e.g. "2026-01-05"
  month: string; // e.g. "Jan 2026"
}

export const generateWeeks = (): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  const start = new Date(2026, 0, 5); // Monday Jan 5, 2026

  for (let i = 1; i <= 43; i++) {
    const curDate = new Date(start);
    curDate.setDate(start.getDate() + (i - 1) * 7);

    const year = curDate.getFullYear();
    const monthIndex = curDate.getMonth();
    const day = curDate.getDate().toString().padStart(2, '0');
    const monthNum = (monthIndex + 1).toString().padStart(2, '0');
    const startDateStr = `${year}-${monthNum}-${day}`;

    // Map month name
    const monthName = PERIODS[Math.min(monthIndex, 9)];
    const weekCode = `W${i.toString().padStart(2, '0')} 2026`;

    weeks.push({
      weekCode,
      startDate: startDateStr,
      month: monthName,
    });
  }
  return weeks;
};

export const WEEKS = generateWeeks();

export const TIER_EVENT_MASTERCARD = ['Tier 1', 'Tier 2', 'Tier 3'];
export const BILLABLE_ICA_MASTERCARD = ['ICA 001', 'ICA 002', 'ICA 003', 'ICA 004'];
export const TYPE_VISA = ['Type 1', 'Type 2', 'Type 3'];

// 1. Generate Visa Data (Monthly Granularity: 10 Periods x 4 Categories x 3 Fee Names = 120 Rows)
// Configured with diverse monthly fluctuation: low baselines, moderate months, and quarterly audit spikes
export const generateVisaData = (): VisaRecord[] => {
  const records: VisaRecord[] = [];

  // Monthly profile with diverse fluctuations
  // devRowIndices: which rows out of 12 have deviation (1-indexed)
  // devAmountsUsd: target deviation in USD for each deviation row
  const monthlyVisaConfig: {
    devRowIndices: number[];
    devAmountsUsd: number[];
  }[] = [
    // Jan: Low baseline (~$1,754 ≈ Rp 28.5 Jt)
    { devRowIndices: [6], devAmountsUsd: [1754] },
    // Feb: Moderate (~$3,950 ≈ Rp 64.2 Jt)
    { devRowIndices: [3, 8], devAmountsUsd: [2100, 1850] },
    // Mar: Q1 True-up major spike (~$21,415 ≈ Rp 348.0 Jt)
    { devRowIndices: [2, 5, 7, 10], devAmountsUsd: [6200, 4850, 5465, 4900] },
    // Apr: Low-moderate (~$2,590 ≈ Rp 42.1 Jt)
    { devRowIndices: [7], devAmountsUsd: [2590] },
    // Mei: Moderate (~$7,115 ≈ Rp 115.6 Jt)
    { devRowIndices: [4, 9], devAmountsUsd: [3850, 3265] },
    // Jun: Mid-year settlement true-up spike (~$13,932 ≈ Rp 226.4 Jt)
    { devRowIndices: [1, 6, 11], devAmountsUsd: [5120, 4612, 4200] },
    // Jul: Low-moderate (~$3,612 ≈ Rp 58.7 Jt)
    { devRowIndices: [5, 8], devAmountsUsd: [1950, 1662] },
    // Agu: Moderate (~$8,548 ≈ Rp 138.9 Jt)
    { devRowIndices: [2, 7], devAmountsUsd: [4800, 3748] },
    // Sep: Q3 Tier Review peak spike (~$25,550 ≈ Rp 415.2 Jt)
    { devRowIndices: [3, 6, 8, 10], devAmountsUsd: [7800, 6450, 5600, 5700] },
    // Okt: Current month (~$11,846 ≈ Rp 192.5 Jt) + 2 un-reconciled items
    { devRowIndices: [4, 7], devAmountsUsd: [6200, 5646] },
  ];

  PERIODS.forEach((period, pIdx) => {
    const monthNum = (pIdx + 1).toString().padStart(2, '0');
    const invoiceDate = `2026-${monthNum}-20`;
    const cfg = monthlyVisaConfig[pIdx];

    let rowInMonth = 0;

    STANDARD_CATEGORIES.forEach((category) => {
      // 3 fee names per category
      for (let fIdx = 1; fIdx <= 3; fIdx++) {
        rowInMonth++;
        const invoiceId = `INV-VSA-2026${monthNum}-${rowInMonth.toString().padStart(2, '0')}`;
        const currentOrPrev: 'Current' | 'Previous' = (rowInMonth % 4 === 0) ? 'Previous' : 'Current';
        const feeGroup = `Grup ${(fIdx).toString().padStart(2, '0')}`;
        const feeName = `Fee Name ${(fIdx).toString().padStart(2, '0')}`;
        const billingLine = `Line ${(rowInMonth).toString().padStart(3, '0')}`;
        const invoiceDesc = `Tagihan ${category} ${(fIdx).toString().padStart(2, '0')}`;
        const customDesc = `Deskripsi Khusus ${(fIdx).toString().padStart(2, '0')}`;
        const type = TYPE_VISA[(rowInMonth - 1) % TYPE_VISA.length];
        const rateType = rowInMonth % 2 === 0 ? 'Tiered' : 'Flat';

        // 2 out of 12 rows are IDR, rest are USD
        const isIdr = rowInMonth === 4 || rowInMonth === 9;
        const billingCurrency: 'USD' | 'IDR' = isIdr ? 'IDR' : 'USD';
        const forexRate = USD_IDR_RATE;

        // Base Units & Rate
        const seed = (pIdx * 31 + rowInMonth * 17 + 7) % 100;
        const units = isIdr ? 180000 + seed * 2500 : 42000 + seed * 750;
        const rate = isIdr ? 1250 : 0.085 + ((seed % 6) * 0.005);

        // Check if this row is unreconciled (Okt 2026 rows 11 & 12)
        const isUnreconciled = pIdx === 9 && (rowInMonth === 11 || rowInMonth === 12);

        // Check if this row has deviation
        const devIdx = cfg.devRowIndices.indexOf(rowInMonth);
        const isDeviasi = devIdx !== -1 && !isUnreconciled;

        let totalVisa = Number((units * rate).toFixed(2));
        let unitsBmri = units;
        let totalFeeBmri = 0;

        if (isUnreconciled) {
          unitsBmri = 0;
          totalFeeBmri = 0;
        } else if (isDeviasi) {
          const devAmountUsd = cfg.devAmountsUsd[devIdx];
          const targetDevNative = isIdr ? devAmountUsd * forexRate : devAmountUsd;
          totalFeeBmri = Math.max(10, Number((totalVisa - targetDevNative).toFixed(2)));
          unitsBmri = Math.round(totalFeeBmri / rate);
        } else {
          // Perfectly matching row
          totalFeeBmri = totalVisa;
          unitsBmri = units;
        }

        const selisihTagihan = isUnreconciled ? totalVisa : Number((totalVisa - totalFeeBmri).toFixed(2));
        const persentaseSelisih = totalFeeBmri > 0 ? (selisihTagihan / totalFeeBmri) * 100 : (totalVisa > 0 ? 100 : 0);

        // Convert to USD-Equivalent and IDR (Baseline Rule)
        let totalUsd: number;
        let totalFeeBmriUsd: number;
        let selisihUsd: number;
        let selisihIdr: number;

        if (billingCurrency === 'IDR') {
          totalUsd = totalVisa / forexRate;
          totalFeeBmriUsd = totalFeeBmri / forexRate;
          selisihUsd = totalUsd - totalFeeBmriUsd;
          selisihIdr = selisihTagihan;
        } else {
          totalUsd = totalVisa;
          totalFeeBmriUsd = totalFeeBmri;
          selisihUsd = selisihTagihan;
          selisihIdr = usdToIdr(selisihUsd);
        }

        // Status evaluated on USD-equivalent selisih
        let status: VisaRecord['STATUS'] = 'Match';
        if (isUnreconciled) {
          status = 'Belum Direkonsiliasi';
        } else if (Math.abs(selisihUsd) <= RECONCILIATION_TOLERANCE) {
          status = 'Match';
        } else {
          status = 'Deviasi';
        }

        records.push({
          'Billing Period': period,
          'Invoice Date': invoiceDate,
          'Invoice ID': invoiceId,
          'Current or Previous': currentOrPrev,
          Mapping: `Mapping ${(rowInMonth % 3 + 1).toString().padStart(2, '0')}`,
          'Settlement ID': `SETTLE-${800 + pIdx * 12 + rowInMonth}`,
          'Fee Category': category,
          'Fee Group': feeGroup,
          'Fee Name': feeName,
          'Billing Line': billingLine,
          'Invoice Description': invoiceDesc,
          'Billing Line Custom Description': customDesc,
          Type: type,
          'Rate Type': rateType,
          Units: units,
          'Rate Cur': billingCurrency,
          Rate: Number(rate.toFixed(4)),
          'Foreign Exchange Rate': forexRate,
          'Billing Currency': billingCurrency,
          Total: totalVisa,
          'Jumlah Units BMRI': unitsBmri,
          'Total Fee BMRI': totalFeeBmri,
          Selisih: selisihTagihan,
          'Persentase Selisih': Number(persentaseSelisih.toFixed(2)),
          totalUsd,
          totalFeeBmriUsd,
          selisihUsd,
          selisihIdr,
          STATUS: status,
          CATATAN: '',
        });
      }
    });
  });

  return records;
};

// 2. Generate Mastercard Data (Weekly Granularity: 43 Weeks x 4 Categories = 172 Rows)
// Weekly deviation targets aggregate to diverse monthly profiles, alternating with Visa
export const generateMastercardData = (): MastercardRecord[] => {
  const records: MastercardRecord[] = [];
  let no = 1;

  // Target deviation amounts in IDR per week (43 weeks)
  // Designed so monthly totals fluctuate dynamically:
  // Jan (~22.8M), Feb (~82.5M), Mar (~198.4M), Apr (~66.8M), Mei (~74.2M),
  // Jun (~392.6M - peak), Jul (~88.4M), Agu (~108.3M), Sep (~284.1M - peak), Okt (~155M)
  const weeklyDeviationTargets: number[] = [
    // Jan (W01-W04)
    3200000, 5800000, 4600000, 9200000,
    // Feb (W05-W08)
    16500000, 22400000, 18800000, 24800000,
    // Mar (W09-W13 - Q1 Audit Spike)
    28500000, 44200000, 52800000, 46400000, 26500000,
    // Apr (W14-W17)
    14200000, 18500000, 15600000, 18500000,
    // Mei (W18-W22)
    12400000, 15800000, 16200000, 14500000, 15300000,
    // Jun (W23-W26 - Major Mid-year Scheme True-up Spike)
    68400000, 112500000, 128400000, 83300000,
    // Jul (W27-W30)
    18500000, 26400000, 21800000, 21700000,
    // Agu (W31-W35)
    18200000, 24500000, 22800000, 25400000, 17400000,
    // Sep (W36-W39 - Q3 Tier Spike)
    54800000, 82400000, 88600000, 58300000,
    // Okt (W40-W43)
    32500000, 41200000, 36800000, 44500000,
  ];

  WEEKS.forEach((week, wIdx) => {
    const weeklyTargetDev = weeklyDeviationTargets[wIdx] || 15000000;
    // Which category out of 4 takes the deviation this week
    const devCatIdx = (wIdx % 4);

    STANDARD_CATEGORIES.forEach((category, cIdx) => {
      const eventId = `EVT-${1000 + wIdx * 4 + cIdx}`;
      const tierEvent = TIER_EVENT_MASTERCARD[cIdx % TIER_EVENT_MASTERCARD.length];
      const desc = `Transaksi ${category} Mingguan`;
      const bySvByQty: 'BY SV' | 'BY QTY' = cIdx === 2 ? 'BY SV' : 'BY QTY';
      const billableIca = BILLABLE_ICA_MASTERCARD[cIdx % BILLABLE_ICA_MASTERCARD.length];

      const seed = (wIdx * 29 + cIdx * 13 + 19) % 100;

      // Base Quantities & Rates (in IDR)
      const qtyBase = 15000 + (seed * 350);
      const rateBase = bySvByQty === 'BY QTY' ? 4200 + ((seed % 8) * 150) : 1;

      // Last week (W43) has 2 unreconciled rows (Settlement & Interchange)
      const isUnreconciled = (wIdx === 42 && (cIdx === 2 || cIdx === 3));
      const isDeviasi = (cIdx === devCatIdx) && !isUnreconciled;

      let qtyMandiri = qtyBase;
      let rateMandiri = rateBase;
      let qtyMastercard = qtyBase;
      let rateMastercard = rateBase;

      let penyebabQty = 0;
      let penyebabRate = 0;
      let penyebabTax = 0;

      if (isUnreconciled) {
        qtyMandiri = 0;
        rateMandiri = 0;
      } else if (isDeviasi) {
        // Attribute deviation to volume (qty), rate, or tax
        const causeType = wIdx % 3;
        if (causeType === 0) {
          // Volume discrepancy
          penyebabQty = weeklyTargetDev;
          const deltaQty = Math.round(weeklyTargetDev / rateMandiri);
          qtyMastercard = qtyBase + deltaQty;
        } else if (causeType === 1) {
          // Rate discrepancy
          penyebabRate = weeklyTargetDev;
          const deltaRate = Math.round(weeklyTargetDev / qtyMastercard);
          rateMastercard = rateBase + deltaRate;
        } else {
          // Tax discrepancy
          penyebabTax = weeklyTargetDev;
        }
      }

      const chargeMandiri = bySvByQty === 'BY QTY'
        ? qtyMandiri * rateMandiri
        : (qtyMandiri > 0 ? 65000000 + seed * 850000 : 0);
      const taxMandiri = Math.round(chargeMandiri * 0.11);
      const totalMandiri = chargeMandiri + taxMandiri;

      let chargeMastercard = bySvByQty === 'BY QTY'
        ? qtyMastercard * rateMastercard
        : 65000000 + seed * 850000;

      if (isDeviasi && penyebabTax === 0 && bySvByQty === 'BY SV') {
        chargeMastercard += weeklyTargetDev;
      }

      let taxMastercard = Math.round(chargeMastercard * 0.11);
      if (isDeviasi && penyebabTax > 0) {
        taxMastercard += penyebabTax;
      }

      const totalMastercard = chargeMastercard + taxMastercard;
      const selisih = totalMastercard - totalMandiri; // in IDR
      const persentaseSelisih = totalMandiri !== 0 ? (selisih / totalMandiri) * 100 : (totalMastercard > 0 ? 100 : 0);

      // USD Equivalent values
      const selisihUsd = idrToUsd(selisih);
      const totalMandiriUsd = idrToUsd(totalMandiri);
      const totalMcUsd = idrToUsd(totalMastercard);

      // Status evaluated on USD-equivalent selisih
      let status: MastercardRecord['STATUS'] = 'Match';
      if (isUnreconciled) {
        status = 'Belum Direkonsiliasi';
      } else if (Math.abs(selisihUsd) <= RECONCILIATION_TOLERANCE) {
        status = 'Match';
      } else {
        status = 'Deviasi';
      }

      records.push({
        NO: no++,
        TANGGAL: week.startDate,
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
        'SERVICE KATEGORI': category,
        'BILLABLE ICA': billableIca,
        Minggu: week.weekCode,
        Bulan: week.month,
        selisihUsd,
        totalMandiriUsd,
        totalMcUsd,
        STATUS: status,
        CATATAN: '',
        penyebabQty: isDeviasi ? Math.abs(penyebabQty) : 0,
        penyebabRate: isDeviasi ? Math.abs(penyebabRate) : 0,
        penyebabTax: isDeviasi ? Math.abs(penyebabTax) : 0,
      });
    });
  });

  return records;
};

export const RAW_VISA_RECORDS = generateVisaData();
export const RAW_MASTERCARD_RECORDS = generateMastercardData();

// Process strip placeholders (Clean, no fictional claims)
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
    secondaryInfo: 'Mapping 4 kategori standar',
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
  return formatUSD(amount);
};

export const formatUSD = (amount: number): string => {
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
