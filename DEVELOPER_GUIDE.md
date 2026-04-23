# Zakat Tracker App - Complete Documentation

## 🎯 Project Overview

The **Zakat Tracker App** is a modern, user-friendly cross-platform application designed to help Muslims manage their finances and calculate Zakat easily and accurately.

### Key Features

✅ **Record Transactions**
- Track income and expenses in multiple currencies
- Categorize spending
- Maintain detailed transaction history
- View statistics and trends

✅ **Automatic Zakat Calculation**
- Calculate based on assets and liabilities
- Automatic Nisab threshold checking
- 2.5% standard rate calculation
- Support for multiple asset types

✅ **Multi-Currency Support**
- 16+ major world currencies
- Real-time exchange rates
- Currency conversion with live data
- Consolidate wealth in single currency

✅ **Cross-Platform**
- Works on PC (Windows, Mac, Linux)
- Works on phones (mobile browser)
- Access from local network
- No installation needed on phone

✅ **Local Data Storage**
- All data stored locally on your computer
- Privacy-focused (no cloud)
- Full data control
- Easy backup/restore

---

## 📋 Project Structure

```
zekat_app/
│
├── 📄 README.md                    # Quick start guide
├── 📄 INSTALLATION.md              # Detailed installation instructions
├── 📄 USER_GUIDE.md                # Complete user manual
├── 📄 ZAKAT_GUIDE.md               # Islamic Zakat education
├── 📄 DEVELOPER_GUIDE.md           # Development documentation
│
├── server/                         # Node.js/Express Backend
│   ├── index.js                   # Main server file
│   ├── database.js                # Database initialization
│   ├── .env                       # Environment configuration
│   ├── package.json               # Dependencies
│   │
│   └── controllers/               # Route handlers
│       ├── currencyController.js  # Currency conversion API
│       ├── transactionController.js # Transaction CRUD
│       └── zakatController.js     # Zakat calculation
│
├── client/                         # React Frontend
│   ├── public/
│   │   └── index.html             # Main HTML file
│   │
│   ├── src/
│   │   ├── index.js               # Entry point
│   │   ├── index.css              # Global styles
│   │   ├── App.js                 # Main component
│   │   ├── App.css                # App styles
│   │   │
│   │   └── pages/                 # Page components
│   │       ├── Dashboard.js       # Home page
│   │       ├── Transactions.js    # Transaction management
│   │       ├── ZakatCalculator.js # Zakat calculation
│   │       └── CurrencyConverter.js # Currency conversion
│   │
│   └── package.json               # React dependencies
│
└── .gitignore                      # Git ignore rules
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- npm (included with Node.js)

### Installation (3 minutes)

**1. Install Backend**
```bash
cd zekat_app/server
npm install
```

**2. Install Frontend**
```bash
cd ../client
npm install
```

**3. Start Backend (Terminal 1)**
```bash
cd zekat_app/server
npm start
# Server runs on http://localhost:5000
```

**4. Start Frontend (Terminal 2)**
```bash
cd zekat_app/client
npm start
# App opens at http://localhost:3000
```

**Done! 🎉**

---

## 📱 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Computer/Phone                │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │         React Frontend (Port 3000)           │      │
│  │ ┌─────────────────────────────────────────┐  │      │
│  │ │  Dashboard | Transactions | Calculator  │  │      │
│  │ │       Currency Converter | Settings     │  │      │
│  │ └─────────────────────────────────────────┘  │      │
│  └──────────────────────────────────────────────┘      │
│                        ▲                                 │
│                        │ HTTP/REST                       │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │     Node.js/Express Backend (Port 5000)      │      │
│  │ ┌─────────────────────────────────────────┐  │      │
│  │ │  API Routes & Business Logic            │  │      │
│  │ │  - Transactions                         │  │      │
│  │ │  - Zakat Calculations                   │  │      │
│  │ │  - Currency Conversion                  │  │      │
│  │ └─────────────────────────────────────────┘  │      │
│  └──────────────────────────────────────────────┘      │
│                        ▲                                 │
│                        │ SQL                             │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │      SQLite Database (zekat.db)              │      │
│  │  ┌─────────────────────────────────────┐    │      │
│  │  │ - Transactions                      │    │      │
│  │  │ - Assets & Liabilities              │    │      │
│  │  │ - Zakat Records                     │    │      │
│  │  │ - User Settings                     │    │      │
│  │  └─────────────────────────────────────┘    │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│    External APIs (when needed):                         │
│    - ExchangeRate-API (currency rates)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Tables Overview

**users**
- Stores user profiles
- Tracks Zakat year preferences
- One user (ID=1) by default

**transactions**
- Income and expense records
- Linked to users
- Includes: amount, currency, category, date, description

**assets**
- Tracks wealth components
- Asset types: cash, gold, silver, stocks, inventory
- Can track gold/silver by weight

**liabilities**
- Records debts and obligations
- Subtracted from assets for net wealth

**zakat_records**
- Historical Zakat calculations
- Tracks payments made
- Records calculation date and amounts

---

## 🔧 Technology Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: SQLite3
- **APIs**: ExchangeRate-API (free)
- **HTTP**: REST API
- **Middleware**: CORS, Body Parser

### Frontend
- **Library**: React 18
- **Routing**: React Router
- **HTTP**: Axios
- **Styling**: CSS3 (responsive)
- **Build**: Create React App

### Key Libraries

**Backend** (`server/package.json`)
```json
{
  "express": "Web framework",
  "sqlite3": "Database",
  "axios": "HTTP requests",
  "cors": "Cross-origin support",
  "dotenv": "Environment config"
}
```

**Frontend** (`client/package.json`)
```json
{
  "react": "UI library",
  "react-dom": "React rendering",
  "axios": "API calls",
  "react-router-dom": "Navigation"
}
```

---

## 📊 API Endpoints

### Currency APIs
```
GET  /api/currency/rates?base=USD
GET  /api/currency/convert?amount=100&from=USD&to=EUR
```

### Transaction APIs
```
GET    /api/transactions?userId=1
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

### Zakat APIs
```
GET  /api/zakat/calculate?userId=1
GET  /api/zakat/summary?userId=1
POST /api/zakat/set-year
```

### Health Check
```
GET  /api/health
```

---

## 🧮 Zakat Calculation Formula

```javascript
// Core calculation logic
const netWealth = totalAssets - totalLiabilities;
const nisabThreshold = 87.48 * goldPricePerGram; // ~$5,668
const nisabMet = netWealth >= nisabThreshold;
const zakatDue = nisabMet ? netWealth * 0.025 : 0;
```

### Example

```
Calculation:
───────────────────────────
Total Assets:        $50,000
Total Liabilities:  -$5,000
Net Wealth:         $45,000
Nisab Threshold:    $5,668
Nisab Met?          YES ✓
Zakat Rate:         2.5%
───────────────────────────
ZAKAT DUE:          $1,125
```

---

## 🔐 Security & Privacy

### Data Storage
✅ **Local Storage Only**
- No data sent to cloud
- No external servers
- Complete user control

✅ **Database Protection**
- Parameterized queries (SQL injection safe)
- Input validation
- No sensitive data logging

✅ **No Tracking**
- No analytics
- No advertisements
- No telemetry

### API Security
✅ **CORS Enabled** (local development)
✅ **Input Validation** on server
✅ **Error Handling** with safe messages
✅ **No API Keys Required** (free APIs only)

---

## 📈 Performance

### Optimization Features

1. **Rate Caching**
   - Exchange rates cached for 1 hour
   - Reduces API calls
   - Faster response times

2. **Database Indexing**
   - Indexed on user_id, date fields
   - Quick queries
   - Efficient filtering

3. **Frontend Optimization**
   - Lazy loading components
   - Efficient re-rendering
   - Minimal bundle size

4. **API Efficiency**
   - Batch operations possible
   - Pagination ready
   - Proper error handling

---

## 🚀 Deployment Options

### Local Deployment (Current)
```bash
# Development setup
npm start (backend)
npm start (frontend)
# Accessible at localhost:3000
```

### Docker Deployment (Optional)
```bash
# Create containers for isolation
docker build -t zekat-app .
docker run -p 5000:5000 -p 3000:3000 zekat-app
```

### Production Build
```bash
cd client
npm run build
# Creates optimized static files in client/build/
```

### Hosting Options
- **Server**: AWS, DigitalOcean, Heroku, Railway
- **Database**: Cloud SQLite, PostgreSQL
- **Frontend**: Vercel, Netlify, GitHub Pages

---

## 🎓 Learning Resources

### For Users
1. Read: `README.md` - Quick overview
2. Read: `USER_GUIDE.md` - Step-by-step usage
3. Read: `ZAKAT_GUIDE.md` - Islamic context
4. Try: Use app and explore features

### For Developers
1. Read: `INSTALLATION.md` - Setup guide
2. Study: `server/index.js` - API structure
3. Study: `client/App.js` - Frontend structure
4. Extend: Add features by following patterns

---

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| **README.md** | Quick start | 5 min |
| **INSTALLATION.md** | Detailed setup | 15 min |
| **USER_GUIDE.md** | Complete manual | 30 min |
| **ZAKAT_GUIDE.md** | Islamic education | 20 min |
| **DEVELOPER_GUIDE.md** | Technical details | 25 min |

---

## ✨ Features & Benefits

### For Individual Users
✓ Easy transaction recording  
✓ Automatic calculations  
✓ Multi-currency support  
✓ Privacy (local storage)  
✓ Cross-device access  

### For Business Users
✓ Comprehensive asset tracking  
✓ Expense categorization  
✓ Currency consolidation  
✓ Historical records  
✓ Export capabilities (coming)  

### For Communities
✓ Standardized calculations  
✓ Educational resources  
✓ Islamic compliance  
✓ Open source potential  
✓ Customization options  

---

## 🔄 Future Enhancements

**Planned Features** (v2.0)
- Multi-user support with accounts
- Email reminders for Zakat due dates
- CSV/PDF export of calculations
- Mobile app (iOS/Android native)
- Advanced reporting and analytics
- Multiple Zakat schools support
- Cryptocurrency integration
- Zakat payment tracking
- Community features

**Under Consideration**
- Cloud sync (optional)
- Advanced search and filtering
- Budget planning tools
- Investment tracking
- Tax integration
- Multi-language support (Arabic, Urdu, etc.)

---

## 🆘 Support & Help

### Quick Help
- **App Usage**: See `USER_GUIDE.md`
- **Setup Issues**: See `INSTALLATION.md`
- **Islamic Questions**: Consult local imam/scholar
- **Technical**: Check error messages in browser console

### Common Issues
1. **Server won't start** → Check ports 5000/3000 available
2. **Frontend can't connect** → Verify proxy in package.json
3. **Calculations wrong** → Check transaction data accuracy
4. **Currency won't load** → Check internet connection

---

## 📖 References

### Islamic Sources
- Qur'an 2:177, 9:60 (Zakat verses)
- Sahih Bukhari, Sahih Muslim (Hadith)
- Classical Islamic jurisprudence texts

### Technical References
- React Documentation: react.dev
- Express.js Guide: expressjs.com
- SQLite Reference: sqlite.org
- ExchangeRate-API: exchangerate-api.com

---

## 📝 Version History

**v1.0.0** - Initial Release (April 2026)
- Core transaction tracking
- Zakat calculation engine
- Currency conversion
- Dashboard overview
- Multi-currency support
- Local storage database

---

## 📞 Contact & Feedback

**Ways to Help Improve**
1. Test the app thoroughly
2. Report bugs found
3. Suggest new features
4. Share with community
5. Provide feedback

**Contributing**
- Code improvements welcome
- Documentation enhancements needed
- Translation contributions
- Test cases addition
- Security audits appreciated

---

## 📜 License

This project is provided for educational and personal use. 

**Disclaimer**: This app is a tool to help with Zakat calculations. Always consult with qualified Islamic scholars for important financial and religious decisions.

---

## 🤲 Final Notes

> "The best of you are those who are best to their families, and I am the best among you to my family." - Prophet Muhammad (PBUH)

This app is built with the intention to help Muslims fulfill their Islamic obligations with ease and accuracy.

**May Allah accept from all of us. Ameen! 🤲**

---

**Created with ❤️ for the Muslim community**  
**Version**: 1.0.0  
**Last Updated**: April 21, 2026
