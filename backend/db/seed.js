// Demo data for local development. Run after `npm run migrate`.
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const PASSWORD = 'Password@123';

(async () => {
  try {
    const hash = await bcrypt.hash(PASSWORD, 10);
    const users = [
      ['Asha Admin', 'admin@crm.test', 'admin'],
      ['Manoj Manager', 'manager@crm.test', 'manager'],
      ['Ravi Rep', 'rep@crm.test', 'sales_rep'],
    ];
    const ids = {};
    for (const [name, email, role] of users) {
      const r = await db.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name, email, hash, role]
      );
      ids[role] = r.rows[0].id;
    }

    if ((await db.query('SELECT COUNT(*)::int AS n FROM companies')).rows[0].n > 0) {
      console.log('Demo data already present, skipping');
      return;
    }

    const stages = (await db.query('SELECT id, name FROM pipeline_stages')).rows;
    const stage = (n) => stages.find((s) => s.name === n).id;

    const companyRows = [
      ['Northwind Logistics', 'Logistics', 'northwind.example', '40-100'],
      ['Bluepeak Software', 'Software', 'bluepeak.example', '10-40'],
      ['Greenfield Foods', 'Food & beverage', 'greenfield.example', '100-500'],
      ['Harbor Health Clinics', 'Healthcare', 'harborhealth.example', '40-100'],
    ];
    const companies = [];
    for (const [name, industry, website, size] of companyRows) {
      companies.push((await db.query(
        'INSERT INTO companies (name, industry, website, size, owner_id) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [name, industry, website, size, ids.manager]
      )).rows[0].id);
    }

    const contactRows = [
      ['Priya', 'Nair', 'priya@northwind.example', '+91 90000 11111', 'Operations head', 0],
      ['Karthik', 'Rao', 'karthik@bluepeak.example', '+91 90000 22222', 'CTO', 1],
      ['Meera', 'Iyer', 'meera@greenfield.example', '+91 90000 33333', 'Procurement lead', 2],
      ['Sanjay', 'Patel', 'sanjay@harborhealth.example', '+91 90000 44444', 'Director', 3],
    ];
    const contacts = [];
    for (const [f, l, email, phone, title, ci] of contactRows) {
      contacts.push((await db.query(
        `INSERT INTO contacts (first_name,last_name,email,phone,job_title,company_id,owner_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [f, l, email, phone, title, companies[ci], ids.sales_rep]
      )).rows[0].id);
    }

    const leadRows = [
      ['Fleet tracking rollout', 450000, 'Qualified', 'Referral', 0],
      ['Custom API integration', 180000, 'Proposal sent', 'Website', 1],
      ['Inventory dashboard', 320000, 'Negotiation', 'Event', 2],
      ['Patient portal pilot', 750000, 'New', 'Cold outreach', 3],
      ['Support desk setup', 120000, 'Won', 'Referral', 1],
      ['Warehouse analytics', 260000, 'Lost', 'Website', 0],
      ['Billing automation', 210000, 'Contacted', 'Event', 2],
    ];
    const leadIds = [];
    for (const [title, value, st, source, i] of leadRows) {
      const stageRow = stages.find((s) => s.name === st);
      const status = st === 'Won' ? 'won' : st === 'Lost' ? 'lost' : 'open';
      leadIds.push((await db.query(
        `INSERT INTO leads (title, value, status, stage_id, contact_id, company_id, owner_id, source, closed_at, expected_close)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9, CURRENT_DATE + 30) RETURNING id`,
        [title, value, status, stageRow.id, contacts[i], companies[i], ids.sales_rep, source,
          status === 'open' ? null : new Date()]
      )).rows[0].id);
    }

    const taskRows = [
      ['Send proposal to Bluepeak', 'high', 0, 1],
      ['Follow-up call with Greenfield', 'medium', 1, 2],
      ['Prepare demo for Harbor Health', 'high', 3, 3],
      ['Update contact details', 'low', 5, null],
    ];
    for (const [title, priority, days, li] of taskRows) {
      await db.query(
        `INSERT INTO tasks (title, priority, due_date, assigned_to, lead_id) VALUES ($1,$2,CURRENT_DATE + $3::int,$4,$5)`,
        [title, priority, days, ids.sales_rep, li === null ? null : leadIds[li]]
      );
    }

    await db.query(
      `INSERT INTO email_templates (name, subject, body, created_by) VALUES
       ('Introduction', 'Introducing our services to {{company}}',
        E'Hi {{first_name}},\n\nI''m {{sender_name}}. I''d like to share how we can help {{company}} with {{lead_title}}.\n\nCould we schedule a 20-minute call this week?\n\nThanks,\n{{sender_name}}', $1),
       ('Proposal follow-up', 'Following up on {{lead_title}}',
        E'Hi {{first_name}},\n\nJust checking in on the proposal for {{lead_title}}. Happy to answer any questions.\n\nBest,\n{{sender_name}}', $1)`,
      [ids.manager]
    );

    console.log('Seeded demo data. Sign in with admin@crm.test / manager@crm.test / rep@crm.test');
    console.log(`Password for all demo users: ${PASSWORD}`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();
