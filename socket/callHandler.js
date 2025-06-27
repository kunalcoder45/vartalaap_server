const connectedUsers = new Map(); // userId => socketId

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Save mapping of userId <-> socketId
    socket.on('register-user', (userId) => {
      // Allow re-registration to update socket ID if it changes (e.g., reconnection)
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
      console.log("Currently connected users map:", [...connectedUsers.entries()]);
    });

    socket.on('call-user', ({ targetId, offer, caller, callType }) => {
      // targetId here is the USER ID from the client, not the socket ID
      const targetSocketId = connectedUsers.get(targetId);
      console.log(`Attempting to call user ID: ${targetId}. Found socket ID: ${targetSocketId}`);

      if (targetSocketId) {
        // 'from' should be the actual socket ID of the caller for the receiver to respond
        io.to(targetSocketId).emit('incoming-call', {
          from: socket.id, // The socket ID of the caller
          caller,
          offer,
          callType,
        });
        console.log(`Emitted 'incoming-call' to ${targetSocketId} (user ${targetId}) from ${socket.id}`);
      } else {
        console.log(`Target user ${targetId} not found or not connected.`);
        // Optionally, emit an event back to the caller that the user is offline
        socket.emit('user-offline', { targetId });
      }
    });

    socket.on('answer-call', ({ targetId, answer }) => {
      // targetId here is the original caller's socket ID
      console.log(`Received answer from ${socket.id} for target ${targetId}`);
      io.to(targetId).emit('call-answered', { answer });
    });

    socket.on('end-call', ({ targetId }) => {
      // targetId here can be either a user ID or a socket ID, depending on how it's sent.
      // We need to handle both. If it's a user ID, look up the socket.
      let actualTargetSocketId = targetId;
      if (connectedUsers.has(targetId)) { // Check if it's a user ID
        actualTargetSocketId = connectedUsers.get(targetId);
      }
      console.log(`Received 'end-call' from ${socket.id} for target ${targetId}. Actual socket ID: ${actualTargetSocketId}`);

      if (actualTargetSocketId) {
        io.to(actualTargetSocketId).emit('call-ended');
      }
    });

    socket.on('decline-call', ({ targetId }) => {
      // targetId here is the original caller's socket ID
      console.log(`Received 'decline-call' from ${socket.id} for target ${targetId}`);
      if (targetId) {
        io.to(targetId).emit('call-declined');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      // Remove the disconnected socket from the map
      for (const [userId, sockId] of connectedUsers.entries()) {
        if (sockId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} (socket ${socket.id}) unregistered.`);
          break;
        }
      }
      console.log("Updated connected users map:", [...connectedUsers.entries()]);
    });
  });
};