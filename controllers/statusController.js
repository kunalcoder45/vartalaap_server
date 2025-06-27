// const Status = require('../models/Status');
// const User = require('../models/User');
// const path = require('path');
// const fs = require('fs').promises; // Use promises version for async/await

// // Upload a new status
// const uploadStatus = async (req, res) => {
//     try {
//         const { visibility = 'public' } = req.body;
//         // CORRECTED: Use req.user._id (MongoDB ID) if available, otherwise fallback to Firebase UID
//         const userId = req.user._id || req.user.uid;
//         console.log(`[statusController] Uploading status for user ID: ${userId}, Visibility: ${visibility}`);

//         if (!req.file) {
//             console.error('[statusController] Error: No media file provided by Multer after upload middleware.');
//             return res.status(400).json({ error: 'No media file provided' });
//         }

//         // Determine media type
//         const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
//         console.log(`[statusController] Uploaded file details: Originalname=${req.file.originalname}, Mimetype=${req.file.mimetype}, Path=${req.file.path}`);


//         // Set expiration time (24 hours from now)
//         const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

//         // Delete any existing active status for this user
//         // Note: You might want to remove this if you want users to have multiple statuses
//         // or refine the logic (e.g., delete only if a new one is created, or allow multiple active).
//         // Current logic replaces existing active status.
//         const existingStatus = await Status.findOneAndDelete({
//             userId,
//             expiresAt: { $gt: new Date() } // Find active status
//         });

//         if (existingStatus) {
//             console.log(`[statusController] Deleted existing active status for user ${userId}: ${existingStatus._id}`);
//             // Optionally delete the old media file from disk
//             try {
//                 await fs.unlink(existingStatus.mediaUrl);
//                 console.log(`[statusController] Deleted old media file: ${existingStatus.mediaUrl}`);
//             } catch (fileDeleteError) {
//                 console.warn(`[statusController] Warning: Could not delete old status media file ${existingStatus.mediaUrl}:`, fileDeleteError);
//             }
//         }


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
//                 createdAt: status.createdAt
//             }
//         });
//     } catch (error) {
//         console.error('[statusController] Upload status error:', error);
//         res.status(500).json({ error: 'Failed to upload status', details: error.message }); // Send detailed error message
//     }
// };

// // Get all active statuses (for activity bar)
// const getStatuses = async (req, res) => {
//     try {
//         console.log('[GET] /api/status - req.user:', req.user);

//         const currentUserId = req.user._id; // Should be MongoDB ID now

//         if (!currentUserId) {
//             return res.status(403).json({ message: 'No MongoDB user found. Please sync profile.' });
//         }

//         const user = await User.findById(currentUserId).populate('following');

//         if (!user) {
//             return res.status(404).json({ message: 'User not found in DB.' });
//         }

//         const followingIds = user.following.map(f => f._id);
//         const visibleUserIds = [currentUserId, ...followingIds];

//         const statuses = await Status.find({
//             userId: { $in: visibleUserIds }, // Changed from 'user' to 'userId' to match model field
//             expiresAt: { $gt: new Date() }
//         }).populate('userId', 'name avatarUrl'); // Populate userId field to get user details

//         console.log(`[GET] /api/status - ${statuses.length} status(es) found`);
//         // Format the output to match frontend expectation (flat status object with user info)
//         const formattedStatuses = statuses.map(status => ({
//             _id: status._id,
//             userId: status.userId._id, // Get the actual user ID from the populated object
//             mediaType: status.mediaType,
//             mediaUrl: status.mediaUrl, // Include mediaUrl for viewing
//             createdAt: status.createdAt,
//             viewedBy: status.viewedBy,
//             name: status.userId.name, // Add user's name directly
//             avatarUrl: status.userId.avatarUrl // Add user's avatar URL directly
//         }));


//         return res.json(formattedStatuses);
//     } catch (error) {
//         console.error('Error in getStatuses:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };

// // Get statuses by specific user
// // const getStatusByUserId = async (req, res) => {
// //     try {
// //         const { userId } = req.params;
// //         const currentUserId = req.user._id; // Ensure using MongoDB ID

// //         // Check if current user can view this user's statuses
// //         const targetUser = await User.findById(userId);
// //         if (!targetUser) {
// //             return res.status(404).json({ error: 'User not found' });
// //         }

// //         const currentUser = await User.findById(currentUserId);
// //         // Check if currentUser.following is an array and includes userId
// //         const isFollowing = currentUser?.following?.some(id => id.toString() === userId);

// //         const statuses = await Status.find({
// //             userId,
// //             expiresAt: { $gt: new Date() },
// //             $or: [
// //                 { visibility: 'public' },
// //                 {
// //                     $and: [
// //                         { visibility: 'followers' },
// //                         {
// //                             $or: [
// //                                 { userId: currentUserId }, // Own status
// //                                 isFollowing // Following the user
// //                             ]
// //                         }
// //                     ]
// //                 }
// //             ]
// //         })
// //             .populate('userId', 'name avatarUrl')
// //             .sort({ createdAt: -1 });

// //         res.json(statuses);
// //     } catch (error) {
// //         console.error('Get user statuses error:', error);
// //         res.status(500).json({ error: 'Failed to fetch user statuses' });
// //     }
// // };

// // const getStatusByUserId = async (req, res) => {
// //     try {
// //         const { userId } = req.params;
// //         const currentUserId = req.user._id; // Ensure using MongoDB ID

// //         console.log(`Backend: Fetching status for target user ID: ${userId} by current user ID: ${currentUserId}`);

// //         // Check if current user can view this user's statuses
// //         const targetUser = await User.findById(userId);
// //         if (!targetUser) {
// //             console.warn(`Backend: User not found for ID: ${userId}`);
// //             return res.status(404).json({ error: 'User not found' });
// //         }

// //         const currentUser = await User.findById(currentUserId);
// //         // Determine if currentUser is following the targetUser
// //         // Use toString() for comparison as _id can be ObjectId objects
// //         const isFollowingTargetUser = currentUser?.following?.some(id => id.toString() === userId.toString());

// //         // Determine if the requested userId is the current user's own ID
// //         const isOwnProfile = userId.toString() === currentUserId.toString();

// //         // Build the query conditions for status visibility
// //         const queryConditions = {
// //             userId: userId,
// //             expiresAt: { $gt: new Date() }, // Status must not be expired
// //             $or: [
// //                 { visibility: 'public' } // Always allow public statuses
// //             ]
// //         };

// //         // If the user is the owner of the profile, or they are following the user,
// //         // then they can also see 'followers' visibility statuses.
// //         if (isOwnProfile || isFollowingTargetUser) {
// //             queryConditions.$or.push({ visibility: 'followers' });
// //         }


// //         const statuses = await Status.find(queryConditions)
// //             .populate('userId', 'name avatarUrl')
// //             .sort({ createdAt: -1 });

// //         console.log(`Backend: Found ${statuses.length} active status(es) for ${userId}. Is Own Profile: ${isOwnProfile}, Is Following: ${isFollowingTargetUser}`);
// //         console.log("Backend: Statuses data:", statuses); // See the actual data

// //         res.json(statuses);
// //     } catch (error) {
// //         console.error('Get user statuses error:', error);
// //         res.status(500).json({ error: 'Failed to fetch user statuses' });
// //     }
// // };

// const getStatusByUserId = async (req, res) => {
//     try {
//         const { userId } = req.params; // This is the ID of the user whose statuses are being requested (e.g., Kunal Sharma's ID)
//         const currentUserId = req.user._id; // This is the ID of the authenticated user making the request (e.g., YOU logged in)

//         console.log(`Backend: Request to fetch status for target user ID: ${userId} by current user ID: ${currentUserId}`);

//         // Find the target user (whose status is being requested)
//         const targetUser = await User.findById(userId);
//         if (!targetUser) {
//             console.warn(`Backend: Target user not found for ID: ${userId}`);
//             return res.status(404).json({ error: 'Target user not found.' });
//         }

//         // Determine if the current authenticated user is the target user
//         const isOwnProfile = currentUserId.toString() === userId.toString();
//         console.log(`Backend: Is Own Profile: ${isOwnProfile}`);

//         let queryConditions = {
//             userId: userId,
//             expiresAt: { $gt: new Date() } // Only retrieve active (non-expired) statuses
//         };

//         // If it's the user's own profile, they can always see their own statuses, regardless of visibility setting.
//         if (isOwnProfile) {
//             // No additional visibility filter needed for own profile
//             console.log(`Backend: Fetching ALL active statuses for own profile (${userId}).`);
//         } else {
//             // If it's not the user's own profile, apply visibility rules based on relationship
//             const currentUser = await User.findById(currentUserId);
//             if (!currentUser) {
//                 console.warn(`Backend: Current authenticated user (${currentUserId}) not found in DB.`);
//                 // If current user is not found, they can only see public statuses of others.
//                 queryConditions.$or = [{ visibility: 'public' }];
//             } else {
//                 // Check if currentUser is following the targetUser
//                 const isFollowingTargetUser = currentUser.following.some(id => id.toString() === userId.toString());
//                 // Check if targetUser is following the currentUser (i.e., currentUser is a follower of targetUser)
//                 const isFollowerOfTargetUser = targetUser.followers.some(id => id.toString() === currentUserId.toString());

//                 console.log(`Backend: Viewer (${currentUserId}) is not owner. Following target: ${isFollowingTargetUser}, Is follower of target: ${isFollowerOfTargetUser}`);

//                 // Initialize visibility clauses for non-owner requests
//                 const visibilityClauses = [{ visibility: 'public' }]; // Public statuses are always visible to anyone

//                 // If the current user is following the target user OR is a follower of the target user,
//                 // they can also see 'followers' visibility statuses.
//                 if (isFollowingTargetUser || isFollowerOfTargetUser) {
//                     visibilityClauses.push({ visibility: 'followers' });
//                     console.log(`Backend: Viewer can see 'public' and 'followers' statuses.`);
//                 } else {
//                     console.log(`Backend: Viewer can only see 'public' statuses.`);
//                 }
//                 queryConditions.$or = visibilityClauses;
//             }
//         }

//         const statuses = await Status.find(queryConditions)
//             .populate('userId', 'name avatarUrl') // Populate user details for the status
//             .sort({ createdAt: -1 }); // Get the latest status first

//         console.log(`Backend: Found ${statuses.length} active status(es) for ${userId}.`);
//         console.log("Backend: Statuses data (first 5):", statuses.slice(0, 5)); // Log first few to avoid large output

//         res.status(200).json(statuses);

//     } catch (error) {
//         console.error('Backend Error: Failed to fetch user statuses:', error);
//         res.status(500).json({ message: 'Failed to fetch user statuses', error: error.message });
//     }
// };

// // Ensure your router.get uses the correct middleware name 'verifyFirebaseToken' if that's what it is
// // Based on your previous logs, it was `verifyFirebaseToken`, not `verifyToken` // Assuming `attachMongoUser` is your middleware to attach req.user._id

// // Mark status as viewed
// const markStatusAsViewed = async (req, res) => {
//     try {
//         const { statusId } = req.params;
//         const currentUserId = req.user._id; // Ensure using MongoDB ID

//         const status = await Status.findById(statusId);
//         if (!status) {
//             return res.status(404).json({ error: 'Status not found' });
//         }

//         // Don't mark own status as viewed
//         if (status.userId.toString() === currentUserId.toString()) { // Compare as strings
//             return res.json({ message: 'Cannot view own status' });
//         }

//         // Add to viewedBy if not already viewed
//         if (!status.viewedBy.map(id => id.toString()).includes(currentUserId.toString())) { // Compare as strings
//             status.viewedBy.push(currentUserId);
//             await status.save();
//         }

//         res.json({ message: 'Status marked as viewed' });
//     } catch (error) {
//         console.error('Mark status viewed error:', error);
//         res.status(500).json({ error: 'Failed to mark status as viewed' });
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
//             await fs.unlink(status.mediaUrl);
//             console.log(`[statusController] Successfully deleted media file: ${status.mediaUrl}`);
//         } catch (fileError) {
//             console.warn(`[statusController] Warning: Could not delete media file ${status.mediaUrl}:`, fileError);
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
//                 await fs.unlink(status.mediaUrl);
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
//     getStatuses,
//     getStatusByUserId,
//     markStatusAsViewed,
//     deleteStatus,
//     getStatusAnalytics,
//     cleanupExpiredStatuses
// };




// const Status = require('../models/Status');
// const User = require('../models/User'); // Ensure User model is imported
// const path = require('path');
// const fs = require('fs').promises; // Use promises version for async/await

// // Upload a new status
// const uploadStatus = async (req, res) => {
//     try {
//         const { visibility = 'public' } = req.body;
//         // CORRECTED: Use req.user._id (MongoDB ID) if available, otherwise fallback to Firebase UID
//         const userId = req.user._id || req.user.uid; // Prioritize MongoDB ID

//         console.log(`[statusController] Uploading status for user ID: ${userId}, Visibility: ${visibility}`);

//         if (!req.file) {
//             console.error('[statusController] Error: No media file provided by Multer after upload middleware.');
//             return res.status(400).json({ error: 'No media file provided' });
//         }

//         // Determine media type
//         const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
//         console.log(`[statusController] Uploaded file details: Originalname=${req.file.originalname}, Mimetype=${req.file.mimetype}, Path=${req.file.path}`);

//         // Set expiration time (24 hours from now)
//         const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

//         // Delete any existing active status for this user
//         // This logic assumes a user can only have ONE active status at a time.
//         // If you want multiple statuses, you'll need to adjust this.
//         const existingStatus = await Status.findOneAndDelete({
//             userId,
//             expiresAt: { $gt: new Date() } // Find active status
//         });

//         if (existingStatus) {
//             console.log(`[statusController] Deleted existing active status for user ${userId}: ${existingStatus._id}`);
//             // Optionally delete the old media file from disk
//             try {
//                 // Ensure the path is correct for deletion, it should match the path saved in mediaUrl
//                 await fs.unlink(path.resolve(existingStatus.mediaUrl)); // Use path.resolve to ensure absolute path
//                 console.log(`[statusController] Deleted old media file: ${existingStatus.mediaUrl}`);
//             } catch (fileDeleteError) {
//                 console.warn(`[statusController] Warning: Could not delete old status media file ${existingStatus.mediaUrl}:`, fileDeleteError.message);
//             }
//         }

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
//                 mediaUrl: status.mediaUrl // Include mediaUrl in response for frontend convenience
//             }
//         });
//     } catch (error) {
//         console.error('[statusController] Upload status error:', error);
//         res.status(500).json({ error: 'Failed to upload status', details: error.message }); // Send detailed error message
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

//         const user = await User.findById(currentUserId).populate('following').populate('followers'); // Populate both

//         if (!user) {
//             console.warn(`[GET] /api/status - Current user (${currentUserId}) not found in DB.`);
//             return res.status(404).json({ message: 'Current user not found in DB.' });
//         }

//         const followingIds = user.following.map(f => f._id.toString());
//         const followerIds = user.followers.map(f => f._id.toString());

//         // Users whose public/followers-only statuses should be visible to current user
//         // This includes: current user, users they follow, users who follow them.
//         const visibleUserIds = [
//             currentUserId.toString(), // Always show current user's status
//             ...followingIds,
//             ...followerIds
//         ];

//         // Remove duplicates if any
//         const uniqueVisibleUserIds = [...new Set(visibleUserIds)];

//         console.log(`[GET] /api/status - Unique visible user IDs: ${uniqueVisibleUserIds.join(', ')}`);

//         const statuses = await Status.find({
//             userId: { $in: uniqueVisibleUserIds }, // Filter by relevant user IDs
//             expiresAt: { $gt: new Date() }, // Only active statuses
//             $or: [
//                 { visibility: 'public' }, // Always show public statuses
//                 // If it's your own status OR if the status owner is in your following/followers list,
//                 // then show their 'followers' statuses.
//                 // This complex OR condition is handled by the overall filter, but the backend fetch for all
//                 // relevant users and then client-side filtering/display is often easier for the activity bar.
//                 // However, if you want strict backend filtering, it would need a more complex $or on userId + visibility
//                 // For simplicity, for the *activity bar*, we fetch all statuses from relevant users.
//                 // The client-side `getStatusByUserId` handles fine-grained viewing.
//                 {
//                     $and: [
//                         { visibility: 'followers' },
//                         {
//                             userId: { $in: [...followingIds, ...followerIds, currentUserId.toString()] }
//                         }
//                     ]
//                 }
//             ]
//         })
//         .populate('userId', 'name avatarUrl') // Populate userId field to get user details
//         .sort({ createdAt: -1 }); // Newest first

//         console.log(`[GET] /api/status - ${statuses.length} status(es) found for activity bar.`);

//         // Group statuses by user for the frontend activity bar
//         const groupedStatuses = {};
//         statuses.forEach(status => {
//             // Ensure userId is populated
//             if (status.userId && status.userId._id) {
//                 const uId = status.userId._id.toString();
//                 if (!groupedStatuses[uId]) {
//                     groupedStatuses[uId] = {
//                         _id: uId,
//                         name: status.userId.name,
//                         avatarUrl: status.userId.avatarUrl,
//                         hasActiveStatus: true,
//                         activeStatus: null // Will store the first status found
//                     };
//                 }
//                 // Store the first active status found for that user.
//                 // If you want to show *multiple* statuses per user in the activity bar,
//                 // you'd change this to an array (e.g., activeStatuses: []).
//                 // For a single "story bubble", the first one is enough.
//                 if (!groupedStatuses[uId].activeStatus) {
//                     groupedStatuses[uId].activeStatus = {
//                         _id: status._id,
//                         userId: uId,
//                         mediaType: status.mediaType,
//                         mediaUrl: status.mediaUrl,
//                         createdAt: status.createdAt,
//                         viewedBy: status.viewedBy,
//                         visibility: status.visibility
//                     };
//                 }
//             }
//         });

//         // Convert the grouped object back to an array of User-like objects
//         const formattedConnections = Object.values(groupedStatuses);

//         // For the main current user's status:
//         // We will fetch this separately on the frontend to ensure it always appears first and has correct details.
//         // So, we'll filter out the current user from `formattedConnections` if they appear there
//         // (they might if they follow/are followed by someone else who has a status)
//         const connectionsWithoutCurrentUser = formattedConnections.filter(conn => conn._id.toString() !== currentUserId.toString());

//         return res.json(connectionsWithoutCurrentUser); // Only send connections, current user's status is handled separately by frontend
//     } catch (error) {
//         console.error('Error in getStatuses:', error);
//         return res.status(500).json({ message: 'Internal server error', details: error.message });
//     }
// };


// // Get statuses by specific user (the one whose profile is being viewed)
// // const getStatusByUserId = async (req, res) => {
// //     try {
// //         const { userId } = req.params; // This is the ID of the user whose statuses are being requested (e.g., Kunal Sharma's ID)
// //         const currentUserId = req.user._id; // This is the ID of the authenticated user making the request (e.g., YOU logged in)

// //         console.log(`[statusController:getStatusByUserId] Request to fetch status for target user ID: ${userId} by current user ID: ${currentUserId}`);

// //         // Find the target user (whose status is being requested)
// //         const targetUser = await User.findById(userId);
// //         if (!targetUser) {
// //             console.warn(`[statusController:getStatusByUserId] Target user not found for ID: ${userId}`);
// //             return res.status(404).json({ error: 'Target user not found.' });
// //         }

// //         // Determine if the current authenticated user is the target user
// //         const isOwnProfile = currentUserId.toString() === userId.toString();
// //         console.log(`[statusController:getStatusByUserId] Is Own Profile: ${isOwnProfile}`);

// //         let queryConditions = {
// //             userId: userId,
// //             expiresAt: { $gt: new Date() } // Only retrieve active (non-expired) statuses
// //         };

// //         // If it's the user's own profile, they can always see their own statuses, regardless of visibility setting.
// //         if (isOwnProfile) {
// //             // No additional visibility filter needed for own profile, all active statuses are fetched
// //             console.log(`[statusController:getStatusByUserId] Fetching ALL active statuses for own profile (${userId}).`);
// //         } else {
// //             // If it's not the user's own profile, apply visibility rules based on relationship
// //             const currentUser = await User.findById(currentUserId).populate('following').populate('followers');
// //             if (!currentUser) {
// //                 console.warn(`[statusController:getStatusByUserId] Current authenticated user (${currentUserId}) not found in DB.`);
// //                 // If current user is not found, they can only see public statuses of others.
// //                 queryConditions.$or = [{ visibility: 'public' }];
// //             } else {
// //                 // Check if currentUser is following the targetUser
// //                 const isFollowingTargetUser = currentUser.following.some(id => id.toString() === userId.toString());
// //                 // Check if targetUser is following the currentUser (i.e., currentUser is a follower of targetUser)
// //                 // This means targetUser has currentUserId in their 'followers' array.
// //                 const isFollowerOfTargetUser = targetUser.followers.some(id => id.toString() === currentUserId.toString());

// //                 console.log(`[statusController:getStatusByUserId] Viewer (${currentUserId}) is not owner. Is following target: ${isFollowingTargetUser}, Is follower of target: ${isFollowerOfTargetUser}`);

// //                 // Build the $or condition for visibility
// //                 const visibilityClauses = [{ visibility: 'public' }]; // Public statuses are always visible to anyone

// //                 // If the current user is following the target user OR the current user is a follower of the target user,
// //                 // then they can also see 'followers' visibility statuses.
// //                 if (isFollowingTargetUser || isFollowerOfTargetUser) {
// //                     visibilityClauses.push({ visibility: 'followers' });
// //                     console.log(`[statusController:getStatusByUserId] Viewer can see 'public' and 'followers' statuses.`);
// //                 } else {
// //                     console.log(`[statusController:getStatusByUserId] Viewer can only see 'public' statuses.`);
// //                 }
// //                 queryConditions.$or = visibilityClauses;
// //             }
// //         }

// //         const statuses = await Status.find(queryConditions)
// //             .populate('userId', 'name avatarUrl') // Populate user details for the status
// //             .sort({ createdAt: -1 }); // Get the latest status first

// //         console.log(`[statusController:getStatusByUserId] Found ${statuses.length} active status(es) for ${userId}.`);
// //         console.log("Backend: Statuses data (first 5):", statuses.slice(0, 5)); // See the actual data

// //         res.status(200).json(statuses);

// //     } catch (error) {
// //         console.error('[statusController:getStatusByUserId] Get user statuses error:', error);
// //         res.status(500).json({ error: 'Failed to fetch user statuses', details: error.message });
// //     }
// // };

// // ... (rest of your statusController.js code) ...

// // Get statuses by specific user (the one whose profile is being viewed)
// const getStatusByUserId = async (req, res) => {
//     try {
//         const { userId } = req.params; // This is the ID of the user whose statuses are being requested (e.g., Kunal Sharma's ID)
//         const currentUserId = req.user._id; // This is the ID of the authenticated user making the request (e.g., YOU logged in)

//         console.log(`[statusController:getStatusByUserId] Request to fetch status for target user ID: ${userId} by current user ID: ${currentUserId}`);

//         // --- Step 1: Validate User IDs ---
//         if (!userId || !currentUserId) {
//             console.error('[statusController:getStatusByUserId] Missing userId or currentUserId.');
//             return res.status(400).json({ error: 'User ID or current user ID is missing.' });
//         }

//         // Ensure they are valid MongoDB ObjectIds if necessary, though Mongoose handles basic string IDs well
//         // You might add a check here if you use something like 'mongoose.Types.ObjectId.isValid(userId)'

//         // --- Step 2: Find the target user ---
//         const targetUser = await User.findById(userId);
//         if (!targetUser) {
//             console.warn(`[statusController:getStatusByUserId] Target user not found for ID: ${userId}`);
//             return res.status(404).json({ error: 'Target user not found.' });
//         }

//         // --- Step 3: Determine if the current authenticated user is the target user ---
//         const isOwnProfile = currentUserId.toString() === userId.toString();
//         console.log(`[statusController:getStatusByUserId] Is Own Profile: ${isOwnProfile}`);

//         let queryConditions = {
//             userId: userId,
//             expiresAt: { $gt: new Date() } // Only retrieve active (non-expired) statuses
//         };

//         // --- Step 4: Apply Visibility Rules ---
//         if (isOwnProfile) {
//             // If it's the user's own profile, they can always see their own statuses, regardless of visibility setting.
//             console.log(`[statusController:getStatusByUserId] Fetching ALL active statuses for own profile (${userId}).`);
//             // No additional visibility filter needed for own profile
//         } else {
//             // If it's not the user's own profile, apply visibility rules based on relationship
//             const currentUser = await User.findById(currentUserId).populate('following').populate('followers');

//             if (!currentUser) {
//                 console.warn(`[statusController:getStatusByUserId] Current authenticated user (${currentUserId}) not found in DB. Restricting to public statuses.`);
//                 // If current user is not found (e.g., deleted), they can only see public statuses of others.
//                 queryConditions.$or = [{ visibility: 'public' }];
//             } else {
//                 // Check if currentUser is following the targetUser
//                 const isFollowingTargetUser = currentUser.following.some(id => id.toString() === userId.toString());
//                 // Check if targetUser is following the currentUser (i.e., currentUser is a follower of targetUser)
//                 const isFollowerOfTargetUser = targetUser.followers.some(id => id.toString() === currentUserId.toString());

//                 console.log(`[statusController:getStatusByUserId] Viewer (${currentUserId}) is not owner. Is following target (${userId}): ${isFollowingTargetUser}, Is follower of target (${userId}): ${isFollowerOfTargetUser}`);

//                 // Build the $or condition for visibility
//                 const visibilityClauses = [{ visibility: 'public' }]; // Public statuses are always visible to anyone

//                 // If the current user is following the target user OR the current user is a follower of the target user,
//                 // then they can also see 'followers' visibility statuses.
//                 if (isFollowingTargetUser || isFollowerOfTargetUser) {
//                     visibilityClauses.push({ visibility: 'followers' });
//                     console.log(`[statusController:getStatusByUserId] Viewer can see 'public' and 'followers' statuses.`);
//                 } else {
//                     console.log(`[statusController:getStatusByUserId] Viewer can only see 'public' statuses.`);
//                 }
//                 queryConditions.$or = visibilityClauses;
//             }
//         }

//         // --- Step 5: Fetch the statuses based on conditions ---
//         console.log(`[statusController:getStatusByUserId] Final MongoDB query conditions for ${userId}:`, JSON.stringify(queryConditions, null, 2));

//         const statuses = await Status.find(queryConditions)
//             .populate('userId', 'name avatarUrl') // Populate user details for the status owner
//             .sort({ createdAt: -1 }); // Get the latest status first

//         console.log(`[statusController:getStatusByUserId] Found ${statuses.length} active status(es) for ${userId}.`);
//         console.log("Backend: Statuses data (first 5):", statuses.slice(0, 5).map(s => ({
//             _id: s._id,
//             mediaType: s.mediaType,
//             mediaUrl: s.mediaUrl,
//             visibility: s.visibility,
//             createdAt: s.createdAt,
//             userId: s.userId ? s.userId._id : 'N/A' // Log user ID
//         }))); // Log more relevant fields for debugging

//         res.status(200).json(statuses);

//     } catch (error) {
//         console.error('[statusController:getStatusByUserId] !!! CRITICAL ERROR !!! Failed to fetch user statuses:', error);
//         // Log the full error stack for better debugging on the backend
//         console.error('Error stack:', error.stack);
//         res.status(500).json({ error: 'Failed to fetch user statuses', details: error.message, code: error.code }); // Send more details
//     }
// };

// // ... (rest of your statusController.js code) ...

// // Mark status as viewed
// const markStatusAsViewed = async (req, res) => {
//     try {
//         const { statusId } = req.params;
//         const currentUserId = req.user._id; // Ensure using MongoDB ID

//         const status = await Status.findById(statusId);
//         if (!status) {
//             return res.status(404).json({ error: 'Status not found' });
//         }

//         // Don't mark own status as viewed
//         if (status.userId.toString() === currentUserId.toString()) { // Compare as strings
//             console.log(`[statusController] Not marking own status (${statusId}) as viewed by ${currentUserId}.`);
//             return res.json({ message: 'Cannot mark own status as viewed' });
//         }

//         // Add to viewedBy if not already viewed
//         if (!status.viewedBy.map(id => id.toString()).includes(currentUserId.toString())) { // Compare as strings
//             status.viewedBy.push(currentUserId);
//             await status.save();
//             console.log(`[statusController] Status ${statusId} marked as viewed by ${currentUserId}.`);
//         } else {
//             console.log(`[statusController] Status ${statusId} already viewed by ${currentUserId}.`);
//         }

//         res.json({ message: 'Status marked as viewed' });
//     } catch (error) {
//         console.error('Mark status viewed error:', error);
//         res.status(500).json({ error: 'Failed to mark status as viewed' });
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
//     getStatuses,
//     getStatusByUserId,
//     markStatusAsViewed,
//     deleteStatus,
//     getStatusAnalytics,
//     cleanupExpiredStatuses
// };









// controllers/statusController.js
const Status = require('../models/Status');
const User = require('../models/User'); // Ensure User model is imported
const path = require('path');
const fs = require('fs').promises; // Use promises version for async/await

// Upload a new status
const uploadStatus = async (req, res) => {
    try {
        const { visibility = 'public' } = req.body;
        const userId = req.user._id; // Use MongoDB ID from req.user

        console.log(`[statusController] Uploading status for user ID: ${userId}, Visibility: ${visibility}`);

        if (!req.file) {
            console.error('[statusController] Error: No media file provided by Multer after upload middleware.');
            return res.status(400).json({ error: 'No media file provided' });
        }

        const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        console.log(`[statusController] Uploaded file details: Originalname=${req.file.originalname}, Mimetype=${req.file.mimetype}, Path=${req.file.path}`);

        // Set expiration time (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // *** CRITICAL CHANGE HERE: REMOVE findOneAndDelete ***
        // A user can now have multiple active statuses.
        // The old code:
        // const existingStatus = await Status.findOneAndDelete({
        //     userId,
        //     expiresAt: { $gt: new Date() } // Find active status
        // });
        // if (existingStatus) { ... delete old media ... }
        // REMOVE THE ABOVE BLOCK ENTIRELY IF YOU WANT MULTIPLE STATUSES.

        // Create new status
        const status = new Status({
            userId,
            mediaUrl: req.file.path, // Multer saves the file path here
            mediaType,
            visibility,
            expiresAt,
            viewedBy: [], // Track who viewed this status
            createdAt: new Date()
        });

        await status.save();
        console.log(`[statusController] New status created successfully: ${status._id}`);

        res.status(201).json({
            message: 'Status uploaded successfully',
            status: {
                _id: status._id,
                userId: status.userId,
                mediaType: status.mediaType,
                visibility: status.visibility,
                expiresAt: status.expiresAt,
                createdAt: status.createdAt,
                mediaUrl: status.mediaUrl
            }
        });
    } catch (error) {
        console.error('[statusController] Upload status error:', error);
        res.status(500).json({ error: 'Failed to upload status', details: error.message });
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

        const followingIds = user.following.map(f => f._id.toString());
        const followerIds = user.followers.map(f => f._id.toString());

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find all active statuses for current user and their connections
        const rawStatuses = await Status.find({
            expiresAt: { $gt: twentyFourHoursAgo }, // Only active statuses
            $or: [
                { userId: currentUserId }, // Always show own statuses
                { // Show public statuses from anyone
                    visibility: 'public',
                    userId: { $ne: currentUserId } // Exclude own public statuses already covered above
                },
                { // Show followers-only statuses from users I follow or users who follow me
                    visibility: 'followers',
                    userId: { $in: [...followingIds, ...followerIds] }
                }
            ]
        })
            .populate('userId', 'name avatarUrl')
            .sort({ createdAt: -1 }); // Get the latest first

        console.log(`[GET] /api/status - ${rawStatuses.length} potential status(es) found.`);

        // Group statuses by user and ensure only relevant ones are sent for the activity bar
        const groupedStatuses = {};
        rawStatuses.forEach(status => {
            if (status.userId && status.userId._id) {
                const uId = status.userId._id.toString();
                // If this is the current user's status, add to a special list for them
                if (uId === currentUserId.toString()) {
                    if (!groupedStatuses[uId]) {
                        groupedStatuses[uId] = {
                            _id: uId,
                            name: status.userId.name,
                            avatarUrl: status.userId.avatarUrl,
                            hasActiveStatus: true,
                            // Store ALL active statuses for the current user
                            allActiveStatuses: []
                        };
                    }
                    groupedStatuses[uId].allActiveStatuses.push({
                        _id: status._id,
                        userId: uId,
                        mediaType: status.mediaType,
                        mediaUrl: status.mediaUrl,
                        createdAt: status.createdAt,
                        viewedBy: status.viewedBy,
                        visibility: status.visibility
                    });
                } else {
                    // For connections, just indicate they have active status and their latest status for thumbnail
                    if (!groupedStatuses[uId]) {
                        groupedStatuses[uId] = {
                            _id: uId,
                            name: status.userId.name,
                            avatarUrl: status.userId.avatarUrl,
                            hasActiveStatus: true,
                            // For connections, we only need a placeholder or the latest status info for the bubble
                            latestActiveStatusPreview: {
                                _id: status._id,
                                mediaType: status.mediaType,
                                mediaUrl: status.mediaUrl,
                                createdAt: status.createdAt,
                            }
                        };
                    }
                }
            }
        });

        // Separate current user's data from connections
        const currentUserDataForFrontend = groupedStatuses[currentUserId.toString()] || {
            _id: currentUserId.toString(),
            name: user.name, // Fallback to current user's name
            avatarUrl: user.avatarUrl,
            hasActiveStatus: false,
            allActiveStatuses: []
        };
        // Sort current user's statuses by createdAt to ensure oldest is first if frontend consumes that way
        currentUserDataForFrontend.allActiveStatuses?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());


        const connectionsWithActiveStatuses = Object.values(groupedStatuses).filter(u => u._id.toString() !== currentUserId.toString());

        // You might want to sort connections as well, e.g., by latest status time or alphabetically
        connectionsWithActiveStatuses.sort((a, b) => {
            const timeA = a.latestActiveStatusPreview ? new Date(a.latestActiveStatusPreview.createdAt).getTime() : 0;
            const timeB = b.latestActiveStatusPreview ? new Date(b.latestActiveStatusPreview.createdAt).getTime() : 0;
            return timeB - timeA; // Newest first
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
            createdAt: { $gt: twentyFourHoursAgo } // Filter by creation time, not expiresAt
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
            mediaUrl: s.mediaUrl,
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
// // ... (rest of your statusController.js code) ...

// Mark status as viewed
// const markStatusAsViewed = async (req, res) => {
//     try {
//         const { statusId } = req.params;
//         const currentUserId = req.user._id; // Ensure using MongoDB ID

//         const status = await Status.findById(statusId);
//         if (!status) {
//             return res.status(404).json({ error: 'Status not found' });
//         }

//         // Don't mark own status as viewed
//         if (status.userId.toString() === currentUserId.toString()) { // Compare as strings
//             console.log(`[statusController] Not marking own status (${statusId}) as viewed by ${currentUserId}.`);
//             return res.json({ message: 'Cannot mark own status as viewed' });
//         }

//         // Add to viewedBy if not already viewed
//         if (!status.viewedBy.map(id => id.toString()).includes(currentUserId.toString())) { // Compare as strings
//             status.viewedBy.push(currentUserId);
//             await status.save();
//             console.log(`[statusController] Status ${statusId} marked as viewed by ${currentUserId}.`);
//         } else {
//             console.log(`[statusController] Status ${statusId} already viewed by ${currentUserId}.`);
//         }

//         res.json({ message: 'Status marked as viewed' });
//     } catch (error) {
//         console.error('Mark status viewed error:', error);
//         res.status(500).json({ error: 'Failed to mark status as viewed' });
//     }
// };

// In your backend statusController.js (or wherever your /api/status/view/:statusId logic lives)

const markStatusAsViewed = async (req, res, next) => {
    try {
        const { statusId } = req.params;
        // req.user._id comes from your authMiddleware, representing the current authenticated user
        const viewerId = req.user._id;

        if (!viewerId) {
            return res.status(401).json({ message: 'Authentication required to mark status as viewed.' });
        }

        // Find the status
        const status = await Status.findById(statusId);

        if (!status) {
            return res.status(404).json({ message: 'Status not found.' });
        }

        // IMPORTANT: Prevent a user from marking their own status as viewed
        // Ensure that status.userId is a string or convert viewerId to ObjectId for comparison
        if (status.userId.toString() === viewerId.toString()) {
            console.log(`[Backend:markStatusAsViewed] User ${viewerId} attempted to view their own status ${statusId}. Not counting.`);
            return res.status(200).json({ message: 'Own status view not counted.' });
        }

        // Check if the viewer has already viewed this status to prevent duplicate entries
        if (!status.viewedBy.includes(viewerId)) {
            status.viewedBy.push(viewerId);
            await status.save();
            console.log(`[Backend:markStatusAsViewed] Status ${statusId} marked as viewed by ${viewerId}.`);
        } else {
            console.log(`[Backend:markStatusAsViewed] Status ${statusId} already viewed by ${viewerId}.`);
        }

        res.status(200).json({ message: 'Status view processed successfully.' });

    } catch (error) {
        console.error('Error marking status as viewed:', error);
        next(error); // Pass to global error handler
    }
};

// Delete status
const deleteStatus = async (req, res) => {
    try {
        const { statusId } = req.params;
        const currentUserId = req.user._id; // Ensure using MongoDB ID

        const status = await Status.findById(statusId);
        if (!status) {
            return res.status(404).json({ error: 'Status not found' });
        }

        // Only allow deletion of own status
        if (status.userId.toString() !== currentUserId.toString()) { // Compare as strings
            return res.status(403).json({ error: 'Not authorized to delete this status' });
        }

        // Delete media file
        try {
            await fs.unlink(path.resolve(status.mediaUrl)); // Use path.resolve
            console.log(`[statusController] Successfully deleted media file: ${status.mediaUrl}`);
        } catch (fileError) {
            console.warn(`[statusController] Warning: Could not delete media file ${status.mediaUrl}:`, fileError.message);
            // Don't block deletion if file deletion fails, but log it
        }

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
        const currentUserId = req.user._id; // Ensure using MongoDB ID

        const status = await Status.findById(statusId)
            .populate('viewedBy', 'name avatarUrl')
            .populate('userId', 'name avatarUrl');

        if (!status) {
            return res.status(404).json({ error: 'Status not found' });
        }

        // Only allow viewing analytics of own status
        if (status.userId._id.toString() !== currentUserId.toString()) { // Compare as strings
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
        // Delete media files
        for (const status of expiredStatuses) {
            try {
                await fs.unlink(path.resolve(status.mediaUrl)); // Use path.resolve
                deletedFilesCount++;
            } catch (error) {
                console.warn(`[cleanupExpiredStatuses] Could not delete file ${status.mediaUrl}:`, error.message);
            }
        }

        // Delete from database
        const result = await Status.deleteMany({
            expiresAt: { $lte: new Date() }
        });

        console.log(`[cleanupExpiredStatuses] Cleaned up ${result.deletedCount} expired statuses (files deleted: ${deletedFilesCount})`);
        return result.deletedCount;
    } catch (error) {
        console.error('[cleanupExpiredStatuses] Cleanup expired statuses error:', error);
        throw error;
    }
};


module.exports = {
    uploadStatus,
    getStatuses, // This will list connections with active stories + current user's stories
    getStatusByUserId, // This will fetch ALL active stories for a specific user to view in the viewer
    markStatusAsViewed,
    deleteStatus,
    getStatusAnalytics,
    cleanupExpiredStatuses
};