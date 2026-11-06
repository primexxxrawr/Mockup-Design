import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import {
  MastercardRecord,
  VisaRecord,
  RECONCILIATION_TOLERANCE,
  STANDARD_CATEGORIES,
  StandardCategory,
  idrToUsd,
  usdToIdr,
} from '../types';

export interface ParseResult {
  mastercardRecords: MastercardRecord[];
  visaRecords: VisaRecord[];
  fileNames: string[];
  message: string;
}

const normalizeCategory = (val: string): StandardCategory => {
  const match = STANDARD_CATEGORIES.find((c) => c.toLowerCase() === val.toLowerCase().trim());
  return match || 'Assessment';
};

// Normalize column key for flexible matching
const cleanKey = (key: string): string => {
  return key.trim().toUpperCase().replace(/[\s_\-\/]+/g, ' ');
};

export const parseUploadedFile = async (file: File): Promise<ParseResult> => {
  const fileName = file.name.toLowerCase();
  let mastercardList: MastercardRecord[] = [];
  let visaList: VisaRecord[] = [];
  const processedFiles: string[] = [];

  if (fileName.endsWith('.zip')) {
    // 1. Process ZIP File
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);

    for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
      if (zipEntry.dir) continue;
      const lowerRel = relativePath.toLowerCase();

      // Only inspect tabular files
      if (
        lowerRel.endsWith('.csv') ||
        lowerRel.endsWith('.xlsx') ||
        lowerRel.endsWith('.xls') ||
        lowerRel.endsWith('.tsv') ||
        lowerRel.endsWith('.txt')
      ) {
        processedFiles.push(relativePath);
        const arrayBuffer = await zipEntry.async('arraybuffer');
        const { mc, visa } = parseArrayBuffer(arrayBuffer, relativePath);
        mastercardList = [...mastercardList, ...mc];
        visaList = [...visaList, ...visa];
      }
    }
  } else if (
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.tsv')
  ) {
    // 2. Process Single Excel or CSV File
    processedFiles.push(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const { mc, visa } = parseArrayBuffer(arrayBuffer, file.name);
    mastercardList = mc;
    visaList = visa;
  } else {
    throw new Error('Format file tidak didukung. Harap unggah file .zip, .xlsx, atau .csv');
  }

  return {
    mastercardRecords: mastercardList,
    visaRecords: visaList,
    fileNames: processedFiles,
    message: `Berhasil mengekstrak ${processedFiles.length} file: ${mastercardList.length} data Mastercard, ${visaList.length} data Visa.`,
  };
};

const parseArrayBuffer = (
  buffer: ArrayBuffer,
  sourceName: string
): { mc: MastercardRecord[]; visa: VisaRecord[] } => {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const mcRecords: MastercardRecord[] = [];
  const visaRecords: VisaRecord[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) return;

    // Detect structure by checking keys of first row
    const firstRowKeys = Object.keys(rawRows[0]).map(cleanKey);

    const hasMcKey = firstRowKeys.some((k) =>
      k.includes('EVENT ID') ||
      k.includes('TIER EVENT') ||
      k.includes('BY SV') ||
      k.includes('QTY MANDIRI') ||
      k.includes('CHARGE MASTERCARD')
    );

    const hasVisaKey = firstRowKeys.some((k) =>
      k.includes('BILLING PERIOD') ||
      k.includes('INVOICE ID') ||
      k.includes('FEE CATEGORY') ||
      k.includes('TOTAL FEE BMRI') ||
      k.includes('UNITS BMRI')
    );

    if (hasMcKey || sheetName.toLowerCase().includes('mastercard') || sourceName.toLowerCase().includes('mastercard')) {
      // Map as Mastercard
      rawRows.forEach((r, idx) => {
        // Find keys flexibly
        const getVal = (possibleKeys: string[]): any => {
          for (const key of Object.keys(r)) {
            const ck = cleanKey(key);
            if (possibleKeys.some((pk) => ck.includes(cleanKey(pk)))) {
              return r[key];
            }
          }
          return '';
        };

        const getNum = (possibleKeys: string[]): number => {
          const val = getVal(possibleKeys);
          if (typeof val === 'number') return val;
          const cleanStr = String(val).replace(/[^0-9.-]/g, '');
          return Number(cleanStr) || 0;
        };

        const no = getNum(['NO']) || idx + 1;
        const tanggal = String(getVal(['TANGGAL', 'DATE', 'TXN DATE']) || '2026-01-15');
        const eventId = String(getVal(['EVENT ID', 'EVENTID', 'EVENT']) || `EVT-${1000 + idx}`);
        const tierEvent = String(getVal(['TIER EVENT', 'TIER']) || 'Tier 1');
        const desc = String(getVal(['DESC', 'DESCRIPTION', 'URAIAN']) || 'Transaksi Mastercard');
        const bySvByQtyRaw = String(getVal(['BY SV / BY QTY', 'TYPE', 'METRIC']) || 'BY QTY').toUpperCase();
        const bySvByQty = bySvByQtyRaw.includes('SV') ? 'BY SV' : 'BY QTY';

        const qtyMandiri = getNum(['QTY MANDIRI', 'QUANTITY MANDIRI']);
        const rateMandiri = getNum(['RATE MANDIRI', 'TARIF MANDIRI']);
        let chargeMandiri = getNum(['CHARGE MANDIRI']);
        if (!chargeMandiri && bySvByQty === 'BY QTY') chargeMandiri = qtyMandiri * rateMandiri;
        const taxMandiri = getNum(['TAX MANDIRI', 'PPN MANDIRI']) || Math.round(chargeMandiri * 0.11);
        const totalMandiri = getNum(['TOTAL MANDIRI']) || chargeMandiri + taxMandiri;

        const qtyMc = getNum(['QTY MASTERCARD', 'QTY MC']);
        const rateMc = getNum(['RATE MASTERCARD', 'RATE MC']);
        let chargeMc = getNum(['CHARGE MASTERCARD', 'CHARGE MC']);
        if (!chargeMc && bySvByQty === 'BY QTY') chargeMc = qtyMc * rateMc;
        const taxMc = getNum(['TAX MASTERCARD', 'TAX MC']) || Math.round(chargeMc * 0.11);
        const totalMc = getNum(['TOTAL MASTERCARD', 'TOTAL MC']) || chargeMc + taxMc;

        const selisih = getNum(['SELISIH']) || totalMc - totalMandiri;
        const pctSelisih = totalMandiri !== 0 ? (selisih / totalMandiri) * 100 : (totalMc > 0 ? 100 : 0);

        const serviceKategori = normalizeCategory(
          String(getVal(['SERVICE KATEGORI', 'KATEGORI', 'CATEGORY']) || 'Assessment')
        );
        const billableIca = String(getVal(['BILLABLE ICA', 'ICA']) || 'ICA 001');

        let status: MastercardRecord['STATUS'] = 'Match';
        if (totalMandiri === 0 && totalMc > 0) {
          status = 'Belum Direkonsiliasi';
        } else if (Math.abs(selisih) <= RECONCILIATION_TOLERANCE) {
          status = 'Match';
        } else {
          status = 'Deviasi';
        }

        mcRecords.push({
          NO: no,
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
          'QTY MASTERCARD': qtyMc,
          'RATE MASTERCARD': rateMc,
          'CHARGE MASTERCARD': chargeMc,
          'TAX MASTERCARD': taxMc,
          'TOTAL MASTERCARD': totalMc,
          SELISIH: selisih,
          'PERSENTASE SELISIH': Number(pctSelisih.toFixed(2)),
          'SERVICE KATEGORI': serviceKategori,
          'BILLABLE ICA': billableIca,
          Minggu: String(getVal(['MINGGU', 'WEEK']) || 'W01 2026'),
          Bulan: String(getVal(['BULAN', 'MONTH', 'PERIODE']) || 'Jan 2026'),
          selisihUsd: idrToUsd(selisih),
          totalMandiriUsd: idrToUsd(totalMandiri),
          totalMcUsd: idrToUsd(totalMc),
          STATUS: status,
          CATATAN: '',
          penyebabQty: Math.abs(qtyMc - qtyMandiri) * rateMandiri,
          penyebabRate: qtyMc * Math.abs(rateMc - rateMandiri),
          penyebabTax: Math.abs(taxMc - taxMandiri),
        });
      });
    } else {
      // Map as Visa
      rawRows.forEach((r, idx) => {
        const getVal = (possibleKeys: string[]): any => {
          for (const key of Object.keys(r)) {
            const ck = cleanKey(key);
            if (possibleKeys.some((pk) => ck.includes(cleanKey(pk)))) {
              return r[key];
            }
          }
          return '';
        };

        const getNum = (possibleKeys: string[]): number => {
          const val = getVal(possibleKeys);
          if (typeof val === 'number') return val;
          const cleanStr = String(val).replace(/[^0-9.-]/g, '');
          return Number(cleanStr) || 0;
        };

        const billingPeriod = String(getVal(['BILLING PERIOD', 'PERIOD']) || 'Jan 2026');
        const invoiceDate = String(getVal(['INVOICE DATE', 'DATE']) || '2026-01-20');
        const invoiceId = String(getVal(['INVOICE ID', 'INVOICEID', 'INV']) || `INV-VSA-${1000 + idx}`);
        const currentOrPrevRaw = String(getVal(['CURRENT OR PREVIOUS', 'CURRENT']) || 'Current');
        const currentOrPrev = currentOrPrevRaw.toLowerCase().includes('prev') ? 'Previous' : 'Current';
        const mapping = String(getVal(['MAPPING']) || 'Mapping 01');
        const settlementId = String(getVal(['SETTLEMENT ID', 'SETTLEMENT']) || `SETTLE-${800 + idx}`);
        const feeCategory = normalizeCategory(String(getVal(['FEE CATEGORY', 'CATEGORY']) || 'Assessment'));
        const feeGroup = String(getVal(['FEE GROUP', 'GROUP']) || 'Grup 1');
        const feeName = String(getVal(['FEE NAME']) || `Fee Name ${(idx % 10) + 1}`);
        const billingLine = String(getVal(['BILLING LINE', 'LINE']) || `Line ${(idx % 20) + 1}`);
        const invoiceDesc = String(getVal(['INVOICE DESCRIPTION', 'DESCRIPTION']) || 'Tagihan Visa');
        const customDesc = String(getVal(['BILLING LINE CUSTOM DESCRIPTION', 'CUSTOM']) || 'Custom Desc');
        const type = String(getVal(['TYPE']) || 'Type 1');
        const rateType = String(getVal(['RATE TYPE']) || 'Tiered');
        const units = getNum(['UNITS', 'QTY VISA', 'QTY']);
        const rateCur = String(getVal(['RATE CUR', 'CURRENCY']) || 'USD');
        const rate = getNum(['RATE', 'TARIF']);
        const forexRate = getNum(['FOREIGN EXCHANGE RATE', 'FOREX', 'KURS']) || 16250;
        const billingCurrRaw = String(getVal(['BILLING CURRENCY', 'BILLING CURR']) || 'USD').toUpperCase();
        const billingCurrency: 'USD' | 'IDR' =
          billingCurrRaw.includes('IDR') || billingCurrRaw.includes('RP') ? 'IDR' : 'USD';

        const total = getNum(['TOTAL', 'INVOICE TOTAL']) || Number((units * rate).toFixed(2));
        const unitsBmri = getNum(['JUMLAH UNITS BMRI', 'UNITS BMRI', 'QTY BMRI']);
        const totalFeeBmri = getNum(['TOTAL FEE BMRI', 'FEE BMRI', 'BMRI TOTAL']);

        const selisih = getNum(['SELISIH']) || Number((total - totalFeeBmri).toFixed(2));
        const pctSelisih = totalFeeBmri > 0 ? (selisih / totalFeeBmri) * 100 : (total > 0 ? 100 : 0);

        const totalUsd = billingCurrency === 'IDR' ? total / forexRate : total;
        const totalFeeBmriUsd = billingCurrency === 'IDR' ? totalFeeBmri / forexRate : totalFeeBmri;
        const selisihUsd = totalUsd - totalFeeBmriUsd;
        const selisihIdr = usdToIdr(selisihUsd);

        let status: VisaRecord['STATUS'] = 'Match';
        if (totalFeeBmriUsd === 0 && totalUsd > 0) {
          status = 'Belum Direkonsiliasi';
        } else if (Math.abs(selisihUsd) <= RECONCILIATION_TOLERANCE) {
          status = 'Match';
        } else {
          status = 'Deviasi';
        }

        visaRecords.push({
          'Billing Period': billingPeriod,
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
          Rate: rate,
          'Foreign Exchange Rate': forexRate,
          'Billing Currency': billingCurrency,
          Total: total,
          'Jumlah Units BMRI': unitsBmri,
          'Total Fee BMRI': totalFeeBmri,
          Selisih: selisih,
          'Persentase Selisih': Number(pctSelisih.toFixed(2)),
          totalUsd,
          totalFeeBmriUsd,
          selisihUsd,
          selisihIdr,
          STATUS: status,
          CATATAN: '',
        });
      });
    }
  });

  return { mc: mcRecords, visa: visaRecords };
};
