const logger = require('../../config/logs');

function handleParseFile(channel, content, originalMessage, producers) {
  logger.info('#_parse_file' + content);
  channel.reject(originalMessage, false);
}

module.exports = { handleParseFile };
