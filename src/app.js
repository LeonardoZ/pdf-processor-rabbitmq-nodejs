var express = require('express');
var logger = require('morgan');
var producer = require('./services/producers');

var indexRouter = require('./routes/index');
var jobsRouter = require('./routes/jobs');

var app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/', indexRouter);
app.use('/jobs', jobsRouter);

producer.connect();

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    await producer.disconnect();
  })
);

module.exports = app;
