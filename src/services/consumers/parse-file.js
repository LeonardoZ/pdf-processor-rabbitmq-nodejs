const logger = require('../../config/logs');
const fs = require('fs/promises');
const pdf = require('pdf-parse');

async function handleParseFile(channel, content, originalMessage, producers) {
  let dataBuffer;
  try {
    dataBuffer = await fs.readFile('file_upload/' + content.filename || 'nopt');
  } catch (error) {
    logger.error('File not found');
    channel.reject(originalMessage, false);
    return;
  }

  try {
    console.log(content);
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
    //console.log(data.text);
  } catch (error) {
    logger.error('Failed to read PDF');
    channel.reject(originalMessage, false);
    return;
  }
}

module.exports = { handleParseFile };
