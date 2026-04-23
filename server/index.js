const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const currencyController = require('./controllers/currencyController');
const transactionController = require('./controllers/transactionController');
const zakatController = require('./controllers/zakatController');
const authController = require('./controllers/authController');
const syncController = require('./controllers/syncController');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
db.initDatabase();

// Routes

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', requireAuth, authController.logout);

// Sync Routes
app.get('/api/sync/state', requireAuth, syncController.getState);
app.put('/api/sync/state', requireAuth, syncController.saveState);

// Currency Routes
app.get('/api/currency/rates', currencyController.getRates);
app.get('/api/currency/convert', currencyController.convert);

// Transaction Routes
app.get('/api/transactions', transactionController.getAllTransactions);
app.post('/api/transactions', transactionController.addTransaction);
app.put('/api/transactions/:id', transactionController.updateTransaction);
app.delete('/api/transactions/:id', transactionController.deleteTransaction);

// Zakat Routes
app.get('/api/zakat/calculate', zakatController.calculateZakat);
app.get('/api/zakat/summary', zakatController.getZakatSummary);
app.post('/api/zakat/set-year', zakatController.setZakatYear);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
