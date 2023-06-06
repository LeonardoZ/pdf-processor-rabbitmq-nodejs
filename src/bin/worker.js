const logger = require('../config/logs');
var consumer = require('../services/consumers');

consumer.start();

logger.info('Starting worker');

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await consumer.disconnect();
  })
);
