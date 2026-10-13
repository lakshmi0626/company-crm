const express = require('express');
const db = require('../config/db');
const asyncHandler = require('./asyncHandler');
const { logActivity } = require('./activity');
const { authorize } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

/**
 * Builds a REST router (list, get, create, update, delete) for one table.
 * The main table is always aliased as `t` in `from`, `columns`, filters and search.
 */
module.exports = function crud(opts) {
  const {
    entity, table, fields,
    required = [], search = [], filters = [],
    from = `${table} t`, columns = 't.*', orderBy = 't.id DESC',
    ownerCol = null, scopeByOwner = false, touch = false,
    labelField = 'id', deleteRoles = ['admin', 'manager'],
    beforeSave = null,
  } = opts;

  const router = express.Router();

  const clean = (body, isCreate) => {
    const out = {};
    for (const f of fields) {
      if (body[f] === undefined) continue;
      if (body[f] === '' || body[f] === null) {
        if (!isCreate) out[f] = null; // allow clearing on update, let defaults apply on create
      } else out[f] = body[f];
    }
    return out;
  };

  const fetchOne = async (id) =>
    (await db.query(`SELECT ${columns} FROM ${from} WHERE t.id = $1`, [id])).rows[0];

  const canAccess = (user, row) =>
    !(scopeByOwner && user.role === 'sales_rep' && row[ownerCol] !== user.id);

  router.get('/', asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
    const where = [];
    const params = [];

    if (req.query.q && search.length) {
      params.push(`%${req.query.q}%`);
      where.push('(' + search.map((c) => `${c}::text ILIKE $${params.length}`).join(' OR ') + ')');
    }
    for (const f of filters) {
      const v = req.query[f.param];
      if (v !== undefined && v !== '') {
        params.push(v);
        where.push(`${f.column} = $${params.length}`);
      }
    }
    if (scopeByOwner && req.user.role === 'sales_rep') {
      params.push(req.user.id);
      where.push(`t.${ownerCol} = $${params.length}`);
    }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (await db.query(`SELECT COUNT(*)::int AS n FROM ${from} ${w}`, params)).rows[0].n;
    const rows = (await db.query(
      `SELECT ${columns} FROM ${from} ${w} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      params
    )).rows;
    res.json({ data: rows, page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) });
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const row = await fetchOne(req.params.id);
    if (!row) throw httpError(404, `${entity} not found`);
    if (!canAccess(req.user, row)) throw httpError(403, 'You do not have access to this record');
    res.json(row);
  }));

  router.post('/', asyncHandler(async (req, res) => {
    const data = clean(req.body, true);

    if (ownerCol && (data[ownerCol] === undefined || req.user.role === 'sales_rep')) {
      data[ownerCol] = req.user.id;
    }
    if (beforeSave) await beforeSave(data, req, null);

    const missing = required.filter((f) => data[f] === undefined);
    if (missing.length) throw httpError(400, `Required: ${missing.join(', ')}`);

    const keys = Object.keys(data);
    const inserted = await db.query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
      keys.map((k) => data[k])
    );
    const row = await fetchOne(inserted.rows[0].id);
    await logActivity(req.user.id, entity, row.id, 'created', { label: row[labelField] });
    res.status(201).json(row);
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    const existing = await fetchOne(req.params.id);
    if (!existing) throw httpError(404, `${entity} not found`);
    if (!canAccess(req.user, existing)) throw httpError(403, 'You do not have access to this record');

    const data = clean(req.body, false);
    const blank = required.filter((f) => f in data && data[f] === null);
    if (blank.length) throw httpError(400, `Required: ${blank.join(', ')}`);
    if (ownerCol && req.user.role === 'sales_rep') delete data[ownerCol];
    if (beforeSave) await beforeSave(data, req, existing);

    const keys = Object.keys(data);
    if (!keys.length) throw httpError(400, 'Nothing to update');
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    if (touch) sets.push('updated_at = NOW()');
    await db.query(
      `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${keys.length + 1}`,
      [...keys.map((k) => data[k]), req.params.id]
    );
    const row = await fetchOne(req.params.id);
    await logActivity(req.user.id, entity, row.id, 'updated', { label: row[labelField] });
    res.json(row);
  }));

  router.delete('/:id', authorize(...deleteRoles), asyncHandler(async (req, res) => {
    const existing = await fetchOne(req.params.id);
    if (!existing) throw httpError(404, `${entity} not found`);
    if (!canAccess(req.user, existing)) throw httpError(403, 'You do not have access to this record');
    await db.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
    await logActivity(req.user.id, entity, existing.id, 'deleted', { label: existing[labelField] });
    res.status(204).end();
  }));

  router.fetchOne = fetchOne;
  router.canAccess = canAccess;
  return router;
};
