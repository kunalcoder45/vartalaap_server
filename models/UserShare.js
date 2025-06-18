// vartalaap/server/models/UserShare.js
const mongoose = require('mongoose');

const userShareSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID of the user who shared
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // Reference to the Post
    sharedAt: { type: Date, default: Date.now },
});

// Compound index to ensure a user can share a post only once
userShareSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('UserShare', userShareSchema);