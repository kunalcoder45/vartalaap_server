// server/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    lastMessage: {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        mediaType: { type: String, enum: ['image', 'video', 'audio', 'file'] }, // ADDED: For media previews in conversation list
    },
    // `updatedAt` is automatically managed by `timestamps: true`
}, { timestamps: true });

conversationSchema.index({ participants: 1 }); // Index for faster lookups by participants

module.exports = mongoose.model('Conversation', conversationSchema);