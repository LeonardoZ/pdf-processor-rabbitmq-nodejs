const express = require('express');
const upload = require('../config/upload');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send([]);
});

router.post('/pdf', upload.array('files'), function (req, res, next) {
  const files = req.files;
  console.log(files);
  return res
    .json(
      files.map((f) => ({
        received: f.originalname,
      }))
    )
    .end();
});

module.exports = router;
