const { RabbitMqConnection, exchanges } = require('../config/rabbitmq-class');

const connection = new RabbitMqConnection(true);

function disconnect() {
  return connection.finish();
}

async function start() {
  await connection.connect();
}

function handleReceiveFileMessage(channel) {}

module.exports = { connect, disconnect };
