// vartalaap/server/models/UserLike.js
const mongoose = require('mongoose');

const userLikeSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID of the user who liked
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // Reference to the Post
    likedAt: { type: Date, default: Date.now },
});

// Compound index to ensure a user can like a post only once
userLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('UserLike', userLikeSchema);