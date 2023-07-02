const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(
  `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.process.env.MONGO_HOST}`
);

// use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

module.exports = { Mongoose: mongoose };
