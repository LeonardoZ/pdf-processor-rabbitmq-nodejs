const express = require('express');
const router = express.Router();
const { PdfData } = require('../model');

/* GET users listing. */
router.get('/', async function (req, res, next) {
  const pdf = await PdfData.find();
  return res.json(pdf);
});

module.exports = router;
