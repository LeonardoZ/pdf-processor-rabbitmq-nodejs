const logger = require('../../config/logs');
const fs = require('fs/promises');
const pdf = require('pdf-parse');
const { PdfData } = require('../../model');

async function handleParseFile(channel, content, originalMessage, producers) {
  let dataBuffer;
  logger.info('#_parse_file Starting to process file');
  try {
    dataBuffer = await fs.readFile('file_upload/' + content.filename || 'nopt');
  } catch (error) {
    logger.error('File not found');
    channel.reject(originalMessage, false);
    return;
  }

  try {
    logger.info('#_parse_file Parsing PDF');
    const data = await pdf(dataBuffer);

    // number of pages
    console.log(data.numpages);
    // number of rendered pages
    console.log(data.numrender);
    // PDF info
    console.log(data.info);
    // PDF metadata
    console.log(data.metadata);
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    console.log(data.version);
    // PDF text

    const entity = new PdfData({
      name: content.filename,
      page_num: data.numpages,
      info: data.info,
    });

    await entity.save();
    channel.ack(originalMessage);
    logger.info('#_parse_file File saved');
  } catch (error) {
    logger.error('Failed to read PDF ' + error.stack);
    await channel.reject(originalMessage, false);
    return;
  }
}

module.exports = { handleParseFile };
