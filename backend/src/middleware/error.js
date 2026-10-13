class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const httpError = (status, message) => new HttpError(status, message);

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err.code === '23505') return res.status(409).json({ error: 'A record with this value already exists' });
  if (err.code === '23503') return res.status(409).json({ error: 'This record is linked to other data and cannot be changed this way' });
  if (['22P02', '23502', '23514', '22007'].includes(err.code)) {
    return res.status(400).json({ error: 'Some fields have invalid values' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
}

module.exports = { HttpError, httpError, notFound, errorHandler };
