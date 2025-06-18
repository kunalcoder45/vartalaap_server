const admin = require('firebase-admin');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        console.error('AUTH_MIDDLEWARE: No authorization token provided or malformed header.');
        return res.status(401).json({ message: 'Authentication required: No token provided.' });
    }

    const idToken = header.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('AUTH_MIDDLEWARE: Firebase ID Token decoded successfully for UID:', decodedToken.uid);

        let user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
            console.log('AUTH_MIDDLEWARE: User not found in DB, creating new user for UID:', decodedToken.uid);

            user = new User({
                firebaseUid: decodedToken.uid,
                name: decodedToken.name || 'Anonymous',
                email: decodedToken.email || '',
                avatarUrl: decodedToken.picture || '',
            });

            await user.save();
            console.log('AUTH_MIDDLEWARE: New user created with ID:', user._id);
        }

        req.user = user;
        req.firebaseUser = decodedToken;
        console.log('AUTH_MIDDLEWARE: MongoDB User attached to req.user (ID:', user._id, ')');

        next();

    } catch (error) {
        console.error('AUTH_MIDDLEWARE: Error during authentication process:', error.message);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Authentication failed: Token expired. Please re-authenticate.' });
        }
        return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
    }
};

module.exports = authMiddleware;