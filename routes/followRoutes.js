
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Path to your User model
const FollowRequest = require('../models/FollowRequest'); // Path to your FollowRequest model
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken'); // Path to your Firebase token verification middleware
const attachMongoUser = require('../middleware/attachMongoUser'); // Path to the new middleware that attaches MongoDB user info
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
// const userController = require('../controllers/userController');
// const { getUsersByIds } = require('../controllers/userController');
// const { getFollowDetails } = require('../controllers/userController');

router.post('/send-follow-request', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.mongoUserId; // Current user's MongoDB ID
        const currentUserName = req.user.name; // Current user's name from Firebase token, or fetched from DB if attachMongoUser provides it

        // Basic validation for targetUserId
        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: 'Invalid target user ID' });
        }

        // Check if user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if trying to follow self
        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        // Check if already following
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found' }); // Should not happen with attachMongoUser
        }

        if (currentUser.following.includes(targetUserId)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Check if a pending follow request already exists (sender -> receiver)
        const existingRequest = await FollowRequest.findOne({
            sender: currentUserId,
            receiver: targetUserId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Follow request already sent' });
        }

        // Check if the target user has sent a pending request to current user (receiver -> sender)
        // If so, automatically accept it
        const reverseRequest = await FollowRequest.findOne({
            sender: targetUserId,
            receiver: currentUserId,
            status: 'pending'
        });

        if (reverseRequest) {
            reverseRequest.status = 'accepted';
            await reverseRequest.save();

            // Add to followers/following lists for both users
            await User.findByIdAndUpdate(reverseRequest.sender, {
                $addToSet: { following: currentUserId }
            });
            await User.findByIdAndUpdate(currentUserId, {
                $addToSet: { followers: reverseRequest.sender }
            });

            // Create a notification for the sender of the reverse request (whose request was accepted)
            const notification = new Notification({
                recipient: reverseRequest.sender, // The user whose request was accepted
                sender: currentUserId, // The user who accepted it (current user)
                type: 'followRequestAccepted',
                message: `${currentUser.name || 'A user'} accepted your follow request.`,
                link: `/dashboard/profile/${currentUserId}` // Link to the accepter's profile
            });
            await notification.save();

            // Emit socket event to the sender of the reverse request
            const io = req.app.get('io');
            const senderOfReverseRequestUser = await User.findById(reverseRequest.sender); // Fetch sender to get firebaseUid
            if (io && senderOfReverseRequestUser && senderOfReverseRequestUser.firebaseUid) {
                // Ensure to send the full notification object including sender details if needed on client
                io.to(senderOfReverseRequestUser.firebaseUid).emit('newNotification', {
                    _id: notification._id,
                    type: notification.type,
                    message: notification.message,
                    read: notification.read,
                    createdAt: notification.createdAt,
                    sender: {
                        _id: currentUser._id,
                        name: currentUser.name,
                        avatarUrl: currentUser.avatarUrl,
                        firebaseUid: currentUser.firebaseUid
                    },
                    link: notification.link
                });
            }

            return res.status(200).json({ message: 'Automatically accepted existing follow request.', status: 'accepted' });
        }

        // IF NEW FOLLOW REQUEST IS SENT:
        const followRequest = new FollowRequest({
            sender: currentUserId,
            receiver: targetUserId,
            status: 'pending'
        });
        await followRequest.save();

        // Populate sender info for real-time notification
        // Note: It's better to populate the sender's details from the `currentUser` object
        // that was already fetched or directly from `req.user` if `attachMongoUser` provides it.
        // For consistency and to ensure avatarUrl, let's fetch the sender's full details.
        const senderUserForNotification = await User.findById(currentUserId).select('name avatarUrl firebaseUid');

        // Create a new notification for the recipient of the follow request
        const notification = new Notification({
            recipient: targetUserId, // The user receiving the request
            sender: currentUserId, // The user who sent the request
            type: 'followRequest',
            message: `${senderUserForNotification?.name || 'A user'} sent you a follow request.`,
            link: '/dashboard/requests', // Link to the pending requests page
            data: {
                requestId: followRequest._id // Add requestId for client-side action
            }
        });
        await notification.save();

        // Emit socket event to target user (receiver of the request)
        const io = req.app.get('io');
        if (io && targetUser.firebaseUid) {
            io.to(targetUser.firebaseUid).emit('newNotification', {
                _id: notification._id,
                type: notification.type,
                message: notification.message,
                read: notification.read,
                createdAt: notification.createdAt,
                sender: {
                    _id: senderUserForNotification?._id,
                    name: senderUserForNotification?.name,
                    avatarUrl: senderUserForNotification?.avatarUrl,
                    firebaseUid: senderUserForNotification?.firebaseUid
                },
                data: notification.data,
                link: notification.link
            });
        } else {
            console.warn(`Socket event not emitted: Target user ${targetUserId} has no firebaseUid or IO not available.`);
        }

        res.status(201).json({
            message: 'Follow request sent successfully',
            request: followRequest
        });

    } catch (error) {
        console.error('Error sending follow request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/pending-requests', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const userId = req.user.mongoUserId;

        const requests = await FollowRequest.find({
            receiver: userId,
            status: 'pending'
        }).populate('sender', 'name avatarUrl firebaseUid').sort({ createdAt: -1 });

        res.json({ requests });

    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/accept-follow-request/:requestId', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const { requestId } = req.params;
        const currentUserId = req.user.mongoUserId; // This is User B (the accepter)
        const currentUserName = req.user.name;

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        const updatedRequest = await FollowRequest.findOneAndUpdate(
            {
                _id: requestId,
                receiver: currentUserId,
                status: 'pending' // Crucial: only update if it's pending
            },
            {
                status: 'accepted'
            },
            { new: true }
        );

        if (!updatedRequest) {
            const existingRequestCheck = await FollowRequest.findById(requestId);
            if (!existingRequestCheck) {
                return res.status(404).json({ message: 'Follow request not found.' });
            }
            if (existingRequestCheck.receiver.toString() !== currentUserId.toString()) {
                return res.status(403).json({ message: 'Unauthorized to accept this request.' });
            }
            if (existingRequestCheck.status === 'accepted') {
                return res.status(409).json({ message: 'This follow request has already been accepted.' });
            }
            if (existingRequestCheck.status === 'rejected') {
                return res.status(409).json({ message: 'This follow request has already been rejected.' });
            }
            return res.status(400).json({ message: 'Request could not be processed.' });
        }

        // --- MODIFIED LOGIC FOR MUTUAL FOLLOW ---

        const senderId = updatedRequest.sender; // This is User A (the sender of the original request)
        const receiverId = currentUserId; // This is User B (the user who accepted)

        // 1. Add receiverId to sender's (User A's) 'following' list
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { following: receiverId }
        });

        // 2. Add senderId to receiver's (User B's) 'followers' list
        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { followers: senderId }
        });

        // 3. Add senderId to receiver's (User B's) 'following' list
        // This makes User B also follow User A
        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { following: senderId }
        });

        // 4. Add receiverId to sender's (User A's) 'followers' list
        // This makes User A also followed by User B
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { followers: receiverId }
        });

        // --- END OF MODIFIED LOGIC ---

        const sender = await User.findById(senderId); // User A
        const accepterUser = await User.findById(receiverId); // User B (current user)

        if (!sender) {
            console.error(`Accept Follow: Sender user with ID ${senderId} not found.`);
        }

        // Create a notification for the sender (User A) that their request was accepted
        const notificationToSender = new Notification({
            recipient: senderId,
            sender: receiverId, // User B accepted
            type: 'followRequestAccepted',
            message: `${accepterUser?.name || 'A user'} accepted your follow request.`,
            link: `/dashboard/profile/${receiverId}`
        });
        await notificationToSender.save();

        // Create a notification for the receiver (User B) that they are now following the sender (User A)
        // This notification is optional, but confirms the mutual follow
        const notificationToReceiver = new Notification({
            recipient: receiverId, // User B
            sender: senderId, // User A
            type: 'mutualFollowEstablished', // You might need to add this type to your schema
            message: `You are now following ${sender?.name || 'a user'}.`,
            link: `/dashboard/profile/${senderId}`
        });
        await notificationToReceiver.save();


        const io = req.app.get('io');
        // Emit socket event to sender (User A)
        if (io && sender && sender.firebaseUid) {
            io.to(sender.firebaseUid).emit('newNotification', {
                _id: notificationToSender._id,
                type: notificationToSender.type,
                message: notificationToSender.message,
                read: notificationToSender.read,
                createdAt: notificationToSender.createdAt,
                sender: {
                    _id: accepterUser?._id,
                    name: accepterUser?.name,
                    avatarUrl: accepterUser?.avatarUrl,
                    firebaseUid: accepterUser?.firebaseUid
                },
                link: notificationToSender.link
            });
        } else {
            console.warn(`Socket event not emitted: Sender ${senderId} has no firebaseUid or IO not available.`);
        }

        // Emit socket event to receiver (User B) - optional, but useful for real-time update
        if (io && accepterUser && accepterUser.firebaseUid) {
            io.to(accepterUser.firebaseUid).emit('newNotification', {
                _id: notificationToReceiver._id,
                type: notificationToReceiver.type,
                message: notificationToReceiver.message,
                read: notificationToReceiver.read,
                createdAt: notificationToReceiver.createdAt,
                sender: {
                    _id: sender?._id,
                    name: sender?.name,
                    avatarUrl: sender?.avatarUrl,
                    firebaseUid: sender?.firebaseUid
                },
                link: notificationToReceiver.link
            });
        }


        res.json({ message: 'Follow request accepted and mutual follow established successfully' });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This follow request has already been accepted or is a duplicate.' });
        }
        console.error('Error accepting follow request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/reject-follow-request/:requestId', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const { requestId } = req.params;
        const currentUserId = req.user.mongoUserId; // This is the user rejecting the request

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        // Find the request and ensure it's pending and meant for the current user
        const updatedRequest = await FollowRequest.findOneAndUpdate(
            {
                _id: requestId,
                receiver: currentUserId,
                status: 'pending' // <--- CRUCIAL CHANGE: Only reject if it's pending
            },
            {
                status: 'rejected'
            },
            { new: true } // Return the updated document
        );

        if (!updatedRequest) {
            // Check why it wasn't found/updated
            const existingRequestCheck = await FollowRequest.findById(requestId);
            if (!existingRequestCheck) {
                return res.status(404).json({ message: 'Follow request not found.' });
            }
            if (existingRequestCheck.receiver.toString() !== currentUserId.toString()) {
                return res.status(403).json({ message: 'Unauthorized to reject this request.' });
            }
            if (existingRequestCheck.status === 'accepted') {
                return res.status(409).json({ message: 'This follow request has already been accepted.' });
            }
            if (existingRequestCheck.status === 'rejected') {
                return res.status(409).json({ message: 'This follow request has already been rejected.' });
            }
            return res.status(400).json({ message: 'Request could not be processed, perhaps it is no longer pending.' });
        }

        // Optionally, delete the rejected request to clean up your database
        // await FollowRequest.findByIdAndDelete(requestId); // Uncomment if you want to delete them immediately

        const sender = await User.findById(updatedRequest.sender);
        const rejecterUser = await User.findById(currentUserId);

        // Create a notification for the sender that their request was rejected
        const notificationToSender = new Notification({
            recipient: updatedRequest.sender,
            sender: currentUserId,
            type: 'followRequestRejected', // Make sure this is in your Notification schema enum
            message: `${rejecterUser?.name || 'A user'} rejected your follow request.`,
            link: `/dashboard/profile/${currentUserId}`
        });
        await notificationToSender.save();

        const io = req.app.get('io');
        if (io && sender && sender.firebaseUid) {
            io.to(sender.firebaseUid).emit('newNotification', {
                _id: notificationToSender._id,
                type: notificationToSender.type,
                message: notificationToSender.message,
                read: notificationToSender.read,
                createdAt: notificationToSender.createdAt,
                sender: {
                    _id: rejecterUser?._id,
                    name: rejecterUser?.name,
                    avatarUrl: rejecterUser?.avatarUrl,
                    firebaseUid: rejecterUser?.firebaseUid
                },
                link: notificationToSender.link
            });
        }

        res.json({ message: 'Follow request rejected successfully' });

    } catch (error) {
        console.error('Error rejecting follow request:', error);
        // Do not return 409 for duplicate key here, because the `findOneAndUpdate`
        // should prevent it if the query is correct. If it still happens,
        // it means the unique index isn't properly designed for your flow,
        // or there's another underlying issue.
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/follow-status/:targetUserId', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.mongoUserId;

        // Basic validation for targetUserId
        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: 'Invalid target user ID' });
        }

        // If trying to check status with self
        if (currentUserId.toString() === targetUserId.toString()) {
            return res.json({ status: 'self' });
        }

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            // This case should ideally not happen if attachMongoUser worked correctly
            return res.status(404).json({ message: 'Current user profile not found in database.' });
        }

        // Check if already following
        if (currentUser.following.includes(targetUserId)) {
            return res.json({ status: 'following' });
        }

        // Check if a pending request was sent BY current user TO target user
        const sentPendingRequest = await FollowRequest.findOne({
            sender: currentUserId,
            receiver: targetUserId,
            status: 'pending'
        });

        if (sentPendingRequest) {
            return res.json({ status: 'pending_sent' });
        }

        // Check if a pending request was sent TO current user BY target user
        const receivedPendingRequest = await FollowRequest.findOne({
            sender: targetUserId,
            receiver: currentUserId,
            status: 'pending'
        });

        if (receivedPendingRequest) {
            return res.json({ status: 'pending_received' });
        }

        return res.json({ status: 'not_following' });

    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/unfollow/:targetUserId', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.mongoUserId; // The user initiating the unfollow

        // 1. Basic validation for targetUserId
        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: 'Invalid target user ID' });
        }

        // 2. Prevent a user from unfollowing themselves
        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(400).json({ message: 'You cannot unfollow yourself.' });
        }

        // 3. Perform the unfollow by removing IDs from both users' arrays
        // Use $pull to remove targetUserId from current user's 'following' list
        const currentUserUpdate = await User.findByIdAndUpdate(
            currentUserId,
            { $pull: { following: targetUserId } },
            { new: true, runValidators: true } // runValidators: true is good practice
        );

        // Use $pull to remove currentUserId from target user's 'followers' list
        const targetUserUpdate = await User.findByIdAndUpdate(
            targetUserId,
            { $pull: { followers: currentUserId } },
            { new: true, runValidators: true } // runValidators: true is good practice
        );

        // 4. Check if the unfollow actually resulted in changes (optional but good for debugging/strictness)
        // If either user wasn't found or wasn't following/followed, the $pull might not change anything.
        // It's generally fine if these updates don't find anything to pull, as it means the relationship didn't exist.
        if (!currentUserUpdate) {
            // This case might mean the current user (unfollower) doesn't exist,
            // or there was an issue updating their 'following' list.
            console.warn(`Unfollow operation: Current user ${currentUserId} not found or update failed.`);
            return res.status(404).json({ message: 'Unfollowing user not found.' });
        }

        if (!targetUserUpdate) {
            // This means the user being unfollowed wasn't found. The unfollower's list is still updated.
            console.warn(`Unfollow operation: Target user ${targetUserId} not found.`);
            // You might still want to proceed and send 200, as the primary action (unfollowing on current user's side) succeeded.
            // For now, we'll proceed to notification and then send 200.
        }

        // 5. Clean up any related follow requests (crucial for clean state)
        // If there was a pending, accepted, or rejected request between them, it should be removed or marked.
        // For simplicity, we'll delete any requests involving these two users.
        await FollowRequest.deleteMany({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId }
            ]
        });


        // 6. Create a notification for the unfollowed user
        const unfollowerUser = await User.findById(currentUserId); // Re-fetch to ensure latest data or use currentUserUpdate
        // Check if targetUserUpdate exists before creating notification
        if (targetUserUpdate && unfollowerUser) {
            const notification = new Notification({
                recipient: targetUserUpdate._id, // The user who was unfollowed
                sender: unfollowerUser._id, // The user who unfollowed
                type: 'unfollowed', // Make sure this is in your Notification schema enum!
                message: `${unfollowerUser.name || 'A user'} unfollowed you.`,
                link: `/dashboard/profile/${unfollowerUser._id}` // Link to the unfollower's profile
            });
            await notification.save();

            // 7. Emit socket event to the unfollowed user
            const io = req.app.get('io');
            // Ensure targetUserUpdate.firebaseUid exists before trying to emit
            if (io && targetUserUpdate.firebaseUid) {
                io.to(targetUserUpdate.firebaseUid).emit('newNotification', {
                    _id: notification._id,
                    type: notification.type,
                    message: notification.message,
                    read: notification.isRead, // Use 'isRead' from your schema
                    createdAt: notification.createdAt,
                    sender: {
                        _id: unfollowerUser._id,
                        name: unfollowerUser.name,
                        avatarUrl: unfollowerUser.avatarUrl,
                        firebaseUid: unfollowerUser.firebaseUid
                    },
                    link: notification.link
                });
            } else {
                console.warn(`Socket event not emitted: Unfollowed user ${targetUserId} has no firebaseUid or IO not available.`);
            }
        } else {
            console.warn(`Notification not created: unfollowerUser or targetUserUpdate missing.`);
        }

        res.status(200).json({ message: 'User unfollowed successfully' });

    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// router.get('/following/:userId', verifyFirebaseToken, attachMongoUser, userController.getFollowing);
// router.get('/followers/:userId', verifyFirebaseToken, attachMongoUser, userController.getFollowers);
// router.get('/user-connections/:userId', verifyFirebaseToken, attachMongoUser, userController.getUserConnections);
// router.post('/users/bulk', getUsersByIds);
// router.get('/follow-details/:userId', getFollowDetails);

module.exports = router;