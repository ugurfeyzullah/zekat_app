# Zakat Tracker App - User Guide

## 📱 Getting Started

### System Requirements
- **PC**: Windows 10+, macOS 10.13+, or Linux
- **Phone**: iOS Safari or Android Chrome
- **Browser**: Any modern browser (Chrome, Firefox, Safari, Edge)
- **Internet**: Required for currency conversion rates

### Opening the App

1. **Backend Server** - Open terminal and run:
   ```bash
   cd zekat_app/server
   npm start
   ```

2. **Frontend** - Open another terminal and run:
   ```bash
   cd zekat_app/client
   npm start
   ```

3. **Browser** - App opens automatically at `http://localhost:3000`

4. **Mobile Access** - On same network:
   - Find PC's IP address (e.g., 192.168.1.100)
   - On phone, visit: `http://[PC-IP]:3000`

---

## 🏠 Dashboard Overview

The dashboard shows your financial snapshot at a glance.

### What You See

**📊 Statistics Cards**
- **Total Income**: All money earned this year
- **Total Expenses**: All money spent this year
- **Net Savings**: Income minus expenses
- **Zakat Due**: Amount you must give (if applicable)

**📈 Zakat Summary**
- Total assets in all forms
- Total liabilities (debts)
- Net wealth calculation
- Nisab status (met/not met)
- Zakat percentage due
- Visual calculation breakdown

**📋 Recent Transactions**
- Last 5 transactions
- Type, amount, currency, date
- Quick overview of recent activity

**💡 Tips Section**
- Best practices for Zakat
- Reminders about calculation
- Helpful information

### Tips
- 📍 Check dashboard daily to see your financial progress
- 📍 Use currency converter to see wealth in different currencies
- 📍 Review recent transactions to ensure accuracy

---

## 💰 Transaction Management

### Adding Transactions

**How to Add**
1. Click **💰 Transactions** tab
2. Fill in the form:
   - **Type**: Select Income or Expense
   - **Category**: Choose from predefined list
   - **Amount**: Enter numeric value
   - **Currency**: Select from 10+ currencies
   - **Date**: Pick transaction date
   - **Description**: Optional notes

3. Click **Add Transaction**

### Transaction Types

**📈 Income Categories**
- Salary
- Business
- Investment
- Rental Income
- Gift
- Other

**📉 Expense Categories**
- Food
- Utilities
- Transport
- Bills
- Shopping
- Other

### Currency Support
- USD, EUR, GBP, TRY, AED
- SAR, PKR, INR, CAD, AUD

### Transaction List

**What You See**
- Date of transaction
- Type (Income/Expense)
- Category
- Description
- Amount with currency
- Delete option

**Actions**
- View all transactions (sorted newest first)
- Delete unwanted transactions
- Search capabilities (coming soon)
- Export to CSV (coming soon)

### Transaction Statistics

- **Total Transactions**: Count of all entries
- **Total Income**: Sum of all income
- **Total Expenses**: Sum of all expenses
- **Net Balance**: Income minus expenses

### Examples

**Example 1: Monthly Salary**
```
Type:        Income
Category:    Salary
Amount:      5,000
Currency:    USD
Date:        2026-04-01
Description: March salary payment
```

**Example 2: Grocery Purchase**
```
Type:        Expense
Category:    Food
Amount:      150
Currency:    USD
Date:        2026-04-20
Description: Weekly groceries
```

**Example 3: International Transfer**
```
Type:        Income
Category:    Gift
Amount:      2,000
Currency:    EUR
Date:        2026-04-15
Description: Gift from family
```

### Tips
- ✍️ Update transactions regularly for accuracy
- 💱 Add multi-currency income in original currency (don't convert)
- 📝 Use descriptions to remember transaction purpose
- 🗑️ Delete duplicate entries immediately
- 📅 Enter date same day for better tracking

---

## 🧮 Zakat Calculator

### Understanding Zakat Calculation

The calculator performs these steps automatically:

1. **Collects all assets** (cash, gold, stocks, etc.)
2. **Subtracts liabilities** (debts, loans)
3. **Calculates net wealth**
4. **Checks nisab threshold** (minimum required)
5. **Applies 2.5% rate** (if nisab is met)
6. **Shows amount due**

### Setting Your Zakat Year

**Step 1**: Navigate to Zakat Calculator  
**Step 2**: Find "Set Your Zakat Year"  
**Step 3**: Select start date  
**Step 4**: System calculates next due date (1 year later)  

**Examples**
- Start: April 21, 2026 → Due: April 21, 2027
- Start: January 1, 2026 → Due: January 1, 2027

### Entering Your Assets

**Asset Types**

1. **💵 Cash & Bank Accounts**
   - Include: Physical money, checking, savings
   - Enter in: USD (or use converter)
   - Example: 15,000

2. **🪙 Gold**
   - Include: Jewelry for storage, bullion, coins
   - Enter in: Grams
   - Example: 50 grams
   - System converts using: ~$65/gram

3. **📈 Stocks & Investments**
   - Include: Stock holdings, bonds, mutual funds
   - Enter value on calculation date
   - Example: 12,000

4. **🏪 Business Inventory**
   - Include: Stock for sale, merchandise
   - Use market value
   - Example: 8,000

5. **📊 Other Assets**
   - Include: Rental property income (annual), receivables
   - Example: 5,000

6. **💳 Liabilities**
   - Include: Debts, loans, credit cards
   - Deducted from assets
   - Example: 3,000

### Example Calculation

```
ASSETS:
☐ Cash:        $15,000
☐ Gold:        50g × $65 = $3,250
☐ Stocks:      $10,000
☐ Inventory:   $8,000
☐ Other:       $5,000
───────────────────────
Total Assets:  $41,250

LIABILITIES:
☐ Personal Debt: $3,000
───────────────────────
Net Wealth:    $38,250

NISAB CHECK:
Threshold:     $5,668 (87.48g of gold)
Your Wealth:   $38,250
Status:        ✅ ABOVE NISAB - Zakat is due

CALCULATION:
Net Wealth:    $38,250
Rate:          × 2.5%
Zakat Due:     = $956.25
```

### Important Points

⚠️ **Your Nisab Status**
- **ABOVE NISAB**: You must pay Zakat
- **BELOW NISAB**: Zakat is not obligatory (charity voluntary)

⚠️ **Deduct All Debts**
- Include personal loans
- Include business debts
- Include credit card balances
- Do NOT include future payments (mortgage)

⚠️ **Use Accurate Dates**
- All asset values on same date
- Typically your Zakat anniversary
- Mark it consistently each year

### Tips
- 🔍 Double-check numbers before calculating
- 📱 Screenshot results for your records
- 📝 Keep receipts of asset evidence
- 🕌 Consult scholar for complex situations
- 💾 Save calculation results

---

## 🔄 Currency Converter

### Why Convert?

You have wealth in multiple currencies:
- Salary in USD
- Gold in Grams (calculate as currency)
- International savings in EUR

The converter unifies everything for accurate Zakat calculation.

### How to Convert

**Quick Conversion**
1. Click **🔄 Currency Converter**
2. Select "From" currency
3. Enter amount
4. Select "To" currency
5. Click **Convert**
6. See result

**Swap Currencies**
- Click **⇄ Swap** button to reverse conversion

### Supported Currencies

| Code | Currency |
|------|----------|
| USD | US Dollar |
| EUR | Euro |
| GBP | British Pound |
| TRY | Turkish Lira |
| AED | Emirates Dirham |
| SAR | Saudi Riyal |
| PKR | Pakistani Rupee |
| INR | Indian Rupee |
| CAD | Canadian Dollar |
| AUD | Australian Dollar |
| JPY | Japanese Yen |
| CNY | Chinese Yuan |
| CHF | Swiss Franc |
| SGD | Singapore Dollar |
| HKD | Hong Kong Dollar |
| MXN | Mexican Peso |

### Exchange Rates

**How Rates Work**
- Updated hourly from live sources
- Cached for 1 hour (to save API calls)
- Show current market rates
- Updated automatically

**Rate Table**
- Shows exchange rates for base currency
- Top 10 most common currencies
- Live updates
- Last update time shown

### Example Conversions

**Example 1: Multi-currency consolidation**
```
GBP 8,000 → USD ?
1 GBP = 1.25 USD
8,000 × 1.25 = $10,000 USD
```

**Example 2: Gold valuation**
```
50 grams gold → USD value
50g × $65/g = $3,250 USD
```

**Example 3: International savings**
```
EUR 5,000 savings → USD equivalent
EUR 5,000 × 1.09 = $5,450 USD
```

### Common Shortcuts

Pre-configured quick conversions:
- USD ↔ EUR (US Dollar ↔ Euro)
- USD ↔ TRY (US Dollar ↔ Turkish Lira)
- USD ↔ AED (US Dollar ↔ Emirates Dirham)
- USD ↔ SAR (US Dollar ↔ Saudi Riyal)
- USD ↔ PKR (US Dollar ↔ Pakistani Rupee)
- USD ↔ INR (US Dollar ↔ Indian Rupee)

Click any to auto-fill for quick conversion.

### Tips
- 💱 Convert all wealth to same currency before Zakat calculation
- 📌 Check rates regularly (fluctuate daily)
- 🌍 Use for travel budgeting too
- ✍️ Note exchange date for record-keeping
- 🔄 Rates cached 1 hour (refresh for latest)

---

## 🎯 Common Scenarios

### Scenario 1: Salaried Employee

**Step 1**: Record monthly salary
```
Type: Income
Category: Salary
Amount: 5,000 USD
Date: 1st of each month
```

**Step 2**: Record regular expenses
```
Type: Expense
Category: Food/Utilities/Transport
Amount: Varies
Date: As they occur
```

**Step 3**: On Zakat anniversary
```
✓ Check dashboard for net savings
✓ Go to Zakat Calculator
✓ Add savings balance + gold (if any)
✓ Calculate Zakat due
✓ Get final amount to distribute
```

### Scenario 2: International Income

**Step 1**: Add income in original currency
```
Type: Income
Category: Salary
Amount: 50,000 PKR (or any currency)
Currency: PKR
Date: Payment date
```

**Step 2**: At Zakat calculation time
```
✓ Go to Currency Converter
✓ Convert PKR to USD: 50,000 PKR = ~$180 USD
✓ Add all converted amounts
✓ Calculate combined Zakat
```

### Scenario 3: Business Owner

**Step 1**: Record business income
```
Type: Income
Category: Business
Amount: 10,000 USD
Date: Weekly/monthly
```

**Step 2**: Record business expenses
```
Type: Expense
Category: Various
Amount: Supplies/equipment/etc
Date: When purchased
```

**Step 3**: Track inventory
```
In Zakat Calculator:
☐ Inventory: [Current stock value]
☐ Receivables: [Money owed to business]
```

**Step 4**: Deduct business liabilities
```
In Zakat Calculator:
☐ Liabilities: [Business loans/debts]
```

### Scenario 4: Multi-Asset Holder

**Situation**: You have savings in:
- USD bank account: $10,000
- EUR savings: €5,000
- Gold jewelry: 30 grams
- Stocks: $8,000
- Turkish property rental: 24,000 TRY/year

**Step 1**: Convert all to USD
```
Conversions (rates vary):
USD Bank:      $10,000
EUR Savings:   €5,000 × 1.09 = $5,450
Gold:          30g × $65 = $1,950
Stocks:        $8,000
Rental Income: 24,000 TRY ÷ 35 = $685/month
Annual:        $685 × 12 = $8,220
```

**Step 2**: Calculate Zakat
```
Total Assets:   $38,620
Deduct Debts:   -$3,000
Net Wealth:     $35,620
Nisab Check:    ✅ Above $5,668
Zakat (2.5%):   $890.50
```

---

## ⚙️ Settings & Tips

### Data Storage
- All data saved locally on computer
- Not sent to internet
- Persistent between sessions
- Backup by copying zekat.db file

### Privacy
- Only you see your data
- No cloud sync (by default)
- No advertisements
- No tracking

### Backup

**Manual Backup**
1. Close the app
2. Find `zekat_app/server/zekat.db`
3. Copy to safe location
4. Rename with date: `zekat_2026-04-21.db`

**Restore from Backup**
1. Stop the server
2. Replace `zekat.db` with backup file
3. Restart server
4. Data is restored

### Mobile Access

**Local Network**
1. On PC: Note your IP (ipconfig command)
2. On phone (same WiFi): Visit `http://[PC-IP]:3000`
3. Works like regular phone app

**Tips**
- Bookmark in phone browser
- Add to home screen (Save as app)
- Works offline after first load

---

## ❓ FAQ

**Q: Where is my data stored?**  
A: In `zekat_app/server/zekat.db` file on your computer

**Q: Can I access from multiple devices?**  
A: Yes, if on same local network. Just use PC's IP address.

**Q: What if I make a mistake?**  
A: Delete the wrong transaction and add correct one. System recalculates automatically.

**Q: Can I change Zakat year later?**  
A: Yes, go to Zakat Calculator and select new start date.

**Q: Do I need internet?**  
A: Only for currency conversion. Everything else works offline.

**Q: How often should I update?**  
A: Add transactions regularly (daily is best) for accuracy.

**Q: How do I export my data?**  
A: Feature coming soon. For now, take screenshots of Dashboard.

---

## 🆘 Troubleshooting

### App Won't Start
```
✓ Check Node.js is installed: node --version
✓ Check both npm install commands completed
✓ Check no ports already in use
✓ Restart both servers
```

### Calculations Seem Wrong
```
✓ Check all transactions recorded correctly
✓ Verify no duplicate transactions
✓ Confirm currency selections
✓ Double-check Zakat year setting
```

### Currency Converter Won't Work
```
✓ Check internet connection
✓ Check backend server is running
✓ Wait 1 minute (rates are cached)
✓ Refresh browser
```

### Data Lost
```
✓ Check zekat.db file exists
✓ Try restoring from backup
✓ Contact support with error message
```

---

## 📞 Support

**For Help With:**
- **App Usage**: Refer to this guide
- **Islamic Questions**: Consult local Islamic scholar
- **Technical Issues**: Check README.md and INSTALLATION.md
- **Feature Requests**: Document and share in feedback

---

**Happy Tracking! May Allah accept your worship. 🤲**

**Version**: 1.0.0  
**Last Updated**: 2026-04-21
