# 🕌 Zakat Tracker App

A comprehensive **native desktop and mobile app** for Muslims to track savings, record spendings, and calculate Zakat automatically with real-time currency conversion.

## 🎯 Available Versions

### 🖥️ **Windows Desktop App**
- Native Windows application
- Install from .exe file
- Offline capable
- System integration (Start Menu, taskbar)

### 📱 **iOS Mobile App**
- Native iPhone app
- Install from App Store
- Optimized for touch
- Background sync

### 📱 **Android Mobile App**
- Native Android app
- Install from Google Play
- Optimized for touch
- Background sync

### 🌐 **Web Browser**
- Works on any browser
- Access from PC or phone
- No installation needed

---

## ✨ Features

- 💰 **Record Transactions**: Track income and expenses in any currency
- 🔄 **Currency Conversion**: Real-time rates for 16+ currencies
- 📊 **Automatic Zakat**: Calculate 2.5% with Nisab checking
- 📱 **Multi-Platform**: Windows, iOS, Android, Web
- 💾 **Local Storage**: All data stays on your device
- 📈 **Statistics**: Income/expense tracking
- 🌍 **Multi-Currency**: Convert between different currencies
- ⏰ **Annual Reminders**: Remember your Zakat due date

---

## 🚀 Quick Start

### For Windows Desktop (Easiest)

**1. One-Command Build:**
```bash
cd zekat_app/client
npm install && npm install --save-dev electron electron-builder concurrently wait-on electron-is-dev
npm run electron-build
```

**2. Share the .exe**
- Find: `dist/Zakat-Tracker-Setup-1.0.0.exe`
- Share with friends
- They run it → App installs

### For Mobile Apps

See: [`NATIVE_APP_BUILD.md`](./NATIVE_APP_BUILD.md) for detailed iOS/Android instructions

### For Web Browser

```bash
cd zekat_app/server
npm install && npm start

# In another terminal
cd zekat_app/client
npm install && npm start
```

Visit: `http://localhost:3000`

---

## 📁 Project Structure

```
zekat_app/
├── 📄 README.md                    # This file
├── 📄 QUICK_START_NATIVE.md        # Quick native app guide ⭐
├── 📄 NATIVE_APP_BUILD.md          # Detailed build instructions
├── 📄 INSTALLATION.md              # Web app setup
├── 📄 USER_GUIDE.md                # How to use
├── 📄 ZAKAT_GUIDE.md               # Islamic education
│
├── server/                         # Backend API
│   ├── index.js
│   ├── database.js
│   └── controllers/
│
└── client/                         # Frontend (All platforms)
    ├── src/
    │   ├── App.js
    │   └── pages/
    ├── public/
    │   ├── electron.js             # Windows desktop
    │   └── index.html
    └── package.json
```

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Desktop** | Electron | Windows .exe app |
| **Mobile** | Capacitor | iOS & Android wrapper |
| **Frontend** | React 18 | User interface |
| **Backend** | Express.js | API & business logic |
| **Database** | SQLite | Local data storage |
| **APIs** | ExchangeRate-API | Currency rates |

---

## 📦 Building & Distributing

### Windows Desktop Distribution

```bash
npm run electron-build
# Creates: dist/Zakat-Tracker-Setup-1.0.0.exe
# Users run .exe → App installs → Ready to use
```

### iOS Distribution

```bash
npm run capacitor-build-ios
# Upload to App Store
# Users download from App Store
```

### Android Distribution

```bash
npm run capacitor-build-android
# Upload APK to Google Play
# Users download from Play Store
```

---

## 🎓 Getting Help

1. **Quick Start** → Read [`QUICK_START_NATIVE.md`](./QUICK_START_NATIVE.md)
2. **Detailed Build** → Read [`NATIVE_APP_BUILD.md`](./NATIVE_APP_BUILD.md)
3. **Web Setup** → Read [`INSTALLATION.md`](./INSTALLATION.md)
4. **Using the App** → Read [`USER_GUIDE.md`](./USER_GUIDE.md)
5. **Zakat Info** → Read [`ZAKAT_GUIDE.md`](./ZAKAT_GUIDE.md)

---

## 💡 Key Features Explained

### 📊 Dashboard
- View income/expense summary
- See Zakat status at a glance
- Check recent transactions
- Get helpful tips

### 💰 Transactions
- Add income (salary, business, gifts)
- Add expenses (food, utilities, etc.)
- Multiple currencies supported
- Categorized entries

### 🧮 Zakat Calculator
- Enter all your assets
- Deduct liabilities
- Automatic Nisab checking
- Calculates exact Zakat due (2.5%)

### 🔄 Currency Converter
- Convert between 16+ currencies
- Real-time exchange rates
- Consolidate multi-currency wealth

---

## 🌐 Platform Guide

| Platform | Installation | Usage | Distribution |
|----------|--------------|-------|--------------|
| **Windows** | Run .exe | Double-click to open | Share .exe file |
| **iOS** | App Store | Tap app icon | Apple App Store |
| **Android** | Play Store | Tap app icon | Google Play Store |
| **Web** | Browser | Visit URL | Email/website link |

---

## ✅ What's Included

✓ Complete source code  
✓ Native app templates  
✓ Backend API  
✓ Database setup  
✓ 5 documentation files  
✓ Build configurations  
✓ Example data  

---

## 🎯 Next Steps

1. **Start Here**: Read [`QUICK_START_NATIVE.md`](./QUICK_START_NATIVE.md)
2. **Build Desktop**: `npm run electron-build`
3. **Build Mobile**: Follow [`NATIVE_APP_BUILD.md`](./NATIVE_APP_BUILD.md)
4. **Distribute**: Share .exe or upload to stores
5. **Support Users**: Direct to [`USER_GUIDE.md`](./USER_GUIDE.md)

---

## 📊 Zakat Calculation Example

```
Input Your Data:
├─ Cash: $15,000
├─ Gold: 50 grams
├─ Stocks: $10,000
└─ Debts: -$3,000

System Calculates:
├─ Total Assets: $41,250
├─ Net Wealth: $38,250
├─ Nisab Threshold: $5,668
├─ Nisab Met: ✅ YES
└─ Zakat Due: $956.25 (2.5%)

Result: 💵 Pay $956.25
```

---

## 🔒 Privacy & Security

✅ All data stored **locally** (no cloud)  
✅ No external accounts required  
✅ Complete **user privacy**  
✅ Easy **backup/restore**  
✅ **No tracking** or analytics  
✅ **Offline capable**  

---

## 🚀 Status

✅ **Backend**: Complete  
✅ **Frontend**: Complete  
✅ **Windows Build**: Ready  
✅ **iOS Build**: Ready  
✅ **Android Build**: Ready  
✅ **Documentation**: Complete  

---

## 📞 Support

- **Setup Issues?** → See `NATIVE_APP_BUILD.md`
- **How to Use?** → See `USER_GUIDE.md`
- **About Zakat?** → See `ZAKAT_GUIDE.md`
- **Technical?** → See `DEVELOPER_GUIDE.md`

---

**🕌 Built with ❤️ for the Muslim community**

May Allah accept from all of us. **Ameen!** 🤲
