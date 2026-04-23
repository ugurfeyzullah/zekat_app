const { dbPromise } = require('../database');
const { hashToken } = require('../services/authService');

const getBearerToken = (authHeader) => {
  const value = String(authHeader || '');
  if (!value.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return value.slice(7).trim();
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const session = await dbPromise.get(
      `SELECT
         s.id AS session_id,
         s.user_id,
         u.username
       FROM user_sessions s
       INNER JOIN auth_users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
      [hashToken(token)]
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.auth = {
      sessionId: session.session_id,
      userId: session.user_id,
      username: session.username
    };

    // Best effort audit/update for last usage.
    dbPromise
      .run('UPDATE user_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?', [session.session_id])
      .catch(() => {});

    return next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  requireAuth
};
