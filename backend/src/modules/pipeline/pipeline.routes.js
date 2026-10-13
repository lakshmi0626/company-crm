const router = require('express').Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { authorize } = require('../../middleware/auth');
const { httpError } = require('../../middleware/error');

router.get('/stages', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM pipeline_stages ORDER BY position');
  res.json(rows);
}));

// Kanban data: every stage with its leads. Sales reps only see their own leads.
router.get('/board', asyncHandler(async (req, res) => {
  const ownerId = req.user.role === 'sales_rep' ? req.user.id : null;
  const stages = (await db.query('SELECT * FROM pipeline_stages ORDER BY position')).rows;
  const leads = (await db.query(
    `SELECT l.id, l.title, l.value, l.status, l.stage_id, l.expected_close,
            co.name AS company_name, u.name AS owner_name,
            TRIM(c.first_name || ' ' || COALESCE(c.last_name, '')) AS contact_name
     FROM leads l
     LEFT JOIN companies co ON co.id = l.company_id
     LEFT JOIN contacts c ON c.id = l.contact_id
     LEFT JOIN users u ON u.id = l.owner_id
     WHERE ($1::int IS NULL OR l.owner_id = $1)
     ORDER BY l.updated_at DESC`,
    [ownerId]
  )).rows;
  res.json({ stages: stages.map((s) => ({ ...s, leads: leads.filter((l) => l.stage_id === s.id) })) });
}));

router.use(authorize('admin', 'manager'));

router.post('/stages', asyncHandler(async (req, res) => {
  const { name, probability = 0, is_won = false, is_lost = false } = req.body;
  if (!name) throw httpError(400, 'Required: name');
  const { rows } = await db.query(
    `INSERT INTO pipeline_stages (name, position, probability, is_won, is_lost)
     VALUES ($1, COALESCE((SELECT MAX(position) + 1 FROM pipeline_stages), 1), $2, $3, $4) RETURNING *`,
    [name, probability, is_won, is_lost]
  );
  res.status(201).json(rows[0]);
}));

// Must be declared before /stages/:id
router.put('/stages/reorder', asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) throw httpError(400, 'Required: ids (array of stage ids)');
  for (let i = 0; i < ids.length; i++) {
    await db.query('UPDATE pipeline_stages SET position = $1 WHERE id = $2', [i + 1, ids[i]]);
  }
  res.json({ message: 'Stages reordered' });
}));

router.put('/stages/:id', asyncHandler(async (req, res) => {
  const { name, probability, is_won, is_lost } = req.body;
  const { rows } = await db.query(
    `UPDATE pipeline_stages SET name = COALESCE($1, name), probability = COALESCE($2, probability),
            is_won = COALESCE($3, is_won), is_lost = COALESCE($4, is_lost)
     WHERE id = $5 RETURNING *`,
    [name, probability, is_won, is_lost, req.params.id]
  );
  if (!rows[0]) throw httpError(404, 'Stage not found');
  res.json(rows[0]);
}));

router.delete('/stages/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM pipeline_stages WHERE id = $1', [req.params.id]);
  res.status(204).end();
}));

module.exports = router;
