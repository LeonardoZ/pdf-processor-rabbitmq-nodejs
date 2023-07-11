const logger = require('./logs');

require('dotenv').config();

const amqp = require('amqplib');
const {
  handleValidateFileMessage,
} = require('../services/consumers/validate-file');
const { handleParseFile } = require('../services/consumers/parse-file');

const connectionOptions = {
  protocol: 'amqp',
  hostname: `${process.env.RABBIT_URL}`,
  heartbeat: 20,
  port: process.env.RABBIT_PORT,
  username: process.env.RABBIT_USER,
  password: process.env.RABBIT_PASS,
  vhost: '/',
};

const socketOptions = {
  timeout: 5000,
  postConnectTimeout: 20000,
};

const exchanges = {
  pdf: {
    name: 'ex-pdf',
    type: 'topic',
  },
  validate_file_dlx: {
    name: 'dlx-pdf-validate-files',
    type: 'direct',
  },
  parse_pdf_dlx: {
    name: 'dlx-pdf-parse-pdf',
    type: 'direct',
  },
};

const queues = {
  validate_file_dlq: {
    name: 'dlq-pdf-validate-file',
    binding: 'q-pdf-validate-file',
    handler: null,
    exchange: 'dlx-pdf-validate-files',
  },
  validate_file: {
    name: 'q-pdf-validate-file',
    binding: 'pdf.validate-file',
    exchange: 'ex-pdf',
    handler: handleValidateFileMessage,
    dead_letter_exchange: 'dlx-pdf-validate-files',
  },
  parse_pdf_dlq: {
    name: 'dlq-pdf-parse',
    binding: 'q-pdf-parse',
    handler: null,
    exchange: 'dlx-pdf-parse-pdf',
  },
  parse_pdf: {
    name: 'q-pdf-parse',
    binding: 'pdf.parse',
    exchange: 'ex-pdf',
    handler: handleParseFile,
    dead_letter_exchange: 'dlx-pdf-parse-pdf',
  },
};

const producers = {
  validateFile: async ({ filename, mimetype, size }) =>
    produce({
      exchange: exchanges.pdf.name,
      routingKey: 'pdf.validate-file',
      message: { filename, mimetype, size },
    }),

  parseFile: async ({ filename }) =>
    produce({
      exchange: exchanges.pdf.name,
      routingKey: 'pdf.parse',
      message: { filename },
    }),
};

let connection = null;
let channel = null;

async function connectRabbitmq(shouldConsume) {
  try {
    connection = await amqp.connect(connectionOptions, socketOptions);
    connection.on('error', handleConnectionError);
    connection.on('close', handleConnectionClose);

    channel = await connection.createConfirmChannel();

    // configures channel for publish confirms
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
      const deadLetterOpts = !queue.dead_letter_exchange
        ? {}
        : {
            deadLetterExchange: queue.dead_letter_exchange,
            deadLetterRoutingKey: queue.name,
          };

      await channel.assertQueue(queue.name, {
        durable: true,
        ...deadLetterOpts,
      });

      await channel.bindQueue(queue.name, queue.exchange, queue.binding);
      logger.info(`Asserted queue ${queue.name}`);
      if (shouldConsume && queue.handler) {
        await channel.prefetch(1);
        await channel.consume(
          queue.name,
          (message) =>
            queue.handler(
              channel,
              JSON.parse(message.content.toString()),
              message,
              producers
            ),
          {
            noAck: false,
          }
        );
      }
    }

    logger.info('Connected to RabbitMQ server');
  } catch (error) {
    logger.error('Error connecting to RabbitMQ server:' + error.message);
    // Retry connection after a delay
    setTimeout(connectRabbitmq, 5000);
  }
}

function handleConnectionError(error) {
  logger.error('RabbitMQ connection error:' + error.message);
  // Handle the error or log it

  // Retry connection after a delay
  setTimeout(connectRabbitmq, 5000);
}

function handleConnectionClose() {
  logger.info('Connection to RabbitMQ server closed');
  // Handle the connection close event

  // Retry connection after a delay
  setTimeout(connectRabbitmq, 5000);
}

async function produce({ exchange, routingKey, message }) {
  try {
    // Ensure the exchange exists

    // Publish the message with ack required
    const continueToPush = channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { mandatory: true, persistent: true }
    );
    await channel.waitForConfirms();
    console.log('output ', continueToPush);
    return continueToPush;
  } catch (error) {
    logger.error('Error producing message: ' + error.stack);
    // Handle the error
    await connection.close();
    throw error;
  }
}

async function disconnectRabbitmq() {
  await channel.close();
  await connection.close();
}

// Start the initial connection
module.exports = {
  disconnectRabbitmq,
  connectRabbitmq,
  producers,
};
