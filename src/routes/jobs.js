const express = require('express');
const upload = require('../config/upload');
const { producers } = require('../config/rabbitmq');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send([]);
});

router.post('/pdf', upload.single('file'), async (req, res, next) => {
  const file = req.file;
  const result = await producers.validateFile({
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  });

  if (!result) {
    return res
      .status(500)
      .json({ error: 'Could not upload file. Try again later' });
  }

  return res.status(202).json({
    received: file.originalname,
  });
});

module.exports = router;
