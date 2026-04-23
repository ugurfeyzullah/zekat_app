import { buildApiUrl } from './runtimeConfig';

const STORAGE_KEY = 'zakat_tracker_transactions_v1';

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeTransaction = (transaction) => ({
  id: transaction.id,
  user_id: transaction.user_id ?? 1,
  type: transaction.type === 'expense' ? 'expense' : 'income',
  category: transaction.category || '',
  description: transaction.description || '',
  amount: toNumber(transaction.amount),
  currency: (transaction.currency || 'USD').toUpperCase(),
  date: transaction.date || new Date().toISOString().split('T')[0]
});

const sortByMostRecent = (transactions) =>
  [...transactions].sort((a, b) => {
    const dateDelta = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDelta !== 0) {
      return dateDelta;
    }
    return Number(b.id || 0) - Number(a.id || 0);
  });

const transactionSignature = (transaction) =>
  [
    transaction.id ?? '',
    transaction.date ?? '',
    transaction.type ?? '',
    transaction.category ?? '',
    transaction.description ?? '',
    Number(transaction.amount || 0).toFixed(2),
    transaction.currency ?? ''
  ].join('|');

const mergeTransactions = (primaryTransactions, secondaryTransactions) => {
  const mergedMap = new Map();

  [...primaryTransactions, ...secondaryTransactions]
    .map(normalizeTransaction)
    .forEach((transaction) => {
      mergedMap.set(transactionSignature(transaction), transaction);
    });

  return sortByMostRecent(Array.from(mergedMap.values()));
};

const readLocalTransactions = () => {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortByMostRecent(parsed.map(normalizeTransaction));
  } catch (error) {
    console.warn('Unable to read local transactions:', error);
    return [];
  }
};

const saveLocalTransactions = (transactions) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortByMostRecent(transactions)));
  } catch (error) {
    console.warn('Unable to store local transactions:', error);
  }
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

export const getTransactions = async (userId = 1) => {
  try {
    const response = await fetchWithTimeout(
      buildApiUrl(`/api/transactions?userId=${encodeURIComponent(userId)}`)
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.status}`);
    }

    const data = await response.json();
    const serverTransactions = Array.isArray(data) ? data.map(normalizeTransaction) : [];
    const localTransactions = readLocalTransactions();
    const mergedTransactions = mergeTransactions(serverTransactions, localTransactions);
    saveLocalTransactions(mergedTransactions);

    return {
      transactions: mergedTransactions,
      source: 'server'
    };
  } catch (error) {
    return {
      transactions: readLocalTransactions(),
      source: 'local'
    };
  }
};

export const addTransaction = async (transaction, userId = 1) => {
  const payload = normalizeTransaction({
    ...transaction,
    user_id: userId
  });

  try {
    const response = await fetchWithTimeout(buildApiUrl('/api/transactions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add transaction: ${response.status}`);
    }

    return { source: 'server' };
  } catch (error) {
    const localTransactions = readLocalTransactions();
    const newTransaction = {
      ...payload,
      id: Date.now()
    };

    saveLocalTransactions([newTransaction, ...localTransactions]);
    return { source: 'local' };
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`/api/transactions/${transactionId}`), {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete transaction: ${response.status}`);
    }
  } catch (error) {
    // Fall through to local deletion.
  }

  const localTransactions = readLocalTransactions().filter(
    (transaction) => String(transaction.id) !== String(transactionId)
  );
  saveLocalTransactions(localTransactions);
};
