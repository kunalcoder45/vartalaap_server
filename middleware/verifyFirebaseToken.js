


// // server/middleware/verifyFirebaseToken.js
// const admin = require('../firebase-admin-config');
// const User = require('../models/User');

// const verifyFirebaseToken = async (req, res, next) => {
//     console.log('[verifyFirebaseToken] Middleware triggered');

//     const authHeader = req.headers.authorization;
//     console.log('[verifyFirebaseToken] Authorization Header:', authHeader ? 'Present' : 'Missing');

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         console.error('No authorization token provided or malformed header.');
//         return res.status(401).json({ message: 'No authorization token provided or malformed header.' });
//     }

//     const idToken = authHeader.split(' ')[1];

//     try {
//         const decodedToken = await admin.auth().verifyIdToken(idToken);
//         console.log('Firebase ID Token decoded. UID:', decodedToken.uid);

//         const mongoUser = await User.findOne({ firebaseUid: decodedToken.uid });

//         if (!mongoUser) {
//             console.warn('MongoDB user not found for Firebase UID:', decodedToken.uid, '. Proceeding with only Firebase UID.');
//             req.user = { uid: decodedToken.uid }; // Firebase UID only
//         } else {
//             req.user = {
//                 uid: decodedToken.uid, // Also keep firebase uid for consistency
//                 _id: mongoUser._id, // MongoDB _id
//                 ...mongoUser.toObject(),
//             };
//             console.log('MongoDB user attached to req.user (Mongo ID:', mongoUser._id, ')');
//         }

//         req.firebaseUser = decodedToken; // Store the full decoded Firebase token

//         next();
//     } catch (error) {
//         console.error('Error verifying Firebase ID token:', error.message);
//         return res.status(401).json({ message: 'Invalid or expired Firebase ID token.' });
//     }
// };

// module.exports = verifyFirebaseToken;








// server/middleware/verifyFirebaseToken.js
const admin = require('../firebase-admin-config');
const User = require('../models/User'); // Ensure this path is correct

const verifyFirebaseToken = async (req, res, next) => {
    console.log('[verifyFirebaseToken] Middleware triggered');

    const authHeader = req.headers.authorization;
    console.log('[verifyFirebaseToken] Authorization Header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[verifyFirebaseToken] No authorization token provided or malformed header.');
        return res.status(401).json({ message: 'No authorization token provided or malformed header.' });
    }

    const idToken = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('[verifyFirebaseToken] Firebase ID Token decoded. UID:', decodedToken.uid);

        // Find the MongoDB user associated with this Firebase UID
        const mongoUser = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!mongoUser) {
            console.error('[verifyFirebaseToken] MongoDB user not found for Firebase UID:', decodedToken.uid, '. Cannot proceed as a full user.');
            // If a MongoDB user is essential for all authenticated routes, return an error.
            // If some routes allow just a Firebase UID, you'd handle it differently.
            // For status, a MongoDB user is required.
            return res.status(404).json({ message: 'User profile not found in our database. Please complete your profile setup.' });
        }

        // Attach the MongoDB user's _id directly to req.user._id for consistency
        // Also attach the full MongoDB user object (converted to plain object)
        req.user = {
            _id: mongoUser._id.toString(), // Ensure it's a string, matching what _id in Status model typically stores
            firebaseUid: decodedToken.uid, // Keep Firebase UID
            name: mongoUser.name,
            avatarUrl: mongoUser.avatarUrl,
            // Add other user properties you might need from mongoUser
            // For example, if you have 'following' or 'followers' arrays on the User model
            following: mongoUser.following,
            followers: mongoUser.followers,
            // ... any other fields
        };

        // You might still want req.firebaseUser for raw decoded token data, but req.user should be canonical for MongoDB ID
        req.firebaseUser = decodedToken;

        console.log('[verifyFirebaseToken] MongoDB user attached to req.user (Mongo ID:', req.user._id, ')');
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error('[verifyFirebaseToken] Error verifying Firebase ID token or finding MongoDB user:', error.message);
        return res.status(401).json({ message: 'Invalid or expired Firebase ID token.', details: error.message });
    }
};

module.exports = verifyFirebaseToken;