const { RabbitMqConnection } = require('../config/rabbitmq-class');

const connection = new RabbitMqConnection(false);

function disconnect() {
  return connection.finish();
}

async function start() {
  await connection.connect();
}

module.exports = { start, disconnect };
