var express = require('express');
var logger = require('morgan');
require('express-async-errors');

var producer = require('./services/producers');

var indexRouter = require('./routes/index');
var jobsRouter = require('./routes/jobs');

var app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/', indexRouter);
app.use('/jobs', jobsRouter);
app.use((error, req, res, next) => {
  res
    .status(500)
    .json({ error: true, message: error.message, stacj: error.stack });
});

producer.connect();

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await producer.disconnect();
  })
);

module.exports = app;
