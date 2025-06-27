// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: { // This field is technically redundant if you have conversationId and sender, but kept for consistency
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        // 'required' removed from here, handled by pre('validate') hook
    },
    mediaUrl: { // Relative path to the stored media file, e.g., '/uploads/chat_media/image-12345.jpg'
        type: String,
        // 'required' removed from here, handled by pre('validate') hook
    },
    mediaType: { // e.g., 'image', 'video', 'audio', 'file'
        type: String,
        enum: ['image', 'video', 'audio', 'file'], // Define allowed media types
        required: function() {
            // mediaType is required only if mediaUrl is present
            return !!this.mediaUrl;
        },
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isDeleted: { // ADDED: For soft deletion
        type: Boolean,
        default: false,
    },
    isEdited: { // ADDED: For tracking message edits
        type: Boolean,
        default: false,
    },
}, { timestamps: true }); // `timestamps: true` automatically adds `createdAt` and `updatedAt`

// Add a custom validation to ensure at least one of `content` or `mediaUrl` is present
messageSchema.pre('validate', function(next) {
    if (!this.content && !this.mediaUrl) {
        this.invalidate('content', 'Message must have either content or mediaUrl.');
        this.invalidate('mediaUrl', 'Message must have either content or mediaUrl.');
    }
    next();
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);