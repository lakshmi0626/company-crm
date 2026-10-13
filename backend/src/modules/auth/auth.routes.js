const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many attempts. Try again in a few minutes' },
});

router.get('/setup-status', ctrl.setupStatus);
router.post('/register', limiter, ctrl.register);
router.post('/login', limiter, ctrl.login);
router.get('/me', authenticate, ctrl.me);
router.put('/password', authenticate, ctrl.changePassword);

module.exports = router;
