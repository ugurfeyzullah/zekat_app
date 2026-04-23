# Installation & Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### Step 1: Install Backend Dependencies

```bash
cd zekat_app/server
npm install
```

This installs:
- **express** - Web server framework
- **cors** - Cross-origin request handling
- **sqlite3** - Local database
- **axios** - HTTP client for API calls
- **body-parser** - Request body parsing
- **dotenv** - Environment configuration

### Step 2: Install Frontend Dependencies

```bash
cd zekat_app/client
npm install
```

This installs:
- **react** - UI library
- **react-dom** - React rendering
- **axios** - HTTP client
- **react-scripts** - Build tools

### Step 3: Start the Backend Server

In the `server` directory:

```bash
npm start
```

You should see:
```
Server running on http://localhost:5000
Connected to SQLite database at [path]/zekat.db
Database tables initialized
```

### Step 4: Start the Frontend Application

In a **new terminal**, navigate to the `client` directory:

```bash
npm start
```

The app will automatically open at `http://localhost:3000`

## Using the App

### 1. Dashboard
- View your income and expenses summary
- See automatic Zakat calculation
- Check recent transactions
- Get quick tips about Zakat

### 2. Transactions
- Add income/expense records
- Support for multiple currencies
- Categorize transactions
- Edit or delete entries
- View transaction statistics

### 3. Zakat Calculator
- Set your Zakat calculation year
- Enter your assets manually:
  - Cash & Bank Accounts
  - Gold (in grams)
  - Stocks & Investments
  - Business Inventory
  - Other Assets
- Enter your liabilities (debts)
- Automatic calculation of:
  - Nisab threshold check
  - Net wealth calculation
  - Zakat due (2.5%)

### 4. Currency Converter
- Convert between 16 major currencies
- Real-time exchange rates
- Cache rates for 1 hour
- Common conversion shortcuts
- Live rate display

## Features Explained

### 💾 Data Storage
- All data is stored locally in SQLite database (`zekat.db`)
- Data persists between sessions
- No data is sent to external servers

### 🔄 Currency Conversion
- Uses free ExchangeRate-API
- Supports major world currencies:
  - USD, EUR, GBP, TRY, AED, SAR
  - PKR, INR, CAD, AUD, JPY, CNY
  - CHF, SGD, HKD, MXN
- Rates cached for 1 hour
- Automatic conversion for calculations

### 📊 Automatic Calculations
The app automatically calculates:
1. **Total Income**: Sum of all income transactions
2. **Total Expenses**: Sum of all expense transactions
3. **Net Savings**: Income - Expenses
4. **Total Assets**: Cash + Gold + Stocks + Inventory + Other
5. **Net Wealth**: Total Assets - Total Liabilities
6. **Nisab Status**: Whether net wealth meets minimum threshold
7. **Zakat Due**: Net Wealth × 2.5% (if nisab met)

### 🕌 Zakat Concept
- **Nisab**: Minimum threshold = 87.48g of gold (~$5,000 USD)
- **Rate**: 2.5% of zakatable wealth
- **Frequency**: Annual (every Islamic or Gregorian year)
- **Obligation**: Only if wealth exceeds Nisab
- **Recipients**: Poor, needy, debtors, travelers, workers, new converts

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
# If port is busy, modify PORT in server/.env file
```

### Frontend Won't Connect to Backend
```bash
# Make sure backend is running on port 5000
# Check that proxy is set in client/package.json:
"proxy": "http://localhost:5000"
```

### Database Errors
```bash
# Delete zekat.db and restart server
# Database will be recreated with initial schema
```

### Port Already in Use
```bash
# Backend (port 5000):
# Edit server/.env and change PORT value

# Frontend (port 3000):
# Set environment variable: DANGEROUSLY_DISABLE_HOST_CHECK=true
# Or run: PORT=3001 npm start
```

## Development

### Project Structure
```
zekat_app/
├── server/
│   ├── index.js              # Main server file
│   ├── database.js           # Database setup
│   ├── controllers/
│   │   ├── currencyController.js
│   │   ├── transactionController.js
│   │   └── zakatController.js
│   ├── package.json
│   ├── .env
│   └── zekat.db             # SQLite database (created on first run)
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js           # Main app component
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       ├── Transactions.js
│   │       ├── ZakatCalculator.js
│   │       └── CurrencyConverter.js
│   └── package.json
│
└── README.md

```

## API Endpoints

### Currency APIs
- `GET /api/currency/rates?base=USD` - Get latest exchange rates
- `GET /api/currency/convert?amount=100&from=USD&to=EUR` - Convert currency

### Transaction APIs
- `GET /api/transactions?userId=1` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Zakat APIs
- `GET /api/zakat/calculate?userId=1` - Calculate zakat
- `GET /api/zakat/summary?userId=1` - Get zakat summary
- `POST /api/zakat/set-year` - Set zakat year

## Performance Tips

1. **Cache**: Exchange rates are cached for 1 hour
2. **Database**: Use indexes on frequently queried fields
3. **Frontend**: React renders are optimized with component memoization
4. **API**: Batch requests where possible

## Security Considerations

- **Local Storage**: All data stored locally in SQLite
- **API Keys**: Not used (free APIs)
- **CORS**: Enabled for local development
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Protected by parameterized queries

## Deployment

### Docker (Optional)
```bash
# Create Dockerfile for containerization
docker build -t zekat-app .
docker run -p 5000:5000 -p 3000:3000 zekat-app
```

### Production Build
```bash
cd client
npm run build
# Build files in client/build/
```

## Support & Feedback

For issues or suggestions, please refer to the documentation or contact the development team.

---

**Version**: 1.0.0  
**License**: MIT  
**Last Updated**: 2026-04-21
