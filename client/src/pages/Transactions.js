import React, { useMemo, useState } from 'react';
import { addTransaction, deleteTransaction } from '../services/transactionService';

function Transactions({ transactions, onRefresh, dataSource }) {
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    description: '',
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        const dateDelta = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDelta !== 0) {
          return dateDelta;
        }
        return Number(b.id || 0) - Number(a.id || 0);
      }),
    [transactions]
  );

  const totals = useMemo(() => {
    const totalIncome = sortedTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const totalExpenses = sortedTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses
    };
  }, [sortedTransactions]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.amount || Number.isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setMessage('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addTransaction({
        ...formData,
        amount: Number(formData.amount)
      });

      setMessage(
        result.source === 'server'
          ? 'Transaction added successfully.'
          : 'Transaction added in local mode.'
      );

      setFormData({
        type: 'income',
        category: '',
        description: '',
        amount: '',
        currency: 'USD',
        date: new Date().toISOString().split('T')[0]
      });

      await onRefresh();
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteTransaction(transactionId);
      await onRefresh();
      setMessage('Transaction deleted.');
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error deleting transaction: ${error.message}`);
    }
  };

  const categories = {
    income: ['Salary', 'Business', 'Investment', 'Rental Income', 'Gift', 'Other'],
    expense: ['Food', 'Utilities', 'Transport', 'Bills', 'Shopping', 'Other']
  };

  const currencies = ['USD', 'EUR', 'GBP', 'TRY', 'AED', 'SAR', 'PKR', 'INR', 'CAD', 'AUD'];

  return (
    <div className="transactions">
      <div className="card">
        <h2>Add new transaction</h2>

        {message && (
          <div className={`alert ${message.toLowerCase().includes('error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <p style={{ marginBottom: '1rem', color: '#555' }}>
          Data mode: {dataSource === 'server' ? 'Server-synced' : 'Local offline'}
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}
          >
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="">Select category</option>
                {categories[formData.type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleInputChange}>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional notes"
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>All transactions</h2>

        {sortedTransactions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction) => (
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
                    <td>{transaction.category || '-'}</td>
                    <td>{transaction.description || '-'}</td>
                    <td style={{ fontWeight: 'bold' }}>
                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                    </td>
                    <td>{transaction.currency}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(transaction.id)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#7f8c8d', padding: '1rem' }}>No transactions yet. Add one above.</p>
        )}
      </div>

      {sortedTransactions.length > 0 && (
        <div className="card">
          <h2>Transaction statistics</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}
          >
            <div>
              <p>
                <strong>Total transactions:</strong>
              </p>
              <p style={{ fontSize: '1.5rem', color: '#3498db' }}>{sortedTransactions.length}</p>
            </div>

            <div>
              <p>
                <strong>Total income:</strong>
              </p>
              <p style={{ fontSize: '1.5rem', color: '#27ae60' }}>${totals.totalIncome.toFixed(2)}</p>
            </div>

            <div>
              <p>
                <strong>Total expenses:</strong>
              </p>
              <p style={{ fontSize: '1.5rem', color: '#e74c3c' }}>${totals.totalExpenses.toFixed(2)}</p>
            </div>

            <div>
              <p>
                <strong>Net balance:</strong>
              </p>
              <p style={{ fontSize: '1.5rem', color: totals.netBalance >= 0 ? '#27ae60' : '#e74c3c' }}>
                ${totals.netBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
