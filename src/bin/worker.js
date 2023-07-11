const logger = require('../config/logs');
const { connectMongo } = require('../config/mongo');
const { connectRabbitmq, disconnectRabbitmq } = require('../config/rabbitmq');
async function main() {
  logger.info('Starting worker');
  await connectRabbitmq(true);
  await connectMongo();
}

main()
  .then(() => console.log('starting worker...'))
  .catch((err) => logger.error('Failed to start: ' + err.stack));

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await disconnectRabbitmq();
  })
);
