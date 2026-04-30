const multer = require("multer");

const storage = multer.memoryStorage(); // store file in RAM
const upload = multer({ storage });

module.exports = upload;
