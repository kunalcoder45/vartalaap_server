const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'followers'],
    default: 'public'
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true // Important for cleanup queries
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
statusSchema.index({ userId: 1, expiresAt: -1 });
statusSchema.index({ expiresAt: 1, visibility: 1 });

// TTL index to automatically delete expired documents
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if status is active
statusSchema.virtual('isActive').get(function() {
  return this.expiresAt > new Date();
});

// Instance method to check if user has viewed this status
statusSchema.methods.hasUserViewed = function(userId) {
  return this.viewedBy.includes(userId);
};

// Static method to get active statuses for a user
statusSchema.statics.getActiveStatusesForUser = function(userId) {
  return this.find({
    userId,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to get viewable statuses for a user based on following
statusSchema.statics.getViewableStatuses = function(currentUserId, followingIds = []) {
  return this.find({
    $and: [
      { expiresAt: { $gt: new Date() } },
      {
        $or: [
          { visibility: 'public' },
          { 
            $and: [
              { visibility: 'followers' },
              { 
                $or: [
                  { userId: currentUserId },
                  { userId: { $in: followingIds } }
                ]
              }
            ]
          }
        ]
      }
    ]
  })
  .populate('userId', 'name avatarUrl')
  .sort({ createdAt: -1 });
};

// Pre-save middleware to ensure expiration time
statusSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Default to 24 hours from creation
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Pre-remove middleware to clean up media files
statusSchema.pre('remove', async function(next) {
  try {
    const fs = require('fs').promises;
    await fs.unlink(this.mediaUrl);
  } catch (error) {
    console.warn('Could not delete media file:', error);
  }
  next();
});

module.exports = mongoose.model('Status', statusSchema);