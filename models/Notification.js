// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'followRequest',
            'followRequestAccepted',
            'followRequestRejected',
            'newFollower',
            'like',
            'comment',
            'mention',
            'post',
            'unfollowed',
            'mutualFollowEstablished'
        ]
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String, // URL to navigate when notification is clicked
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Additional data for the notification
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);