var express = require('express');
var logger = require('morgan');
var rabbitMq = require('./config/rabbitmq');

var indexRouter = require('./routes/index');
var jobsRouter = require('./routes/jobs');

var app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/', indexRouter);
app.use('/jobs', jobsRouter);

rabbitMq.connect();

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.once(signal, async () => {
    console.log('finished');
    await rabbitMq.finish();
  })
);

module.exports = app;
