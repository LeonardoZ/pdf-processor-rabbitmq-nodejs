const { RabbitMqConnection, exchanges } = require('../config/rabbitmq-class');

const connection = new RabbitMqConnection(true);

function disconnect() {
  return connection.finish();
}

function connect() {
  connection.connect();
}

const producers = {
  receiveFile: async ({ filename, mimetype, size }) =>
    connection.produce({
      exchange: exchanges.pdf.name,
      routingKey: 'pdf.parse',
      message: { filename, mimetype, size },
    }),
};

module.exports = { connect, disconnect, producers };
