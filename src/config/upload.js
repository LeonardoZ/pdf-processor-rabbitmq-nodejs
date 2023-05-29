const multer = require('multer');

const upload = multer({ dest: 'file_upload/' });

module.exports = upload;
