const socketAuth = require('./socketAuth');

const handleSocketConnection = (io) => {
    io.use(socketAuth);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join user to their own room for personal notifications
        socket.join(socket.userId);

        // Handle user going online
        socket.on('user-online', (userData) => {
            socket.broadcast.emit('user-status-change', {
                userId: userData.userId,
                status: 'online'
            });
        });

        // Handle user going offline
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            socket.broadcast.emit('user-status-change', {
                userId: socket.userId,
                status: 'offline'
            });
        });

        // Handle real-time notifications
        socket.on('mark-notification-read', (notificationId) => {
            // Handle marking notification as read
            socket.to(socket.userId).emit('notification-read', notificationId);
        });
    });
};

module.exports = handleSocketConnection;