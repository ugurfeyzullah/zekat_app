const { dbPromise } = require('../database');

const NISAB_GOLD_GRAMS = 87.48; // Standard nisab in grams of gold
const ZAKAT_RATE = 0.025; // 2.5% standard rate
const GOLD_PRICE_PER_GRAM = 65; // Approximate USD per gram (will need to be fetched from API)

const calculateZakat = async (req, res) => {
  try {
    const { userId = 1, baseCurrency = 'USD' } = req.query;

    // Get all assets for the user
    const assets = await dbPromise.all(
      `SELECT * FROM assets WHERE user_id = ? AND date >= DATE('now', '-1 year')`,
      [userId]
    );

    // Get all liabilities for the user
    const liabilities = await dbPromise.all(
      `SELECT SUM(amount) as total FROM liabilities WHERE user_id = ?`,
      [userId]
    );

    // Calculate total assets
    let totalAssets = 0;
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        let assetValue = asset.amount;

        // If asset is gold or silver in grams, convert to currency value
        if (asset.asset_type === 'gold' && asset.weight_grams) {
          assetValue = asset.weight_grams * GOLD_PRICE_PER_GRAM;
        }

        totalAssets += assetValue;
      }
    }

    // Get total liabilities
    const totalLiabilities = liabilities[0]?.total || 0;

    // Calculate net wealth
    const netWealth = Math.max(0, totalAssets - totalLiabilities);

    // Calculate nisab threshold (in base currency)
    const nisabThreshold = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM;

    // Determine if nisab is met
    const nisabMet = netWealth >= nisabThreshold;

    // Calculate zakat
    const zakatDue = nisabMet ? netWealth * ZAKAT_RATE : 0;

    res.json({
      userId,
      totalAssets,
      totalLiabilities,
      netWealth,
      nisabThreshold,
      nisabMet,
      zakatDue,
      zakatRate: ZAKAT_RATE * 100,
      baseCurrency,
      calculation: {
        formula: `(${totalAssets} - ${totalLiabilities}) × ${ZAKAT_RATE} = ${zakatDue}`,
        nisabStatus: nisabMet ? 'Zakat is obligatory' : 'Below nisab threshold'
      }
    });
  } catch (error) {
    console.error('Error calculating zakat:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getZakatSummary = async (req, res) => {
  try {
    const { userId = 1 } = req.query;

    // Get user info
    const user = await dbPromise.get(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );

    // Get recent zakat records
    const records = await dbPromise.all(
      `SELECT * FROM zakat_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    // Get this year's transactions
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;

    const expenses = await dbPromise.all(
      `SELECT SUM(amount) as total FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?`,
      [userId, yearStart, yearEnd]
    );

    const income = await dbPromise.all(
      `SELECT SUM(amount) as total FROM transactions
       WHERE user_id = ? AND type = 'income' AND date BETWEEN ? AND ?`,
      [userId, yearStart, yearEnd]
    );

    const totalIncome = income[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;

    res.json({
      user,
      summary: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        year: currentYear
      },
      recentRecords: records || [],
      zakatYearStartDate: user?.zakat_year_start_date
    });
  } catch (error) {
    console.error('Error getting zakat summary:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const setZakatYear = async (req, res) => {
  try {
    const { userId = 1, startDate } = req.body;

    if (!startDate) {
      return res.status(400).json({
        error: 'Missing required field: startDate'
      });
    }

    await dbPromise.run(
      `UPDATE users SET zakat_year_start_date = ? WHERE id = ?`,
      [startDate, userId]
    );

    res.json({
      message: 'Zakat year updated successfully',
      zakatYearStart: startDate,
      zakatYearEnd: calculateNextZakatDate(startDate)
    });
  } catch (error) {
    console.error('Error setting zakat year:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate next zakat date (1 year from start)
const calculateNextZakatDate = (startDate) => {
  const date = new Date(startDate);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
};

module.exports = {
  calculateZakat,
  getZakatSummary,
  setZakatYear
};
