const express = require('express');
const logger = require('morgan');
const winstonLogger = require('./config/logs');
require('express-async-errors');

const indexRouter = require('./routes/index');
const jobsRouter = require('./routes/jobs');
const pdfDataRouter = require('./routes/pdf-data');

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/', indexRouter);
app.use('/jobs', jobsRouter);
app.use('/pdf-data', pdfDataRouter);
app.use((error, req, res, next) => {
  console.log(error);
  winstonLogger.error(error);
  res
    .status(500)
    .json({ error: true, message: error.message, stacj: error.stack });
});

module.exports = app;
