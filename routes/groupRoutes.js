// // server/routes/groupRoutes.js
// // This file handles group-related routes.
// const express = require('express');
// const router = express.Router();
// const Group = require('../models/Group'); // Assuming you have a Group model
// const User = require('../models/User'); // Assuming you have a User model
// const verifyFirebaseToken = require('../middleware/verifyFirebaseToken'); // Import the shared middleware

// // GET /api/groups/joined - Get groups joined by the logged-in user
// // This route is protected by the verifyFirebaseToken middleware.
// router.get('/joined', verifyFirebaseToken, async (req, res) => {
//     try {
//         const firebaseUid = req.user.uid; // Get UID from the verified token
//         const user = await User.findOne({ firebaseUid });

//         if (!user) {
//             // If the user doesn't exist in MongoDB, they can't have joined groups yet
//             return res.status(404).json({ message: 'User not found in database. Please sync profile first.' });
//         }

//         // Find groups where the user's MongoDB _id is in the 'members' array
//         // Populate 'admin' and 'members' fields to get detailed user info
//         const joinedGroups = await Group.find({ members: user._id })
//             .populate('admin', 'name avatarUrl') // Populate admin with specific fields
//             .populate('members', 'name avatarUrl'); // Populate members with specific fields

//         res.json(joinedGroups);
//     } catch (error) {
//         console.error('Error fetching joined groups:', error.message);
//         res.status(500).json({ message: 'Failed to fetch joined groups.', error: error.message });
//     }
// });

// // Add other group routes here as needed (e.g., create, join, leave, get all groups)
// // Example:
// // router.post('/create', verifyFirebaseToken, async (req, res) => { /* ... */ });

// module.exports = router;


// server/routes/groupRoutes.js
// This file handles group-related routes.
const express = require('express');
const router = express.Router();
const Group = require('../models/Group'); // Assuming you have a Group model
const User = require('../models/User'); // Assuming you have a User model
const authMiddleware = require('../middleware/authMiddleware'); // Import the new authMiddleware

// GET /api/groups/joined - Get groups joined by the logged-in user
// This route is protected by the authMiddleware to ensure the user exists in MongoDB
router.get('/joined', authMiddleware, async (req, res) => {
    try {
        // --- IMPORTANT CHANGE HERE ---
        // req.user now contains the MongoDB user document (from authMiddleware)
        // So, you can directly access user._id or user.firebaseUid
        const user = req.user; // authMiddleware has already fetched and attached the user

        // Since authMiddleware would have already returned 404 if user not found,
        // this check is mostly for clarity or if authMiddleware is configured differently.
        // For robustness, it's good to keep it.
        if (!user) {
            return res.status(404).json({ message: 'User not found in database (via authMiddleware).' });
        }

        // Find groups where the user's MongoDB _id is in the 'members' array
        // Populate 'admin' and 'members' fields to get detailed user info
        const joinedGroups = await Group.find({ members: user._id })
            .populate('admin', 'name avatarUrl') // Populate admin with specific fields
            .populate('members', 'name avatarUrl'); // Populate members with specific fields

        res.json(joinedGroups);
    } catch (error) {
        console.error('Error fetching joined groups:', error.message);
        res.status(500).json({ message: 'Failed to fetch joined groups.', error: error.message });
    }
});

// Add other group routes here as needed (e.g., create, join, leave, get all groups)
// Example:
// router.post('/create', authMiddleware, async (req, res) => { /* ... */ });

module.exports = router;