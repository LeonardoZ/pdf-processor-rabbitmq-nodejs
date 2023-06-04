var consumer = require('../services/consumers');

consumer.start();

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await consumer.disconnect();
  })
);
