const router = require('express').Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const params = [];
  const where = [];
  if (req.query.entity) { params.push(req.query.entity); where.push(`a.entity = $${params.length}`); }
  if (req.query.entity_id) { params.push(req.query.entity_id); where.push(`a.entity_id = $${params.length}`); }
  if (req.user.role === 'sales_rep') { params.push(req.user.id); where.push(`a.user_id = $${params.length}`); }
  const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
  const { rows } = await db.query(
    `SELECT a.*, u.name AS user_name FROM activities a LEFT JOIN users u ON u.id = a.user_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY a.created_at DESC LIMIT ${limit}`,
    params
  );
  res.json(rows);
}));

module.exports = router;
