const logger = require('./logs');

require('dotenv').config();

const amqp = require('amqplib');

const connectionOptions = {
  protocol: 'amqp',
  hostname: `${process.env.RABBIT_URL}`,
  heartbeat: 5,
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

class RabbitMqConnection {
  connection = null;
  channel = null;
  isProducer = false;

  constructor(isProducer) {
    this.isProducer = isProducer;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(connectionOptions, socketOptions);
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('close', this.handleConnectionClose.bind(this));

      if (this.isProducer) {
        this.channel = await this.connection.createConfirmChannel();
      } else {
        this.channel = await this.connection.createChannel();
      }

      // configures channel for publish confirms
      // Set up your queues, exchanges, and bindings here
      // ...
      for (const key of Object.keys(exchanges)) {
        const exchange = exchanges[key];
        await this.channel.assertExchange(exchange.name, exchange.type, {
          durable: true,
        });
        logger.info(`Asserted exchange ${exchange.name}`);
      }

      for (const key of Object.keys(queues)) {
        const queue = queues[key];
        await this.channel.assertQueue(queue.name, {
          durable: true,
          deadLetterExchange: queue.dead_letter_exchange,
        });
        await this.channel.bindQueue(queue.name, queue.exchange, queue.binding);
        logger.info(`Asserted queue ${queue.name}`);
      }

      logger.info('Connected to RabbitMQ server');
    } catch (error) {
      console.log(error);
      logger.error('Error connecting to RabbitMQ server:' + error.message);
      // Retry connection after a delay
      setTimeout(this.connect.bind(this), 5000);
    }
  }

  handleConnectionError(error) {
    logger.error('RabbitMQ connection error:' + error.message);
    // Handle the error or log it

    // Retry connection after a delay
    setTimeout(this.connect.bind(this), 5000);
  }

  handleConnectionClose() {
    logger.info('Connection to RabbitMQ server closed');
    // Handle the connection close event

    // Retry connection after a delay
    setTimeout(this.connect.bind(this), 5000);
  }

  async produce({ exchange, routingKey, message }) {
    try {
      // Ensure the exchange exists

      // Publish the message with ack required
      const continueToPush = await this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { mandatory: true, persistent: true }
      );
      await this.channel.waitForConfirms();
      return continueToPush;
    } catch (error) {
      logger.error('Error producing message: ' + error.stack);
      // Handle the error
      await this.connection.close();
      throw error;
    }
  }

  async finish() {
    await channel.close();
    await connection.close();
  }
}

// Start the initial connection
module.exports = { RabbitMqConnection, exchanges, queues };
