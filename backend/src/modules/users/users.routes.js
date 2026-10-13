const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const crud = require('../../utils/crudFactory');
const asyncHandler = require('../../utils/asyncHandler');
const { authorize } = require('../../middleware/auth');
const { httpError } = require('../../middleware/error');

// Light list used by assignment dropdowns. Open to every signed-in user.
router.get('/options', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT id, name, role FROM users WHERE active = TRUE ORDER BY name');
  res.json(rows);
}));

// Managers can view the team; only admins can change it.
router.use((req, res, next) =>
  (req.method === 'GET' ? authorize('admin', 'manager') : authorize('admin'))(req, res, next)
);

router.delete('/:id', (req, res, next) => {
  if (Number(req.params.id) === req.user.id) {
    return next(httpError(400, 'You cannot delete your own account'));
  }
  next();
});

router.use('/', crud({
  entity: 'user',
  table: 'users',
  fields: ['name', 'email', 'role', 'active', 'password'],
  required: ['name', 'email', 'password_hash'],
  search: ['t.name', 't.email'],
  filters: [{ param: 'role', column: 't.role' }],
  columns: 't.id, t.name, t.email, t.role, t.active, t.created_at',
  orderBy: 't.name ASC',
  labelField: 'name',
  deleteRoles: ['admin'],
  beforeSave: async (data, req, existing) => {
    if (data.password) {
      if (data.password.length < 8) throw httpError(400, 'Password must be at least 8 characters');
      data.password_hash = await bcrypt.hash(data.password, 10);
    } else if (!existing) {
      throw httpError(400, 'Set a password for the new user');
    }
    delete data.password;
    if (data.email) data.email = data.email.trim().toLowerCase();
    if (existing && existing.id === req.user.id && (data.active === false || (data.role && data.role !== 'admin'))) {
      throw httpError(400, 'You cannot disable or demote your own account');
    }
  },
}));

module.exports = router;
