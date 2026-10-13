const router = require('express').Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activity');
const { httpError } = require('../../middleware/error');

const LINKS = ['lead_id', 'contact_id', 'company_id'];

async function assertLeadAccess(user, leadId) {
  if (!leadId || user.role !== 'sales_rep') return;
  const { rows } = await db.query('SELECT owner_id FROM leads WHERE id = $1', [leadId]);
  if (!rows[0]) throw httpError(404, 'lead not found');
  if (rows[0].owner_id !== user.id) throw httpError(403, 'You do not have access to this lead');
}

router.get('/', asyncHandler(async (req, res) => {
  const where = [];
  const params = [];
  for (const k of LINKS) {
    if (req.query[k]) { params.push(req.query[k]); where.push(`n.${k} = $${params.length}`); }
  }
  if (!where.length) throw httpError(400, 'Provide lead_id, contact_id or company_id');
  await assertLeadAccess(req.user, req.query.lead_id);
  const { rows } = await db.query(
    `SELECT n.*, u.name AS author_name FROM notes n
     LEFT JOIN users u ON u.id = n.author_id
     WHERE ${where.join(' AND ')} ORDER BY n.created_at DESC`,
    params
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) throw httpError(400, 'Write something before saving the note');
  const link = LINKS.find((k) => req.body[k]);
  if (!link) throw httpError(400, 'A note must belong to a lead, contact or company');
  await assertLeadAccess(req.user, req.body.lead_id);

  const { rows } = await db.query(
    `INSERT INTO notes (body, ${link}, author_id) VALUES ($1, $2, $3) RETURNING id`,
    [body.trim(), req.body[link], req.user.id]
  );
  await logActivity(req.user.id, 'note', rows[0].id, 'created', { on: link, id: req.body[link] });
  const note = await db.query(
    'SELECT n.*, u.name AS author_name FROM notes n LEFT JOIN users u ON u.id = n.author_id WHERE n.id = $1',
    [rows[0].id]
  );
  res.status(201).json(note.rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT author_id FROM notes WHERE id = $1', [req.params.id]);
  if (!rows[0]) throw httpError(404, 'note not found');
  if (req.user.role === 'sales_rep' && rows[0].author_id !== req.user.id) {
    throw httpError(403, 'You can only delete your own notes');
  }
  await db.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
  res.status(204).end();
}));

module.exports = router;
