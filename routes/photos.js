const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Photo = require("../models/Photos");
const User = require("../models/User");
const upload = require("../middleware/multer"); // 👈 YOUR EXISTING MULTER

const ObjectId = mongoose.Types.ObjectId;

/* ================================
   UPLOAD PHOTO (BASE64)
================================ */
router.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { userId } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const base64Image = req.file.buffer.toString("base64");

    const newPhoto = new Photo({
      userId: new ObjectId(userId),
      photo: base64Image
    });

    await newPhoto.save();

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { photoCount: 1 } },
      { new: true }
    );

    res.status(201).json({
      message: "Photo uploaded successfully",
      photoId: newPhoto._id,
      photoCount: user.photoCount
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   FETCH USER PHOTOS
================================ */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const photos = await Photo.find({ userId })
      .select("+photo")
      .sort({ createdAt: -1 });

    res.status(200).json(photos);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   DELETE PHOTO
================================ */
router.delete("/delete/:id", async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    await User.findByIdAndUpdate(
      photo.userId,
      { $inc: { photoCount: -1 } }
    );

    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;