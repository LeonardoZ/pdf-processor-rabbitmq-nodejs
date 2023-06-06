const logger = require('../../config/logs');

function handleParseFile(channel, content, originalMessage) {
  logger.info('_parse_file', content, originalMessage);
  channel.ack(originalMessage);
}

module.exports = { handleParseFile };
