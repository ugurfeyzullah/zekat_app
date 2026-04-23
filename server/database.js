const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const getDatabasePath = () => {
  const envPath = String(process.env.SQLITE_DB_PATH || '').trim();
  if (!envPath) {
    return path.join(__dirname, 'zekat.db');
  }
  return path.resolve(envPath);
};

const dbPath = getDatabasePath();
const dbDirectory = path.dirname(dbPath);
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database open error: ', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const runSchema = (sql) => {
  db.run(sql, (err) => {
    if (err) {
      console.error('Schema initialization error:', err.message);
    }
  });
};

const initDatabase = () => {
  // Ensure schema statements execute in order.
  db.serialize(() => {
    // Users table
    runSchema(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      zakat_year_start_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Auth users table (for cloud sync accounts)
    runSchema(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Token sessions table
    runSchema(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES auth_users(id) ON DELETE CASCADE
    )
  `);

    runSchema(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
    ON user_sessions(user_id)
  `);

    // Per-user cloud state
    runSchema(`
    CREATE TABLE IF NOT EXISTS user_sync_state (
      user_id INTEGER PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES auth_users(id) ON DELETE CASCADE
    )
  `);

    // Transactions table
    runSchema(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category TEXT,
      description TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

    // Assets table
    runSchema(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      asset_type TEXT NOT NULL CHECK(asset_type IN ('cash', 'gold', 'silver', 'stocks', 'inventory', 'rental_income')),
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      weight_grams REAL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

    // Liabilities table
    runSchema(`
    CREATE TABLE IF NOT EXISTS liabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      description TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

    // Zakat records table
    runSchema(`
    CREATE TABLE IF NOT EXISTS zakat_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_wealth REAL,
      total_liabilities REAL,
      net_wealth REAL,
      nisab_threshold REAL,
      zakat_due REAL,
      currency TEXT DEFAULT 'USD',
      zakat_year_start DATE,
      zakat_year_end DATE,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

    console.log('Database tables initialized');
  });
};

// Promise wrapper for database operations
const dbPromise = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function onRun(err) {
        if (err) reject(err);
        else {
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = {
  db,
  dbPromise,
  initDatabase
};
