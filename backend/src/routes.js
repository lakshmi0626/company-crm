const router = require('express').Router();
const { authenticate } = require('./middleware/auth');

router.use('/auth', require('./modules/auth/auth.routes'));

// Everything below requires a valid JWT.
router.use(authenticate);
router.use('/users', require('./modules/users/users.routes'));
router.use('/companies', require('./modules/companies/companies.routes'));
router.use('/contacts', require('./modules/contacts/contacts.routes'));
router.use('/leads', require('./modules/leads/leads.routes'));
router.use('/pipeline', require('./modules/pipeline/pipeline.routes'));
router.use('/tasks', require('./modules/tasks/tasks.routes'));
router.use('/notes', require('./modules/notes/notes.routes'));
router.use('/templates', require('./modules/emails/templates.routes'));
router.use('/reports', require('./modules/reports/reports.routes'));
router.use('/io', require('./modules/importExport/io.routes'));
router.use('/activities', require('./modules/activities/activities.routes'));

module.exports = router;
