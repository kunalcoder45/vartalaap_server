// socket/socketHandlers.ts (Example structure)
// This file should contain the logic for your Socket.IO events for calling.
// It will look very similar to the `io.on('connection', ...)` block from the previous response.

module.exports = (io) => {
    const activeUsers = new Map(); // userId -> socketId
    const calls = new Map(); // callId -> { callerId, receiverId }

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('register', (userId) => {
            activeUsers.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
            io.emit('online_users', Array.from(activeUsers.keys()));
        });

        socket.on('call_user', async ({ targetUserId, callerId, callerName }) => {
            const receiverSocketId = activeUsers.get(targetUserId);
            if (receiverSocketId) {
                // Generate a unique callId for this session
                const callId = `${callerId}-${targetUserId}-${Date.now()}`;
                calls.set(callId, { caller: callerId, receiver: targetUserId });

                io.to(receiverSocketId).emit('incoming_call', {
                    callId,
                    from: callerId,
                    fromName: callerName,
                });
                // Also, perhaps notify the caller that the call is ringing
                socket.emit('call_ringing', { callId, targetUserId, targetUserName: callerName }); // You might want to send targetName
                console.log(`Call initiated from ${callerName} (${callerId}) to ${targetUserId}`);
            } else {
                socket.emit('user_offline', { userId: targetUserId });
                console.log(`Call failed: User ${targetUserId} is offline.`);
            }
        });

        socket.on('sending_signal', ({ userToSignal, signal, callerId, callId }) => {
            const receiverSocketId = activeUsers.get(userToSignal);
            if (receiverSocketId) {
                console.log(`Sending signal from ${callerId} to ${userToSignal} for call ${callId}`);
                io.to(receiverSocketId).emit('user_joined', { signal, from: callerId, callId });
            }
        });

        socket.on('returning_signal', ({ signal, to, callId }) => {
            const callerSocketId = activeUsers.get(to);
            if (callerSocketId) {
                console.log(`Returning signal from ${socket.id} to ${to} for call ${callId}`);
                io.to(callerSocketId).emit('receiving_returned_signal', { signal, from: socket.id, callId });
            }
        });

        socket.on('accept_call', ({ callId, acceptedByUserId }) => {
            const call = calls.get(callId);
            if (call) {
                const callerSocketId = activeUsers.get(call.caller);
                if (callerSocketId) {
                    io.to(callerSocketId).emit('call_accepted', { callId, acceptedBy: acceptedByUserId });
                    console.log(`Call ${callId} accepted by ${acceptedByUserId}`);
                }
            }
        });

        socket.on('decline_call', ({ callId, declinedByUserId }) => {
            const call = calls.get(callId);
            if (call) {
                const callerSocketId = activeUsers.get(call.caller);
                if (callerSocketId) {
                    io.to(callerSocketId).emit('call_declined', { callId, declinedBy: declinedByUserId });
                    console.log(`Call ${callId} declined by ${declinedByUserId}`);
                }
                calls.delete(callId); // Clean up call record
            }
        });

        socket.on('end_call', ({ callId, userId }) => {
            const call = calls.get(callId);
            if (call) {
                const otherUserId = call.caller === userId ? call.receiver : call.caller;
                const otherUserSocketId = activeUsers.get(otherUserId);
                if (otherUserSocketId) {
                    io.to(otherUserSocketId).emit('call_ended', { callId, endedBy: userId });
                    console.log(`Call ${callId} ended by ${userId}`);
                }
                calls.delete(callId); // Clean up call record
            }
        });


        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            // Remove user from active users map
            let disconnectedUserId = null;
            for (let [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    activeUsers.delete(userId);
                    console.log(`User ${userId} deregistered.`);
                    break;
                }
            }
            io.emit('online_users', Array.from(activeUsers.keys())); // Update online users list

            // Handle ongoing calls if a user disconnects
            calls.forEach((call, callId) => {
                if (call.caller === disconnectedUserId || call.receiver === disconnectedUserId) {
                    const otherUserId = call.caller === disconnectedUserId ? call.receiver : call.caller;
                    const otherUserSocketId = activeUsers.get(otherUserId);
                    if (otherUserSocketId) {
                        io.to(otherUserSocketId).emit('call_ended', { callId, endedBy: 'disconnect', disconnectedUser: disconnectedUserId });
                    }
                    calls.delete(callId);
                }
            });
        });
    });
};