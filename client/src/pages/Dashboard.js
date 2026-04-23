import React, { useMemo } from 'react';
import { calculateZakatFromTransactions } from '../utils/zakat';

function Dashboard({ transactions, dataSource }) {
  const currentYear = new Date().getFullYear();

  const yearlySummary = useMemo(() => {
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;

    return transactions.reduce(
      (summary, transaction) => {
        if (transaction.date < yearStart || transaction.date > yearEnd) {
          return summary;
        }

        if (transaction.type === 'income') {
          summary.totalIncome += Number(transaction.amount) || 0;
        }

        if (transaction.type === 'expense') {
          summary.totalExpenses += Number(transaction.amount) || 0;
        }

        return summary;
      },
      {
        totalIncome: 0,
        totalExpenses: 0
      }
    );
  }, [transactions, currentYear]);

  const zakatInfo = useMemo(
    () => calculateZakatFromTransactions(transactions),
    [transactions]
  );

  const netSavings = yearlySummary.totalIncome - yearlySummary.totalExpenses;

  return (
    <div className="dashboard">
      <h2 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Welcome to your Zakat dashboard</h2>

      <div className="stats-grid">
        <div className="stat-box income">
          <h3>Total Income</h3>
          <div className="value">${yearlySummary.totalIncome.toFixed(2)}</div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Year {currentYear}</p>
        </div>

        <div className="stat-box expense">
          <h3>Total Expenses</h3>
          <div className="value">${yearlySummary.totalExpenses.toFixed(2)}</div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Year {currentYear}</p>
        </div>

        <div className="stat-box">
          <h3>Net Savings</h3>
          <div className="value">${netSavings.toFixed(2)}</div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Income minus expenses</p>
        </div>

        <div className="stat-box zakat">
          <h3>Zakat Due</h3>
          <div className="value">${zakatInfo.zakatDue.toFixed(2)}</div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {zakatInfo.nisabMet ? 'Obligatory' : 'Below Nisab'}
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Zakat calculation summary</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <div>
            <p>
              <strong>Estimated total assets:</strong>
            </p>
            <p style={{ fontSize: '1.5rem', color: '#3498db' }}>${zakatInfo.totalAssets.toFixed(2)}</p>
          </div>

          <div>
            <p>
              <strong>Total liabilities:</strong>
            </p>
            <p style={{ fontSize: '1.5rem', color: '#e74c3c' }}>
              ${zakatInfo.totalLiabilities.toFixed(2)}
            </p>
          </div>

          <div>
            <p>
              <strong>Net wealth:</strong>
            </p>
            <p style={{ fontSize: '1.5rem', color: '#27ae60' }}>${zakatInfo.netWealth.toFixed(2)}</p>
          </div>

          <div>
            <p>
              <strong>Nisab threshold:</strong>
            </p>
            <p style={{ fontSize: '1.5rem', color: '#f39c12' }}>
              ${zakatInfo.nisabThreshold.toFixed(2)}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#ecf0f1',
            borderRadius: '5px'
          }}
        >
          <p>
            <strong>Status:</strong>{' '}
            <span
              style={{
                color: zakatInfo.nisabMet ? '#27ae60' : '#e74c3c',
                fontWeight: 'bold'
              }}
            >
              {zakatInfo.nisabMet ? 'Zakat is obligatory' : 'Below Nisab threshold'}
            </span>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Calculation:</strong> ({zakatInfo.totalAssets.toFixed(2)} -{' '}
            {zakatInfo.totalLiabilities.toFixed(2)}) x {zakatInfo.zakatRatePercent}%
          </p>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#2c3e50', fontWeight: 'bold' }}>
            Zakat due: ${zakatInfo.zakatDue.toFixed(2)}
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#555' }}>
            This estimate uses net savings from transactions as cash wealth.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Recent transactions</h2>
        {transactions.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td
                    style={{
                      fontWeight: 'bold',
                      color: transaction.type === 'income' ? '#27ae60' : '#e74c3c'
                    }}
                  >
                    {transaction.type.toUpperCase()}
                  </td>
                  <td>{transaction.category || 'N/A'}</td>
                  <td>{transaction.description || 'N/A'}</td>
                  <td>${Number(transaction.amount).toFixed(2)}</td>
                  <td>{transaction.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#7f8c8d' }}>No transactions yet. Add income and expenses to begin.</p>
        )}
      </div>

      <div className="card">
        <h2>Tips</h2>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Track consistently:</strong> accurate records improve Zakat estimates.
          </li>
          <li>
            <strong>Review Nisab:</strong> Zakat applies when net wealth meets or exceeds Nisab.
          </li>
          <li>
            <strong>Use yearly reviews:</strong> check your position once each Zakat cycle.
          </li>
          <li>
            <strong>Consolidate currencies:</strong> use the converter before final calculations.
          </li>
          <li>
            <strong>Confirm rulings:</strong> consult scholars for specific cases.
          </li>
        </ul>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
          Data mode: {dataSource === 'server' ? 'Server-synced' : 'Local offline'}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
