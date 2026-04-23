const { dbPromise } = require('../database');

const getAllTransactions = async (req, res) => {
  try {
    const { userId = 1 } = req.query;

    const transactions = await dbPromise.all(
      `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`,
      [userId]
    );

    res.json(transactions || []);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { userId = 1, type, category, description, amount, currency, date } = req.body;

    if (!type || !amount || !date) {
      return res.status(400).json({
        error: 'Missing required fields: type, amount, date'
      });
    }

    await dbPromise.run(
      `INSERT INTO transactions (user_id, type, category, description, amount, currency, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, category, description, amount, currency || 'USD', date]
    );

    res.status(201).json({ message: 'Transaction added successfully' });
  } catch (error) {
    console.error('Error adding transaction:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, description, amount, currency, date } = req.body;

    if (!amount || !date) {
      return res.status(400).json({
        error: 'Missing required fields: amount, date'
      });
    }

    await dbPromise.run(
      `UPDATE transactions SET type = ?, category = ?, description = ?, amount = ?, currency = ?, date = ?
       WHERE id = ?`,
      [type, category, description, amount, currency, date, id]
    );

    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Error updating transaction:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await dbPromise.run(
      `DELETE FROM transactions WHERE id = ?`,
      [id]
    );

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
};
