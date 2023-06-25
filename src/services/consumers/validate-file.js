const logger = require('../../config/logs');

const limit = 31457280; //30mb

async function handleValidateFileMessage(
  channel,
  content,
  originalMessage,
  producers
) {
  // validate file format
  if (content.mimetype !== 'application/pdf') {
    // no requeue - direct dead letter
    channel.nack(originalMessage, false, false);
    logger.info('#_handle_validate_file Must by application/pdf');
    return;
  }

  // validate size

  if (content.size > limit) {
    channel.nack(originalMessage, false, false);
    logger.info(
      '#_handle_validate_file' + `File exceeds file limt ${limit} bytes`
    );
    return;
  }
  console.log(producers);
  await producers.parseFile(content.filename);
  channel.ack(originalMessage);
  logger.info(
    '#_handle_validate_file' +
      `File ${content.filename} is valid. Produced parse messsage`
  );
  // post message to next queue
}

module.exports = { handleValidateFileMessage };
