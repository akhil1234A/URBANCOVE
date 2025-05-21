const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const errorResponse = {
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  };

  logger.error({
    level: 'error',
    message: `${req.method} ${req.originalUrl} ${statusCode} - ${err.message}`,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
