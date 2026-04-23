import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getRates } from '../services/currencyService';

const AUTO_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [rateSource, setRateSource] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currencies = [
    'USD',
    'EUR',
    'GBP',
    'TRY',
    'AED',
    'SAR',
    'PKR',
    'INR',
    'CAD',
    'AUD',
    'JPY',
    'CNY',
    'CHF',
    'SGD',
    'HKD',
    'MXN'
  ];

  const fetchRates = useCallback(
    async ({ forceRefresh = false } = {}) => {
      setLoading(true);
      setErrorMessage('');

      try {
        const result = await getRates(fromCurrency, { forceRefresh });
        setRates(result.rates);
        setRateSource(result.source);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        setErrorMessage('Unable to fetch rates right now. Check your connection and try again.');
        setRates(null);
      } finally {
        setLoading(false);
      }
    },
    [fromCurrency]
  );

  useEffect(() => {
    fetchRates({ forceRefresh: false });
  }, [fetchRates]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchRates({ forceRefresh: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchRates]);

  useEffect(() => {
    if (!amount || Number(amount) <= 0 || Number.isNaN(Number(amount))) {
      setConvertedAmount('');
      return;
    }

    if (!rates || typeof rates !== 'object') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (fromCurrency === toCurrency) {
        setConvertedAmount(Number(amount));
        return;
      }

      const rate = Number(rates[toCurrency]);
      if (!Number.isFinite(rate)) {
        setConvertedAmount('');
        return;
      }

      setConvertedAmount(Number(amount) * rate);
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [amount, fromCurrency, rates, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const displayRates = useMemo(() => {
    if (!rates) {
      return [];
    }

    return Object.entries(rates)
      .filter(([currency]) => currency !== fromCurrency)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 10);
  }, [fromCurrency, rates]);

  const sourceLabel = useMemo(() => {
    if (rateSource === 'server') {
      return 'server';
    }
    if (rateSource === 'direct') {
      return 'live provider';
    }
    if (rateSource === 'cache') {
      return 'local cache';
    }
    return '';
  }, [rateSource]);

  return (
    <div className="currency-converter">
      <div className="card">
        <h2>Currency converter</h2>

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            alignItems: 'end',
            marginBottom: '2rem'
          }}
        >
          <div>
            <div className="form-group">
              <label>From</label>
              <select value={fromCurrency} onChange={(event) => setFromCurrency(event.target.value)}>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleSwapCurrencies}
            style={{ marginBottom: '0.75rem', height: 'fit-content' }}
          >
            Swap
          </button>

          <div>
            <div className="form-group">
              <label>To</label>
              <select value={toCurrency} onChange={(event) => setToCurrency(event.target.value)}>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Result (auto)</label>
              <input
                type="text"
                value={convertedAmount ? Number(convertedAmount).toFixed(2) : ''}
                readOnly
                placeholder="Result"
              />
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => fetchRates({ forceRefresh: true })}
          disabled={loading}
        >
          {loading ? 'Updating rates...' : 'Refresh Rates Now'}
        </button>

        {convertedAmount && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <p style={{ color: '#155724', fontSize: '1.2rem' }}>
              <strong>
                {amount} {fromCurrency} = {Number(convertedAmount).toFixed(2)} {toCurrency}
              </strong>
            </p>
          </div>
        )}

        {lastUpdate && (
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
            Last updated: {lastUpdate}
            {sourceLabel ? ` (${sourceLabel})` : ''}. Auto-refresh every 15 minutes.
          </p>
        )}
      </div>

      {rates && Object.keys(rates).length > 0 && (
        <div className="card">
          <h2>Exchange rates ({fromCurrency})</h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Rate</th>
                  <th>1 {fromCurrency} =</th>
                </tr>
              </thead>
              <tbody>
                {displayRates.map(([currency, rate]) => (
                  <tr key={currency}>
                    <td style={{ fontWeight: 'bold' }}>{currency}</td>
                    <td>{Number(rate).toFixed(4)}</td>
                    <td style={{ color: '#3498db', fontWeight: 'bold' }}>
                      {Number(rate).toFixed(2)} {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f0f7ff',
              borderRadius: '5px'
            }}
          >
            <p style={{ fontSize: '0.9rem', color: '#0c5460' }}>
              Rates are online and automatic. The app uses server rates when available, then a live provider, then local cache.
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Tips</h2>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Use one base currency:</strong> convert your assets before calculating Zakat.
          </li>
          <li>
            <strong>Refresh rates:</strong> rates auto-refresh every 15 minutes and can be manually refreshed.
          </li>
          <li>
            <strong>Cross-platform safe:</strong> converter works in web, desktop, and mobile wrappers.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CurrencyConverter;
