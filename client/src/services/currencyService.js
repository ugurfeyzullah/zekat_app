import { buildApiUrl } from './runtimeConfig';

const CURRENCY_CACHE_KEY = 'zakat_tracker_currency_rates_v1';
const CURRENCY_CACHE_DURATION_MS = 60 * 60 * 1000;
const DIRECT_RATES_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

const fetchWithTimeout = async (url, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

const readCache = () => {
  try {
    const raw = window.localStorage.getItem(CURRENCY_CACHE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeCacheEntry = (base, rates) => {
  const cache = readCache();
  cache[base] = {
    rates,
    timestamp: Date.now()
  };
  window.localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(cache));
};

const getCachedRates = (base) => {
  const cache = readCache();
  const entry = cache[base];
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.timestamp > CURRENCY_CACHE_DURATION_MS) {
    return null;
  }

  return entry.rates;
};

const normalizeCurrency = (currency) => currency?.toUpperCase().trim();

const normalizeRatesMap = (rawRates, baseCurrency) => {
  const normalized = {};

  Object.entries(rawRates || {}).forEach(([code, value]) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const numericRate = Number(value);
    if (normalizedCode && Number.isFinite(numericRate) && numericRate > 0) {
      normalized[normalizedCode] = numericRate;
    }
  });

  normalized[baseCurrency] = 1;
  return normalized;
};

export const getRates = async (baseCurrency = 'USD', options = {}) => {
  const { forceRefresh = false } = options;
  const base = normalizeCurrency(baseCurrency) || 'USD';
  const cachedRates = forceRefresh ? null : getCachedRates(base);

  if (cachedRates) {
    return {
      base,
      rates: cachedRates,
      source: 'cache'
    };
  }

  try {
    const backendResponse = await fetchWithTimeout(
      buildApiUrl(`/api/currency/rates?base=${encodeURIComponent(base)}`)
    );
    if (backendResponse.ok) {
      const data = await backendResponse.json();
      if (data?.rates && typeof data.rates === 'object') {
        const normalizedRates = normalizeRatesMap(data.rates, base);
        writeCacheEntry(base, normalizedRates);
        return {
          base,
          rates: normalizedRates,
          source: 'server'
        };
      }
    }
  } catch (error) {
    // Fall through to direct provider.
  }

  const baseLower = base.toLowerCase();
  const directResponse = await fetchWithTimeout(`${DIRECT_RATES_URL}/${encodeURIComponent(baseLower)}.json`);
  if (!directResponse.ok) {
    throw new Error(`Unable to fetch rates: ${directResponse.status}`);
  }

  const directData = await directResponse.json();
  const directRates = directData?.[baseLower];
  if (!directRates || typeof directRates !== 'object') {
    throw new Error('Exchange rate payload is invalid.');
  }

  const normalizedRates = normalizeRatesMap(directRates, base);

  writeCacheEntry(base, normalizedRates);
  return {
    base,
    rates: normalizedRates,
    source: 'direct'
  };
};

export const convertCurrency = async ({ amount, fromCurrency, toCurrency }) => {
  const amountValue = Number(amount);
  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    throw new Error('Amount must be a positive number.');
  }

  const from = normalizeCurrency(fromCurrency) || 'USD';
  const to = normalizeCurrency(toCurrency) || 'EUR';

  if (from === to) {
    return {
      amount: amountValue,
      from,
      to,
      rate: 1,
      convertedAmount: amountValue,
      source: 'identity'
    };
  }

  const { rates, source } = await getRates(from);
  const rate = Number(rates[to]);
  if (!Number.isFinite(rate)) {
    throw new Error(`Rate not found for ${to}.`);
  }

  return {
    amount: amountValue,
    from,
    to,
    rate,
    convertedAmount: amountValue * rate,
    source
  };
};
