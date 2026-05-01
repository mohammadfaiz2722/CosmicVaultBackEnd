const multer = require("multer");

const storage = multer.memoryStorage(); // store file in RAM
const upload = multer({ storage });

module.exports = upload;


const mongoose = require("mongoose");
const { Schema } = mongoose;

const PhotoSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    photo: {
      type: String,
      required: true,
      select: false, // important for performance
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("photo", PhotoSchema);



