const connectedUsers = new Map(); // userId (MongoDB _id) => socketId

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Backend: Socket connected:', socket.id);

    // Register user with their MongoDB _id
    socket.on('register-user', (userId) => {
      // Ensure userId is a string. If it's an object, convert it.
      if (typeof userId !== 'string') {
        console.error("Backend: register-user received non-string userId:", userId);
        return;
      }
      connectedUsers.set(userId, socket.id);
      console.log(`Backend: User ${userId} registered with socket ${socket.id}`);
      console.log("Backend: Currently connected users map:", [...connectedUsers.entries()]);
    });

    socket.on('call-user', ({ targetId, offer, caller, callType }) => {
      // targetId here is the USER ID (MongoDB _id) from the client
      const targetSocketId = connectedUsers.get(targetId);
      console.log(`Backend: Attempting to call user ID: ${targetId}. Found socket ID: ${targetSocketId}`);

      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', {
          from: socket.id, // The socket ID of the caller
          caller,
          offer,
          callType,
        });
        console.log(`Backend: Emitted 'incoming-call' to ${targetSocketId} (user ${targetId}) from ${socket.id}`);
      } else {
        console.log(`Backend: Target user ${targetId} not found or not connected.`);
        // Emit an event back to the caller that the user is offline
        socket.emit('user-offline', { targetId });
      }
    });

    socket.on('answer-call', ({ targetId, answer }) => {
      // targetId here is the original caller's socket ID
      console.log(`Backend: Received answer from ${socket.id} for target ${targetId}`);
      io.to(targetId).emit('call-answered', { answer });
    });

    socket.on('end-call', ({ targetId }) => {
      // targetId can be either a user ID (MongoDB _id) or a socket ID.
      // We first try to resolve it as a userId to get the current socket ID.
      let actualTargetSocketId = connectedUsers.get(targetId);

      // If it's not a known userId, assume it's already a socket ID (e.g., from `callInfo.from` on frontend)
      if (!actualTargetSocketId) {
        actualTargetSocketId = targetId;
      }

      console.log(`Backend: Received 'end-call' from ${socket.id} for target ${targetId}. Actual socket ID: ${actualTargetSocketId}`);

      if (actualTargetSocketId) {
        io.to(actualTargetSocketId).emit('call-ended');
        console.log(`Backend: Emitted 'call-ended' to ${actualTargetSocketId}`);
      } else {
        console.log(`Backend: Target for 'end-call' (${targetId}) not found in connected sockets.`);
      }
    });

    socket.on('decline-call', ({ targetId }) => {
      // targetId here is the original caller's socket ID
      console.log(`Backend: Received 'decline-call' from ${socket.id} for target ${targetId}`);
      if (targetId) {
        io.to(targetId).emit('call-declined');
        console.log(`Backend: Emitted 'call-declined' to ${targetId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Backend: Socket disconnected:', socket.id);
      // Remove the disconnected socket's associated user from the map
      for (const [userId, sockId] of connectedUsers.entries()) {
        if (sockId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`Backend: User ${userId} (socket ${socket.id}) unregistered due to disconnect.`);
          break; // Assuming one socket per user _id in this simple map. For multiple tabs, a Set of sockets might be needed.
        }
      }
      console.log("Backend: Updated connected users map after disconnect:", [...connectedUsers.entries()]);
    });
  });
};