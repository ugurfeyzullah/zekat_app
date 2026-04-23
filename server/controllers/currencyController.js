const axios = require('axios');

// Cache for exchange rates to minimize API calls
let ratesCache = {
  data: {}
};

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Free API for exchange rates (includes XAU/XAG)
const API_BASE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

const normalizeCurrencyCode = (code) => String(code || '').trim().toUpperCase();

const parseRatesPayload = (payload, baseCurrency) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid rates payload');
  }

  const baseLower = baseCurrency.toLowerCase();

  // Expected shape: { date: 'YYYY-MM-DD', [baseLower]: { usd: 1, eur: 0.9, ... } }
  let ratesObject = payload[baseLower];

  if (!ratesObject || typeof ratesObject !== 'object' || Array.isArray(ratesObject)) {
    const fallbackEntry = Object.entries(payload).find(([key, value]) => (
      key !== 'date' && value && typeof value === 'object' && !Array.isArray(value)
    ));

    ratesObject = fallbackEntry ? fallbackEntry[1] : null;
  }

  if (!ratesObject || typeof ratesObject !== 'object') {
    throw new Error(`Rates for base ${baseCurrency} not found in payload`);
  }

  const normalizedRates = {};

  for (const [currency, value] of Object.entries(ratesObject)) {
    const code = normalizeCurrencyCode(currency);
    const numericValue = Number(value);

    if (code && Number.isFinite(numericValue)) {
      normalizedRates[code] = numericValue;
    }
  }

  if (!Object.keys(normalizedRates).length) {
    throw new Error(`No valid rates available for base ${baseCurrency}`);
  }

  return {
    rates: normalizedRates,
    date: typeof payload.date === 'string' ? payload.date : null
  };
};

const fetchRatesForBase = async (base) => {
  const normalizedBase = normalizeCurrencyCode(base) || 'USD';
  const cachedEntry = ratesCache.data[normalizedBase];

  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
    return {
      base: normalizedBase,
      rates: cachedEntry.rates,
      date: cachedEntry.date,
      cached: true
    };
  }

  const response = await axios.get(`${API_BASE_URL}/${normalizedBase.toLowerCase()}.json`);
  const parsedPayload = parseRatesPayload(response.data, normalizedBase);

  ratesCache.data[normalizedBase] = {
    rates: parsedPayload.rates,
    date: parsedPayload.date,
    timestamp: Date.now()
  };

  return {
    base: normalizedBase,
    rates: parsedPayload.rates,
    date: parsedPayload.date,
    cached: false
  };
};

const getRates = async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const ratesData = await fetchRatesForBase(base);

    res.json({
      base: ratesData.base,
      rates: ratesData.rates,
      date: ratesData.date,
      cached: ratesData.cached
    });
  } catch (error) {
    console.error('Error fetching rates:', error.message);
    res.status(500).json({
      error: 'Failed to fetch exchange rates',
      message: error.message
    });
  }
};

const convert = async (req, res) => {
  try {
    const { amount, from, to } = req.query;

    if (!amount || !from || !to) {
      return res.status(400).json({
        error: 'Missing parameters: amount, from, to'
      });
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount)) {
      return res.status(400).json({
        error: 'Invalid amount parameter'
      });
    }

    const fromCurrency = normalizeCurrencyCode(from);
    const toCurrency = normalizeCurrencyCode(to);

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({
        error: 'Invalid currency code'
      });
    }

    if (fromCurrency === toCurrency) {
      return res.json({
        from: fromCurrency,
        to: toCurrency,
        amount: parsedAmount,
        rate: 1,
        convertedAmount: parsedAmount,
        timestamp: new Date().toISOString()
      });
    }

    const ratesData = await fetchRatesForBase(fromCurrency);
    const rate = ratesData.rates[toCurrency];

    if (!Number.isFinite(rate)) {
      return res.status(400).json({
        error: `Currency ${toCurrency} not found`
      });
    }

    const convertedAmount = parsedAmount * rate;

    res.json({
      from: fromCurrency,
      to: toCurrency,
      amount: parsedAmount,
      rate,
      convertedAmount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error converting currency:', error.message);
    res.status(500).json({
      error: 'Failed to convert currency',
      message: error.message
    });
  }
};

module.exports = {
  getRates,
  convert
};
