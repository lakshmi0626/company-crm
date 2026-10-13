const router = require('express').Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { authorize } = require('../../middleware/auth');
const { httpError } = require('../../middleware/error');
const { toCSV, parseCSV } = require('../../utils/csv');
const { logActivity } = require('../../utils/activity');

router.use(authorize('admin', 'manager'));

const EXPORTS = {
  contacts: {
    columns: ['first_name', 'last_name', 'email', 'phone', 'job_title', 'company'],
    sql: `SELECT c.first_name, c.last_name, c.email, c.phone, c.job_title, co.name AS company
          FROM contacts c LEFT JOIN companies co ON co.id = c.company_id ORDER BY c.id`,
  },
  companies: {
    columns: ['name', 'industry', 'website', 'phone', 'address', 'size'],
    sql: 'SELECT name, industry, website, phone, address, size FROM companies ORDER BY id',
  },
  leads: {
    columns: ['title', 'value', 'status', 'stage', 'source', 'expected_close', 'company', 'contact', 'owner'],
    sql: `SELECT l.title, l.value, l.status, s.name AS stage, l.source, l.expected_close,
                 co.name AS company, TRIM(c.first_name || ' ' || COALESCE(c.last_name, '')) AS contact, u.name AS owner
          FROM leads l
          LEFT JOIN pipeline_stages s ON s.id = l.stage_id
          LEFT JOIN companies co ON co.id = l.company_id
          LEFT JOIN contacts c ON c.id = l.contact_id
          LEFT JOIN users u ON u.id = l.owner_id ORDER BY l.id`,
  },
};

router.get('/export/:entity', asyncHandler(async (req, res) => {
  const def = EXPORTS[req.params.entity];
  if (!def) throw httpError(404, 'Nothing to export for that type');
  const { rows } = await db.query(def.sql);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.entity}.csv"`);
  res.send(toCSV(rows, def.columns));
}));

// Expects { csv: "<file text>" } with columns: first_name, last_name, email, phone, job_title, company
router.post('/import/contacts', asyncHandler(async (req, res) => {
  const records = parseCSV(req.body.csv);
  if (!records.length) throw httpError(400, 'The file has no data rows. Include a header row and at least one contact');
  if (records.length > 2000) throw httpError(400, 'Import up to 2000 contacts at a time');

  const companyIds = new Map();
  const result = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const line = i + 2; // header is line 1
    if (!r.first_name) { result.errors.push({ line, reason: 'first_name is empty' }); continue; }

    if (r.email) {
      const dup = await db.query('SELECT 1 FROM contacts WHERE LOWER(email) = LOWER($1)', [r.email]);
      if (dup.rows.length) { result.skipped++; continue; }
    }

    let companyId = null;
    if (r.company) {
      const key = r.company.toLowerCase();
      if (!companyIds.has(key)) {
        const found = await db.query('SELECT id FROM companies WHERE LOWER(name) = $1', [key]);
        companyIds.set(key, found.rows[0]
          ? found.rows[0].id
          : (await db.query('INSERT INTO companies (name, owner_id) VALUES ($1, $2) RETURNING id', [r.company, req.user.id])).rows[0].id);
      }
      companyId = companyIds.get(key);
    }

    await db.query(
      `INSERT INTO contacts (first_name, last_name, email, phone, job_title, company_id, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [r.first_name, r.last_name || null, r.email || null, r.phone || null, r.job_title || null, companyId, req.user.id]
    );
    result.imported++;
  }

  await logActivity(req.user.id, 'contact', null, 'imported', { imported: result.imported, skipped: result.skipped });
  res.json(result);
}));

module.exports = router;
