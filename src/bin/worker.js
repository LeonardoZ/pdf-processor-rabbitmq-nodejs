const logger = require('../config/logs');
const { connectRabbitmq, disconnectRabbitmq } = require('../config/rabbitmq');

async function main() {
  logger.info('Starting worker');
  connectRabbitmq();
}

main().catch((err) => logger.error('Failed to start: ' + err.stack));

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await disconnectRabbitmq();
  })
);
