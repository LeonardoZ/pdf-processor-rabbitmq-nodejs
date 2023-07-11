const { Mongoose } = require('./config/mongo');

const PdfData = Mongoose.model(
  'PdfData',
  new Mongoose.Schema({ name: String, page_num: Number, info: Object })
);

module.exports = { PdfData };
