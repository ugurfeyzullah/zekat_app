const CURRENCY_TO_WEALTH_TYPE = {
  EUR: 'EUR_CASH',
  USD: 'USD_CASH',
  TRY: 'TRY_CASH',
  GBP: 'GBP_CASH',
  AED: 'AED_CASH',
  SAR: 'SAR_CASH'
};

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

const toNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const text = String(value ?? '').trim();
  if (!text) {
    return null;
  }

  let normalized = text.replace(/\s/g, '').replace(/[^\d.,-]/g, '');
  if (!normalized || normalized === '-' || normalized === ',' || normalized === '.') {
    return null;
  }

  const commaCount = (normalized.match(/,/g) || []).length;
  const dotCount = (normalized.match(/\./g) || []).length;

  if (commaCount > 0 && dotCount > 0) {
    if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  } else if (commaCount > 0) {
    if (commaCount === 1) {
      normalized = normalized.replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapCurrencyToken = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }

  if (/^[a-zA-Z]{3}$/.test(raw)) {
    return raw.toUpperCase();
  }

  const token = normalizeText(raw);

  if (token.includes('altin') || token.includes('gold') || token.includes('xau')) {
    return 'XAU';
  }

  if (token.includes('gumus') || token.includes('silver') || token.includes('xag')) {
    return 'XAG';
  }

  if (token.includes('euro') || token.includes('eur')) {
    return 'EUR';
  }

  if (token === 'tl' || token.includes('try') || token.includes('lira')) {
    return 'TRY';
  }

  if (token.includes('usd') || token.includes('dollar')) {
    return 'USD';
  }

  if (token.includes('gbp') || token.includes('pound') || token.includes('sterlin')) {
    return 'GBP';
  }

  if (token.includes('aed') || token.includes('dirham')) {
    return 'AED';
  }

  if (token.includes('sar') || token.includes('riyal')) {
    return 'SAR';
  }

  if (token.includes('cad')) {
    return 'CAD';
  }

  if (token.includes('aud')) {
    return 'AUD';
  }

  if (token.includes('pkr')) {
    return 'PKR';
  }

  if (token.includes('inr')) {
    return 'INR';
  }

  return null;
};

const findCell = (rows, predicate) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      if (predicate(row[colIndex], rowIndex, colIndex)) {
        return { rowIndex, colIndex };
      }
    }
  }
  return null;
};

const extractWealthEntries = (rows) => {
  const entries = [];

  const toplamMalCell = findCell(rows, (value) => normalizeText(value).includes('toplam mal'));
  if (toplamMalCell) {
    let blankCount = 0;
    for (
      let rowIndex = toplamMalCell.rowIndex + 1;
      rowIndex < Math.min(rows.length, toplamMalCell.rowIndex + 30);
      rowIndex += 1
    ) {
      const row = rows[rowIndex] || [];
      const labelCell = row[toplamMalCell.colIndex];
      const amountCell = row[toplamMalCell.colIndex + 1];
      const convertedCell = row[toplamMalCell.colIndex + 2];

      const label = mapCurrencyToken(labelCell);
      const amount = toNumber(amountCell);
      const converted = toNumber(convertedCell);

      if (!label && amount === null && converted === null) {
        blankCount += 1;
        if (blankCount >= 2) {
          break;
        }
        continue;
      }

      blankCount = 0;
      if (!label) {
        continue;
      }

      entries.push({ currency: label, amount, converted });
    }
  }

  if (entries.length > 0) {
    return entries;
  }

  // Fallback detection if "Toplam Mal" block is missing.
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      const label = mapCurrencyToken(row[colIndex]);
      if (!label) {
        continue;
      }

      const leftAmount = colIndex > 0 ? toNumber(row[colIndex - 1]) : null;
      if (colIndex <= 2 && leftAmount !== null && leftAmount > 0) {
        continue;
      }

      const amount = toNumber(row[colIndex + 1]);
      const converted = toNumber(row[colIndex + 2]);
      if (amount === null && converted === null) {
        continue;
      }

      entries.push({ currency: label, amount, converted });
    }
  }

  return entries;
};

const extractPaymentEntries = (rows, fallbackBaseCurrency) => {
  let detectedBaseCurrency = null;
  const entries = [];

  const header = rows
    .map((row, rowIndex) => ({ row: row || [], rowIndex }))
    .find(({ row }) => {
      const normalized = row.map((cell) => normalizeText(cell));
      const amountCol = normalized.findIndex((value) => value === 'miktar' || value.includes('miktar'));
      const currencyCol = normalized.findIndex((value) => value === 'cins' || value.includes('cins'));
      const personCol = normalized.findIndex(
        (value) => value === 'kisi' || value === 'kişi' || value.includes('kisi') || value.includes('kişi')
      );
      return amountCol >= 0 && currencyCol >= 0 && personCol >= 0;
    });

  if (header) {
    const normalized = header.row.map((cell) => normalizeText(cell));
    const amountCol = normalized.findIndex((value) => value === 'miktar' || value.includes('miktar'));
    const currencyCol = normalized.findIndex((value) => value === 'cins' || value.includes('cins'));
    const personCol = normalized.findIndex(
      (value) => value === 'kisi' || value === 'kişi' || value.includes('kisi') || value.includes('kişi')
    );
    const convertedCol = personCol + 1 < header.row.length ? personCol + 1 : null;
    detectedBaseCurrency = convertedCol !== null ? mapCurrencyToken(header.row[convertedCol]) : null;

    let blankCount = 0;
    for (let rowIndex = header.rowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || [];
      const amount = toNumber(row[amountCol]);
      const converted = convertedCol !== null ? toNumber(row[convertedCol]) : null;
      const paidTo = String(row[personCol] || '').trim();
      const currencyRaw = row[currencyCol];
      const currency = mapCurrencyToken(currencyRaw);

      if (amount === null && converted === null && !paidTo && !String(currencyRaw || '').trim()) {
        blankCount += 1;
        if (blankCount >= 2) {
          break;
        }
        continue;
      }
      blankCount = 0;

      if (amount === null && converted === null) {
        continue;
      }

      if (!currency) {
        const base = detectedBaseCurrency || fallbackBaseCurrency;
        if (converted !== null) {
          entries.push({ paidTo, amount: converted, currency: base });
        }
        continue;
      }

      const finalAmount = amount !== null ? amount : converted;
      if (finalAmount === null) {
        continue;
      }

      entries.push({ paidTo, amount: finalAmount, currency });
    }
  }

  if (entries.length > 0) {
    return { entries, detectedBaseCurrency };
  }

  // Fallback: simple A/B/C pattern.
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    const amount = toNumber(row[0]);
    const currency = mapCurrencyToken(row[1]);
    const paidTo = String(row[2] || '').trim();

    if (amount === null || !currency || !paidTo) {
      continue;
    }

    entries.push({ paidTo, amount, currency });
  }

  return { entries, detectedBaseCurrency };
};

const mapWealthRows = (entries, baseCurrency, warnings) => {
  const rows = [];

  entries.forEach((entry) => {
    if (entry.currency === 'XAU') {
      if (entry.amount !== null) {
        rows.push({ type: 'GOLD_GRAMS', amount: entry.amount, note: 'Imported from Excel' });
      }
      return;
    }

    if (entry.currency === 'XAG') {
      if (entry.amount !== null) {
        rows.push({ type: 'SILVER_GRAMS', amount: entry.amount, note: 'Imported from Excel' });
      }
      return;
    }

    let targetType = null;
    if (entry.currency === baseCurrency) {
      targetType = 'BASE_CASH';
    } else if (CURRENCY_TO_WEALTH_TYPE[entry.currency]) {
      targetType = CURRENCY_TO_WEALTH_TYPE[entry.currency];
    }

    if (targetType) {
      if (entry.amount !== null) {
        rows.push({ type: targetType, amount: entry.amount, note: 'Imported from Excel' });
        return;
      }

      if (entry.converted !== null) {
        rows.push({ type: 'BASE_CASH', amount: entry.converted, note: `Imported converted from ${entry.currency}` });
        return;
      }
    }

    if (entry.converted !== null) {
      rows.push({ type: 'BASE_CASH', amount: entry.converted, note: `Imported converted from ${entry.currency}` });
    } else {
      warnings.push(`Wealth row skipped for ${entry.currency} (no usable amount).`);
    }
  });

  return rows;
};

const mapPaymentRows = (entries, warnings) =>
  entries
    .map((entry) => {
      if (entry.amount === null || entry.amount <= 0) {
        warnings.push('A payment row was skipped because amount was invalid.');
        return null;
      }

      if (!entry.currency) {
        warnings.push('A payment row was skipped because currency was missing.');
        return null;
      }

      return {
        paidTo: entry.paidTo || '',
        amount: entry.amount,
        currency: entry.currency
      };
    })
    .filter(Boolean);

export const parseZakatExcelMatrix = (rows, fallbackBaseCurrency = 'EUR') => {
  const warnings = [];
  const wealthEntries = extractWealthEntries(rows);
  const paymentExtraction = extractPaymentEntries(rows, fallbackBaseCurrency);
  const detectedBaseCurrency = paymentExtraction.detectedBaseCurrency || null;
  const baseCurrency = detectedBaseCurrency || fallbackBaseCurrency;

  const wealthRows = mapWealthRows(wealthEntries, baseCurrency, warnings);
  const paymentRows = mapPaymentRows(paymentExtraction.entries, warnings);

  return {
    detectedBaseCurrency,
    wealthRows,
    paymentRows,
    warnings
  };
};
