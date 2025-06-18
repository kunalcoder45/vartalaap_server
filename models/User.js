// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        default: 'Anonymous User',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    avatarUrl: {
        type: String,
        default: '/avatars/default-avatar.png',
    },
    bio: {
        type: String,
        default: '',
        maxlength: 200,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    // --- These fields are crucial for social features ---
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Correctly references the 'User' model
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Correctly references the 'User' model
        }
    ],
    // --- End social fields ---
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true }); // `timestamps: true` automatically handles createdAt and updatedAt

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now(); // Ensures updatedAt is explicitly set on every save
    next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
