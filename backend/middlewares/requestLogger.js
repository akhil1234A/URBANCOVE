const morgan = require('morgan');
const logger = require('../utils/logger');

morgan.token('json', (req, res) => {
  return JSON.stringify({
    level: 'info',
    message: `${req.method} ${req.originalUrl} ${res.statusCode}`,
    timestamp: new Date().toISOString(),
  });
});

const requestLogger = morgan(':json', {
  stream: {
    write: (message) => {
      try {
        const logObject = JSON.parse(message);
        logger.log(logObject);
      } catch (err) {
        logger.error('Failed to parse morgan log', err);
      }
    },
  },
});

module.exports = requestLogger;
