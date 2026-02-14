const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;

  res.status(status).json({
    ok: false,
    message,
  });
};

module.exports = { errorMiddleware };
