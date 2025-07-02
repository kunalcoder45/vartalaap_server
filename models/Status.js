// const mongoose = require('mongoose');

// const statusSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   mediaUrl: {
//     type: String,
//     required: true
//   },
//   mediaType: {
//     type: String,
//     enum: ['image', 'video'],
//     required: true
//   },
//   visibility: {
//     type: String,
//     enum: ['public', 'followers'],
//     default: 'public'
//   },
//   viewedBy: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//     index: true
//   },
//   expiresAt: {
//     type: Date,
//     required: true,
//     index: true // Important for cleanup queries
//   }
// }, {
//   timestamps: true
// });

// // Create compound index for efficient queries
// statusSchema.index({ userId: 1, expiresAt: -1 });
// statusSchema.index({ expiresAt: 1, visibility: 1 });

// // TTL index to automatically delete expired documents
// statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// // Virtual for checking if status is active
// statusSchema.virtual('isActive').get(function() {
//   return this.expiresAt > new Date();
// });

// // Instance method to check if user has viewed this status
// statusSchema.methods.hasUserViewed = function(userId) {
//   return this.viewedBy.includes(userId);
// };

// // Static method to get active statuses for a user
// statusSchema.statics.getActiveStatusesForUser = function(userId) {
//   return this.find({
//     userId,
//     expiresAt: { $gt: new Date() }
//   }).sort({ createdAt: -1 });
// };

// // Static method to get viewable statuses for a user based on following
// statusSchema.statics.getViewableStatuses = function(currentUserId, followingIds = []) {
//   return this.find({
//     $and: [
//       { expiresAt: { $gt: new Date() } },
//       {
//         $or: [
//           { visibility: 'public' },
//           { 
//             $and: [
//               { visibility: 'followers' },
//               { 
//                 $or: [
//                   { userId: currentUserId },
//                   { userId: { $in: followingIds } }
//                 ]
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   })
//   .populate('userId', 'name avatarUrl')
//   .sort({ createdAt: -1 });
// };

// // Pre-save middleware to ensure expiration time
// statusSchema.pre('save', function(next) {
//   if (this.isNew && !this.expiresAt) {
//     // Default to 24 hours from creation
//     this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//   }
//   next();
// });

// // Pre-remove middleware to clean up media files
// statusSchema.pre('remove', async function(next) {
//   try {
//     const fs = require('fs').promises;
//     await fs.unlink(this.mediaUrl);
//   } catch (error) {
//     console.warn('Could not delete media file:', error);
//   }
//   next();
// });

// module.exports = mongoose.model('Status', statusSchema);

const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for efficient lookups by user
  },
  mediaUrl: {
    type: String, // This will store the full Cloudinary URL
    required: true
  },
  mediaPublicId: { // Store Cloudinary's public ID for deletion
    type: String,
    required: true,
    unique: true // Public IDs are unique identifiers in Cloudinary
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  description: { // Common field for statuses/stories
    type: String,
    trim: true,
    maxlength: 200, // Optional: Limit description length
  },
  visibility: {
    type: String,
    enum: ['public', 'followers'],
    default: 'public',
    required: true // Ensure visibility is always set
  },
  viewedBy: [{ // Array of user IDs who viewed this status
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // createdAt is automatically added by timestamps: true
  expiresAt: {
    type: Date,
    required: true,
    // --- FIX: Set a default for new documents (24 hours from creation) ---
    default: function() {
        // Returns a date 24 hours from the current time when a new document is created
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
    },
    index: true // Important for cleanup queries and TTL
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});


// --- Indexes ---
// Compound index for efficient queries by user and expiration time (e.g., getting active statuses for a user)
statusSchema.index({ userId: 1, expiresAt: -1 });
// Compound index for efficient queries by expiration time and visibility (e.g., getting public/followers statuses)
statusSchema.index({ expiresAt: 1, visibility: 1 });

// TTL (Time-To-Live) index to automatically delete expired documents from MongoDB
// The document will be deleted automatically when 'expiresAt' date is reached.
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --- Virtuals (Computed properties not stored in DB) ---
// Virtual for checking if status is active
statusSchema.virtual('isActive').get(function() {
  return this.expiresAt > new Date();
});


// --- Instance Methods (Methods on a single document) ---
// Instance method to check if a specific user has viewed this status
statusSchema.methods.hasUserViewed = function(userId) {
  // Convert ObjectId to string for reliable comparison if userId is a string
  return this.viewedBy.some(viewerId => viewerId.toString() === userId.toString());
};


// --- Static Methods (Methods on the Model itself) ---
// Static method to get active statuses for a specific user
statusSchema.statics.getActiveStatusesForUser = function(userId) {
  return this.find({
    userId,
    expiresAt: { $gt: new Date() } // Find statuses that have not yet expired
  }).sort({ createdAt: -1 }); // Sort by newest first
};

// Static method to get viewable statuses for a user based on following relationships
// This method is useful for a comprehensive feed of viewable stories
statusSchema.statics.getViewableStatuses = function(currentUserId, followingIds = []) {
  return this.find({
    $and: [
      { expiresAt: { $gt: new Date() } }, // Only active statuses
      {
        $or: [
          { visibility: 'public' }, // Always show public statuses
          {
            // Show 'followers' only statuses if:
            $and: [
              { visibility: 'followers' },
              {
                $or: [
                  { userId: currentUserId }, // Current user's own 'followers' statuses
                  { userId: { $in: followingIds } } // 'followers' statuses from people current user follows
                ]
              }
            ]
          }
        ]
      }
    ]
  })
  .populate('userId', 'name avatarUrl') // Populate user details for the status owner
  .sort({ createdAt: -1 }); // Sort by newest first
};


module.exports = mongoose.model('Status', statusSchema);