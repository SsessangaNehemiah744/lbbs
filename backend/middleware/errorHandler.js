/**
 * 404 handler for unmatched routes
 */
const notFound = (req, res, _next) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
};

/**
 * Global error handler — never exposes stack traces in production
 */
const errorHandler = (err, _req, res, _next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `Duplicate value for ${field}` });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
