const { dbPromise } = require('../database');
const {
  createSessionToken,
  hashPassword,
  hashToken,
  normalizeUsername,
  verifyPassword
} = require('../services/authService');

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 6;

const validateCredentials = (username, password) => {
  if (!username || !password) {
    return 'Missing required fields: username, password';
  }

  if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    return `Username length must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return null;
};

const register = async (req, res) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = String(req.body?.password || '');
    const validationError = validateCredentials(username, password);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingUser = await dbPromise.get(
      'SELECT id FROM auth_users WHERE username = ? COLLATE NOCASE',
      [username]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const { salt, hash } = hashPassword(password);
    const result = await dbPromise.run(
      `INSERT INTO auth_users (username, password_salt, password_hash)
       VALUES (?, ?, ?)`,
      [username, salt, hash]
    );

    return res.status(201).json({
      user: {
        id: result.lastID,
        username
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ error: 'Failed to register user' });
  }
};

const login = async (req, res) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = String(req.body?.password || '');

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing required fields: username, password' });
    }

    const user = await dbPromise.get(
      `SELECT id, username, password_salt, password_hash
       FROM auth_users
       WHERE username = ? COLLATE NOCASE`,
      [username]
    );

    if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = createSessionToken();
    await dbPromise.run(
      `INSERT INTO user_sessions (user_id, token_hash)
       VALUES (?, ?)`,
      [user.id, hashToken(token)]
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ error: 'Failed to login' });
  }
};

const logout = async (req, res) => {
  try {
    const sessionId = req.auth?.sessionId;

    if (!sessionId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await dbPromise.run('DELETE FROM user_sessions WHERE id = ?', [sessionId]);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.status(500).json({ error: 'Failed to logout' });
  }
};

module.exports = {
  register,
  login,
  logout
};
