const { nodeEnv } = require('../../config/env');

const log = (level, ...args) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(prefix, ...args);
};

module.exports = {
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
  debug: (...args) => nodeEnv === 'development' && log('debug', ...args),
};
