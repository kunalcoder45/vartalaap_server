// // const mongoose = require('mongoose');
// // const User = require('../models/User');

// // // Get following list of a user
// // exports.getFollowing = async (req, res, next) => {
// //   try {
// //     const { userId } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(userId))
// //       return res.status(400).json({ message: 'Invalid user ID format.' });

// //     const user = await User.findById(userId)
// //       .populate('following', 'name username email avatarUrl bio createdAt')
// //       .lean();

// //     if (!user) return res.status(404).json({ message: 'User not found.' });

// //     const formattedFollowing = (user.following || []).map(f => ({
// //       _id: f._id,
// //       name: f.name || 'Unknown User',
// //       username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'),
// //       email: f.email,
// //       avatarUrl: f.avatarUrl || null,
// //       bio: f.bio || '',
// //       createdAt: f.createdAt,
// //     }));

// //     res.status(200).json(formattedFollowing);

// //   } catch (error) {
// //     console.error('Error in getFollowing:', error);
// //     next(error);
// //   }
// // };

// // // Get followers list of a user
// // exports.getFollowers = async (req, res, next) => {
// //   try {
// //     const { userId } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(userId))
// //       return res.status(400).json({ message: 'Invalid user ID format.' });

// //     const user = await User.findById(userId)
// //       .populate('followers', 'name username email avatarUrl bio createdAt')
// //       .lean();

// //     if (!user) return res.status(404).json({ message: 'User not found.' });

// //     const formattedFollowers = (user.followers || []).map(f => ({
// //       _id: f._id,
// //       name: f.name || 'Unknown User',
// //       username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'),
// //       email: f.email,
// //       avatarUrl: f.avatarUrl || null,
// //       bio: f.bio || '',
// //       createdAt: f.createdAt,
// //     }));

// //     res.status(200).json(formattedFollowers);

// //   } catch (error) {
// //     console.error('Error in getFollowers:', error);
// //     next(error);
// //   }
// // };

// // exports.getUserConnections = async (req, res) => {
// //     try {
// //         const userId = req.params.userId;

// //         const followRequests = await FollowRequest.find({
// //             $or: [{ sender: userId }, { receiver: userId }],
// //             status: 'accepted',
// //         }).populate('sender receiver', 'name avatarUrl');

// //         const followers = followRequests
// //             .filter(req => req.receiver._id.toString() === userId)
// //             .map(req => ({
// //                 _id: req.sender._id,
// //                 name: req.sender.name,
// //                 avatarUrl: req.sender.avatarUrl,
// //             }));

// //         const following = followRequests
// //             .filter(req => req.sender._id.toString() === userId)
// //             .map(req => ({
// //                 _id: req.receiver._id,
// //                 name: req.receiver.name,
// //                 avatarUrl: req.receiver.avatarUrl,
// //             }));

// //         return res.status(200).json({ followers, following });
// //     } catch (error) {
// //         console.error('Error in getUserConnections:', error);
// //         res.status(500).json({ message: 'Failed to fetch user connections' });
// //     }
// // };

// // exports.getUsersByIds = async (req, res) => {
// //     try {
// //         const { ids } = req.body;
// //         if (!Array.isArray(ids)) {
// //             return res.status(400).json({ message: 'ids must be an array' });
// //         }

// //         const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

// //         const users = await User.find({ _id: { $in: objectIds } })
// //             .select('_id name avatarUrl');

// //         res.json(users);
// //     } catch (error) {
// //         console.error('Error fetching users by IDs:', error);
// //         res.status(500).json({ message: 'Server error' });
// //     }
// // };

// // // exports.getFollowDetails = async (req, res) => {
// // //   try {
// // //     const { userId } = req.params;

// // //     const user = await User.findById(userId)
// // //       .populate('followers', 'name avatarUrl')
// // //       .populate('following', 'name avatarUrl');

// // //     if (!user) {
// // //       return res.status(404).json({ message: 'User not found' });
// // //     }

// // //     return res.json({
// // //       followers: user.followers || [],
// // //       following: user.following || [],
// // //     });
// // //   } catch (error) {
// // //     console.error('Error fetching follow details:', error);
// // //     return res.status(500).json({ message: 'Server error' });
// // //   }
// // // };


// // exports.getMongoUserByFirebaseUid = async (req, res) => {
// //     try {
// //         const { firebaseUid } = req.params;

// //         // Ensure your User model has a 'firebaseUid' field that stores the Firebase UID.
// //         // For example, in your User model schema:
// //         // firebaseUid: { type: String, required: true, unique: true },
// //         const user = await User.findOne({ firebaseUid: firebaseUid });

// //         if (!user) {
// //             return res.status(404).json({ message: 'User not found for the provided Firebase UID.' });
// //         }

// //         // Return the MongoDB _id
// //         return res.json({ _id: user._id });
// //     } catch (error) {
// //         console.error('Error in getMongoUserByFirebaseUid:', error);
// //         return res.status(500).json({ message: 'Server error while fetching user by Firebase UID.' });
// //     }
// // };


// // // In controllers/userController.js
// // exports.getFollowDetails = async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     // Validate userId if needed
// //     if (!userId) {
// //       return res.status(400).json({ message: 'User ID required' });
// //     }

// //     // Fetch user by ID, populate followers and following
// //     const user = await User.findById(userId)
// //       .populate('followers', 'name avatarUrl')   // adjust field names to your schema
// //       .populate('following', 'name avatarUrl');

// //     if (!user) {
// //       return res.status(404).json({ message: 'User not found' });
// //     }

// //     res.json({
// //       followers: user.followers || [],
// //       following: user.following || [],
// //     });
// //   } catch (error) {
// //     console.error('Error fetching follow details:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };



// // exports.getManyUserDetails = async (req, res) => {
// //     try {
// //         const { userIds } = req.body; // Expects an array of user IDs
        
// //         if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
// //             return res.status(400).json({ message: 'User IDs array is required.' });
// //         }

// //         const users = await User.find({ _id: { $in: userIds } })
// //                                 .select('name avatarUrl') // Select only necessary fields
// //                                 .lean(); // Return plain JavaScript objects

// //         // If you need to transform avatarUrl, do it here.
// //         // For example, if avatarUrl stores only filename:
// //         const formattedUsers = users.map(user => ({
// //             _id: user._id,
// //             name: user.name,
// //             avatarUrl: user.avatarUrl // This should be the relative path or full URL if already stored
// //         }));

// //         res.status(200).json(formattedUsers);
// //     } catch (error) {
// //         console.error('Error fetching user details:', error);
// //         res.status(500).json({ message: 'Internal server error.' });
// //     }
// // };










// const mongoose = require('mongoose');
// const User = require('../models/User'); // Ensure this path is correct relative to the controller
// const path = require('path');
// const FollowRequest = require('../models/FollowRequest'); // Assuming you have this model

// // --- IMPORTANT: Ensure this matches your frontend's MEDIA_BASE_URL ---
// // This is used to construct full URLs for avatars/media from relative paths
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com';

// // Helper function to construct full URL for avatars
// const getFullAvatarUrl = (avatarPath) => {
//     if (!avatarPath || avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
//         return avatarPath || `${BACKEND_URL}/avatars/userLogo.png`;
//     }
//     const cleanedPath = avatarPath.replace(/\\/g, '/');
//     return `${BACKEND_URL}/${cleanedPath}`;
// };


// // Get following list of a user
// exports.getFollowing = async (req, res, next) => {
//     try {
//         const { userId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(userId))
//             return res.status(400).json({ message: 'Invalid user ID format.' });

//         const user = await User.findById(userId)
//             .populate('following', 'name username email avatarUrl bio createdAt') // Added username for consistency
//             .lean();

//         if (!user) return res.status(404).json({ message: 'User not found.' });

//         // Ensure user.following is an array before mapping
//         const formattedFollowing = (user.following || []).map(f => ({
//             _id: f._id,
//             name: f.name || 'Unknown User',
//             username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'), // Provide a fallback for username
//             email: f.email,
//             avatarUrl: getFullAvatarUrl(f.avatarUrl), // Use helper for full URL
//             bio: f.bio || '',
//             createdAt: f.createdAt,
//         }));

//         res.status(200).json(formattedFollowing);

//     } catch (error) {
//         console.error('Error in getFollowing:', error);
//         next(error);
//     }
// };

// // Get followers list of a user
// exports.getFollowers = async (req, res, next) => {
//     try {
//         const { userId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(userId))
//             return res.status(400).json({ message: 'Invalid user ID format.' });

//         const user = await User.findById(userId)
//             .populate('followers', 'name username email avatarUrl bio createdAt') // Added username
//             .lean();

//         if (!user) return res.status(404).json({ message: 'User not found.' });

//         // Ensure user.followers is an array before mapping
//         const formattedFollowers = (user.followers || []).map(f => ({
//             _id: f._id,
//             name: f.name || 'Unknown User',
//             username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'), // Provide a fallback for username
//             email: f.email,
//             avatarUrl: getFullAvatarUrl(f.avatarUrl), // Use helper for full URL
//             bio: f.bio || '',
//             createdAt: f.createdAt,
//         }));

//         res.status(200).json(formattedFollowers);

//     } catch (error) {
//         console.error('Error in getFollowers:', error);
//         next(error);
//     }
// };

// // You had this using FollowRequest model, ensure it's imported
// exports.getUserConnections = async (req, res) => {
//     try {
//         const userId = req.params.userId;

//         // Make sure FollowRequest model is imported and path is correct
//         const followRequests = await FollowRequest.find({
//             $or: [{ sender: userId }, { receiver: userId }],
//             status: 'accepted',
//         }).populate('sender receiver', 'name avatarUrl');

//         const followers = followRequests
//             .filter(req => req.receiver._id.toString() === userId)
//             .map(req => ({
//                 _id: req.sender._id,
//                 name: req.sender.name,
//                 avatarUrl: getFullAvatarUrl(req.sender.avatarUrl),
//             }));

//         const following = followRequests
//             .filter(req => req.sender._id.toString() === userId)
//             .map(req => ({
//                 _id: req.receiver._id,
//                 name: req.receiver.name,
//                 avatarUrl: getFullAvatarUrl(req.receiver.avatarUrl),
//             }));

//         return res.status(200).json({ followers, following });
//     } catch (error) {
//         console.error('Error in getUserConnections:', error);
//         res.status(500).json({ message: 'Failed to fetch user connections' });
//     }
// };

// exports.getUsersByIds = async (req, res) => {
//     try {
//         const { ids } = req.body;
//         if (!Array.isArray(ids)) {
//             return res.status(400).json({ message: 'ids must be an array' });
//         }

//         const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

//         const users = await User.find({ _id: { $in: objectIds } })
//             .select('_id name avatarUrl');

//         // Apply getFullAvatarUrl here as well if this route is for external consumption
//         const formattedUsers = users.map(user => ({
//             _id: user._id,
//             name: user.name,
//             avatarUrl: getFullAvatarUrl(user.avatarUrl)
//         }));

//         res.json(formattedUsers);
//     } catch (error) {
//         console.error('Error fetching users by IDs:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // In server/controllers/userController.js
// exports.getMongoUserByFirebaseUid = async (req, res) => {
//     try {
//         const { firebaseUid } = req.params;
//         console.log(`[getMongoUserByFirebaseUid] Attempting to find user with firebaseUid: ${firebaseUid}`);

//         const user = await User.findOne({ firebaseUid: firebaseUid });

//         if (!user) {
//             console.warn(`[getMongoUserByFirebaseUid] User not found for firebaseUid: ${firebaseUid}`);
//             return res.status(404).json({ message: 'User not found for the provided Firebase UID.' });
//         }

//         console.log(`[getMongoUserByFirebaseUid] Found user: ${user._id} for firebaseUid: ${firebaseUid}`);
//         return res.json({ _id: user._id });
//     } catch (error) {
//         console.error('[getMongoUserByFirebaseUid] Error:', error);
//         return res.status(500).json({ message: 'Server error while fetching user by Firebase UID.' });
//     }
// };

// exports.getFollowDetails = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         if (!userId) {
//             return res.status(400).json({ message: 'User ID required' });
//         }

//         const user = await User.findById(userId)
//             .populate('followers', 'name avatarUrl')
//             .populate('following', 'name avatarUrl');

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Apply getFullAvatarUrl to the populated results
//         const formattedFollowers = (user.followers || []).map(f => ({
//             _id: f._id,
//             name: f.name,
//             avatarUrl: getFullAvatarUrl(f.avatarUrl),
//         }));

//         const formattedFollowing = (user.following || []).map(f => ({
//             _id: f._id,
//             name: f.name,
//             avatarUrl: getFullAvatarUrl(f.avatarUrl),
//         }));

//         res.json({
//             followers: formattedFollowers,
//             following: formattedFollowing,
//         });
//     } catch (error) {
//         console.error('Error fetching follow details:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.getManyUserDetails = async (req, res) => {
//     try {
//         const { userIds } = req.body;

//         if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
//             return res.status(400).json({ message: 'User IDs array is required.' });
//         }

//         const users = await User.find({ _id: { $in: userIds } })
//             .select('name avatarUrl')
//             .lean();

//         const formattedUsers = users.map(user => ({
//             _id: user._id,
//             name: user.name,
//             avatarUrl: getFullAvatarUrl(user.avatarUrl) // Ensure full URL
//         }));

//         res.status(200).json(formattedUsers);
//     } catch (error) {
//         console.error('Error fetching user details:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };













const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
const FollowRequest = require('../models/FollowRequest'); // Assuming you have this model

// Import the centralized avatar utility
const { getFullAvatarUrl } = require('../utils/avatarUtils'); // IMPORTED

// Removed the local BACKEND_URL and getFullAvatarUrl definition here,
// as they are now centralized in avatarUtils.js

// Get following list of a user
exports.getFollowing = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId))
            return res.status(400).json({ message: 'Invalid user ID format.' });

        const user = await User.findById(userId)
            .populate('following', 'name username email avatarUrl bio createdAt') // Added username for consistency
            .lean();

        if (!user) return res.status(404).json({ message: 'User not found.' });

        const formattedFollowing = (user.following || []).map(f => ({
            _id: f._id,
            name: f.name || 'Unknown User',
            username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'), // Provide a fallback for username
            email: f.email,
            avatarUrl: getFullAvatarUrl(f.avatarUrl),
            bio: f.bio || '',
            createdAt: f.createdAt,
        }));

        res.status(200).json(formattedFollowing);

    } catch (error) {
        console.error('Error in getFollowing:', error);
        next(error);
    }
};

// Get followers list of a user
exports.getFollowers = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId))
            return res.status(400).json({ message: 'Invalid user ID format.' });

        const user = await User.findById(userId)
            .populate('followers', 'name username email avatarUrl bio createdAt') // Added username
            .lean();

        if (!user) return res.status(404).json({ message: 'User not found.' });

        const formattedFollowers = (user.followers || []).map(f => ({
            _id: f._id,
            name: f.name || 'Unknown User',
            username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'), // Provide a fallback for username
            email: f.email,
            avatarUrl: getFullAvatarUrl(f.avatarUrl),
            bio: f.bio || '',
            createdAt: f.createdAt,
        }));

        res.status(200).json(formattedFollowers);

    } catch (error) {
        console.error('Error in getFollowers:', error);
        next(error);
    }
};

exports.getUserConnections = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        const followRequests = await FollowRequest.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: 'accepted',
        }).populate('sender receiver', 'name username avatarUrl'); // Populating username

        const followers = followRequests
            .filter(req => req.receiver._id.toString() === userId)
            .map(req => ({
                _id: req.sender._id,
                name: req.sender.name,
                username: req.sender.username, // Include username
                avatarUrl: getFullAvatarUrl(req.sender.avatarUrl),
            }));

        const following = followRequests
            .filter(req => req.sender._id.toString() === userId)
            .map(req => ({
                _id: req.receiver._id,
                name: req.receiver.name,
                username: req.receiver.username, // Include username
                avatarUrl: getFullAvatarUrl(req.receiver.avatarUrl),
            }));

        return res.status(200).json({ followers, following });
    } catch (error) {
        console.error('Error in getUserConnections:', error);
        res.status(500).json({ message: 'Failed to fetch user connections' });
    }
};

exports.getUsersByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: 'ids must be an array' });
        }

        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

        const users = await User.find({ _id: { $in: objectIds } })
            .select('_id name username avatarUrl'); // Select username

        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            username: user.username, // Include username
            avatarUrl: getFullAvatarUrl(user.avatarUrl)
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users by IDs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// In server/controllers/userController.js
exports.getMongoUserByFirebaseUid = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        console.log(`[getMongoUserByFirebaseUid] Attempting to find user with firebaseUid: ${firebaseUid}`);

        const user = await User.findOne({ firebaseUid: firebaseUid });

        if (!user) {
            console.warn(`[getMongoUserByFirebaseUid] User not found for firebaseUid: ${firebaseUid}`);
            return res.status(404).json({ message: 'User not found for the provided Firebase UID.' });
        }

        console.log(`[getMongoUserByFirebaseUid] Found user: ${user._id} for firebaseUid: ${firebaseUid}`);
        // Return full user object as per MongoUser interface, converting avatarUrl
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username, // Include username
            avatarUrl: getFullAvatarUrl(user.avatarUrl),
            bio: user.bio,
            firebaseUid: user.firebaseUid
        });
    } catch (error) {
        console.error('[getMongoUserByFirebaseUid] Error:', error);
        return res.status(500).json({ message: 'Server error while fetching user by Firebase UID.' });
    }
};

exports.getFollowDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        const user = await User.findById(userId)
            .populate('followers', 'name username avatarUrl') // Populating username
            .populate('following', 'name username avatarUrl'); // Populating username

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const formattedFollowers = (user.followers || []).map(f => ({
            _id: f._id,
            name: f.name,
            username: f.username, // Include username
            avatarUrl: getFullAvatarUrl(f.avatarUrl),
        }));

        const formattedFollowing = (user.following || []).map(f => ({
            _id: f._id,
            name: f.name,
            username: f.username, // Include username
            avatarUrl: getFullAvatarUrl(f.avatarUrl),
        }));

        res.json({
            followers: formattedFollowers,
            following: formattedFollowing,
        });
    } catch (error) {
        console.error('Error fetching follow details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getManyUserDetails = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'User IDs array is required.' });
        }

        const users = await User.find({ _id: { $in: userIds } })
            .select('name username avatarUrl') // Select username
            .lean();

        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            username: user.username, // Include username
            avatarUrl: getFullAvatarUrl(user.avatarUrl)
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};