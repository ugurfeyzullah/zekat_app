const { dbPromise } = require('../database');

const getState = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    const record = await dbPromise.get(
      `SELECT state_json, updated_at
       FROM user_sync_state
       WHERE user_id = ?`,
      [userId]
    );

    if (!record) {
      return res.json({
        state: null,
        updatedAt: null
      });
    }

    let parsedState = null;
    try {
      parsedState = JSON.parse(record.state_json);
    } catch (error) {
      parsedState = null;
    }

    return res.json({
      state: parsedState,
      updatedAt: record.updated_at
    });
  } catch (error) {
    console.error('Get sync state error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch sync state' });
  }
};

const saveState = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const state = req.body?.state;

    if (typeof state === 'undefined') {
      return res.status(400).json({ error: 'Missing required field: state' });
    }

    let serializedState;
    try {
      serializedState = JSON.stringify(state);
    } catch (error) {
      return res.status(400).json({ error: 'State must be JSON-serializable' });
    }

    await dbPromise.run(
      `INSERT INTO user_sync_state (user_id, state_json, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
         state_json = excluded.state_json,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, serializedState]
    );

    const updatedRecord = await dbPromise.get(
      `SELECT updated_at
       FROM user_sync_state
       WHERE user_id = ?`,
      [userId]
    );

    return res.json({
      message: 'State synced successfully',
      updatedAt: updatedRecord?.updated_at || null
    });
  } catch (error) {
    console.error('Save sync state error:', error.message);
    return res.status(500).json({ error: 'Failed to save sync state' });
  }
};

module.exports = {
  getState,
  saveState
};
