const logger = require('../config/logs');
const { connect, disconnect } = require('../config/rabbitmq');

connect(true);

logger.info('Starting worker');

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await disconnect();
  })
);
