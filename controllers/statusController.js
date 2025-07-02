// // controllers/statusController.js
// const Status = require('../models/Status');
// const User = require('../models/User'); // Ensure User model is imported
// const path = require('path');
// const fs = require('fs').promises; // Use promises version for async/await

// // Upload a new status
// const uploadStatus = async (req, res) => {
//     try {
//         const { visibility = 'public' } = req.body;
//         const userId = req.user._id; // Use MongoDB ID from req.user

//         console.log(`[statusController] Uploading status for user ID: ${userId}, Visibility: ${visibility}`);

//         if (!req.file) {
//             console.error('[statusController] Error: No media file provided by Multer after upload middleware.');
//             return res.status(400).json({ error: 'No media file provided' });
//         }

//         const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
//         console.log(`[statusController] Uploaded file details: Originalname=${req.file.originalname}, Mimetype=${req.file.mimetype}, Path=${req.file.path}`);

//         // Set expiration time (24 hours from now)
//         const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

//         // *** CRITICAL CHANGE HERE: REMOVE findOneAndDelete ***
//         // A user can now have multiple active statuses.
//         // The old code:
//         // const existingStatus = await Status.findOneAndDelete({
//         //     userId,
//         //     expiresAt: { $gt: new Date() } // Find active status
//         // });
//         // if (existingStatus) { ... delete old media ... }
//         // REMOVE THE ABOVE BLOCK ENTIRELY IF YOU WANT MULTIPLE STATUSES.

//         // Create new status
//         const status = new Status({
//             userId,
//             mediaUrl: req.file.path, // Multer saves the file path here
//             mediaType,
//             visibility,
//             expiresAt,
//             viewedBy: [], // Track who viewed this status
//             createdAt: new Date()
//         });

//         await status.save();
//         console.log(`[statusController] New status created successfully: ${status._id}`);

//         res.status(201).json({
//             message: 'Status uploaded successfully',
//             status: {
//                 _id: status._id,
//                 userId: status.userId,
//                 mediaType: status.mediaType,
//                 visibility: status.visibility,
//                 expiresAt: status.expiresAt,
//                 createdAt: status.createdAt,
//                 mediaUrl: status.mediaUrl
//             }
//         });
//     } catch (error) {
//         console.error('[statusController] Upload status error:', error);
//         res.status(500).json({ error: 'Failed to upload status', details: error.message });
//     }
// };

// // Get all active statuses (for activity bar - shows YOURS and FOLLOWED/FOLLOWERS)
// const getStatuses = async (req, res) => {
//     try {
//         console.log('[GET] /api/status - req.user:', req.user);

//         const currentUserId = req.user._id; // Should be MongoDB ID now

//         if (!currentUserId) {
//             console.warn('[GET] /api/status - No MongoDB user ID found for current user.');
//             return res.status(403).json({ message: 'No MongoDB user found. Please ensure your profile is synced.' });
//         }

//         const user = await User.findById(currentUserId).populate('following').populate('followers');

//         if (!user) {
//             console.warn(`[GET] /api/status - Current user (${currentUserId}) not found in DB.`);
//             return res.status(404).json({ message: 'Current user not found in DB.' });
//         }

//         const followingIds = user.following.map(f => f._id.toString());
//         const followerIds = user.followers.map(f => f._id.toString());

//         const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

//         // Find all active statuses for current user and their connections
//         const rawStatuses = await Status.find({
//             expiresAt: { $gt: twentyFourHoursAgo }, // Only active statuses
//             $or: [
//                 { userId: currentUserId }, // Always show own statuses
//                 { // Show public statuses from anyone
//                     visibility: 'public',
//                     userId: { $ne: currentUserId } // Exclude own public statuses already covered above
//                 },
//                 { // Show followers-only statuses from users I follow or users who follow me
//                     visibility: 'followers',
//                     userId: { $in: [...followingIds, ...followerIds] }
//                 }
//             ]
//         })
//             .populate('userId', 'name avatarUrl')
//             .sort({ createdAt: -1 }); // Get the latest first

//         console.log(`[GET] /api/status - ${rawStatuses.length} potential status(es) found.`);

//         // Group statuses by user and ensure only relevant ones are sent for the activity bar
//         const groupedStatuses = {};
//         rawStatuses.forEach(status => {
//             if (status.userId && status.userId._id) {
//                 const uId = status.userId._id.toString();
//                 // If this is the current user's status, add to a special list for them
//                 if (uId === currentUserId.toString()) {
//                     if (!groupedStatuses[uId]) {
//                         groupedStatuses[uId] = {
//                             _id: uId,
//                             name: status.userId.name,
//                             avatarUrl: status.userId.avatarUrl,
//                             hasActiveStatus: true,
//                             // Store ALL active statuses for the current user
//                             allActiveStatuses: []
//                         };
//                     }
//                     groupedStatuses[uId].allActiveStatuses.push({
//                         _id: status._id,
//                         userId: uId,
//                         mediaType: status.mediaType,
//                         mediaUrl: status.mediaUrl,
//                         createdAt: status.createdAt,
//                         viewedBy: status.viewedBy,
//                         visibility: status.visibility
//                     });
//                 } else {
//                     // For connections, just indicate they have active status and their latest status for thumbnail
//                     if (!groupedStatuses[uId]) {
//                         groupedStatuses[uId] = {
//                             _id: uId,
//                             name: status.userId.name,
//                             avatarUrl: status.userId.avatarUrl,
//                             hasActiveStatus: true,
//                             // For connections, we only need a placeholder or the latest status info for the bubble
//                             latestActiveStatusPreview: {
//                                 _id: status._id,
//                                 mediaType: status.mediaType,
//                                 mediaUrl: status.mediaUrl,
//                                 createdAt: status.createdAt,
//                             }
//                         };
//                     }
//                 }
//             }
//         });

//         // Separate current user's data from connections
//         const currentUserDataForFrontend = groupedStatuses[currentUserId.toString()] || {
//             _id: currentUserId.toString(),
//             name: user.name, // Fallback to current user's name
//             avatarUrl: user.avatarUrl,
//             hasActiveStatus: false,
//             allActiveStatuses: []
//         };
//         // Sort current user's statuses by createdAt to ensure oldest is first if frontend consumes that way
//         currentUserDataForFrontend.allActiveStatuses?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());


//         const connectionsWithActiveStatuses = Object.values(groupedStatuses).filter(u => u._id.toString() !== currentUserId.toString());

//         // You might want to sort connections as well, e.g., by latest status time or alphabetically
//         connectionsWithActiveStatuses.sort((a, b) => {
//             const timeA = a.latestActiveStatusPreview ? new Date(a.latestActiveStatusPreview.createdAt).getTime() : 0;
//             const timeB = b.latestActiveStatusPreview ? new Date(b.latestActiveStatusPreview.createdAt).getTime() : 0;
//             return timeB - timeA; // Newest first
//         });

//         res.json({
//             currentUserData: currentUserDataForFrontend,
//             connectionsWithStatuses: connectionsWithActiveStatuses
//         });

//     } catch (error) {
//         console.error('Error in getStatuses:', error);
//         return res.status(500).json({ message: 'Internal server error', details: error.message });
//     }
// };


// // Get statuses by specific user (the one whose profile is being viewed)
// const getStatusByUserId = async (req, res) => {
//     try {
//         const { userId } = req.params; // This is the ID of the user whose statuses are being requested
//         const currentUserId = req.user._id; // This is the ID of the authenticated user making the request

//         console.log(`[statusController:getStatusByUserId] Request for target user ID: ${userId} by current user ID: ${currentUserId}`);

//         if (!userId || !currentUserId) {
//             console.error('[statusController:getStatusByUserId] Missing userId or currentUserId.');
//             return res.status(400).json({ error: 'User ID or current user ID is missing.' });
//         }

//         const targetUser = await User.findById(userId);
//         if (!targetUser) {
//             console.warn(`[statusController:getStatusByUserId] Target user not found for ID: ${userId}`);
//             return res.status(404).json({ error: 'Target user not found.' });
//         }

//         const isOwnProfile = currentUserId.toString() === userId.toString();
//         console.log(`[statusController:getStatusByUserId] Is Own Profile: ${isOwnProfile}`);

//         const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

//         let queryConditions = {
//             userId: userId,
//             createdAt: { $gt: twentyFourHoursAgo } // Filter by creation time, not expiresAt
//         };

//         if (!isOwnProfile) {
//             const currentUser = await User.findById(currentUserId).populate('following').populate('followers');

//             if (!currentUser) {
//                 console.warn(`[statusController:getStatusByUserId] Current authenticated user (${currentUserId}) not found in DB. Restricting to public statuses.`);
//                 queryConditions.$or = [{ visibility: 'public' }];
//             } else {
//                 const isFollowingTargetUser = currentUser.following.some(id => id.toString() === userId.toString());
//                 const isFollowerOfTargetUser = targetUser.followers.some(id => id.toString() === currentUserId.toString());

//                 console.log(`[statusController:getStatusByUserId] Viewer (${currentUserId}) is not owner. Is following target (${userId}): ${isFollowingTargetUser}, Is follower of target (${userId}): ${isFollowerOfTargetUser}`);

//                 const visibilityClauses = [{ visibility: 'public' }];

//                 if (isFollowingTargetUser || isFollowerOfTargetUser) {
//                     visibilityClauses.push({ visibility: 'followers' });
//                     console.log(`[statusController:getStatusByUserId] Viewer can see 'public' and 'followers' statuses.`);
//                 } else {
//                     console.log(`[statusController:getStatusByUserId] Viewer can only see 'public' statuses.`);
//                 }
//                 queryConditions.$or = visibilityClauses;
//             }
//         }

//         console.log(`[statusController:getStatusByUserId] Final MongoDB query conditions for ${userId}:`, JSON.stringify(queryConditions, null, 2));

//         const statuses = await Status.find(queryConditions)
//             .populate('userId', 'name avatarUrl')
//             .sort({ createdAt: 1 }); // Sort by creation time, oldest first, so frontend can play them in sequence

//         console.log(`[statusController:getStatusByUserId] Found ${statuses.length} active status(es) for ${userId}.`);
//         console.log("Backend: Statuses data (first 5):", statuses.slice(0, 5).map(s => ({
//             _id: s._id,
//             mediaType: s.mediaType,
//             mediaUrl: s.mediaUrl,
//             visibility: s.visibility,
//             createdAt: s.createdAt,
//             userId: s.userId ? s.userId._id : 'N/A'
//         })));

//         res.status(200).json(statuses);

//     } catch (error) {
//         console.error('[statusController:getStatusByUserId] !!! CRITICAL ERROR !!! Failed to fetch user statuses:', error);
//         console.error('Error stack:', error.stack);
//         res.status(500).json({ error: 'Failed to fetch user statuses', details: error.message, code: error.code });
//     }
// };
// // // ... (rest of your statusController.js code) ...

// // Mark status as viewed
// // const markStatusAsViewed = async (req, res) => {
// //     try {
// //         const { statusId } = req.params;
// //         const currentUserId = req.user._id; // Ensure using MongoDB ID

// //         const status = await Status.findById(statusId);
// //         if (!status) {
// //             return res.status(404).json({ error: 'Status not found' });
// //         }

// //         // Don't mark own status as viewed
// //         if (status.userId.toString() === currentUserId.toString()) { // Compare as strings
// //             console.log(`[statusController] Not marking own status (${statusId}) as viewed by ${currentUserId}.`);
// //             return res.json({ message: 'Cannot mark own status as viewed' });
// //         }

// //         // Add to viewedBy if not already viewed
// //         if (!status.viewedBy.map(id => id.toString()).includes(currentUserId.toString())) { // Compare as strings
// //             status.viewedBy.push(currentUserId);
// //             await status.save();
// //             console.log(`[statusController] Status ${statusId} marked as viewed by ${currentUserId}.`);
// //         } else {
// //             console.log(`[statusController] Status ${statusId} already viewed by ${currentUserId}.`);
// //         }

// //         res.json({ message: 'Status marked as viewed' });
// //     } catch (error) {
// //         console.error('Mark status viewed error:', error);
// //         res.status(500).json({ error: 'Failed to mark status as viewed' });
// //     }
// // };

// // In your backend statusController.js (or wherever your /api/status/view/:statusId logic lives)

// const markStatusAsViewed = async (req, res, next) => {
//     try {
//         const { statusId } = req.params;
//         // req.user._id comes from your authMiddleware, representing the current authenticated user
//         const viewerId = req.user._id;

//         if (!viewerId) {
//             return res.status(401).json({ message: 'Authentication required to mark status as viewed.' });
//         }

//         // Find the status
//         const status = await Status.findById(statusId);

//         if (!status) {
//             return res.status(404).json({ message: 'Status not found.' });
//         }

//         // IMPORTANT: Prevent a user from marking their own status as viewed
//         // Ensure that status.userId is a string or convert viewerId to ObjectId for comparison
//         if (status.userId.toString() === viewerId.toString()) {
//             console.log(`[Backend:markStatusAsViewed] User ${viewerId} attempted to view their own status ${statusId}. Not counting.`);
//             return res.status(200).json({ message: 'Own status view not counted.' });
//         }

//         // Check if the viewer has already viewed this status to prevent duplicate entries
//         if (!status.viewedBy.includes(viewerId)) {
//             status.viewedBy.push(viewerId);
//             await status.save();
//             console.log(`[Backend:markStatusAsViewed] Status ${statusId} marked as viewed by ${viewerId}.`);
//         } else {
//             console.log(`[Backend:markStatusAsViewed] Status ${statusId} already viewed by ${viewerId}.`);
//         }

//         res.status(200).json({ message: 'Status view processed successfully.' });

//     } catch (error) {
//         console.error('Error marking status as viewed:', error);
//         next(error); // Pass to global error handler
//     }
// };

// // Delete status
// const deleteStatus = async (req, res) => {
//     try {
//         const { statusId } = req.params;
//         const currentUserId = req.user._id; // Ensure using MongoDB ID

//         const status = await Status.findById(statusId);
//         if (!status) {
//             return res.status(404).json({ error: 'Status not found' });
//         }

//         // Only allow deletion of own status
//         if (status.userId.toString() !== currentUserId.toString()) { // Compare as strings
//             return res.status(403).json({ error: 'Not authorized to delete this status' });
//         }

//         // Delete media file
//         try {
//             await fs.unlink(path.resolve(status.mediaUrl)); // Use path.resolve
//             console.log(`[statusController] Successfully deleted media file: ${status.mediaUrl}`);
//         } catch (fileError) {
//             console.warn(`[statusController] Warning: Could not delete media file ${status.mediaUrl}:`, fileError.message);
//             // Don't block deletion if file deletion fails, but log it
//         }

//         await Status.findByIdAndDelete(statusId);
//         res.json({ message: 'Status deleted successfully' });
//     } catch (error) {
//         console.error('Delete status error:', error);
//         res.status(500).json({ error: 'Failed to delete status' });
//     }
// };

// // Get status analytics (who viewed)
// const getStatusAnalytics = async (req, res) => {
//     try {
//         const { statusId } = req.params;
//         const currentUserId = req.user._id; // Ensure using MongoDB ID

//         const status = await Status.findById(statusId)
//             .populate('viewedBy', 'name avatarUrl')
//             .populate('userId', 'name avatarUrl');

//         if (!status) {
//             return res.status(404).json({ error: 'Status not found' });
//         }

//         // Only allow viewing analytics of own status
//         if (status.userId._id.toString() !== currentUserId.toString()) { // Compare as strings
//             return res.status(403).json({ error: 'Not authorized to view analytics' });
//         }

//         res.json({
//             statusId: status._id,
//             totalViews: status.viewedBy.length,
//             viewedBy: status.viewedBy.map(user => ({
//                 _id: user._id,
//                 name: user.name,
//                 avatarUrl: user.avatarUrl
//             })),
//             createdAt: status.createdAt,
//             expiresAt: status.expiresAt
//         });
//     } catch (error) {
//         console.error('Get status analytics error:', error);
//         res.status(500).json({ error: 'Failed to fetch status analytics' });
//     }
// };

// // Clean up expired statuses (utility function)
// const cleanupExpiredStatuses = async () => {
//     try {
//         const expiredStatuses = await Status.find({
//             expiresAt: { $lte: new Date() }
//         });

//         let deletedFilesCount = 0;
//         // Delete media files
//         for (const status of expiredStatuses) {
//             try {
//                 await fs.unlink(path.resolve(status.mediaUrl)); // Use path.resolve
//                 deletedFilesCount++;
//             } catch (error) {
//                 console.warn(`[cleanupExpiredStatuses] Could not delete file ${status.mediaUrl}:`, error.message);
//             }
//         }

//         // Delete from database
//         const result = await Status.deleteMany({
//             expiresAt: { $lte: new Date() }
//         });

//         console.log(`[cleanupExpiredStatuses] Cleaned up ${result.deletedCount} expired statuses (files deleted: ${deletedFilesCount})`);
//         return result.deletedCount;
//     } catch (error) {
//         console.error('[cleanupExpiredStatuses] Cleanup expired statuses error:', error);
//         throw error;
//     }
// };


// module.exports = {
//     uploadStatus,
//     getStatuses, // This will list connections with active stories + current user's stories
//     getStatusByUserId, // This will fetch ALL active stories for a specific user to view in the viewer
//     markStatusAsViewed,
//     deleteStatus,
//     getStatusAnalytics,
//     cleanupExpiredStatuses
// };









// cloudnary //


// controllers/statusController.js
const Status = require('../models/Status');
const User = require('../models/User'); // Ensure User model is imported
const { cloudinary } = require('../config/cloudinary'); // Import cloudinary for deletion

// REMOVE fs and path imports as they are no longer needed for local storage
// const path = require('path');
// const fs = require('fs').promises;

// Upload a new status
const uploadStatus = async (req, res, next) => {
    try {
        const userId = req.user._id; // Extracted from verifyFirebaseToken middleware
        const { description, visibility } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No media file provided for status.' });
        }

        // Log req.file to see its structure
        console.log('[statusController] Full req.file object:', req.file);

        // Extract Cloudinary details correctly
        // multer-storage-cloudinary typically puts the Cloudinary URL in req.file.path
        // and the public ID in req.file.filename or req.file.public_id
        const mediaUrl = req.file.path; // This is the Cloudinary URL
        const mediaPublicId = req.file.filename || req.file.public_id; // Use filename or public_id
        const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video'; // Derive from mimetype

        console.log(`[statusController] Uploaded file details: Originalname=${req.file.originalname}, Mimetype=${req.file.mimetype}, Cloudinary URL=${mediaUrl}, Public ID=${mediaPublicId}, Resource Type=${mediaType}`);

        const newStatus = new Status({
            userId,
            mediaUrl,
            mediaPublicId, // Correctly assign the extracted public ID
            mediaType,     // Correctly assign the derived media type
            description,
            visibility: visibility || 'public' // Default to public if not provided
        });

        const savedStatus = await newStatus.save();

        res.status(201).json({
            message: 'Status uploaded successfully!',
            status: savedStatus
        });

    } catch (error) {
        console.error('[statusController] Upload status error:', error);
        next(error); // Pass error to global error handler
    }
};

// Get all active statuses (for activity bar - shows YOURS and FOLLOWED/FOLLOWERS)
const getStatuses = async (req, res) => {
    try {
        console.log('[GET] /api/status - req.user:', req.user);

        const currentUserId = req.user._id; // Should be MongoDB ID now

        if (!currentUserId) {
            console.warn('[GET] /api/status - No MongoDB user ID found for current user.');
            return res.status(403).json({ message: 'No MongoDB user found. Please ensure your profile is synced.' });
        }

        const user = await User.findById(currentUserId).populate('following').populate('followers');

        if (!user) {
            console.warn(`[GET] /api/status - Current user (${currentUserId}) not found in DB.`);
            return res.status(404).json({ message: 'Current user not found in DB.' });
        }

        // Get IDs of users the current user follows and who follow the current user
        const followingIds = user.following.map(f => f._id.toString());
        const followerIds = user.followers.map(f => f._id.toString());

        // Calculate time for statuses that are still active (e.g., created within the last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find all active statuses based on visibility and relationships
        const rawStatuses = await Status.find({
            expiresAt: { $gt: new Date() }, // Statuses that have not yet expired based on TTL index
            $or: [
                { userId: currentUserId }, // Always show own statuses
                { // Show public statuses from anyone (excluding self as already covered)
                    visibility: 'public',
                    userId: { $ne: currentUserId }
                },
                { // Show followers-only statuses from users I follow or users who follow me
                    visibility: 'followers',
                    userId: { $in: [...followingIds, ...followerIds] }
                }
            ]
        })
            .populate('userId', 'name avatarUrl') // Populate user details
            .sort({ createdAt: -1 }); // Get the latest first

        console.log(`[GET] /api/status - ${rawStatuses.length} potential status(es) found.`);

        // Group statuses by user and format for frontend (Activity Bar)
        const groupedStatuses = {};
        rawStatuses.forEach(status => {
            if (status.userId && status.userId._id) {
                const uId = status.userId._id.toString();
                if (!groupedStatuses[uId]) {
                    // Initialize user entry with their details
                    groupedStatuses[uId] = {
                        _id: uId,
                        name: status.userId.name,
                        avatarUrl: status.userId.avatarUrl,
                        hasActiveStatus: true,
                        // Store full statuses array for the current user,
                        // otherwise just a preview for connections.
                        allActiveStatuses: [],
                        latestActiveStatusPreview: null // Used for connection bubbles
                    };
                }

                // Add the current status to the user's active statuses list
                const statusData = {
                    _id: status._id,
                    userId: uId,
                    description: status.description,
                    mediaType: status.mediaType,
                    mediaUrl: status.mediaUrl, // This is already the Cloudinary URL
                    createdAt: status.createdAt,
                    viewedBy: status.viewedBy.includes(currentUserId) // Check if current user viewed this specific status
                };

                groupedStatuses[uId].allActiveStatuses.push(statusData);

                // For connections, keep track of the latest status for preview
                if (uId !== currentUserId.toString() && (!groupedStatuses[uId].latestActiveStatusPreview || new Date(status.createdAt) > new Date(groupedStatuses[uId].latestActiveStatusPreview.createdAt))) {
                    groupedStatuses[uId].latestActiveStatusPreview = statusData;
                }
            }
        });

        // Separate current user's data from connections and sort
        const currentUserDataForFrontend = groupedStatuses[currentUserId.toString()] || {
            _id: currentUserId.toString(),
            name: user.name,
            avatarUrl: user.avatarUrl,
            hasActiveStatus: false,
            allActiveStatuses: []
        };
        // Sort current user's statuses by createdAt to ensure oldest is first for viewer
        currentUserDataForFrontend.allActiveStatuses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());


        const connectionsWithActiveStatuses = Object.values(groupedStatuses).filter(u => u._id.toString() !== currentUserId.toString());

        // Sort connections by their latest status time (newest first)
        connectionsWithActiveStatuses.sort((a, b) => {
            const timeA = a.latestActiveStatusPreview ? new Date(a.latestActiveStatusPreview.createdAt).getTime() : 0;
            const timeB = b.latestActiveStatusPreview ? new Date(b.latestActiveStatusPreview.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        res.json({
            currentUserData: currentUserDataForFrontend,
            connectionsWithStatuses: connectionsWithActiveStatuses
        });

    } catch (error) {
        console.error('Error in getStatuses:', error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


// Get statuses by specific user (the one whose profile is being viewed)
const getStatusByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // This is the ID of the user whose statuses are being requested
        const currentUserId = req.user._id; // This is the ID of the authenticated user making the request

        console.log(`[statusController:getStatusByUserId] Request for target user ID: ${userId} by current user ID: ${currentUserId}`);

        if (!userId || !currentUserId) {
            console.error('[statusController:getStatusByUserId] Missing userId or currentUserId.');
            return res.status(400).json({ error: 'User ID or current user ID is missing.' });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            console.warn(`[statusController:getStatusByUserId] Target user not found for ID: ${userId}`);
            return res.status(404).json({ error: 'Target user not found.' });
        }

        const isOwnProfile = currentUserId.toString() === userId.toString();
        console.log(`[statusController:getStatusByUserId] Is Own Profile: ${isOwnProfile}`);

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        let queryConditions = {
            userId: userId,
            expiresAt: { $gt: twentyFourHoursAgo } // Filter active statuses
        };

        if (!isOwnProfile) {
            const currentUser = await User.findById(currentUserId).populate('following').populate('followers');

            if (!currentUser) {
                console.warn(`[statusController:getStatusByUserId] Current authenticated user (${currentUserId}) not found in DB. Restricting to public statuses.`);
                queryConditions.$or = [{ visibility: 'public' }];
            } else {
                const isFollowingTargetUser = currentUser.following.some(id => id.toString() === userId.toString());
                const isFollowerOfTargetUser = targetUser.followers.some(id => id.toString() === currentUserId.toString());

                console.log(`[statusController:getStatusByUserId] Viewer (${currentUserId}) is not owner. Is following target (${userId}): ${isFollowingTargetUser}, Is follower of target (${userId}): ${isFollowerOfTargetUser}`);

                const visibilityClauses = [{ visibility: 'public' }];

                if (isFollowingTargetUser || isFollowerOfTargetUser) {
                    visibilityClauses.push({ visibility: 'followers' });
                    console.log(`[statusController:getStatusByUserId] Viewer can see 'public' and 'followers' statuses.`);
                } else {
                    console.log(`[statusController:getStatusByUserId] Viewer can only see 'public' statuses.`);
                }
                queryConditions.$or = visibilityClauses;
            }
        }

        console.log(`[statusController:getStatusByUserId] Final MongoDB query conditions for ${userId}:`, JSON.stringify(queryConditions, null, 2));

        const statuses = await Status.find(queryConditions)
            .populate('userId', 'name avatarUrl')
            .sort({ createdAt: 1 }); // Sort by creation time, oldest first, so frontend can play them in sequence

        console.log(`[statusController:getStatusByUserId] Found ${statuses.length} active status(es) for ${userId}.`);
        console.log("Backend: Statuses data (first 5):", statuses.slice(0, 5).map(s => ({
            _id: s._id,
            mediaType: s.mediaType,
            mediaUrl: s.mediaUrl, // This will be the full Cloudinary URL
            visibility: s.visibility,
            createdAt: s.createdAt,
            userId: s.userId ? s.userId._id : 'N/A'
        })));

        res.status(200).json(statuses);

    } catch (error) {
        console.error('[statusController:getStatusByUserId] !!! CRITICAL ERROR !!! Failed to fetch user statuses:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch user statuses', details: error.message, code: error.code });
    }
};

// const markStatusAsViewed = async (req, res, next) => {
//     try {
//         const { statusId } = req.params;
//         const viewerId = req.user._id;

//         if (!viewerId) {
//             return res.status(401).json({ message: 'Authentication required to mark status as viewed.' });
//         }

//         const status = await Status.findById(statusId);

//         if (!status) {
//             return res.status(404).json({ message: 'Status not found.' });
//         }

//         if (status.userId.toString() === viewerId.toString()) {
//             console.log(`[Backend:markStatusAsViewed] User ${viewerId} attempted to view their own status ${statusId}. Not counting.`);
//             return res.status(200).json({ message: 'Own status view not counted.' });
//         }

//         if (!status.viewedBy.includes(viewerId)) {
//             status.viewedBy.push(viewerId);
//             await status.save();
//             console.log(`[Backend:markStatusAsViewed] Status ${statusId} marked as viewed by ${viewerId}.`);
//         } else {
//             console.log(`[Backend:markStatusAsViewed] Status ${statusId} already viewed by ${viewerId}.`);
//         }

//         res.status(200).json({ message: 'Status view processed successfully.' });

//     } catch (error) {
//         console.error('Error marking status as viewed:', error);
//         next(error);
//     }
// };








// Delete status

// ✅ Updated Backend: markStatusAsViewed.js


const markStatusAsViewed = async (req, res, next) => {
    try {
        const { statusId } = req.params;
        const viewerId = req.user._id;

        if (!viewerId) {
            return res.status(401).json({ message: 'Authentication required to mark status as viewed.' });
        }

        const status = await Status.findById(statusId);

        if (!status) {
            return res.status(404).json({ message: 'Status not found.' });
        }

        // ✅ Ensure viewer doesn't mark their own status
        if (status.userId.toString() === viewerId.toString()) {
            console.log(`[Backend:markStatusAsViewed] User ${viewerId} attempted to view their own status ${statusId}. Not counting.`);
            return res.status(200).json({ message: 'Own status view not counted.', updatedStatus: status });
        }

        // ✅ Fix: use .some() with string comparison to avoid ObjectId mismatch
        const alreadyViewed = status.viewedBy.some(
            id => id.toString() === viewerId.toString()
        );

        if (!alreadyViewed) {
            status.viewedBy.push(viewerId);
            await status.save();
            console.log(`[Backend:markStatusAsViewed] Status ${statusId} marked as viewed by ${viewerId}.`);
        } else {
            console.log(`[Backend:markStatusAsViewed] Status ${statusId} already viewed by ${viewerId}.`);
        }

        res.status(200).json({ 
            message: 'Status view processed successfully.',
            updatedStatus: status
        });

    } catch (error) {
        console.error('Error marking status as viewed:', error);
        next(error);
    }
};



const deleteStatus = async (req, res) => {
    try {
        const { statusId } = req.params;
        const currentUserId = req.user._id;

        const status = await Status.findById(statusId);
        if (!status) {
            return res.status(404).json({ error: 'Status not found' });
        }

        if (status.userId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this status' });
        }

        // --- CLOUDINARY DELETION LOGIC HERE ---
        if (status.mediaPublicId) {
            try {
                // Ensure you pass the correct resource_type (image or video)
                await cloudinary.uploader.destroy(status.mediaPublicId, {
                    resource_type: status.mediaType // Use the stored mediaType
                });
                console.log(`[statusController] Successfully deleted media from Cloudinary: ${status.mediaPublicId}`);
            } catch (cloudinaryErr) {
                console.warn(`[statusController] Warning: Could not delete media from Cloudinary ${status.mediaPublicId}:`, cloudinaryErr.message);
                // Log the warning, but don't prevent DB deletion if Cloudinary fails
            }
        }
        // --- END CLOUDINARY DELETION LOGIC ---

        await Status.findByIdAndDelete(statusId);
        res.json({ message: 'Status deleted successfully' });
    } catch (error) {
        console.error('Delete status error:', error);
        res.status(500).json({ error: 'Failed to delete status' });
    }
};

// Get status analytics (who viewed)
const getStatusAnalytics = async (req, res) => {
    try {
        const { statusId } = req.params;
        const currentUserId = req.user._id;

        const status = await Status.findById(statusId)
            .populate('viewedBy', 'name avatarUrl')
            .populate('userId', 'name avatarUrl');

        if (!status) {
            return res.status(404).json({ error: 'Status not found' });
        }

        if (status.userId._id.toString() !== currentUserId.toString()) {
            return res.status(403).json({ error: 'Not authorized to view analytics' });
        }

        res.json({
            statusId: status._id,
            totalViews: status.viewedBy.length,
            viewedBy: status.viewedBy.map(user => ({
                _id: user._id,
                name: user.name,
                avatarUrl: user.avatarUrl
            })),
            createdAt: status.createdAt,
            expiresAt: status.expiresAt
        });
    } catch (error) {
        console.error('Get status analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch status analytics' });
    }
};

// Clean up expired statuses (utility function)
const cleanupExpiredStatuses = async () => {
    try {
        const expiredStatuses = await Status.find({
            expiresAt: { $lte: new Date() }
        });

        let deletedFilesCount = 0;
        // --- CLOUDINARY CLEANUP LOGIC HERE ---
        for (const status of expiredStatuses) {
            if (status.mediaPublicId) {
                try {
                    await cloudinary.uploader.destroy(status.mediaPublicId, {
                        resource_type: status.mediaType
                    });
                    deletedFilesCount++;
                } catch (error) {
                    console.warn(`[cleanupExpiredStatuses] Could not delete Cloudinary media ${status.mediaPublicId}:`, error.message);
                }
            }
        }
        // --- END CLOUDINARY CLEANUP LOGIC ---

        // Delete from database
        const result = await Status.deleteMany({
            expiresAt: { $lte: new Date() }
        });

        console.log(`[cleanupExpiredStatuses] Cleaned up ${result.deletedCount} expired statuses (Cloudinary files deleted: ${deletedFilesCount})`);
        return result.deletedCount;
    } catch (error) {
        console.error('[cleanupExpiredStatuses] Cleanup expired statuses error:', error);
        throw error;
    }
};


module.exports = {
    uploadStatus,
    getStatuses,
    getStatusByUserId,
    markStatusAsViewed,
    deleteStatus,
    getStatusAnalytics,
    cleanupExpiredStatuses
};