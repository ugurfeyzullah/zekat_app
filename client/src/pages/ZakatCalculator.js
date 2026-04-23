import React, { useEffect, useMemo, useState } from 'react';
import {
  calculateZakatBreakdown,
  calculateZakatFromTransactions,
  DEFAULT_GOLD_PRICE_PER_GRAM
} from '../utils/zakat';

const ZAKAT_YEAR_STORAGE_KEY = 'zakat_tracker_zakat_year_start_v1';

function ZakatCalculator({ transactions, dataSource }) {
  const [zakatYear, setZakatYear] = useState(() => {
    const stored = window.localStorage.getItem(ZAKAT_YEAR_STORAGE_KEY);
    return stored || new Date().toISOString().split('T')[0];
  });

  const [manualAssets, setManualAssets] = useState({
    cash: '',
    goldGrams: '',
    stocks: '',
    inventory: '',
    other: ''
  });

  const [liabilities, setLiabilities] = useState('');
  const [goldPricePerGram, setGoldPricePerGram] = useState(String(DEFAULT_GOLD_PRICE_PER_GRAM));

  useEffect(() => {
    window.localStorage.setItem(ZAKAT_YEAR_STORAGE_KEY, zakatYear);
  }, [zakatYear]);

  const hasManualInput =
    Object.values(manualAssets).some((value) => String(value).trim() !== '') ||
    String(liabilities).trim() !== '';

  const manualCalculation = useMemo(() => {
    if (!hasManualInput) {
      return null;
    }

    return calculateZakatBreakdown({
      cash: manualAssets.cash,
      goldGrams: manualAssets.goldGrams,
      stocks: manualAssets.stocks,
      inventory: manualAssets.inventory,
      other: manualAssets.other,
      liabilities,
      goldPricePerGram
    });
  }, [goldPricePerGram, hasManualInput, liabilities, manualAssets]);

  const automaticCalculation = useMemo(
    () =>
      calculateZakatFromTransactions(transactions, {
        goldPricePerGram
      }),
    [goldPricePerGram, transactions]
  );

  const displayData = manualCalculation || automaticCalculation;

  const handleAssetChange = (event) => {
    const { name, value } = event.target;
    setManualAssets((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const nextZakatDueDate = useMemo(() => {
    const selectedDate = new Date(zakatYear);
    selectedDate.setFullYear(selectedDate.getFullYear() + 1);
    return selectedDate.toLocaleDateString();
  }, [zakatYear]);

  return (
    <div className="zakat-calculator">
      <div className="card">
        <h2>Set your Zakat year</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Select the start date of your Zakat cycle. Your next due date is one year later.
        </p>
        <div className="form-group">
          <label>Zakat year start date</label>
          <input type="date" value={zakatYear} onChange={(event) => setZakatYear(event.target.value)} />
        </div>
        <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Next Zakat due date: {nextZakatDueDate}</p>
      </div>

      <div className="card">
        <h2>Asset inputs</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Enter values manually for a full breakdown, or leave fields empty to estimate from transactions.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <div className="form-group">
            <label>Cash and bank accounts (USD)</label>
            <input
              type="number"
              name="cash"
              value={manualAssets.cash}
              onChange={handleAssetChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Gold (grams)</label>
            <input
              type="number"
              name="goldGrams"
              value={manualAssets.goldGrams}
              onChange={handleAssetChange}
              placeholder="Enter grams"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Stocks and investments (USD)</label>
            <input
              type="number"
              name="stocks"
              value={manualAssets.stocks}
              onChange={handleAssetChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Business inventory (USD)</label>
            <input
              type="number"
              name="inventory"
              value={manualAssets.inventory}
              onChange={handleAssetChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Other assets (USD)</label>
            <input
              type="number"
              name="other"
              value={manualAssets.other}
              onChange={handleAssetChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Total liabilities (USD)</label>
            <input
              type="number"
              value={liabilities}
              onChange={(event) => setLiabilities(event.target.value)}
              placeholder="Debts, short-term obligations"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Gold price per gram (USD)</label>
            <input
              type="number"
              value={goldPricePerGram}
              onChange={(event) => setGoldPricePerGram(event.target.value)}
              placeholder="Current gold price"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Zakat calculation results</h2>

        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Mode: {manualCalculation ? 'Manual asset input' : 'Estimated from transactions'}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ecf0f1',
              borderRadius: '8px',
              borderLeft: '4px solid #3498db'
            }}
          >
            <p>
              <strong>Total assets</strong>
            </p>
            <p style={{ fontSize: '1.8rem', color: '#3498db', fontWeight: 'bold' }}>
              ${displayData.totalAssets.toFixed(2)}
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ecf0f1',
              borderRadius: '8px',
              borderLeft: '4px solid #e74c3c'
            }}
          >
            <p>
              <strong>Total liabilities</strong>
            </p>
            <p style={{ fontSize: '1.8rem', color: '#e74c3c', fontWeight: 'bold' }}>
              ${displayData.totalLiabilities.toFixed(2)}
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ecf0f1',
              borderRadius: '8px',
              borderLeft: '4px solid #27ae60'
            }}
          >
            <p>
              <strong>Net wealth</strong>
            </p>
            <p style={{ fontSize: '1.8rem', color: '#27ae60', fontWeight: 'bold' }}>
              ${displayData.netWealth.toFixed(2)}
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ecf0f1',
              borderRadius: '8px',
              borderLeft: '4px solid #f39c12'
            }}
          >
            <p>
              <strong>Nisab threshold</strong>
            </p>
            <p style={{ fontSize: '1.8rem', color: '#f39c12', fontWeight: 'bold' }}>
              ${displayData.nisabThreshold.toFixed(2)}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: displayData.nisabMet ? '#d4edda' : '#fff3cd',
            borderRadius: '8px',
            borderLeft: `4px solid ${displayData.nisabMet ? '#27ae60' : '#f39c12'}`,
            marginBottom: '1.5rem'
          }}
        >
          <h3 style={{ color: displayData.nisabMet ? '#155724' : '#856404' }}>
            {displayData.nisabMet ? 'Nisab threshold met' : 'Below Nisab threshold'}
          </h3>
          <p style={{ marginTop: '0.5rem' }}>
            {displayData.nisabMet
              ? 'Your wealth exceeds Nisab, so Zakat is due.'
              : `Your wealth is below Nisab (${displayData.nisabThreshold.toFixed(2)} USD).`}
          </p>
        </div>

        <div
          style={{
            padding: '2rem',
            backgroundColor: '#3498db',
            color: '#fff',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Zakat due</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            ${displayData.zakatDue.toFixed(2)}
          </p>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            {displayData.nisabMet
              ? `${displayData.netWealth.toFixed(2)} x ${displayData.zakatRatePercent}% = ${displayData.zakatDue.toFixed(2)} USD`
              : 'No Zakat due at this time'}
          </p>
        </div>

        {!manualCalculation && (
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Automatic mode estimates cash from total income minus total expenses.
          </p>
        )}

        <p style={{ marginTop: '0.75rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
          Data mode: {dataSource === 'server' ? 'Server-synced' : 'Local offline'}
        </p>
      </div>
    </div>
  );
}

export default ZakatCalculator;
