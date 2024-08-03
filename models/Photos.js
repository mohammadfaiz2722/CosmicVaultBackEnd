const mongoose = require('mongoose');
const { Schema } = mongoose;

const PhotoSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    photoUrl: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Photo = mongoose.model('photo', PhotoSchema);
module.exports = Photo;
