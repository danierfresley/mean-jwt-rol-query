const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const logger = require('./core/utils/logger');

connectDB().then(() => {
  app.listen(port, () => logger.info(`API corriendo en puerto ${port}`));
});
