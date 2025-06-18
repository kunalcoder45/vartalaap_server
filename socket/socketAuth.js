const admin = require('../firebase-admin-config');

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Add user info to socket
        socket.userId = decodedToken.uid;
        socket.userEmail = decodedToken.email;
        
        next();
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
    }
};

module.exports = socketAuth;