const logger = require('./logs');

require('dotenv').config();

const amqp = require('amqplib');

const connectionOptions = {
  protocol: 'amqp',
  hostname: `${process.env.RABBIT_URL}`,
  port: process.env.RABBIT_PORT,
  username: process.env.RABBIT_USER,
  password: process.env.RABBIT_PASS,
  vhost: '/',
};

const exchanges = {
  pdf: {
    name: 'ex-pdf',
    type: 'topic',
  },
  receive_file_dlx: {
    name: 'dlx-pdf-receive-files',
    type: 'direct',
  },
};

const queues = {
  receive_file: {
    name: 'q-pdf-receive-file',
    binding: 'pdf.receive-file',
    exchange: 'ex-pdf',
    dead_letter_exchange: 'dlx-pdf-receive-files',
  },
  receive_file_dlq: {
    name: 'dlq-pdf-receive-file',
    binding: '#',
    exchange: 'dlx-pdf-receive-files',
  },
  parse_pdf: {
    name: 'q-pdf-parse',
    binding: 'pdf.parse',
    exchange: 'ex-pdf',
    dead_letter_exchange: 'dlx-pdf-receive-files',
  },
};

let connection;
let channel;

async function connect() {
  try {
    connection = await amqp.connect(connectionOptions);
    connection.on('error', handleConnectionError);
    connection.on('close', handleConnectionClose);

    channel = await connection.createChannel();

    // Set up your queues, exchanges, and bindings here
    // ...
    for (const key of Object.keys(exchanges)) {
      const exchange = exchanges[key];
      await channel.assertExchange(exchange.name, exchange.type, {
        durable: true,
      });
      logger.info(`Asserted exchange ${exchange.name}`);
    }

    for (const key of Object.keys(queues)) {
      const queue = queues[key];
      await channel.assertQueue(queue.name, {
        durable: true,
        deadLetterExchange: queue.dead_letter_exchange,
      });
      await channel.bindQueue(queue.name, queue.exchange, queue.binding);
      logger.info(`Asserted queue ${queue.name}`);
    }

    logger.info('Connected to RabbitMQ server');

    // Start consuming messages
    startConsuming();
  } catch (error) {
    logger.error('Error connecting to RabbitMQ server:', error.message);
    // Retry connection after a delay
    setTimeout(connect, 5000);
  }
}

function startConsuming() {
  // Implement your message consumption logic here
  // ...
}

async function produce({ exchange, routingKey, message }) {
  try {
    // Ensure the exchange exists

    // Publish the message with ack required
    const isPublished = channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { mandatory: true }
    );

    return isPublished;
  } catch (error) {
    logger.error('Error producing message: ' + error.message);
    // Handle the error
    throw error;
  }
}

const producers = {
  receiveFile: async ({ filename, mimetype, size }) =>
    produce({
      exchange: exchanges.pdf.name,
      routingKey: 'pdf.parse',
      message: { filename, mimetype, size },
    }),
};

function handleConnectionError(error) {
  logger.error('RabbitMQ connection error:', error.message);
  // Handle the error or log it

  // Retry connection after a delay
  setTimeout(connect, 5000);
}

function handleConnectionClose() {
  logger.info('Connection to RabbitMQ server closed');
  // Handle the connection close event

  // Retry connection after a delay
  setTimeout(connect, 5000);
}

async function finish() {
  await channel.close();
  await connection.close();
}

// Start the initial connection
module.exports = { connect, finish, producers };
