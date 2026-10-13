const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

const DEFAULT_STAGES = [
  ['New', 1, 10, false, false],
  ['Contacted', 2, 25, false, false],
  ['Qualified', 3, 40, false, false],
  ['Proposal sent', 4, 60, false, false],
  ['Negotiation', 5, 80, false, false],
  ['Won', 6, 100, true, false],
  ['Lost', 7, 0, false, true],
];

(async () => {
  try {
    await db.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM pipeline_stages');
    if (rows[0].n === 0) {
      for (const s of DEFAULT_STAGES) {
        await db.query(
          'INSERT INTO pipeline_stages (name, position, probability, is_won, is_lost) VALUES ($1,$2,$3,$4,$5)', s
        );
      }
      console.log('Inserted default pipeline stages');
    }
    console.log('Database schema is up to date');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();
