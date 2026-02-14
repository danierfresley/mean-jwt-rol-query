const mongoose = require('mongoose');
const { mongoUri } = require('./env');
const logger = require('../core/utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB conectado');
  } catch (err) {
    logger.error('Error conectando a MongoDB', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
