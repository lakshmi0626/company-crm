const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const env = require('../../config/env');
const asyncHandler = require('../../utils/asyncHandler');
const { httpError } = require('../../middleware/error');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.name }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');

exports.setupStatus = asyncHandler(async (req, res) => {
  const { n } = (await db.query('SELECT COUNT(*)::int AS n FROM users')).rows[0];
  res.json({ needsSetup: n === 0 });
});

// Public registration only works for the very first account, which becomes the admin.
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !validEmail(email)) throw httpError(400, 'Enter your name and a valid email');
  if (!password || password.length < 8) throw httpError(400, 'Password must be at least 8 characters');

  const { n } = (await db.query('SELECT COUNT(*)::int AS n FROM users')).rows[0];
  if (n > 0) throw httpError(403, 'Sign-up is closed. Ask an admin to create your account');

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING *`,
    [name.trim(), email.trim().toLowerCase(), hash]
  );
  res.status(201).json({ token: sign(rows[0]), user: publicUser(rows[0]) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Enter your email and password');
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  const user = rows[0];
  const ok = user && user.active && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw httpError(401, 'Email or password is incorrect');
  res.json({ token: sign(user), user: publicUser(user) });
});

exports.me = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1 AND active = TRUE', [req.user.id]);
  if (!rows[0]) throw httpError(401, 'Account not found or disabled');
  res.json(publicUser(rows[0]));
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) throw httpError(400, 'New password must be at least 8 characters');
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0] || !(await bcrypt.compare(currentPassword || '', rows[0].password_hash))) {
    throw httpError(400, 'Current password is incorrect');
  }
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(newPassword, 10), req.user.id]);
  res.json({ message: 'Password updated' });
});
