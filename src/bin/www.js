/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('rabbitmq-node:server');
const http = require('http');
const logger = require('../config/logs');

const { connectRabbitmq, disconnectRabbitmq } = require('../config/rabbitmq');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Start db and queue, then lßisten on provided port, on all network interfaces.
 *
 * */

async function expressListen() {
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

// setup
connectRabbitmq(false)
  .then(async () => await expressListen())
  .catch((err) => logger.error('Failed to start: ' + err.stack));

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await disconnectRabbitmq();
    server.closeAllConnections();
  })
);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
