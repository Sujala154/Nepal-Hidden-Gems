const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String, // URL to image
        default: ''
    },
    travelPreferences: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
