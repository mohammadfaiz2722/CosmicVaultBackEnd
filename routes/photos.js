const express = require('express');
const router = express.Router();
const Photo = require('../models/Photos');
const User = require('../models/User'); // Import the User model
const upload = require('../middleware/multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { userId } = req.body;

        // Validate userId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const newPhoto = new Photo({
            userId: new ObjectId(userId), // Convert to ObjectId
            photoUrl: `/uploads/${req.file.filename}`
        });

        await newPhoto.save();

        // Increment photoCount in User schema
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { photoCount: 1 } },
            { new: true } // Return the updated document
        );

        res.status(201).json({ message: 'Photo uploaded successfully', photo: newPhoto, photoCount: user.photoCount });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const photo = await Photo.findByIdAndDelete(req.params.id);

        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        // Decrement photo count in User schema
        await User.findByIdAndUpdate(
            photo.userId,
            { $inc: { photoCount: -1 } },
            { new: true } // Return the updated document
        );

        const filePath = path.join(__dirname, '..', photo.photoUrl);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('File deletion error:', err);
                // Even if file deletion fails, we've removed the database entry
                // You might want to log this for cleanup later
            }
            res.status(200).json({ message: 'Photo deleted successfully' });
        });
    } catch (error) {
        console.error('Deletion error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const photos = await Photo.find({ userId: new ObjectId(userId) }).sort({ date: -1 });

        res.status(200).json(photos);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
