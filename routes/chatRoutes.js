// // routes/chatRoutes.js
// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware'); // Your existing auth middleware
// const Conversation = require('../models/Conversation');
// const Message = require('../models/Message');
// const User = require('../models/User'); // Assuming you have a User model
// const UploadMedia = require('../middleware/chatupload')

// // GET /api/chats/conversations - Get all conversations for the current user
// router.get('/conversations', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.id; // From your authMiddleware

//         const conversations = await Conversation.find({ participants: userId })
//             .populate('participants', 'name avatarUrl') // Populate participants with relevant fields
//             .sort({ updatedAt: -1 }); // Latest conversations first

//         // Filter out conversations where `lastMessage` sender/content might be empty or missing if not needed
//         // And simplify participant data for frontend
//         const formattedConversations = conversations.map(conv => {
//             const otherParticipant = conv.participants.find(p => p._id.toString() !== userId.toString());
//             return {
//                 _id: conv._id,
//                 otherParticipant: otherParticipant ? {
//                     _id: otherParticipant._id,
//                     name: otherParticipant.name,
//                     avatarUrl: otherParticipant.avatarUrl,
//                 } : null, // Handle cases where other participant might be missing
//                 lastMessage: conv.lastMessage.content ? {
//                     sender: conv.lastMessage.sender,
//                     content: conv.lastMessage.content,
//                     createdAt: conv.lastMessage.createdAt,
//                 } : null,
//                 updatedAt: conv.updatedAt,
//             };
//         }).filter(conv => conv.otherParticipant !== null); // Remove if no other participant found

//         res.json(formattedConversations);
//     } catch (error) {
//         console.error('Error fetching conversations:', error);
//         res.status(500).json({ message: 'Server error fetching conversations.' });
//     }
// });

// // GET /api/chats/messages/:conversationId - Get messages for a specific conversation
// router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
//     try {
//         const { conversationId } = req.params;
//         const userId = req.user.id;

//         const conversation = await Conversation.findById(conversationId);

//         if (!conversation || !conversation.participants.includes(userId)) {
//             return res.status(403).json({ message: 'Access denied to this conversation.' });
//         }

//         const messages = await Message.find({ conversationId })
//             .populate('sender', 'name avatarUrl')
//             .sort({ createdAt: 1 }); // Oldest messages first

//         res.json(messages);
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         res.status(500).json({ message: 'Server error fetching messages.' });
//     }
// });

// // POST /api/chats/message/:receiverId - Send a new message
// // routes/chatRoutes.js (inside your POST /api/chats/message/:receiverId route)

// // Existing route: POST /api/chats/message/:receiverId - Send a new TEXT message
// router.post('/message/:receiverId', authMiddleware, async (req, res) => {
//     try {
//         const senderId = req.user.id;
//         const { receiverId } = req.params;
//         const { content } = req.body;

//         if (!content || typeof content !== 'string' || content.trim() === '') {
//             return res.status(400).json({ message: 'Message content cannot be empty for text messages.' });
//         }

//         let conversation = await Conversation.findOne({
//             participants: {
//                 $all: [senderId, receiverId],
//                 $size: 2
//             }
//         });

//         if (!conversation) {
//             conversation = await Conversation.create({
//                 participants: [senderId, receiverId],
//             });
//             console.log('New conversation created:', conversation._id);
//         }

//         const newMessage = await Message.create({
//             conversationId: conversation._id,
//             sender: senderId,
//             receiver: receiverId, // Keeping for your existing schema, though `conversationId` and `sender` are usually sufficient.
//             content: content.trim(),
//             // mediaUrl and mediaType will be undefined, which is fine as they're optional
//         });

//         // Update lastMessage in conversation
//         conversation.lastMessage = {
//             sender: senderId,
//             content: content.trim(),
//             createdAt: newMessage.createdAt,
//             // mediaType: undefined // Ensure mediaType is not set for text messages
//         };
//         conversation.updatedAt = newMessage.createdAt;
//         await conversation.save();

//         const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatarUrl');

//         // Emit new message via Socket.IO
//         req.app.get('io').to(conversation._id.toString()).emit('newMessage', populatedMessage);
//         req.app.get('io').to(receiverId).emit('newMessageNotification', {
//             senderId: senderId,
//             conversationId: conversation._id,
//             content: content.trim(),
//             senderName: populatedMessage.sender.name,
//         });


//         res.status(201).json(populatedMessage);
//     } catch (error) {
//         console.error('Error sending text message:', error);
//         res.status(500).json({ message: 'Server error sending message.' });
//     }
// });

// // NEW ROUTE: POST /api/chats/media-message/:receiverId - Send a new MEDIA message
// router.post('/media-message/:receiverId', authMiddleware, UploadMedia.single('media'), async (req, res) => {
//     try {
//         const senderId = req.user.id;
//         const { receiverId } = req.params;
//         const content = req.body.content ? req.body.content.trim() : ''; // Optional text content (caption)

//         if (!req.file) {
//             return res.status(400).json({ message: 'No media file uploaded.' });
//         }

//         // Construct the media URL relative to your static server path
//         // Since your `index.js` serves `/uploads` as the base, and `uploadMiddleware` stores in `uploads/chat_media`,
//         // the path will be `/uploads/chat_media/your-filename.ext`
//         const mediaUrl = `/uploads/chat_media/${req.file.filename}`;

//         let mediaType;
//         // Determine media type based on mimetype
//         if (req.file.mimetype.startsWith('image/')) {
//             mediaType = 'image';
//         } else if (req.file.mimetype.startsWith('video/')) {
//             mediaType = 'video';
//         } else if (req.file.mimetype.startsWith('audio/')) {
//             mediaType = 'audio';
//         } else {
//             mediaType = 'file'; // Generic for other types like PDF, doc, etc.
//         }

//         let conversation = await Conversation.findOne({
//             participants: {
//                 $all: [senderId, receiverId],
//                 $size: 2
//             }
//         });

//         if (!conversation) {
//             conversation = await Conversation.create({
//                 participants: [senderId, receiverId],
//             });
//             console.log('New conversation created:', conversation._id);
//         }

//         const newMessage = await Message.create({
//             conversationId: conversation._id,
//             sender: senderId,
//             receiver: receiverId,
//             content: content, // Can be empty if just media
//             mediaUrl: mediaUrl,
//             mediaType: mediaType,
//         });

//         // Update lastMessage in conversation with media info or text
//         conversation.lastMessage = {
//             sender: senderId,
//             content: content || (
//                 mediaType === 'image' ? '📸 Image' :
//                 mediaType === 'video' ? '🎥 Video' :
//                 mediaType === 'audio' ? '🎧 Audio' :
//                 '📄 File'
//             ), // A preview for the chat list
//             createdAt: newMessage.createdAt,
//             mediaType: mediaType, // Store mediaType in lastMessage for easy display
//         };
//         conversation.updatedAt = newMessage.createdAt;
//         await conversation.save();

//         const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatarUrl');

//         // Emit new message via Socket.IO
//         req.app.get('io').to(conversation._id.toString()).emit('newMessage', populatedMessage);
//         req.app.get('io').to(receiverId).emit('newMessageNotification', {
//             senderId: senderId,
//             conversationId: conversation._id,
//             content: content || `New ${mediaType} message`,
//             senderName: populatedMessage.sender.name,
//         });


//         res.status(201).json(populatedMessage);

//     } catch (error) {
//         console.error('Error sending media message:', error);
//         if (error instanceof multer.MulterError) {
//             return res.status(400).json({ message: error.message });
//         }
//         res.status(500).json({ message: 'Server error sending media message.' });
//     }
// });


// router.put('/message/:messageId', authMiddleware, async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const { content } = req.body;
//         const userId = req.user.id;

//         if (!content || typeof content !== 'string' || content.trim() === '') {
//             return res.status(400).json({ message: 'Edited message content cannot be empty.' });
//         }

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ message: 'Message not found.' });
//         }

//         // Ensure the user trying to edit is the sender of the message
//         if (message.sender.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to edit this message.' });
//         }

//         // Update message content and mark it as edited
//         message.content = content.trim();
//         message.isEdited = true; // Add an 'isEdited' field to your Message schema
//         await message.save();

//         // Populate sender details for the response
//         const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatarUrl');

//         // Emit update via Socket.IO to the conversation
//         // This will tell all participants in the conversation that a message was edited
//         req.app.get('io').to(message.conversationId.toString()).emit('messageEdited', populatedMessage);

//         res.status(200).json(populatedMessage);

//     } catch (error) {
//         console.error('Error editing message:', error);
//         res.status(500).json({ message: 'Server error editing message.' });
//     }
// });

// router.delete('/message/:messageId', authMiddleware, async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const userId = req.user.id;

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ message: 'Message not found.' });
//         }

//         // Ensure the user trying to delete is the sender of the message
//         if (message.sender.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to delete this message.' });
//         }

//         // Perform a soft delete: mark message as deleted
//         message.isDeleted = true; // Add an 'isDeleted' field to your Message schema
//         message.content = 'This message was deleted.'; // Change content for display
//         message.mediaUrl = undefined; // Remove media URL if it was a media message
//         message.mediaType = undefined; // Remove media type
//         await message.save();

//         // Populate sender details for the response
//         const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatarUrl');

//         // Emit update via Socket.IO to the conversation
//         // This will tell all participants that a message was deleted
//         req.app.get('io').to(message.conversationId.toString()).emit('messageDeleted', {
//             messageId: message._id,
//             conversationId: message.conversationId,
//             // Optionally send the updated content/status
//             content: populatedMessage.content,
//             isDeleted: populatedMessage.isDeleted
//         });

//         res.status(200).json({ message: 'Message deleted successfully (soft delete).', deletedMessage: populatedMessage });

//     } catch (error) {
//         console.error('Error deleting message:', error);
//         res.status(500).json({ message: 'Server error deleting message.' });
//     }
// });

// module.exports = router;









// // routes/chatRoutes.js
// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware'); // Your existing auth middleware
// const Conversation = require('../models/Conversation');
// const Message = require('../models/Message');
// const User = require('../models/User'); // Assuming you have a User model
// const UploadMedia = require('../middleware/chatupload'); // Assuming this handles your multer setup
// const fs = require('fs');
// const path = require('path');
// const multer = require('multer'); // Import multer if not already imported in chatRoutes.js for MulterError handling


// // Utility function to delete a file
// const deleteFile = (filePath) => {
//     if (filePath && filePath.startsWith('/uploads/chat_media/')) {
//         const fullPath = path.join(__dirname, '..', filePath); // Adjust path based on your server structure
//         fs.unlink(fullPath, (err) => {
//             if (err) console.error(`Failed to delete file: ${fullPath}`, err);
//             else console.log(`Deleted file: ${fullPath}`);
//         });
//     }
// };

// // GET /api/chats/conversations - Get all conversations for the current user
// router.get('/conversations', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.id; // From your authMiddleware

//         const conversations = await Conversation.find({ participants: userId })
//             .populate('participants', 'name avatarUrl') // Populate participants with relevant fields
//             .sort({ updatedAt: -1 }); // Latest conversations first

//         // Filter out conversations where `lastMessage` sender/content might be empty or missing if not needed
//         // And simplify participant data for frontend
//         const formattedConversations = conversations.map(conv => {
//             const otherParticipant = conv.participants.find(p => p._id.toString() !== userId.toString());
//             return {
//                 _id: conv._id,
//                 otherParticipant: otherParticipant ? {
//                     _id: otherParticipant._id,
//                     name: otherParticipant.name,
//                     avatarUrl: otherParticipant.avatarUrl,
//                 } : null, // Handle cases where other participant might be missing
//                 lastMessage: conv.lastMessage.content ? {
//                     sender: conv.lastMessage.sender,
//                     content: conv.lastMessage.content,
//                     createdAt: conv.lastMessage.createdAt,
//                 } : null,
//                 updatedAt: conv.updatedAt,
//             };
//         }).filter(conv => conv.otherParticipant !== null); // Remove if no other participant found

//         res.json(formattedConversations);
//     } catch (error) {
//         console.error('Error fetching conversations:', error);
//         res.status(500).json({ message: 'Server error fetching conversations.' });
//     }
// });

// // GET /api/chats/messages/:conversationId - Get messages for a specific conversation
// router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
//     try {
//         const { conversationId } = req.params;
//         const userId = req.user.id;

//         const conversation = await Conversation.findById(conversationId);

//         if (!conversation || !conversation.participants.includes(userId)) {
//             return res.status(403).json({ message: 'Access denied to this conversation.' });
//         }

//         const messages = await Message.find({ conversationId })
//             .populate('sender', 'name avatarUrl')
//             .sort({ createdAt: 1 }); // Oldest messages first

//         res.json(messages);
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         res.status(500).json({ message: 'Server error fetching messages.' });
//     }
// });

// // POST /api/chats/message/:receiverId - Send a new TEXT message
// router.post('/message/:receiverId', authMiddleware, async (req, res) => {
//     try {
//         const senderId = req.user.id;
//         const { receiverId } = req.params;
//         const { content } = req.body;

//         if (!content || typeof content !== 'string' || content.trim() === '') {
//             return res.status(400).json({ message: 'Message content cannot be empty for text messages.' });
//         }

//         let conversation = await Conversation.findOne({
//             participants: {
//                 $all: [senderId, receiverId],
//                 $size: 2
//             }
//         });

//         if (!conversation) {
//             conversation = await Conversation.create({
//                 participants: [senderId, receiverId],
//             });
//             console.log('New conversation created:', conversation._id);
//         }

//         const newMessage = await Message.create({
//             conversationId: conversation._id,
//             sender: senderId,
//             receiver: receiverId, // Keeping for your existing schema, though `conversationId` and `sender` are usually sufficient.
//             content: content.trim(),
//             // mediaUrl and mediaType will be undefined, which is fine as they're optional
//             isDeleted: false, // Ensure new messages are not marked as deleted
//         });

//         // Update lastMessage in conversation
//         conversation.lastMessage = {
//             sender: senderId,
//             content: content.trim(),
//             createdAt: newMessage.createdAt,
//             // mediaType: undefined // Ensure mediaType is not set for text messages
//         };
//         conversation.updatedAt = newMessage.createdAt;
//         await conversation.save();

//         const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatarUrl');

//         // Emit new message via Socket.IO
//         req.app.get('io').to(conversation._id.toString()).emit('newMessage', populatedMessage);
//         req.app.get('io').to(receiverId).emit('newMessageNotification', {
//             senderId: senderId,
//             conversationId: conversation._id,
//             content: content.trim(),
//             senderName: populatedMessage.sender.name,
//         });


//         res.status(201).json(populatedMessage);
//     } catch (error) {
//         console.error('Error sending text message:', error);
//         res.status(500).json({ message: 'Server error sending message.' });
//     }
// });

// // NEW ROUTE: POST /api/chats/media-message/:receiverId - Send a new MEDIA message
// router.post('/media-message/:receiverId', authMiddleware, UploadMedia.single('media'), async (req, res) => {
//     try {
//         const senderId = req.user.id;
//         const { receiverId } = req.params;
//         const content = req.body.content ? req.body.content.trim() : ''; // Optional text content (caption)

//         if (!req.file) {
//             return res.status(400).json({ message: 'No media file uploaded.' });
//         }

//         // Construct the media URL relative to your static server path
//         // Since your `index.js` serves `/uploads` as the base, and `uploadMiddleware` stores in `uploads/chat_media`,
//         // the path will be `/uploads/chat_media/your-filename.ext`
//         const mediaUrl = `/uploads/chat_media/${req.file.filename}`;

//         let mediaType;
//         // Determine media type based on mimetype
//         if (req.file.mimetype.startsWith('image/')) {
//             mediaType = 'image';
//         } else if (req.file.mimetype.startsWith('video/')) {
//             mediaType = 'video';
//         } else if (req.file.mimetype.startsWith('audio/')) {
//             mediaType = 'audio';
//         } else {
//             mediaType = 'file'; // Generic for other types like PDF, doc, etc.
//         }

//         let conversation = await Conversation.findOne({
//             participants: {
//                 $all: [senderId, receiverId],
//                 $size: 2
//             }
//         });

//         if (!conversation) {
//             conversation = await Conversation.create({
//                 participants: [senderId, receiverId],
//             });
//             console.log('New conversation created:', conversation._id);
//         }

//         const newMessage = await Message.create({
//             conversationId: conversation._id,
//             sender: senderId,
//             receiver: receiverId,
//             content: content, // Can be empty if just media
//             mediaUrl: mediaUrl,
//             mediaType: mediaType,
//             isDeleted: false, // Ensure new messages are not marked as deleted
//         });

//         // Update lastMessage in conversation with media info or text
//         conversation.lastMessage = {
//             sender: senderId,
//             content: content || (
//                 mediaType === 'image' ? '📸 Image' :
//                 mediaType === 'video' ? '🎥 Video' :
//                 mediaType === 'audio' ? '🎧 Audio' :
//                 '📄 File'
//             ), // A preview for the chat list
//             createdAt: newMessage.createdAt,
//             mediaType: mediaType, // Store mediaType in lastMessage for easy display
//         };
//         conversation.updatedAt = newMessage.createdAt;
//         await conversation.save();

//         const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatarUrl');

//         // Emit new message via Socket.IO
//         req.app.get('io').to(conversation._id.toString()).emit('newMessage', populatedMessage);
//         req.app.get('io').to(receiverId).emit('newMessageNotification', {
//             senderId: senderId,
//             conversationId: conversation._id,
//             content: content || `New ${mediaType} message`,
//             senderName: populatedMessage.sender.name,
//         });


//         res.status(201).json(populatedMessage);

//     } catch (error) {
//         console.error('Error sending media message:', error);
//         if (error instanceof multer.MulterError) {
//             return res.status(400).json({ message: error.message });
//         }
//         res.status(500).json({ message: 'Server error sending media message.' });
//     }
// });


// router.put('/message/:messageId', authMiddleware, async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const { content } = req.body;
//         const userId = req.user.id;

//         if (!content || typeof content !== 'string' || content.trim() === '') {
//             return res.status(400).json({ message: 'Edited message content cannot be empty.' });
//         }

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ message: 'Message not found.' });
//         }

//         // Ensure the user trying to edit is the sender of the message
//         if (message.sender.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to edit this message.' });
//         }

//         // Check if the message is already deleted
//         if (message.isDeleted) {
//             return res.status(400).json({ message: 'Cannot edit a deleted message.' });
//         }

//         // Update message content and mark it as edited
//         message.content = content.trim();
//         message.isEdited = true; // Add an 'isEdited' field to your Message schema
//         await message.save();

//         // Populate sender details for the response
//         const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatarUrl');

//         // Emit update via Socket.IO to the conversation
//         // This will tell all participants in the conversation that a message was edited
//         req.app.get('io').to(message.conversationId.toString()).emit('messageEdited', populatedMessage);

//         res.status(200).json(populatedMessage);

//     } catch (error) {
//         console.error('Error editing message:', error);
//         res.status(500).json({ message: 'Server error editing message.' });
//     }
// });

// router.delete('/message/:messageId', authMiddleware, async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const userId = req.user.id;

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ message: 'Message not found.' });
//         }

//         // Ensure the user trying to delete is the sender of the message
//         if (message.sender.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to delete this message.' });
//         }

//         // Soft delete: mark message as deleted
//         message.isDeleted = true; // Add an 'isDeleted' field to your Message schema (boolean, default false)
//         message.content = 'This message was deleted.'; // Change content for display
//         // We keep mediaUrl for potential hard delete later if needed, but remove from display logic
//         // message.mediaUrl = undefined; // Do not clear mediaUrl here if you want to perform hard delete later
//         message.mediaType = undefined; // Clear media type for display purposes
//         await message.save();

//         // Populate sender details for the response
//         const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatarUrl');

//         // Emit update via Socket.IO to the conversation
//         // This will tell all participants that a message was deleted
//         req.app.get('io').to(message.conversationId.toString()).emit('messageDeleted', {
//             messageId: message._id,
//             conversationId: message.conversationId,
//             // Send the updated content and isDeleted status
//             content: populatedMessage.content,
//             isDeleted: populatedMessage.isDeleted,
//         });

//         res.status(200).json({ message: 'Message deleted successfully (soft delete).', deletedMessage: populatedMessage });

//     } catch (error) {
//         console.error('Error deleting message:', error);
//         res.status(500).json({ message: 'Server error deleting message.' });
//     }
// });

// // NEW ROUTE: DELETE /api/chats/messages/:conversationId/all - Delete ALL messages in a conversation
// router.delete('/messages/:conversationId/all', authMiddleware, async (req, res) => {
//     try {
//         const { conversationId } = req.params;
//         const userId = req.user.id;

//         const conversation = await Conversation.findById(conversationId);

//         if (!conversation) {
//             return res.status(404).json({ message: 'Conversation not found.' });
//         }

//         // Ensure the current user is a participant of the conversation
//         if (!conversation.participants.includes(userId)) {
//             return res.status(403).json({ message: 'You are not authorized to delete messages in this conversation.' });
//         }

//         // Find all messages in the conversation to delete associated media files
//         const messagesToDelete = await Message.find({ conversationId, sender: userId }); // Only delete sender's messages and media
//                                                                                          // If you want to delete all messages for both parties,
//                                                                                          // remove `sender: userId` from the query

//         // Delete associated media files from the server
//         for (const message of messagesToDelete) {
//             if (message.mediaUrl) {
//                 deleteFile(message.mediaUrl);
//             }
//         }

//         // Soft delete all messages in the conversation from the current user's perspective
//         // If you want to hard delete for both participants, use `deleteMany`
//         await Message.updateMany(
//             { conversationId }, // Update all messages in this conversation
//             { $set: { isDeleted: true, content: 'This message was deleted.', mediaUrl: undefined, mediaType: undefined } } // Mark as deleted and clear content/media for display
//         );

//         // Update the lastMessage in the conversation to reflect that all messages are gone
//         conversation.lastMessage = {
//             sender: null, // No specific sender
//             content: 'Messages cleared by user.',
//             createdAt: new Date(),
//         };
//         conversation.updatedAt = new Date();
//         await conversation.save();

//         // Emit update via Socket.IO to the conversation
//         // This will tell all participants that messages were cleared
//         req.app.get('io').to(conversation._id.toString()).emit('messagesCleared', {
//             conversationId: conversation._id,
//             clearedBy: userId,
//         });


//         res.status(200).json({ message: 'All messages in this conversation have been deleted.' });

//     } catch (error) {
//         console.error('Error deleting all messages:', error);
//         res.status(500).json({ message: 'Server error deleting all messages.' });
//     }
// });


// module.exports = router;









const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Your existing auth middleware
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User'); // Assuming you have a User model
const UploadMedia = require('../middleware/chatupload'); // Assuming this handles your multer setup
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Import multer if not already imported in chatRoutes.js for MulterError handling


// Utility function to delete a file
const deleteFile = (filePath) => {
    if (filePath && filePath.startsWith('/uploads/chat_media/')) {
        const fullPath = path.join(__dirname, '..', filePath); // Adjust path based on your server structure
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Failed to delete file: ${fullPath}`, err);
            else console.log(`Deleted file: ${fullPath}`);
        });
    }
};

// // GET /api/chats/conversations - Get all conversations for the current user
// router.get('/conversations', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.id; // From your authMiddleware

//         const conversations = await Conversation.find({ participants: userId })
//             .populate('participants', 'name avatarUrl') // Populate participants with relevant fields
//             .sort({ updatedAt: -1 }); // Latest conversations first

//         // Filter out conversations where `lastMessage` sender/content might be empty or missing if not needed
//         // And simplify participant data for frontend
//         const formattedConversations = conversations.map(conv => {
//             const otherParticipant = conv.participants.find(p => p._id.toString() !== userId.toString());
//             return {
//                 _id: conv._id,
//                 otherParticipant: otherParticipant ? {
//                     _id: otherParticipant._id,
//                     name: otherParticipant.name,
//                     avatarUrl: otherParticipant.avatarUrl,
//                 } : null, // Handle cases where other participant might be missing
//                 lastMessage: conv.lastMessage.content ? {
//                     sender: conv.lastMessage.sender,
//                     content: conv.lastMessage.content,
//                     createdAt: conv.lastMessage.createdAt,
//                     mediaType: conv.lastMessage.mediaType || undefined, // Include mediaType
//                 } : null,
//                 updatedAt: conv.updatedAt,
//             };
//         }).filter(conv => conv.otherParticipant !== null); // Remove if no other participant found

//         res.json(formattedConversations);
//     } catch (error) {
//         console.error('Error fetching conversations:', error);
//         res.status(500).json({ message: 'Server error fetching conversations.' });
//     }
// });

// GET /api/chats/conversations - Get all conversations for the current user
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // From your authMiddleware

        // Fetch conversations and populate participants
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'name avatarUrl') // Populate participants with relevant fields
            .sort({ updatedAt: -1 }) // Latest conversations first
            .lean(); // Use .lean() for performance when you're just reading and formatting

        const formattedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherParticipant = conv.participants.find(p => p._id.toString() !== userId.toString());

            // If for some reason there's no other participant, or if you only want
            // to show 1-on-1 chats, you might skip this conversation.
            if (!otherParticipant) {
                return null; // This will be filtered out later
            }

            // --- CRUCIAL CHANGE: Dynamically find the latest NON-DELETED message ---
            const latestNonDeletedMessage = await Message.findOne({
                conversationId: conv._id,
                isDeleted: false // <-- Only consider messages that are NOT marked as deleted
            })
            .sort({ createdAt: -1 }) // Get the most recent one
            .lean(); // Use .lean() for performance

            let lastMessageContentToShow = 'Conversation cleared.';
            let lastMessageSenderId = null;
            let lastMessageCreatedAt = null;
            let lastMessageMediaType = undefined;

            if (latestNonDeletedMessage) {
                lastMessageContentToShow = latestNonDeletedMessage.content;
                lastMessageSenderId = latestNonDeletedMessage.sender;
                lastMessageCreatedAt = latestNonDeletedMessage.createdAt;
                lastMessageMediaType = latestNonDeletedMessage.mediaType;
            }

            return {
                _id: conv._id,
                otherParticipant: {
                    _id: otherParticipant._id,
                    name: otherParticipant.name,
                    avatarUrl: otherParticipant.avatarUrl,
                },
                lastMessage: {
                    sender: lastMessageSenderId,
                    content: lastMessageContentToShow,
                    createdAt: lastMessageCreatedAt,
                    mediaType: lastMessageMediaType,
                },
                updatedAt: conv.updatedAt,
            };
        }));

        // Filter out any null entries if otherParticipant was missing
        const finalFormattedConversations = formattedConversations.filter(conv => conv !== null);

        res.json(finalFormattedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error fetching conversations.' });
    }
});

// GET /api/chats/messages/:conversationId - Get messages for a specific conversation
router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({ message: 'Access denied to this conversation.' });
        }

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name avatarUrl')
            .sort({ createdAt: 1 }); // Oldest messages first

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
});

// POST /api/chats/message/:receiverId - Send a new TEXT message
router.post('/message/:receiverId', authMiddleware, async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;
        const { content } = req.body;

        if (!content || typeof content !== 'string' || content.trim() === '') {
            return res.status(400).json({ message: 'Message content cannot be empty for text messages.' });
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [senderId, receiverId],
                $size: 2
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
            console.log('New conversation created:', conversation._id);
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            receiver: receiverId, // Keeping for your existing schema, though `conversationId` and `sender` are usually sufficient.
            content: content.trim(),
            // mediaUrl and mediaType will be undefined, which is fine as they're optional
            isDeleted: false, // Ensure new messages are not marked as deleted
            isEdited: false, // New messages are not edited initially
        });

        // Update lastMessage in conversation
        conversation.lastMessage = {
            sender: senderId,
            content: content.trim(),
            createdAt: newMessage.createdAt,
            mediaType: undefined // Ensure mediaType is not set for text messages
        };
        conversation.updatedAt = newMessage.createdAt;
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatarUrl');

        // Emit new message via Socket.IO
        req.app.get('io').to(conversation._id.toString()).emit('newMessage', populatedMessage);
        req.app.get('io').to(receiverId).emit('newMessageNotification', {
            senderId: senderId,
            conversationId: conversation._id,
            content: content.trim(),
            senderName: populatedMessage.sender.name,
        });


        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending text message:', error);
        res.status(500).json({ message: 'Server error sending message.' });
    }
});

// NEW ROUTE: POST /api/chats/media-message/:receiverId - Send a new MEDIA message
router.post('/media-message/:receiverId', authMiddleware, UploadMedia.single('media'), async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;
        const content = req.body.content ? req.body.content.trim() : ''; // Optional text content (caption)

        if (!req.file) {
            return res.status(400).json({ message: 'No media file uploaded.' });
        }

        // Construct the media URL relative to your static server path
        // Since your `index.js` serves `/uploads` as the base, and `uploadMiddleware` stores in `uploads/chat_media`,
        // the path will be `/uploads/chat_media/your-filename.ext`
        const mediaUrl = `/uploads/chat_media/${req.file.filename}`;

        let mediaType;
        // Determine media type based on mimetype
        if (req.file.mimetype.startsWith('image/')) {
            mediaType = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
            mediaType = 'video';
        } else if (req.file.mimetype.startsWith('audio/')) {
            mediaType = 'audio';
        } else {
            mediaType = 'file'; // Generic for other types like PDF, doc, etc.
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [senderId, receiverId],
                $size: 2
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
            console.log('New conversation created:', conversation._id);
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content: content, // Can be empty if just media
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            isDeleted: false, // Ensure new messages are not marked as deleted
            isEdited: false, // New messages are not edited initially
        });

        // Update lastMessage in conversation with media info or text
        conversation.lastMessage = {
            sender: senderId,
            content: content || (
                mediaType === 'image' ? '📸 Image' :
                mediaType === 'video' ? '🎥 Video' :
                mediaType === 'audio' ? '🎧 Audio' :
                '📄 File'
            ), // A preview for the chat list
            createdAt: newMessage.createdAt,
            mediaType: mediaType, // Store mediaType in lastMessage for easy display
        };
        conversation.updatedAt = newMessage.createdAt;
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatarUrl');

        // Emit new message via Socket.IO
        req.app.get('io').to(conversation._id.toString()).emit('newMessage', populatedMessage);
        req.app.get('io').to(receiverId).emit('newMessageNotification', {
            senderId: senderId,
            conversationId: conversation._id,
            content: content || `New ${mediaType} message`,
            senderName: populatedMessage.sender.name,
        });


        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('Error sending media message:', error);
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error sending media message.' });
    }
});


// PUT /api/chats/message/:messageId - Edit an existing message (text or media caption)
router.put('/message/:messageId', authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body; // 'content' can be updated for both text and media messages
        const userId = req.user.id;

        // Check if content is provided and is a valid string
        if (content === undefined || typeof content !== 'string') {
            return res.status(400).json({ message: 'Content for editing must be a string.' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        // Ensure the user trying to edit is the sender of the message
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to edit this message.' });
        }

        // Check if the message is already deleted
        if (message.isDeleted) {
            return res.status(400).json({ message: 'Cannot edit a deleted message.' });
        }

        // Update message content and mark it as edited
        message.content = content.trim(); // Update the content for both text and media messages
        message.isEdited = true; // Add an 'isEdited' field to your Message schema (boolean, default false)
        message.updatedAt = new Date(); // Update the timestamp to reflect the edit
        await message.save();

        // Populate sender details for the response
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatarUrl');

        // Emit update via Socket.IO to the conversation
        // This will tell all participants in the conversation that a message was edited
        req.app.get('io').to(message.conversationId.toString()).emit('messageEdited', populatedMessage);

        res.status(200).json(populatedMessage);

    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).json({ message: 'Server error editing message.' });
    }
});

router.delete('/message/:messageId', authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        // Ensure the user trying to delete is the sender of the message
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this message.' });
        }

        // Soft delete: mark message as deleted
        message.isDeleted = true; // Add an 'isDeleted' field to your Message schema (boolean, default false)
        message.content = 'This message was deleted.'; // Change content for display
        // We keep mediaUrl for potential hard delete later if needed, but remove from display logic
        // message.mediaUrl = undefined; // Do not clear mediaUrl here if you want to perform hard delete later
        message.mediaType = undefined; // Clear media type for display purposes
        await message.save();

        // Populate sender details for the response
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatarUrl');

        // Emit update via Socket.IO to the conversation
        // This will tell all participants that a message was deleted
        req.app.get('io').to(message.conversationId.toString()).emit('messageDeleted', {
            messageId: message._id,
            conversationId: message.conversationId,
            // Send the updated content and isDeleted status
            content: populatedMessage.content,
            isDeleted: populatedMessage.isDeleted,
        });

        res.status(200).json({ message: 'Message deleted successfully (soft delete).', deletedMessage: populatedMessage });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Server error deleting message.' });
    }
});

// NEW ROUTE: DELETE /api/chats/messages/:conversationId/all - Delete ALL messages in a conversation
// router.delete('/messages/:conversationId/all', authMiddleware, async (req, res) => {
//     try {
//         const { conversationId } = req.params;
//         const userId = req.user.id;

//         const conversation = await Conversation.findById(conversationId);

//         if (!conversation) {
//             return res.status(404).json({ message: 'Conversation not found.' });
//         }

//         // Ensure the current user is a participant of the conversation
//         if (!conversation.participants.includes(userId)) {
//             return res.status(403).json({ message: 'You are not authorized to delete messages in this conversation.' });
//         }

//         // Find all messages in the conversation that belong to the current user
//         const messagesToDelete = await Message.find({ conversationId, sender: userId });

//         // Delete associated media files from the server for messages owned by the current user
//         for (const message of messagesToDelete) {
//             if (message.mediaUrl) {
//                 deleteFile(message.mediaUrl);
//             }
//         }

//         // Soft delete all messages in the conversation from the current user's perspective
//         // This will mark only the sender's messages as deleted from their view,
//         // or if you want to clear the conversation for both participants (which means
//         // marking *all* messages in that conversation as deleted, regardless of sender),
//         // you would remove `sender: userId` from the `updateMany` filter.
//         await Message.updateMany(
//             { conversationId, sender: userId }, // Mark only current user's messages as deleted
//             { $set: { isDeleted: true, content: 'This message was deleted.', mediaUrl: undefined, mediaType: undefined } } // Mark as deleted and clear content/media for display
//         );

//         // Update the lastMessage in the conversation to reflect that messages were cleared
//         // This 'lastMessage' change will only be relevant if the conversation still exists
//         // and its last message was one of the ones deleted by the user.
//         // It's a common practice to update it to a generic message after bulk deletion.
//         const latestRemainingMessage = await Message.findOne({ conversationId, isDeleted: false }).sort({ createdAt: -1 });

//         if (latestRemainingMessage) {
//             conversation.lastMessage = {
//                 sender: latestRemainingMessage.sender,
//                 content: latestRemainingMessage.content,
//                 createdAt: latestRemainingMessage.createdAt,
//                 mediaType: latestRemainingMessage.mediaType || undefined,
//             };
//         } else {
//             // If no messages remain or all are deleted, set a generic last message
//             conversation.lastMessage = {
//                 sender: null,
//                 content: 'Conversation cleared.', // More generic for all messages
//                 createdAt: new Date(),
//                 mediaType: undefined,
//             };
//         }
        
//         conversation.updatedAt = new Date();
//         await conversation.save();

//         // Emit update via Socket.IO to the conversation
//         // This will tell all participants that messages were cleared (from the perspective of the user who cleared them)
//         req.app.get('io').to(conversation._id.toString()).emit('messagesCleared', {
//             conversationId: conversation._id,
//             clearedBy: userId,
//         });

//         res.status(200).json({ message: 'All your messages in this conversation have been deleted.' });

//     } catch (error) {
//         console.error('Error deleting all messages:', error);
//         res.status(500).json({ message: 'Server error deleting all messages.' });
//     }
// });

router.delete('/messages/:conversationId/all', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id; // Assuming authMiddleware attaches user ID

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        // Ensure the current user is a participant of the conversation
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ message: 'You are not authorized to delete messages in this conversation.' });
        }

        // --- CRUCIAL CHANGE HERE ---
        // Option 1: Mark ALL messages in the conversation as deleted (soft delete for everyone)
        // This is generally safer than hard deleting for everyone if you need message history
        // or for moderation purposes.
        await Message.updateMany(
            { conversationId: conversationId }, // <--- REMOVED `sender: userId` to target ALL messages
            { $set: { isDeleted: true, content: 'This message was deleted.', mediaUrl: undefined, mediaType: undefined, isEdited: false } }
        );

        // If you truly want to HARD DELETE all messages from the database for everyone,
        // you would replace the above updateMany with:
        // const hardDeleteResult = await Message.deleteMany({ conversationId: conversationId });
        // console.log(`Hard deleted ${hardDeleteResult.deletedCount} messages for everyone.`);
        // Note: If you hard delete, the file deletion loop above becomes more critical,
        // as you wouldn't be able to retrieve mediaUrl from the Message model anymore.


        // --- Handling Media Files (Important for Hard Delete) ---
        // If you implement a **hard delete** for all messages (i.e., `Message.deleteMany({ conversationId: conversationId })`),
        // then you MUST fetch `messagesToDelete` BEFORE the `deleteMany` call.
        // For the soft delete shown above, `messagesToDelete` still correctly holds the sender's messages.
        // If you want to delete *all* media files from *all* messages in the conversation when a user "clears" it,
        // regardless of sender, then you'd change the `Message.find` query too.
        //
        // Example for deleting ALL media files if you intend to clear the whole conversation:
        const allMessagesInConversation = await Message.find({ conversationId });
        for (const message of allMessagesInConversation) {
            if (message.mediaUrl) {
                // Ensure `deleteFile` handles potential errors and is robust.
                deleteFile(message.mediaUrl);
            }
        }


        // Update the lastMessage in the conversation
        // After soft-deleting all messages, there won't be any "remaining" non-deleted messages.
        // So, the lastMessage should reflect the conversation being cleared.
        conversation.lastMessage = {
            sender: null, // No specific sender for a "cleared conversation" message
            content: 'Conversation cleared.',
            createdAt: new Date(),
            mediaType: undefined,
        };

        conversation.updatedAt = new Date();
        await conversation.save();

        // Emit update via Socket.IO to the conversation
        // This will notify ALL participants in the conversation that messages were cleared.
        req.app.get('io').to(conversation._id.toString()).emit('messagesCleared', {
            conversationId: conversation._id,
            clearedBy: userId, // Still useful to know who initiated the clear
            // You might want to include a flag like `clearedForAll: true` here
        });

        res.status(200).json({ message: 'All messages in this conversation have been deleted for everyone.' });

    } catch (error) {
        console.error('Error deleting all messages:', error);
        res.status(500).json({ message: 'Server error deleting all messages.' });
    }
});

module.exports = router;
