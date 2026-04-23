export const NISAB_GOLD_GRAMS = 87.48;
export const DEFAULT_GOLD_PRICE_PER_GRAM = 65;
export const ZAKAT_RATE = 0.025;

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const calculateZakatBreakdown = ({
  cash = 0,
  goldGrams = 0,
  stocks = 0,
  inventory = 0,
  other = 0,
  liabilities = 0,
  goldPricePerGram = DEFAULT_GOLD_PRICE_PER_GRAM
} = {}) => {
  const normalizedGoldPrice = Math.max(0, toNumber(goldPricePerGram));

  const assetCash = Math.max(0, toNumber(cash));
  const assetGold = Math.max(0, toNumber(goldGrams)) * normalizedGoldPrice;
  const assetStocks = Math.max(0, toNumber(stocks));
  const assetInventory = Math.max(0, toNumber(inventory));
  const assetOther = Math.max(0, toNumber(other));
  const totalAssets = assetCash + assetGold + assetStocks + assetInventory + assetOther;

  const totalLiabilities = Math.max(0, toNumber(liabilities));
  const netWealth = Math.max(0, totalAssets - totalLiabilities);
  const nisabThreshold = NISAB_GOLD_GRAMS * normalizedGoldPrice;
  const nisabMet = netWealth >= nisabThreshold;
  const zakatDue = nisabMet ? netWealth * ZAKAT_RATE : 0;

  return {
    totalAssets,
    totalLiabilities,
    netWealth,
    nisabThreshold,
    nisabMet,
    zakatDue,
    zakatRatePercent: ZAKAT_RATE * 100
  };
};

export const calculateZakatFromTransactions = (
  transactions = [],
  { liabilities = 0, goldPricePerGram = DEFAULT_GOLD_PRICE_PER_GRAM } = {}
) => {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const estimatedCash = Math.max(0, totalIncome - totalExpenses);
  const calculation = calculateZakatBreakdown({
    cash: estimatedCash,
    liabilities,
    goldPricePerGram
  });

  return {
    ...calculation,
    totalIncome,
    totalExpenses,
    estimatedCashFromTransactions: estimatedCash
  };
};
