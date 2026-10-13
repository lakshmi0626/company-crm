const db = require('../config/db');

// Activity logging must never break the request that triggered it.
async function logActivity(userId, entity, entityId, action, details = {}) {
  try {
    await db.query(
      'INSERT INTO activities (user_id, entity, entity_id, action, details) VALUES ($1,$2,$3,$4,$5)',
      [userId, entity, entityId, action, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
