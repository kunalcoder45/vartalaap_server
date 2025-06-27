
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User'); // User model
// const authMiddleware = require('../middleware/authMiddleware'); // Our unified authentication middleware
// const upload = require('../middleware/uploadMiddleware'); // Multer setup (assuming this file exists now)
// const path = require('path');
// const fs = require('fs/promises'); // Use fs.promises for async operations for cleaner code
// const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
// const attachMongoUser = require('../middleware/attachMongoUser')
// const userController = require('../controllers/userController');

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'; // Ensure this matches frontend's API_BASE_URL (without /api)
// const { getFollowDetails } = require('../controllers/userController');

// // Apply authMiddleware to all routes in this router
// // This will attach the MongoDB user object to req.user
// router.use(authMiddleware);

// // Helper function to get default avatar URL
// const getDefaultAvatarUrl = () => {
//     // This should match the path where you serve default avatars in server.js
//     // e.g., http://localhost:5001/avatars/userLogo.png
//     return `${BACKEND_URL}/avatars/userLogo.png`;
// };

// // GET /api/users/profile - Fetch user's own profile
// router.get('/profile', async (req, res) => {
//     console.log('GET_USER_PROFILE_ROUTE: Entering profile fetch route.');
//     console.log('GET_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user);

//     try {
//         // req.user is already populated by authMiddleware with the MongoDB user document
//         const user = req.user;

//         if (!user) {
//             // This case should ideally not be hit if authMiddleware is configured to return 404
//             // But keeping for robustness.
//             return res.status(404).json({ message: 'User not found in database. Please ensure profile is synced.' });
//         }

//         res.status(200).json({
//             name: user.name,
//             email: user.email,
//             bio: user.bio,
//             // Ensure avatarUrl is a full URL, fallback to default if not set
//             avatarUrl: user.avatarUrl || getDefaultAvatarUrl(),
//             firebaseUid: user.firebaseUid,
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt
//         });
//     } catch (error) {
//         console.error('GET_USER_PROFILE_ROUTE: Error fetching user profile:', error.message);
//         res.status(500).json({ message: 'Internal server error fetching profile.', error: error.message });
//     }
// });

// // PUT /api/users/profile - Update user's own profile
// // The 'avatar' in upload.single('avatar') must match the field name used in FormData on the frontend
// // router.put('/profile', upload.single('avatar'), async (req, res) => {
// //     console.log('PUT_USER_PROFILE_ROUTE: Entering profile update route.');
// //     console.log('PUT_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user);
// //     console.log('PUT_USER_PROFILE_ROUTE: req.body:', req.body); // For name, bio
// //     console.log('PUT_USER_PROFILE_ROUTE: req.file:', req.file); // For avatar file

// //     try {
// //         // req.user is already populated by authMiddleware with the MongoDB user document
// //         const user = req.user;
// //         const { name, bio } = req.body;

// //         if (!user) {
// //             // If user not found (should be handled by authMiddleware before this point)
// //             // Cleanup the uploaded file if any, as it's not associated with a user
// //             if (req.file) {
// //                 await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file for non-existent user:', err));
// //             }
// //             return res.status(404).json({ message: 'User not found.' });
// //         }

// //         // Update fields if they are provided in the request body
// //         if (name !== undefined) {
// //             user.name = name;
// //         }
// //         // Handle bio: allow empty string for bio
// //         if (bio !== undefined) {
// //             user.bio = bio;
// //         }

// //         // Handle avatar update
// //         if (req.file) {
// //             // If there's an existing custom avatar, delete it
// //             // Only delete if it's an uploaded file (starts with /uploads/), not a default avatar
// //             if (user.avatarUrl && user.avatarUrl.startsWith(`${BACKEND_URL}/uploads/`)) {
// //                 const oldAvatarFilename = path.basename(user.avatarUrl);
// //                 const oldAvatarPath = path.join(__dirname, '..', 'uploads', oldAvatarFilename);

// //                 try {
// //                     await fs.unlink(oldAvatarPath);
// //                     console.log(`PUT_USER_PROFILE_ROUTE: Deleted old avatar: ${oldAvatarPath}`);
// //                 } catch (unlinkError) {
// //                     if (unlinkError.code === 'ENOENT') {
// //                         console.warn(`PUT_USER_PROFILE_ROUTE: Old avatar file not found, skipping deletion: ${oldAvatarPath}`);
// //                     } else {
// //                         console.error('PUT_USER_PROFILE_ROUTE: Error deleting old avatar:', unlinkError.message);
// //                     }
// //                 }
// //             }
// //             // Set the new avatar URL
// //             user.avatarUrl = `${BACKEND_URL}/uploads/${req.file.filename}`;
// //             console.log('PUT_USER_PROFILE_ROUTE: New avatar set to:', user.avatarUrl);
// //         }

// //         await user.save(); // Save updated user to MongoDB

// //         res.status(200).json({
// //             message: 'Profile updated successfully!',
// //             name: user.name,
// //             bio: user.bio,
// //             avatarUrl: user.avatarUrl || getDefaultAvatarUrl(), // Return updated URL, or default
// //         });

// //     } catch (error) {
// //         console.error('PUT_USER_PROFILE_ROUTE: Error updating user profile:', error.message);
// //         // If an error occurred during update, delete the newly uploaded file to prevent orphans
// //         if (req.file) {
// //             await fs.unlink(req.file.path).catch(err => console.error('Error deleting newly uploaded file after update failure:', err));
// //         }
// //         res.status(500).json({ message: 'Internal server error updating profile.', error: error.message });
// //     }
// // });

// // backend/routes/users.js - PUT profile route
// router.put('/profile', upload.single('avatar'), async (req, res) => {
//     console.log('PUT_USER_PROFILE_ROUTE: Entering profile update route.');
//     console.log('PUT_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user);
//     console.log('PUT_USER_PROFILE_ROUTE: req.body:', req.body); // For name, bio
//     console.log('PUT_USER_PROFILE_ROUTE: req.file:', req.file); // For avatar file

//     try {
//         // req.user is already populated by authMiddleware with the MongoDB user document
//         const user = req.user;
//         const { name, bio } = req.body;

//         if (!user) {
//             // If user not found (should be handled by authMiddleware before this point)
//             // Cleanup the uploaded file if any, as it's not associated with a user
//             if (req.file) {
//                 await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file for non-existent user:', err));
//             }
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         // Update fields if they are provided in the request body
//         if (name !== undefined) {
//             user.name = name;
//         }
//         // Handle bio: allow empty string for bio
//         if (bio !== undefined) {
//             user.bio = bio;
//         }

//         // Handle avatar update
//         if (req.file) {
//             console.log('PUT_USER_PROFILE_ROUTE: New avatar file uploaded:', req.file.filename);
            
//             // Check if there's an existing custom avatar that needs to be deleted
//             // Only delete if it's an uploaded file (starts with the backend URL + /uploads/), not a default avatar or Google photo
//             if (user.avatarUrl && user.avatarUrl.startsWith(`${BACKEND_URL}/uploads/`)) {
//                 const oldAvatarFilename = path.basename(user.avatarUrl);
//                 const oldAvatarPath = path.join(__dirname, '..', 'uploads', oldAvatarFilename);

//                 try {
//                     await fs.unlink(oldAvatarPath);
//                     console.log(`PUT_USER_PROFILE_ROUTE: Deleted old custom avatar: ${oldAvatarPath}`);
//                 } catch (unlinkError) {
//                     if (unlinkError.code === 'ENOENT') {
//                         console.warn(`PUT_USER_PROFILE_ROUTE: Old avatar file not found, skipping deletion: ${oldAvatarPath}`);
//                     } else {
//                         console.error('PUT_USER_PROFILE_ROUTE: Error deleting old avatar:', unlinkError.message);
//                     }
//                 }
//             } else if (user.avatarUrl) {
//                 // Log that we're replacing a Google/external avatar (no deletion needed)
//                 console.log('PUT_USER_PROFILE_ROUTE: Replacing external avatar (Google/default) with custom upload:', user.avatarUrl);
//             }
            
//             // Set the new avatar URL
//             user.avatarUrl = `${BACKEND_URL}/uploads/${req.file.filename}`;
//             console.log('PUT_USER_PROFILE_ROUTE: New avatar set to:', user.avatarUrl);
//         }

//         await user.save(); // Save updated user to MongoDB

//         // Return the updated user data
//         res.status(200).json({
//             message: 'Profile updated successfully!',
//             _id: user._id, // Include MongoDB ID
//             name: user.name,
//             bio: user.bio,
//             avatarUrl: user.avatarUrl || getDefaultAvatarUrl(), // Return updated URL, or default
//             firebaseUid: user.firebaseUid, // Include Firebase UID for reference
//         });

//     } catch (error) {
//         console.error('PUT_USER_PROFILE_ROUTE: Error updating user profile:', error.message);
//         // If an error occurred during update, delete the newly uploaded file to prevent orphans
//         if (req.file) {
//             await fs.unlink(req.file.path).catch(err => console.error('Error deleting newly uploaded file after update failure:', err));
//         }
//         res.status(500).json({ message: 'Internal server error updating profile.', error: error.message });
//     }
// });

// router.get('/me/relationships', authMiddleware, async (req, res, next) => {
//     try {
//         const userId = req.user._id; // Assuming req.user contains the MongoDB _id from your authMiddleware

//         const user = await User.findById(userId)
//             .select('following pendingSentRequests') // Select only the necessary fields
//             .lean(); // Use .lean() for faster query if you don't need Mongoose document methods

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.json({
//             following: user.following.map(id => id.toString()), // Convert ObjectIds to strings
//             pendingSentRequests: user.pendingSentRequests.map(id => id.toString()),
//             // You might also add pendingReceivedRequests here if you want to show it in the UI
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// // POST send follow request
// router.post('/:targetUserId/follow', authMiddleware, async (req, res, next) => {
//     try {
//         const currentUserId = req.user._id; // The user sending the request
//         const targetUserId = req.params.targetUserId; // The user to follow

//         if (currentUserId.toString() === targetUserId.toString()) {
//             return res.status(400).json({ message: "You cannot follow yourself." });
//         }

//         const currentUser = await User.findById(currentUserId);
//         const targetUser = await User.findById(targetUserId);

//         if (!currentUser || !targetUser) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         // Check if already following
//         if (currentUser.following.includes(targetUserId)) {
//             return res.status(409).json({ message: "Already following this user." });
//         }

//         // Check if request already sent or received
//         if (currentUser.pendingSentRequests.includes(targetUserId) || targetUser.pendingReceivedRequests.includes(currentUserId)) {
//              return res.status(409).json({ message: "Follow request already pending." });
//         }

//         // Add to sender's pendingSentRequests
//         currentUser.pendingSentRequests.push(targetUserId);
//         await currentUser.save();

//         // Add to recipient's pendingReceivedRequests
//         targetUser.pendingReceivedRequests.push(currentUserId);
//         await targetUser.save();

//         // Emit real-time notification (if Socket.IO is configured)
//         const io = req.app.get('socketio'); // Get the Socket.IO instance
//         if (io) {
//             io.emit('sendFollowRequestNotification', {
//                 recipientId: targetUserId, // MongoDB _id of the recipient
//                 senderName: currentUser.name,
//                 senderAvatarUrl: currentUser.avatarUrl,
//                 senderId: currentUserId // MongoDB _id of the sender
//             });
//         }

//         res.status(200).json({ message: 'Follow request sent successfully.' });

//     } catch (error) {
//         next(error);
//     }
// });

// // router.get('/follow-details/:userId',verifyFirebaseToken,attachMongoUser,  getFollowDetails);


// // --- ADD THIS NEW ROUTE ---
// router.get('/by-firebase-uid/:firebaseUid', verifyFirebaseToken, attachMongoUser, userController.getMongoUserByFirebaseUid);
// // -------------------------

// // In your user routes file (e.g. routes/user.js)
// router.get('/follow-details/:userId', verifyFirebaseToken, userController.getFollowDetails);


// module.exports = router;











// const express = require('express');
// const router = express.Router();
// const User = require('../models/User'); // User model
// const authMiddleware = require('../middleware/authMiddleware'); // Our unified authentication middleware
// const upload = require('../middleware/uploadMiddleware'); // Multer setup (assuming this file exists now)
// const path = require('path');
// const fs = require('fs/promises'); // Use fs.promises for async operations for cleaner code
// const verifyFirebaseToken = require('../middleware/verifyFirebaseToken'); // Assuming this exists
// const attachMongoUser = require('../middleware/attachMongoUser'); // Assuming this exists and works
// const userController = require('../controllers/userController'); // Assuming userController exists

// // --- IMPORTANT: Ensure this matches your frontend's MEDIA_BASE_URL ---
// // This is used to construct full URLs for avatars/media from relative paths
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// // Helper function to construct full URL for avatars
// const getFullAvatarUrl = (avatarPath) => {
//     if (!avatarPath || avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
//         // If avatarPath is null/undefined or already an absolute URL (e.g., Google photo)
//         return avatarPath || `${BACKEND_URL}/avatars/userLogo.png`; // Fallback to a default server-side image
//     }
//     // Assume it's a relative path to an uploaded file
//     const cleanedPath = avatarPath.replace(/\\/g, '/'); // Ensure forward slashes
//     return `${BACKEND_URL}/${cleanedPath}`; // e.g., http://localhost:5001/uploads/image.png
// };


// // Apply authMiddleware to all routes in this router
// // This middleware is crucial as it populates `req.user` with the MongoDB user document
// router.use(authMiddleware);

// // --- GET /api/users/profile - Fetch the AUTHENTICATED user's own profile ---
// // This route does NOT take a userId parameter in the URL.
// // It relies on `req.user` being populated by `authMiddleware` after token verification.
// router.get('/profile', async (req, res) => {
//     console.log('GET_AUTH_USER_PROFILE_ROUTE: Attempting to fetch authenticated user profile.');
//     console.log('GET_AUTH_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user ? req.user._id : 'Not populated');

//     try {
//         const user = req.user; // `req.user` should be populated by `authMiddleware`

//         if (!user) {
//             // This case should ideally not be hit if authMiddleware works correctly,
//             // as it should stop the request before here if no user is found.
//             return res.status(404).json({ message: 'Authenticated user not found in database. Please ensure profile is synced.' });
//         }

//         res.status(200).json({
//             _id: user._id, // Include MongoDB _id for frontend use
//             name: user.name,
//             email: user.email,
//             bio: user.bio,
//             // Use the helper to ensure a full URL for the avatar
//             avatarUrl: getFullAvatarUrl(user.avatarUrl),
//             firebaseUid: user.firebaseUid,
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt
//         });
//     } catch (error) {
//         console.error('GET_AUTH_USER_PROFILE_ROUTE: Error fetching user profile:', error.message);
//         res.status(500).json({ message: 'Internal server error fetching your profile.', error: error.message });
//     }
// });

// // --- GET /api/users/profile/:userId - Fetch ANY user's profile by their MongoDB ID ---
// // This route is for fetching *other* users' profiles when their MongoDB ID is known.
// // It still uses `authMiddleware` to ensure the request is from an authenticated user.
// router.get('/profile/:userId', async (req, res) => {
//     console.log('GET_SPECIFIC_USER_PROFILE_ROUTE: Attempting to fetch specific user profile.');
//     console.log('GET_SPECIFIC_USER_PROFILE_ROUTE: req.params.userId:', req.params.userId);

//     try {
//         const targetUserId = req.params.userId;

//         // Fetch the user by the ID provided in the URL parameter
//         const user = await User.findById(targetUserId).select('name avatarUrl email bio'); // Select only necessary public fields

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.status(200).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email, // Consider if email should be public for all users
//             bio: user.bio,
//             avatarUrl: getFullAvatarUrl(user.avatarUrl),
//             // Do NOT include sensitive fields like firebaseUid, passwords, etc., for public profiles
//         });
//     } catch (error) {
//         console.error('GET_SPECIFIC_USER_PROFILE_ROUTE: Error fetching specific user profile:', error.message);
//         res.status(500).json({ message: 'Internal server error fetching specific profile.', error: error.message });
//     }
// });

// // PUT /api/users/profile - Update user's own profile
// // The 'avatar' in upload.single('avatar') must match the field name used in FormData on the frontend
// router.put('/profile', upload.single('avatar'), async (req, res) => {
//     console.log('PUT_USER_PROFILE_ROUTE: Entering profile update route.');
//     console.log('PUT_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user ? req.user._id : 'Not populated');
//     console.log('PUT_USER_PROFILE_ROUTE: req.body:', req.body); // For name, bio
//     console.log('PUT_USER_PROFILE_ROUTE: req.file:', req.file); // For avatar file

//     try {
//         // `req.user` is already populated by authMiddleware with the MongoDB user document
//         const user = req.user;
//         const { name, bio } = req.body;

//         if (!user) {
//             if (req.file) { // Clean up uploaded file if user not found (shouldn't happen with correct auth)
//                 await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file for non-existent user:', err));
//             }
//             return res.status(404).json({ message: 'User not found for update.' });
//         }

//         // Update fields if they are provided in the request body
//         if (name !== undefined) {
//             user.name = name;
//         }
//         if (bio !== undefined) { // Allow empty string for bio
//             user.bio = bio;
//         }

//         // Handle avatar update
//         if (req.file) {
//             console.log('PUT_USER_PROFILE_ROUTE: New avatar file uploaded:', req.file.filename);

//             // Check if there's an existing custom avatar that needs to be deleted
//             // Only delete if it's an uploaded file handled by your server, not an external URL (like Google Photos)
//             const oldAvatarUrl = user.avatarUrl;
//             if (oldAvatarUrl && oldAvatarUrl.startsWith(`${BACKEND_URL}/uploads/`)) {
//                 const oldAvatarFilename = path.basename(oldAvatarUrl);
//                 const oldAvatarPath = path.join(__dirname, '..', 'uploads', oldAvatarFilename);

//                 try {
//                     await fs.unlink(oldAvatarPath);
//                     console.log(`PUT_USER_PROFILE_ROUTE: Deleted old custom avatar: ${oldAvatarPath}`);
//                 } catch (unlinkError) {
//                     if (unlinkError.code === 'ENOENT') {
//                         console.warn(`PUT_USER_PROFILE_ROUTE: Old avatar file not found, skipping deletion: ${oldAvatarPath}`);
//                     } else {
//                         console.error('PUT_USER_PROFILE_ROUTE: Error deleting old avatar:', unlinkError.message);
//                     }
//                 }
//             } else if (oldAvatarUrl) {
//                 console.log('PUT_USER_PROFILE_ROUTE: Replacing external/default avatar with custom upload.');
//             }

//             // Set the new avatar URL based on the uploaded file
//             user.avatarUrl = `uploads/${req.file.filename}`; // Store relative path in DB
//             console.log('PUT_USER_PROFILE_ROUTE: New avatar set to (relative path):', user.avatarUrl);
//         }

//         await user.save(); // Save updated user to MongoDB

//         // Return the updated user data, ensuring avatarUrl is a full URL
//         res.status(200).json({
//             message: 'Profile updated successfully!',
//             _id: user._id,
//             name: user.name,
//             bio: user.bio,
//             avatarUrl: getFullAvatarUrl(user.avatarUrl), // Return the full URL
//             firebaseUid: user.firebaseUid,
//         });

//     } catch (error) {
//         console.error('PUT_USER_PROFILE_ROUTE: Error updating user profile:', error.message);
//         // If an error occurred during update, delete the newly uploaded file to prevent orphans
//         if (req.file) {
//             await fs.unlink(req.file.path).catch(err => console.error('Error deleting newly uploaded file after update failure:', err));
//         }
//         res.status(500).json({ message: 'Internal server error updating profile.', error: error.message });
//     }
// });

// // GET /api/users/me/relationships - Get the current user's following/followers/pending requests
// router.get('/me/relationships', async (req, res, next) => {
//     try {
//         const userId = req.user._id; // `req.user` is from authMiddleware

//         const user = await User.findById(userId)
//             .select('following pendingSentRequests pendingReceivedRequests') // Select all relevant fields
//             .lean(); // Use .lean() for faster queries

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.json({
//             following: user.following.map(id => id.toString()),
//             pendingSentRequests: user.pendingSentRequests.map(id => id.toString()),
//             pendingReceivedRequests: user.pendingReceivedRequests.map(id => id.toString()), // Added
//         });
//     } catch (error) {
//         next(error); // Pass error to error handling middleware
//     }
// });

// // POST /api/users/:targetUserId/follow - Send a follow request
// router.post('/:targetUserId/follow', async (req, res, next) => {
//     try {
//         const currentUserId = req.user._id; // The user sending the request (from authMiddleware)
//         const targetUserId = req.params.targetUserId; // The user to follow (from URL parameter)

//         if (currentUserId.toString() === targetUserId.toString()) {
//             return res.status(400).json({ message: "You cannot follow yourself." });
//         }

//         const currentUser = await User.findById(currentUserId);
//         const targetUser = await User.findById(targetUserId);

//         if (!currentUser || !targetUser) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         // Check if already following
//         if (currentUser.following.includes(targetUserId)) {
//             return res.status(409).json({ message: "Already following this user." });
//         }

//         // Check if request already sent or received
//         if (currentUser.pendingSentRequests.includes(targetUserId) || targetUser.pendingReceivedRequests.includes(currentUserId)) {
//             return res.status(409).json({ message: "Follow request already pending." });
//         }

//         // Add to sender's pendingSentRequests
//         currentUser.pendingSentRequests.push(targetUserId);
//         await currentUser.save();

//         // Add to recipient's pendingReceivedRequests
//         targetUser.pendingReceivedRequests.push(currentUserId);
//         await targetUser.save();

//         // Emit real-time notification (if Socket.IO is configured in your main server.js)
//         const io = req.app.get('socketio'); // Get the Socket.IO instance attached to the app
//         if (io) {
//             io.to(targetUserId.toString()).emit('newFollowRequest', { // Emit to a specific user's socket ID
//                 senderId: currentUserId,
//                 senderName: currentUser.name,
//                 senderAvatarUrl: getFullAvatarUrl(currentUser.avatarUrl),
//                 message: `${currentUser.name} sent you a follow request.`,
//             });
//             console.log(`Socket.IO: Emitted newFollowRequest to user ${targetUserId}`);
//         }

//         res.status(200).json({ message: 'Follow request sent successfully.' });

//     } catch (error) {
//         console.error('Error sending follow request:', error);
//         next(error); // Pass error to error handling middleware
//     }
// });

// // GET /api/users/by-firebase-uid/:firebaseUid - Get MongoDB user by Firebase UID
// // This route is typically used during initial user sync or for specific lookups.
// // It uses `verifyFirebaseToken` and `attachMongoUser` to ensure the requester is authenticated
// // and `req.user` is populated, but fetches a user based on the UID in the URL.
// router.get('/by-firebase-uid/:firebaseUid', verifyFirebaseToken, attachMongoUser, userController.getMongoUserByFirebaseUid);

// // GET /api/user/follow-details/:userId - Get details about a specific user's follow relationships
// // This route is for getting follow details for any user by their MongoDB ID.
// // It also uses `verifyFirebaseToken` to ensure the request is authenticated.
// router.get('/follow-details/:userId', verifyFirebaseToken, userController.getFollowDetails);

// router.post('/many', async (req, res, next) => {
//     // You might want to apply authMiddleware here if these details are sensitive,
//     // or if only authenticated users can view status viewers.
//     // Given it's for 'viewedBy' a status, it likely needs authentication.
//     // If authMiddleware is already applied globally to this router (which it is via `router.use(authMiddleware)`),
//     // then req.user will be available, but this specific endpoint might not strictly *need* req.user
//     // unless you plan to add authorization logic here (e.g., "only show details for friends").
//     userController.getManyUserDetails(req, res, next);
// });

// module.exports = router;








// const express = require('express');
// const router = express.Router();
// const User = require('../models/User'); // User model
// const authMiddleware = require('../middleware/authMiddleware'); // Our unified authentication middleware
// const upload = require('../middleware/uploadMiddleware'); // Multer setup
// const fs = require('fs/promises'); // Use fs.promises for async operations
// const path = require('path');

// // Import the userController functions
// const userController = require('../controllers/userController');

// // --- IMPORTANT: Ensure this matches your frontend's MEDIA_BASE_URL ---
// // This is used to construct full URLs for avatars/media from relative paths
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// // Helper function to construct full URL for avatars (moved to controller, but kept here if other routes need it)
// const getFullAvatarUrl = (avatarPath) => {
//     if (!avatarPath || avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
//         return avatarPath || `${BACKEND_URL}/avatars/userLogo.png`; // Fallback to a default server-side image
//     }
//     const cleanedPath = avatarPath.replace(/\\/g, '/');
//     return `${BACKEND_URL}/${cleanedPath}`; // e.g., http://localhost:5001/uploads/image.png
// };

// // Apply authMiddleware to all routes in this router that require authentication
// router.use(authMiddleware);

// // --- Profile Management Routes ---
// router.get('/profile', async (req, res) => {
//     console.log('GET_AUTH_USER_PROFILE_ROUTE: Attempting to fetch authenticated user profile.');
//     console.log('GET_AUTH_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user ? req.user._id : 'Not populated');

//     try {
//         const user = req.user;

//         if (!user) {
//             return res.status(404).json({ message: 'Authenticated user not found in database. Please ensure profile is synced.' });
//         }

//         res.status(200).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             bio: user.bio,
//             avatarUrl: getFullAvatarUrl(user.avatarUrl),
//             firebaseUid: user.firebaseUid,
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt
//         });
//     } catch (error) {
//         console.error('GET_AUTH_USER_PROFILE_ROUTE: Error fetching user profile:', error.message);
//         res.status(500).json({ message: 'Internal server error fetching your profile.', error: error.message });
//     }
// });

// router.get('/profile/:userId', async (req, res) => {
//     console.log('GET_SPECIFIC_USER_PROFILE_ROUTE: Attempting to fetch specific user profile.');
//     console.log('GET_SPECIFIC_USER_PROFILE_ROUTE: req.params.userId:', req.params.userId);

//     try {
//         const targetUserId = req.params.userId;
//         const user = await User.findById(targetUserId).select('name avatarUrl email bio');

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.status(200).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             bio: user.bio,
//             avatarUrl: getFullAvatarUrl(user.avatarUrl),
//         });
//     } catch (error) {
//         console.error('GET_SPECIFIC_USER_PROFILE_ROUTE: Error fetching specific user profile:', error.message);
//         res.status(500).json({ message: 'Internal server error fetching specific profile.', error: error.message });
//     }
// });

// router.put('/profile', upload.single('avatar'), async (req, res) => {
//     console.log('PUT_USER_PROFILE_ROUTE: Entering profile update route.');
//     console.log('PUT_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user ? req.user._id : 'Not populated');
//     console.log('PUT_USER_PROFILE_ROUTE: req.body:', req.body);
//     console.log('PUT_USER_PROFILE_ROUTE: req.file:', req.file);

//     try {
//         const user = req.user;
//         const { name, bio } = req.body;

//         if (!user) {
//             if (req.file) {
//                 await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file for non-existent user:', err));
//             }
//             return res.status(404).json({ message: 'User not found for update.' });
//         }

//         if (name !== undefined) {
//             user.name = name;
//         }
//         if (bio !== undefined) {
//             user.bio = bio;
//         }

//         if (req.file) {
//             console.log('PUT_USER_PROFILE_ROUTE: New avatar file uploaded:', req.file.filename);
//             const oldAvatarUrl = user.avatarUrl;
//             if (oldAvatarUrl && oldAvatarUrl.startsWith(`${BACKEND_URL}/uploads/`)) {
//                 const oldAvatarFilename = path.basename(oldAvatarUrl);
//                 const oldAvatarPath = path.join(__dirname, '..', 'uploads', oldAvatarFilename);
//                 try {
//                     await fs.unlink(oldAvatarPath);
//                     console.log(`PUT_USER_PROFILE_ROUTE: Deleted old custom avatar: ${oldAvatarPath}`);
//                 } catch (unlinkError) {
//                     if (unlinkError.code === 'ENOENT') {
//                         console.warn(`PUT_USER_PROFILE_ROUTE: Old avatar file not found, skipping deletion: ${oldAvatarPath}`);
//                     } else {
//                         console.error('PUT_USER_PROFILE_ROUTE: Error deleting old avatar:', unlinkError.message);
//                     }
//                 }
//             } else if (oldAvatarUrl) {
//                 console.log('PUT_USER_PROFILE_ROUTE: Replacing external/default avatar with custom upload.');
//             }
//             user.avatarUrl = `uploads/${req.file.filename}`;
//             console.log('PUT_USER_PROFILE_ROUTE: New avatar set to (relative path):', user.avatarUrl);
//         }

//         await user.save();

//         res.status(200).json({
//             message: 'Profile updated successfully!',
//             _id: user._id,
//             name: user.name,
//             bio: user.bio,
//             avatarUrl: getFullAvatarUrl(user.avatarUrl),
//             firebaseUid: user.firebaseUid,
//         });

//     } catch (error) {
//         console.error('PUT_USER_PROFILE_ROUTE: Error updating user profile:', error.message);
//         if (req.file) {
//             await fs.unlink(req.file.path).catch(err => console.error('Error deleting newly uploaded file after update failure:', err));
//         }
//         res.status(500).json({ message: 'Internal server error updating profile.', error: error.message });
//     }
// });

// // --- Social Features Routes ---

// // NEW: Get following list for a user (by MongoDB ID)
// router.get('/:userId/following', userController.getFollowing);

// // NEW: Get followers list for a user (by MongoDB ID)
// router.get('/:userId/followers', userController.getFollowers);


// router.get('/me/relationships', async (req, res, next) => {
//     try {
//         const userId = req.user._id;

//         const user = await User.findById(userId)
//             .select('following pendingSentRequests pendingReceivedRequests')
//             .lean();

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.json({
//             following: user.following.map(id => id.toString()),
//             pendingSentRequests: user.pendingSentRequests.map(id => id.toString()),
//             pendingReceivedRequests: user.pendingReceivedRequests.map(id => id.toString()),
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// router.post('/:targetUserId/follow', async (req, res, next) => {
//     try {
//         const currentUserId = req.user._id;
//         const targetUserId = req.params.targetUserId;

//         if (currentUserId.toString() === targetUserId.toString()) {
//             return res.status(400).json({ message: "You cannot follow yourself." });
//         }

//         const currentUser = await User.findById(currentUserId);
//         const targetUser = await User.findById(targetUserId);

//         if (!currentUser || !targetUser) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         if (currentUser.following.includes(targetUserId)) {
//             return res.status(409).json({ message: "Already following this user." });
//         }

//         if (currentUser.pendingSentRequests.includes(targetUserId) || targetUser.pendingReceivedRequests.includes(currentUserId)) {
//             return res.status(409).json({ message: "Follow request already pending." });
//         }

//         currentUser.pendingSentRequests.push(targetUserId);
//         await currentUser.save();

//         targetUser.pendingReceivedRequests.push(currentUserId);
//         await targetUser.save();

//         const io = req.app.get('socketio');
//         if (io) {
//             io.to(targetUserId.toString()).emit('newFollowRequest', {
//                 senderId: currentUserId,
//                 senderName: currentUser.name,
//                 senderAvatarUrl: getFullAvatarUrl(currentUser.avatarUrl),
//                 message: `${currentUser.name} sent you a follow request.`,
//             });
//             console.log(`Socket.IO: Emitted newFollowRequest to user ${targetUserId}`);
//         }

//         res.status(200).json({ message: 'Follow request sent successfully.' });

//     } catch (error) {
//         console.error('Error sending follow request:', error);
//         next(error);
//     }
// });

// router.get('/by-firebase-uid/:firebaseUid', userController.getMongoUserByFirebaseUid);
// // Other utility routes
// // router.get('/by-firebase-uid/:firebaseUid', verifyFirebaseToken, attachMongoUser, userController.getMongoUserByFirebaseUid);
// // ^ Assuming verifyFirebaseToken and attachMongoUser are correctly chaining before the controller

// // router.get('/follow-details/:userId', verifyFirebaseToken, userController.getFollowDetails);
// // ^ Assuming verifyFirebaseToken is correctly chaining before the controller

// // POST to get many user details by an array of IDs
// // Note: If you want this to be accessible by unauthenticated users (e.g., for public profiles),
// // remove `router.use(authMiddleware)` or define this route *before* it.
// // Given it's likely for private features like status viewers, keeping auth is probably fine.
// router.post('/many', userController.getManyUserDetails);

// router.get('/search', async (req, res) => { // <-- Remove `protect` here
//     try {
//         const query = req.query.q;
//         if (!query) {
//             return res.status(400).json({ message: 'Search query is required.' });
//         }

//         // Case-insensitive search on 'name' field
//         const users = await User.find(
//             { name: { $regex: query, $options: 'i' } },
//             'name avatarUrl' // Select only name and avatarUrl
//         ).limit(10); // Limit results

//         res.json(users);
//     } catch (error) {
//         console.error('Error searching users:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


// module.exports = router;










const express = require('express');
const router = express.Router();
const User = require('../models/User'); // User model
const authMiddleware = require('../middleware/authMiddleware'); // Your chosen unified authentication middleware
const upload = require('../middleware/uploadMiddleware'); // Multer setup
const fs = require('fs/promises'); // Use fs.promises for async operations
const path = require('path');

// Import the userController functions
const userController = require('../controllers/userController');

// --- IMPORTANT: Ensure this matches your frontend's MEDIA_BASE_URL ---
// This is used to construct full URLs for avatars/media from relative paths
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Helper function to construct full URL for avatars (moved to controller, but kept here if other routes need it)
const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath || avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath || `${BACKEND_URL}/avatars/userLogo.png`; // Fallback to a default server-side image
    }
    const cleanedPath = avatarPath.replace(/\\/g, '/');
    return `${BACKEND_URL}/${cleanedPath}`; // e.g., http://localhost:5001/uploads/image.png
};

// Apply authMiddleware to all routes in this router that require authentication
// This means req.user will be populated for all subsequent routes
router.use(authMiddleware);

// --- Profile Management Routes ---
router.get('/profile', async (req, res) => {
    console.log('GET_AUTH_USER_PROFILE_ROUTE: Attempting to fetch authenticated user profile.');
    console.log('GET_AUTH_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user ? req.user._id : 'Not populated');

    try {
        const user = req.user; // User is already populated by authMiddleware

        if (!user) {
            // This case should ideally not happen if authMiddleware works as expected
            return res.status(404).json({ message: 'Authenticated user not found in database. Please ensure profile is synced.' });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatarUrl: getFullAvatarUrl(user.avatarUrl),
            firebaseUid: user.firebaseUid,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error('GET_AUTH_USER_PROFILE_ROUTE: Error fetching user profile:', error.message);
        res.status(500).json({ message: 'Internal server error fetching your profile.', error: error.message });
    }
});

router.get('/profile/:userId', async (req, res) => {
    console.log('GET_SPECIFIC_USER_PROFILE_ROUTE: Attempting to fetch specific user profile.');
    console.log('GET_SPECIFIC_USER_PROFILE_ROUTE: req.params.userId:', req.params.userId);

    try {
        const targetUserId = req.params.userId;
        const user = await User.findById(targetUserId).select('name avatarUrl email bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatarUrl: getFullAvatarUrl(user.avatarUrl),
        });
    } catch (error) {
        console.error('GET_SPECIFIC_USER_PROFILE_ROUTE: Error fetching specific user profile:', error.message);
        res.status(500).json({ message: 'Internal server error fetching specific profile.', error: error.message });
    }
});

router.put('/profile', upload.single('avatar'), async (req, res) => {
    console.log('PUT_USER_PROFILE_ROUTE: Entering profile update route.');
    console.log('PUT_USER_PROFILE_ROUTE: req.user (from authMiddleware):', req.user ? req.user._id : 'Not populated');
    console.log('PUT_USER_PROFILE_ROUTE: req.body:', req.body);
    console.log('PUT_USER_PROFILE_ROUTE: req.file:', req.file);

    try {
        const user = req.user; // User is already populated by authMiddleware
        const { name, bio } = req.body;

        if (!user) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file for non-existent user:', err));
            }
            return res.status(404).json({ message: 'User not found for update.' });
        }

        if (name !== undefined) {
            user.name = name;
        }
        if (bio !== undefined) {
            user.bio = bio;
        }

        if (req.file) {
            console.log('PUT_USER_PROFILE_ROUTE: New avatar file uploaded:', req.file.filename);
            const oldAvatarUrl = user.avatarUrl;
            if (oldAvatarUrl && oldAvatarUrl.startsWith(`${BACKEND_URL}/uploads/`)) {
                const oldAvatarFilename = path.basename(oldAvatarUrl);
                const oldAvatarPath = path.join(__dirname, '..', 'uploads', oldAvatarFilename);
                try {
                    await fs.unlink(oldAvatarPath);
                    console.log(`PUT_USER_PROFILE_ROUTE: Deleted old custom avatar: ${oldAvatarPath}`);
                } catch (unlinkError) {
                    if (unlinkError.code === 'ENOENT') {
                        console.warn(`PUT_USER_PROFILE_ROUTE: Old avatar file not found, skipping deletion: ${oldAvatarPath}`);
                    } else {
                        console.error('PUT_USER_PROFILE_ROUTE: Error deleting old avatar:', unlinkError.message);
                    }
                }
            } else if (oldAvatarUrl) {
                console.log('PUT_USER_PROFILE_ROUTE: Replacing external/default avatar with custom upload.');
            }
            user.avatarUrl = `uploads/${req.file.filename}`;
            console.log('PUT_USER_PROFILE_ROUTE: New avatar set to (relative path):', user.avatarUrl);
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully!',
            _id: user._id,
            name: user.name,
            bio: user.bio,
            avatarUrl: getFullAvatarUrl(user.avatarUrl),
            firebaseUid: user.firebaseUid,
        });

    } catch (error) {
        console.error('PUT_USER_PROFILE_ROUTE: Error updating user profile:', error.message);
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => console.error('Error deleting newly uploaded file after update failure:', err));
        }
        res.status(500).json({ message: 'Internal server error updating profile.', error: error.message });
    }
});

// --- Social Features Routes ---

// NEW: Get following list for a user (by MongoDB ID)
router.get('/:userId/following', userController.getFollowing);

// NEW: Get followers list for a user (by MongoDB ID)
router.get('/:userId/followers', userController.getFollowers);


router.get('/me/relationships', async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .select('following pendingSentRequests pendingReceivedRequests')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({
            following: user.following.map(id => id.toString()),
            pendingSentRequests: user.pendingSentRequests.map(id => id.toString()),
            pendingReceivedRequests: user.pendingReceivedRequests.map(id => id.toString()),
        });
    } catch (error) {
        next(error);
    }
});

router.post('/:targetUserId/follow', async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const targetUserId = req.params.targetUserId;

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        if (currentUser.following.includes(targetUserId)) {
            return res.status(409).json({ message: "Already following this user." });
        }

        if (currentUser.pendingSentRequests.includes(targetUserId) || targetUser.pendingReceivedRequests.includes(currentUserId)) {
            return res.status(409).json({ message: "Follow request already pending." });
        }

        currentUser.pendingSentRequests.push(targetUserId);
        await currentUser.save();

        targetUser.pendingReceivedRequests.push(currentUserId);
        await targetUser.save();

        const io = req.app.get('socketio');
        if (io) {
            io.to(targetUserId.toString()).emit('newFollowRequest', {
                senderId: currentUserId,
                senderName: currentUser.name,
                senderAvatarUrl: getFullAvatarUrl(currentUser.avatarUrl),
                message: `${currentUser.name} sent you a follow request.`,
            });
            console.log(`Socket.IO: Emitted newFollowRequest to user ${targetUserId}`);
        }

        res.status(200).json({ message: 'Follow request sent successfully.' });

    } catch (error) {
        console.error('Error sending follow request:', error);
        next(error);
    }
});

router.get('/by-firebase-uid/:firebaseUid', userController.getMongoUserByFirebaseUid);



router.post('/many', userController.getManyUserDetails);

// router.get('/search', async (req, res) => { // Removed 'protect' here
//     try {
//         const query = req.query.q;
//         if (!query) {
//             return res.status(400).json({ message: 'Search query is required.' });
//         }

//         // Case-insensitive search on 'name' field
//         const users = await User.find(
//             { name: { $regex: query, $options: 'i' } },
//             'name avatarUrl' // Select only name and avatarUrl
//         ).limit(10); // Limit results

//         res.json(users);
//     } catch (error) {
//         console.error('Error searching users:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: 'Search query is required.' });

    const users = await User.find(
      { name: { $regex: query, $options: 'i' } },
      'firebaseUid name avatarUrl'
    ).limit(10);

    console.log('[SEARCH API] Found users:', users);

    const result = users.map(user => ({
      uid: user.firebaseUid,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
    }));

    console.log('[SEARCH API] Sending result:', result);

    res.json(result);
  } catch (error) {
    console.error('[SEARCH API ERROR]:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;