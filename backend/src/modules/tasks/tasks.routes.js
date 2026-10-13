const db = require('../../config/db');
const crud = require('../../utils/crudFactory');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activity');
const { httpError } = require('../../middleware/error');

const router = crud({
  entity: 'task',
  table: 'tasks',
  fields: ['title', 'description', 'due_date', 'status', 'priority', 'assigned_to', 'lead_id', 'contact_id'],
  required: ['title'],
  search: ['t.title', 't.description', 'l.title'],
  filters: [
    { param: 'status', column: 't.status' },
    { param: 'priority', column: 't.priority' },
    { param: 'assigned_to', column: 't.assigned_to' },
    { param: 'lead_id', column: 't.lead_id' },
  ],
  from: `tasks t
         LEFT JOIN users u ON u.id = t.assigned_to
         LEFT JOIN leads l ON l.id = t.lead_id`,
  columns: 't.*, u.name AS assigned_name, l.title AS lead_title',
  orderBy: `t.status ASC, t.due_date ASC NULLS LAST, t.id DESC`,
  ownerCol: 'assigned_to',
  scopeByOwner: true,
  labelField: 'title',
  deleteRoles: ['admin', 'manager', 'sales_rep'],
});

router.patch('/:id/complete', asyncHandler(async (req, res) => {
  const existing = await router.fetchOne(req.params.id);
  if (!existing) throw httpError(404, 'task not found');
  if (!router.canAccess(req.user, existing)) throw httpError(403, 'You do not have access to this record');
  const status = req.body.done === false ? 'open' : 'done';
  await db.query('UPDATE tasks SET status = $1 WHERE id = $2', [status, req.params.id]);
  await logActivity(req.user.id, 'task', existing.id, status === 'done' ? 'completed' : 'reopened', { label: existing.title });
  res.json(await router.fetchOne(req.params.id));
}));

module.exports = router;
