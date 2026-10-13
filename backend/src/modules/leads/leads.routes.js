const db = require('../../config/db');
const crud = require('../../utils/crudFactory');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activity');
const { httpError } = require('../../middleware/error');

// Keeps lead status in sync with its stage and stamps closed_at when a deal closes.
async function beforeSave(data, req, existing) {
  if (!data.stage_id && !existing) {
    const first = await db.query('SELECT id FROM pipeline_stages ORDER BY position LIMIT 1');
    data.stage_id = first.rows[0] && first.rows[0].id;
  }
  if (data.stage_id) {
    const { rows } = await db.query('SELECT is_won, is_lost FROM pipeline_stages WHERE id = $1', [data.stage_id]);
    if (!rows[0]) throw httpError(400, 'That pipeline stage does not exist');
    data.status = rows[0].is_won ? 'won' : rows[0].is_lost ? 'lost' : 'open';
    if (!existing || existing.status !== data.status) {
      data.closed_at = data.status === 'open' ? null : new Date();
    }
  }
}

const router = crud({
  entity: 'lead',
  table: 'leads',
  fields: ['title', 'value', 'stage_id', 'contact_id', 'company_id', 'owner_id', 'source', 'expected_close', 'description'],
  required: ['title'],
  search: ['t.title', 'co.name', 'c.first_name', 'c.last_name'],
  filters: [
    { param: 'stage_id', column: 't.stage_id' },
    { param: 'status', column: 't.status' },
    { param: 'source', column: 't.source' },
    { param: 'owner_id', column: 't.owner_id' },
  ],
  from: `leads t
         LEFT JOIN pipeline_stages s ON s.id = t.stage_id
         LEFT JOIN contacts c ON c.id = t.contact_id
         LEFT JOIN companies co ON co.id = t.company_id
         LEFT JOIN users u ON u.id = t.owner_id`,
  columns: `t.*, s.name AS stage_name,
            TRIM(c.first_name || ' ' || COALESCE(c.last_name, '')) AS contact_name,
            c.email AS contact_email, co.name AS company_name, u.name AS owner_name`,
  orderBy: 't.created_at DESC',
  ownerCol: 'owner_id',
  scopeByOwner: true,
  touch: true,
  labelField: 'title',
  beforeSave,
});

// Used by the pipeline board when a card is dragged to another column.
router.patch('/:id/stage', asyncHandler(async (req, res) => {
  const existing = await router.fetchOne(req.params.id);
  if (!existing) throw httpError(404, 'lead not found');
  if (!router.canAccess(req.user, existing)) throw httpError(403, 'You do not have access to this record');
  if (!req.body.stage_id) throw httpError(400, 'Required: stage_id');

  const data = { stage_id: req.body.stage_id };
  await beforeSave(data, req, existing);
  const keys = Object.keys(data);
  await db.query(
    `UPDATE leads SET ${keys.map((k, i) => `${k} = $${i + 1}`).join(', ')}, updated_at = NOW() WHERE id = $${keys.length + 1}`,
    [...keys.map((k) => data[k]), req.params.id]
  );
  const row = await router.fetchOne(req.params.id);
  await logActivity(req.user.id, 'lead', row.id, 'moved', { label: row.title, stage: row.stage_name });
  res.json(row);
}));

module.exports = router;
