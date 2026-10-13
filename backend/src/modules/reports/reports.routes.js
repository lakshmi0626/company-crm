const router = require('express').Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

// Dashboard numbers. Sales reps see figures for their own leads and tasks only.
router.get('/dashboard', asyncHandler(async (req, res) => {
  const ownerId = req.user.role === 'sales_rep' ? req.user.id : null;

  const [totals, byStage, bySource, monthlyWon, activities] = await Promise.all([
    db.query(
      `SELECT
         (SELECT COUNT(*)::int FROM contacts) AS contacts,
         (SELECT COUNT(*)::int FROM companies) AS companies,
         (SELECT COUNT(*)::int FROM leads WHERE status = 'open' AND ($1::int IS NULL OR owner_id = $1)) AS open_leads,
         (SELECT COALESCE(SUM(value), 0)::float FROM leads WHERE status = 'open' AND ($1::int IS NULL OR owner_id = $1)) AS pipeline_value,
         (SELECT COALESCE(SUM(value), 0)::float FROM leads WHERE status = 'won' AND ($1::int IS NULL OR owner_id = $1)) AS won_value,
         (SELECT COUNT(*)::int FROM leads WHERE status = 'won' AND ($1::int IS NULL OR owner_id = $1)) AS won_count,
         (SELECT COUNT(*)::int FROM leads WHERE status = 'lost' AND ($1::int IS NULL OR owner_id = $1)) AS lost_count,
         (SELECT COUNT(*)::int FROM tasks WHERE status = 'open' AND due_date <= CURRENT_DATE AND ($1::int IS NULL OR assigned_to = $1)) AS tasks_due`,
      [ownerId]
    ),
    db.query(
      `SELECT s.id, s.name, COUNT(l.id)::int AS leads, COALESCE(SUM(l.value), 0)::float AS value
       FROM pipeline_stages s
       LEFT JOIN leads l ON l.stage_id = s.id AND ($1::int IS NULL OR l.owner_id = $1)
       GROUP BY s.id ORDER BY s.position`,
      [ownerId]
    ),
    db.query(
      `SELECT COALESCE(source, 'Unknown') AS source, COUNT(*)::int AS leads
       FROM leads WHERE ($1::int IS NULL OR owner_id = $1)
       GROUP BY COALESCE(source, 'Unknown') ORDER BY leads DESC`,
      [ownerId]
    ),
    db.query(
      `SELECT to_char(date_trunc('month', closed_at), 'Mon YY') AS month,
              COUNT(*)::int AS deals, COALESCE(SUM(value), 0)::float AS value
       FROM leads
       WHERE status = 'won' AND closed_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
         AND ($1::int IS NULL OR owner_id = $1)
       GROUP BY date_trunc('month', closed_at) ORDER BY date_trunc('month', closed_at)`,
      [ownerId]
    ),
    db.query(
      `SELECT a.id, a.entity, a.entity_id, a.action, a.details, a.created_at, u.name AS user_name
       FROM activities a LEFT JOIN users u ON u.id = a.user_id
       WHERE ($1::int IS NULL OR a.user_id = $1)
       ORDER BY a.created_at DESC LIMIT 10`,
      [ownerId]
    ),
  ]);

  res.json({
    totals: totals.rows[0],
    byStage: byStage.rows,
    bySource: bySource.rows,
    monthlyWon: monthlyWon.rows,
    recentActivity: activities.rows,
  });
}));

module.exports = router;
