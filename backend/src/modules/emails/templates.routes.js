const db = require('../../config/db');
const crud = require('../../utils/crudFactory');
const asyncHandler = require('../../utils/asyncHandler');
const { renderTemplate } = require('../../utils/template');
const { httpError } = require('../../middleware/error');

const router = crud({
  entity: 'template',
  table: 'email_templates',
  fields: ['name', 'subject', 'body'],
  required: ['name', 'subject', 'body'],
  search: ['t.name', 't.subject'],
  from: 'email_templates t LEFT JOIN users u ON u.id = t.created_by',
  columns: 't.*, u.name AS created_by_name',
  orderBy: 't.name ASC',
  ownerCol: 'created_by',
  labelField: 'name',
});

// Fills {{first_name}}, {{last_name}}, {{company}}, {{lead_title}}, {{deal_value}}, {{sender_name}}.
router.post('/:id/render', asyncHandler(async (req, res) => {
  const tpl = (await db.query('SELECT * FROM email_templates WHERE id = $1', [req.params.id])).rows[0];
  if (!tpl) throw httpError(404, 'template not found');

  let lead = null;
  let contact = null;
  if (req.body.lead_id) {
    lead = (await db.query(
      `SELECT l.*, co.name AS company_name FROM leads l
       LEFT JOIN companies co ON co.id = l.company_id WHERE l.id = $1`,
      [req.body.lead_id]
    )).rows[0];
  }
  const contactId = req.body.contact_id || (lead && lead.contact_id);
  if (contactId) {
    contact = (await db.query(
      `SELECT c.*, co.name AS company_name FROM contacts c
       LEFT JOIN companies co ON co.id = c.company_id WHERE c.id = $1`,
      [contactId]
    )).rows[0];
  }

  const vars = {
    first_name: contact && contact.first_name,
    last_name: contact && contact.last_name,
    company: (contact && contact.company_name) || (lead && lead.company_name),
    lead_title: lead && lead.title,
    deal_value: lead && lead.value,
    sender_name: req.user.name,
  };
  res.json({
    subject: renderTemplate(tpl.subject, vars),
    body: renderTemplate(tpl.body, vars),
    to: (contact && contact.email) || null,
  });
}));

module.exports = router;
