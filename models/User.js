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
    username: { // ADDED: Username field for unique handles
        type: String,
        unique: true,
        sparse: true, // Allows null values, but unique for non-nulls
        trim: true,
        lowercase: true, // Optional: ensures usernames are always lowercase
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
            ref: 'User'
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    pendingSentRequests: [ // ADDED: For follow requests
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    pendingReceivedRequests: [ // ADDED: For follow requests
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    // --- End social fields ---
}, { timestamps: true }); // `timestamps: true` automatically handles createdAt and updatedAt

// Removed redundant userSchema.pre('save') for updatedAt, as timestamps: true handles it.

module.exports = mongoose.models.User || mongoose.model('User', userSchema);