// server/middleware/attachMongoUser.js
const User = require('../models/User'); // Check this path!

const attachMongoUser = async (req, res, next) => {
    if (!req.firebaseUser || !req.firebaseUser.uid) {
        console.error('ATTACH_MONGO_USER ERROR: req.firebaseUser or UID missing. Ensure verifyFirebaseToken runs first.');
        return res.status(401).json({ message: 'Firebase authentication not complete. Please login again.' });
    }

    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });

        if (!user) {
            // THIS IS THE MOST LIKELY PLACE WHERE IT'S FAILING IF THE MIDDLEWARE IS RUNNING
            console.error(`ATTACH_MONGO_USER ERROR: MongoDB user NOT found for Firebase UID: ${req.firebaseUser.uid}. This user needs to create a profile.`);
            return res.status(404).json({ message: 'User profile not found in our database. Please complete your profile setup.' });
        }

        req.user = {
            ...req.firebaseUser,
            mongoUserId: user._id.toString(), // Convert ObjectId to string
            name: user.name,
            avatarUrl: user.avatarUrl,
        };
        console.log('ATTACH_MONGO_USER SUCCESS: MongoDB User attached to req.user (ID: ' + req.user.mongoUserId + ')');
        next();
    } catch (error) {
        console.error('ATTACH_MONGO_USER CATCH ERROR:', error.message);
        res.status(500).json({ message: 'Internal server error during user profile lookup.' });
    }
};

module.exports = attachMongoUser;