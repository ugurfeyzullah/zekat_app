const DATED_RATES_CACHE_KEY = 'zakat_tracker_dated_rates_v1';
const DATED_RATES_CACHE_DURATION_MS = 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUEST_TIMEOUT_MS = 6000;

const memoryCache = new Map();
const pendingRequests = new Map();

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
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

const normalizeCurrency = (currency) => String(currency || '').trim().toUpperCase();

const isValidDateText = (value) => {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === value;
};

export const normalizeRequestedRateDate = (dateText) => {
  const value = String(dateText || '').trim();
  return isValidDateText(value) ? value : getTodayDateString();
};

const buildCacheKey = (baseCurrency, dateText) => `${baseCurrency}:${dateText}`;

const isEntryExpired = (timestamp) =>
  !Number.isFinite(timestamp) || Date.now() - timestamp > DATED_RATES_CACHE_DURATION_MS;

const readStorageCache = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(DATED_RATES_CACHE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeStorageCache = (cache) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DATED_RATES_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Ignore cache write errors.
  }
};

const readFromStorage = (cacheKey) => {
  const cache = readStorageCache();
  const entry = cache[cacheKey];

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  if (isEntryExpired(Number(entry.timestamp))) {
    delete cache[cacheKey];
    writeStorageCache(cache);
    return null;
  }

  return entry;
};

const writeToCaches = (cacheKey, entry) => {
  memoryCache.set(cacheKey, entry);
  const cache = readStorageCache();
  cache[cacheKey] = entry;
  writeStorageCache(cache);
};

const normalizeRates = (rawRates, baseCurrency) => {
  const normalized = {};

  Object.entries(rawRates || {}).forEach(([code, value]) => {
    const numericRate = Number(value);
    if (Number.isFinite(numericRate) && numericRate > 0) {
      normalized[String(code).trim().toUpperCase()] = numericRate;
    }
  });

  normalized[baseCurrency] = 1;
  return normalized;
};

const fetchSnapshot = async (baseCurrency, dateOrLatest) => {
  const baseLower = baseCurrency.toLowerCase();
  const response = await fetchWithTimeout(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${encodeURIComponent(
      dateOrLatest
    )}/v1/currencies/${encodeURIComponent(baseLower)}.json`
  );

  if (!response.ok) {
    throw new Error(`Unable to fetch dated rates: ${response.status}`);
  }

  const payload = await response.json();
  const baseRates = payload?.[baseLower];
  if (!baseRates || typeof baseRates !== 'object') {
    throw new Error('Dated rates payload is invalid.');
  }

  return {
    rates: normalizeRates(baseRates, baseCurrency),
    resolvedDate: String(payload?.date || '').trim() || dateOrLatest
  };
};

export const getDatedRates = async (baseCurrency = 'USD', dateText, options = {}) => {
  const { forceRefresh = false } = options;
  const base = normalizeCurrency(baseCurrency) || 'USD';
  const requestedDate = normalizeRequestedRateDate(dateText);
  const cacheKey = buildCacheKey(base, requestedDate);

  if (!forceRefresh) {
    const memoryEntry = memoryCache.get(cacheKey);
    if (memoryEntry && !isEntryExpired(Number(memoryEntry.timestamp))) {
      return memoryEntry;
    }

    if (memoryEntry && isEntryExpired(Number(memoryEntry.timestamp))) {
      memoryCache.delete(cacheKey);
    }

    const storedEntry = readFromStorage(cacheKey);
    if (storedEntry) {
      memoryCache.set(cacheKey, storedEntry);
      return storedEntry;
    }
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const pendingRequest = (async () => {
    try {
      const directSnapshot = await fetchSnapshot(base, requestedDate);
      const entry = {
        base,
        requestedDate,
        resolvedDate: directSnapshot.resolvedDate,
        rates: directSnapshot.rates,
        source: 'dated',
        fallbackUsed: false,
        timestamp: Date.now()
      };
      writeToCaches(cacheKey, entry);
      return entry;
    } catch (error) {
      const latestSnapshot = await fetchSnapshot(base, 'latest');
      const entry = {
        base,
        requestedDate,
        resolvedDate: latestSnapshot.resolvedDate,
        rates: latestSnapshot.rates,
        source: 'dated-fallback-latest',
        fallbackUsed: true,
        timestamp: Date.now()
      };
      writeToCaches(cacheKey, entry);
      return entry;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, pendingRequest);
  return pendingRequest;
};

export { getTodayDateString };
