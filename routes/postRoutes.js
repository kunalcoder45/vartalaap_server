// // const express = require('express');
// // const router = express.Router();
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs').promises; // Use fs.promises for async/await file operations
// // const Post = require('../models/Post');
// // const Comment = require('../models/Comment'); 
// // const User = require('../models/User.js');
// // const authenticate = require('../middleware/authMiddleware'); // Use our unified authenticate middleware

// // // Define the base URL for the backend to correctly generate media URLs
// // // IMPORTANT: This should be used when *sending* URLs to the client, not when storing paths.
// // const BACKEND_URL = process.env.BACKEND_URL || 'https://vartalaap-r36o.onrender.com';

// // // Multer storage configuration
// // const storage = multer.diskStorage({
// //     destination: async (req, file, cb) => { // Made async to use await for fs.mkdir
// //         const uploadPath = path.join(__dirname, '..', 'uploads');
// //         try {
// //             await fs.mkdir(uploadPath, { recursive: true }); // Ensure directory exists
// //             cb(null, uploadPath);
// //         } catch (error) {
// //             console.error('Error creating upload directory:', error);
// //             cb(error); // Pass error to Multer
// //         }
// //     },
// //     filename: (req, file, cb) => {
// //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
// //         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
// //     }
// // });

// // const upload = multer({
// //     storage,
// //     limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB file size limit
// //     fileFilter: (req, file, cb) => {
// //         if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
// //             cb(null, true);
// //         } else {
// //             // Pass an error object to cb for Multer to handle
// //             cb(new Error('Only image and video files are allowed!'), false);
// //         }
// //     }
// // });

// // // GET /api/posts - Fetch all posts (public feed)
// // router.get('/', async (req, res) => {
// //     try {
// //         const posts = await Post.find()
// //             .populate('author', 'name email avatarUrl firebaseUid bio')
// //             .sort({ createdAt: -1 })
// //             .limit(50);
// //         res.json(posts);
// //     } catch (error) {
// //         console.error('Error fetching all posts:', error.message);
// //         res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
// //     }
// // });

// // // GET /api/posts/user/:firebaseUid - Fetch posts by a specific user (public access)
// // router.get('/user/:firebaseUid', async (req, res) => {
// //     try {
// //         const { firebaseUid } = req.params;
// //         const user = await User.findOne({ firebaseUid });
// //         if (!user) {
// //             return res.status(404).json({ message: 'User not found.' });
// //         }

// //         const posts = await Post.find({ author: user._id })
// //             .populate('author', 'name email avatarUrl firebaseUid bio')
// //             .sort({ createdAt: -1 });
// //         res.json(posts);
// //     } catch (error) {
// //         console.error('Error fetching user-specific posts:', error.message);
// //         res.status(500).json({ message: 'Failed to fetch user posts', error: error.message });
// //     }
// // });

// // // POST /api/posts - Create a new post (Protected by authenticate)
// // router.post('/', authenticate, upload.single('media'), async (req, res) => {
// //     try {
// //         // req.user is now populated by 'authenticate' middleware with Firebase and MongoDB user info
// //         const { uid, _id: mongoUserId, name, email, avatarUrl } = req.user;
// //         const { text } = req.body; // Remove mediaType here as it's derived from req.file.mimetype or default

// //         let user = await User.findById(mongoUserId); // Use mongoUserId as it's guaranteed to exist
// //         if (!user) { // Should ideally not happen if authenticate passes
// //             return res.status(404).json({ message: 'Authenticated user not found in database.' });
// //         }

// //         const postData = {
// //             author: user._id,
// //             text: text || '',
// //             likes: [],
// //             sharesBy: [],
// //             comments: []
// //         };

// //         if (req.file) {
// //             // Store only the relative path in the database
// //             postData.mediaUrl = `/uploads/${req.file.filename}`;
// //             postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
// //         }

// //         const newPost = new Post(postData);
// //         await newPost.save();
// //         await newPost.populate('author', 'name email avatarUrl firebaseUid bio');

// //         // Modify the post object to return the full URL for media to the client
// //         const postToReturn = { ...newPost.toObject() }; // Convert Mongoose document to plain object
// //         if (postToReturn.mediaUrl) {
// //             postToReturn.mediaUrl = `${BACKEND_URL}${postToReturn.mediaUrl}`;
// //         }

// //         res.status(201).json({ message: 'Post created successfully', post: postToReturn });
// //     } catch (error) {
// //         console.error('Error creating post:', error.message);
// //         // If an error occurs during post creation (e.g., DB error), clean up uploaded file
// //         if (req.file) {
// //             try {
// //                 await fs.unlink(req.file.path);
// //                 console.log('Cleaned up uploaded file:', req.file.path);
// //             } catch (unlinkErr) {
// //                 console.error('Error deleting uploaded file after post creation failure:', req.file.path, unlinkErr);
// //             }
// //         }
// //         res.status(500).json({ message: 'Failed to create post', error: error.message });
// //     }
// // });

// // // PUT /api/posts/:id - Edit an existing post (Protected by authenticate, Author-only)
// // router.put('/:id', authenticate, upload.single('media'), async (req, res) => {
// //     try {
// //         const postId = req.params.id;
// //         const { text, removeMedia } = req.body;
// //         const userId = req.user._id; // MongoDB user ID from authenticate middleware

// //         const post = await Post.findById(postId);

// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         // Check if the authenticated user is the author of the post (using MongoDB _id)
// //         if (post.author.toString() !== userId.toString()) {
// //             return res.status(403).json({ message: 'Not authorized to update this post' });
// //         }

// //         // Update text if provided
// //         if (text !== undefined) { // Check for undefined, allowing empty string as valid update
// //             post.text = text;
// //         }

// //         // Handle media update/removal
// //         if (req.file) {
// //             // Delete old media if it exists
// //             if (post.mediaUrl) {
// //                 const oldMediaPath = path.join(__dirname, '..', post.mediaUrl);
// //                 try {
// //                     await fs.unlink(oldMediaPath);
// //                 } catch (unlinkError) {
// //                     console.warn('Could not delete old media file (might not exist):', oldMediaPath, unlinkError.message);
// //                 }
// //             }
// //             // Store new relative path and type
// //             post.mediaUrl = `/uploads/${req.file.filename}`;
// //             post.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
// //         } else if (removeMedia === 'true') {
// //             // If removeMedia flag is sent and no new file is uploaded
// //             if (post.mediaUrl) {
// //                 const oldMediaPath = path.join(__dirname, '..', post.mediaUrl);
// //                 try {
// //                     await fs.unlink(oldMediaPath);
// //                 } catch (unlinkError) {
// //                     console.warn('Could not delete media on explicit removal (might not exist):', oldMediaPath, unlinkError.message);
// //                 }
// //             }
// //             post.mediaUrl = null; // Clear media reference
// //             post.mediaType = null;
// //         }


// //         const updatedPost = await post.save();

// //         // Populate author field for response
// //         await updatedPost.populate('author', 'name avatarUrl firebaseUid');

// //         // Modify the post object to return the full URL for media to the client
// //         const postToReturn = { ...updatedPost.toObject() };
// //         if (postToReturn.mediaUrl) {
// //             postToReturn.mediaUrl = `${BACKEND_URL}${postToReturn.mediaUrl}`;
// //         }

// //         res.status(200).json({
// //             message: 'Post updated successfully',
// //             post: postToReturn,
// //         });

// //     } catch (error) {
// //         console.error('Error updating post:', error);
// //         // If an error occurred after file upload but before DB save, clean up
// //         if (req.file) {
// //             try {
// //                 await fs.unlink(req.file.path);
// //             } catch (unlinkErr) {
// //                 console.error('Error deleting uploaded file after update failure:', req.file.path, unlinkErr);
// //             }
// //         }
// //         if (error.name === 'CastError' && error.kind === 'ObjectId') {
// //             return res.status(400).json({ message: 'Invalid Post ID' });
// //         }
// //         // For multer errors (e.g., file size limit exceeded)
// //         if (error instanceof multer.MulterError) {
// //             return res.status(400).json({ message: `Upload error: ${error.message}` });
// //         }
// //         res.status(500).json({ message: 'Server Error' });
// //     }
// // });


// // // DELETE /api/posts/:postId - Delete a post (Protected by authenticate, Author-only)
// // router.delete('/:postId', authenticate, async (req, res) => {
// //     try {
// //         const { postId } = req.params;
// //         const userId = req.user._id; // MongoDB user ID from authenticate middleware

// //         const post = await Post.findById(postId).populate('author', 'firebaseUid');
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found.' });
// //         }

// //         // Authorization Check: Ensure the logged-in user is the author of the post (using MongoDB _id)
// //         if (post.author._id.toString() !== userId.toString()) { // Compare MongoDB _id
// //             return res.status(403).json({ message: 'You are not authorized to delete this post.' });
// //         }

// //         // If the post has associated media, delete the file from the server
// //         if (post.mediaUrl) {
// //             // Assume mediaUrl is a relative path like '/uploads/filename.jpg'
// //             const filePath = path.join(__dirname, '..', post.mediaUrl);
// //             try {
// //                 await fs.unlink(filePath); // Use fs.promises.unlink for async delete
// //                 console.log('Successfully deleted associated media file:', filePath);
// //             } catch (unlinkError) {
// //                 console.warn('Could not delete associated media file (might not exist):', filePath, unlinkError.message);
// //                 // Log warning but continue, as the main goal is to delete the DB entry
// //             }
// //         }

// //         // Delete the post from the database
// //         await Post.deleteOne({ _id: postId });

// //         res.json({ message: 'Post deleted successfully.' });

// //     } catch (error) {
// //         console.error('Error deleting post:', error.message);
// //         if (error.name === 'CastError' && error.kind === 'ObjectId') {
// //             return res.status(400).json({ message: 'Invalid Post ID' });
// //         }
// //         res.status(500).json({ message: 'Failed to delete post', error: error.message });
// //     }
// // });

// // // POST /api/posts/:postId/like - Like/unlike a post (Protected by authenticate)
// // router.post('/:postId/like', authenticate, async (req, res) => {
// //     try {
// //         const { uid } = req.user; // Firebase UID from authenticate middleware
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         const hasLiked = post.likes.includes(uid);

// //         if (hasLiked) {
// //             post.likes = post.likes.filter(id => id !== uid);
// //         } else {
// //             post.likes.push(uid);
// //         }

// //         await post.save();

// //         res.json({
// //             updatedLikes: post.likes.length,
// //             isNowLiked: !hasLiked,
// //             message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully'
// //         });
// //     } catch (error) {
// //         console.error('Error liking/unliking post:', error.message);
// //         res.status(500).json({ message: 'Failed to like/unlike post', error: error.message });
// //     }
// // });

// // // GET /api/posts/:postId/check-like - Check if current user has liked a post (Protected by authenticate)
// // router.get('/:postId/check-like', authenticate, async (req, res) => {
// //     try {
// //         const { uid } = req.user; // Firebase UID from authenticate middleware
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         const isLiked = post.likes.includes(uid);
// //         res.json({ isLiked });
// //     } catch (error) {
// //         console.error('Error checking like status:', error.message);
// //         res.status(500).json({ message: 'Error checking like status', error: error.message });
// //     }
// // });

// // // POST /api/posts/:postId/share - Record a post share (Protected by authenticate)
// // router.post('/:postId/share', authenticate, async (req, res) => {
// //     try {
// //         const { uid } = req.user; // Firebase UID from authenticate middleware
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         if (post.sharesBy.includes(uid)) {
// //             return res.json({
// //                 message: 'Post already shared by this user.',
// //                 updatedShares: post.sharesBy.length
// //             });
// //         }

// //         post.sharesBy.push(uid);
// //         await post.save();

// //         res.json({ message: 'Post shared successfully.', updatedShares: post.sharesBy.length });
// //     } catch (error) {
// //         console.error('Error sharing post:', error.message);
// //         res.status(500).json({ message: 'Failed to share post', error: error.message });
// //     }
// // });

// // // GET /api/posts/:postId/comments - Fetch comments for a post (Public)
// // router.get('/:postId/comments', async (req, res) => {
// //     try {
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId)
// //             .select('comments')
// //             .populate({
// //                 path: 'comments.user',
// //                 select: 'name avatarUrl firebaseUid',
// //                 strictPopulate: false
// //             });

// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found.' });
// //         }

// //         const formattedComments = post.comments.map(comment => ({
// //             _id: comment._id,
// //             text: comment.text,
// //             createdAt: comment.createdAt,
// //             authorId: comment.user?._id,
// //             authorName: comment.user?.name,
// //             authorAvatarUrl: comment.user?.avatarUrl // This will be the relative path
// //         }));

// //         // Manually prepend BACKEND_URL to avatarUrl for comments
// //         const commentsToReturn = formattedComments.map(comment => ({
// //             ...comment,
// //             authorAvatarUrl: comment.authorAvatarUrl ? `${BACKEND_URL}${comment.authorAvatarUrl}` : `${BACKEND_URL}/avatars/userLogo.png`
// //         }));


// //         res.status(200).json(commentsToReturn);
// //     } catch (error) {
// //         console.error('Error fetching comments for post:', error.message);
// //         res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
// //     }
// // });

// // // POST /api/posts/:postId/comments - Post a new comment (Protected by authenticate)
// // router.post('/:postId/comments', authenticate, async (req, res) => {
// //     try {
// //         const { postId } = req.params;
// //         const { text } = req.body;
// //         const { _id: mongoUserId, uid: firebaseUid } = req.user; // Get MongoDB _id and Firebase UID from req.user

// //         if (!text || text.trim() === '') {
// //             return res.status(400).json({ message: 'Comment text cannot be empty.' });
// //         }

// //         const user = await User.findById(mongoUserId); // Use the MongoDB ID
// //         if (!user) { // Should not happen if authenticate passes
// //             return res.status(404).json({ message: 'User not found in database.' });
// //         }

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found.' });
// //         }

// //         const newComment = {
// //             user: user._id, // Store MongoDB user ID
// //             text: text,
// //             createdAt: new Date()
// //         };

// //         post.comments.push(newComment);
// //         await post.save();

// //         // Populate the specific new comment's user for the response
// //         await post.populate({
// //             path: `comments.${post.comments.length - 1}.user`,
// //             select: 'name avatarUrl firebaseUid'
// //         });

// //         const savedComment = post.comments[post.comments.length - 1];

// //         const responseComment = {
// //             _id: savedComment._id,
// //             text: savedComment.text,
// //             createdAt: savedComment.createdAt,
// //             authorId: savedComment.user._id,
// //             authorName: savedComment.user.name,
// //             // Ensure avatarUrl is a full URL for the frontend
// //             authorAvatarUrl: savedComment.user.avatarUrl ? `${BACKEND_URL}${savedComment.user.avatarUrl}` : `${BACKEND_URL}/avatars/userLogo.png`
// //         };

// //         return res.status(201).json(responseComment);

// //     } catch (error) {
// //         console.error('Error posting comment:', error.message);
// //         return res.status(500).json({ message: 'Failed to post comment.', error: error.message });
// //     }
// // });

// // // PUT /api/posts/:postId/comments/:commentId - Edit a specific comment (Protected, Author-only)
// // // router.put('/:postId/comments/:commentId', authenticate, async (req, res) => {
// // //     try {
// // //         const { postId, commentId } = req.params;
// // //         const { text } = req.body;
// // //         const userId = req.user._id; // MongoDB _id of the authenticated user

// // //         console.log("------------------------------------------");
// // //         console.log("Backend: Received PUT request for comment edit.");
// // //         console.log("  Extracted postId from params:", postId);
// // //         console.log("  Extracted commentId from params:", commentId);
// // //         console.log("  New text from body:", text);
// // //         console.log("  Authenticated user ID (req.user._id):", userId);
// // //         console.log("------------------------------------------");


// // //         if (!text || text.trim() === '') {
// // //             return res.status(400).json({ message: 'Comment text cannot be empty.' });
// // //         }

// // //         // Step 1: Find the Comment Document Directly
// // //         const comment = await Comment.findById(commentId); // This is where it's failing

// // //         console.log("Result of Comment.findById(commentId):", comment); // <-- CRITICAL LOG

// // //         if (!comment) {
// // //             console.warn(`Backend: Comment with ID ${commentId} not found.`); // Add warning
// // //             return res.status(404).json({ message: 'Comment not found.' });
// // //         }

// // //         // Step 2: Verify Comment Belongs to Post (Important for data integrity)
// // //         console.log("Comment's postId:", comment.postId.toString());
// // //         console.log("URL's postId:", postId);
// // //         if (comment.postId.toString() !== postId) {
// // //             console.warn(`Backend: Comment ${commentId} does not belong to post ${postId}.`);
// // //             return res.status(400).json({ message: 'Comment does not belong to this post.' });
// // //         }

// // //         // Step 3: Authorization Check (User owns the comment)
// // //         console.log("Comment author ID:", comment.author.toString());
// // //         console.log("Authenticated user ID:", userId.toString());
// // //         if (comment.author.toString() !== userId.toString()) {
// // //             console.warn(`Backend: User ${userId} not authorized to edit comment ${commentId}. Author: ${comment.author}`);
// // //             return res.status(403).json({ message: 'Not authorized to edit this comment.' });
// // //         }

// // //         // If we reach here, comment is found and authorized
// // //         comment.text = text.trim();
// // //         await comment.save();

// // //         // Populate author information for the response (if you want it returned)
// // //         await comment.populate('author', 'name avatarUrl firebaseUid');

// // //         // Format the avatar URL for the response
// // //         const commentToReturn = comment.toObject();
// // //         const originalAvatarUrl = commentToReturn.author.avatarUrl;
// // //         // Assuming BACKEND_URL is defined somewhere accessible here (e.g., in your config)
// // //         const BACKEND_URL = process.env.BACKEND_URL || 'https://vartalaap-r36o.onrender.com'; // Make sure this is correctly defined

// // //         if (originalAvatarUrl && !originalAvatarUrl.startsWith('http') && !originalAvatarUrl.startsWith('data:')) {
// // //             commentToReturn.author.avatarUrl = `<span class="math-inline">\{BACKEND\_URL\}</span>{originalAvatarUrl.startsWith('/') ? originalAvatarUrl : '/' + originalAvatarUrl}`;
// // //         } else if (!originalAvatarUrl) {
// // //             commentToReturn.author.avatarUrl = `${BACKEND_URL}/avatars/userLogo.png`;
// // //         }

// // //         console.log("Backend: Comment successfully updated:", commentToReturn._id);
// // //         res.status(200).json({ message: 'Comment updated successfully.', comment: commentToReturn });

// // //     } catch (error) {
// // //         console.error('Backend: Error editing comment:', error);
// // //         if (error.name === 'CastError') {
// // //             return res.status(400).json({ message: 'Invalid Comment ID format. Please check the ID.' });
// // //         }
// // //         res.status(500).json({ message: 'Failed to edit comment', error: error.message });
// // //     }
// // // });

// // // // DELETE /api/posts/:postId/comments/:commentId - Delete a specific comment (Protected, Author-only)
// // // router.delete('/:postId/comments/:commentId', authenticate, async (req, res) => {
// // //     try {
// // //         const { postId, commentId } = req.params;
// // //         const userId = req.user._id; // MongoDB _id of the authenticated user

// // //         // Find the comment directly
// // //         const comment = await Comment.findById(commentId);

// // //         if (!comment) {
// // //             return res.status(404).json({ message: 'Comment not found.' });
// // //         }

// // //         // Check if the comment actually belongs to the specified post (important for integrity)
// // //         if (comment.postId.toString() !== postId) {
// // //             return res.status(400).json({ message: 'Comment does not belong to this post.' });
// // //         }

// // //         // Authorization Check: Ensure the authenticated user is the author of the comment
// // //         if (comment.author.toString() !== userId.toString()) {
// // //             return res.status(403).json({ message: 'Not authorized to delete this comment.' });
// // //         }

// // //         // Remove the comment ID from the Post's comments array
// // //         await Post.findByIdAndUpdate(postId, {
// // //             $pull: { comments: commentId }
// // //         });

// // //         // Delete the comment document itself
// // //         await Comment.deleteOne({ _id: commentId });

// // //         res.status(200).json({ message: 'Comment deleted successfully.' }); // Return 200 with message or 204 No Content

// // //     } catch (error) {
// // //         console.error('Error deleting comment:', error);
// // //         if (error.name === 'CastError') {
// // //             return res.status(400).json({ message: 'Invalid Post ID or Comment ID' });
// // //         }
// // //         res.status(500).json({ message: 'Failed to delete comment', error: error.message });
// // //     }
// // // });

// // module.exports = router;








// // const express = require('express');
// // const router = express.Router();
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs').promises; // Use fs.promises for async/await file operations
// // const Post = require('../models/Post');
// // const Comment = require('../models/Comment'); 
// // const User = require('../models/User.js');
// // const authenticate = require('../middleware/authMiddleware'); // Use our unified authenticate middleware

// // // Define the base URL for the backend to correctly generate media URLs
// // const BACKEND_URL = process.env.BACKEND_URL || 'https://vartalaap-r36o.onrender.com';

// // // Multer storage configuration
// // const storage = multer.diskStorage({
// //     destination: async (req, file, cb) => { // Made async to use await for fs.mkdir
// //         const uploadPath = path.join(__dirname, '..', 'uploads');
// //         try {
// //             await fs.mkdir(uploadPath, { recursive: true }); // Ensure directory exists
// //             cb(null, uploadPath);
// //         } catch (error) {
// //             console.error('Error creating upload directory:', error);
// //             cb(error); // Pass error to Multer
// //         }
// //     },
// //     filename: (req, file, cb) => {
// //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
// //         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
// //     }
// // });

// // const upload = multer({
// //     storage,
// //     limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB file size limit
// //     fileFilter: (req, file, cb) => {
// //         if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
// //             cb(null, true);
// //         } else {
// //             cb(new Error('Only image and video files are allowed!'), false);
// //         }
// //     }
// // });

// // // Helper function to format post objects with full media URLs
// // const formatPostForClient = (post) => {
// //     const postToReturn = { ...post.toObject() };
// //     if (postToReturn.mediaUrl && !postToReturn.mediaUrl.startsWith('http')) {
// //         postToReturn.mediaUrl = `${BACKEND_URL}${postToReturn.mediaUrl}`;
// //     }
// //     // Also handle author avatar if it's a relative path
// //     if (postToReturn.author && postToReturn.author.avatarUrl && !postToReturn.author.avatarUrl.startsWith('http')) {
// //         postToReturn.author.avatarUrl = `${BACKEND_URL}${postToReturn.author.avatarUrl}`;
// //     } else if (postToReturn.author && !postToReturn.author.avatarUrl) {
// //         postToReturn.author.avatarUrl = `${BACKEND_URL}/avatars/userLogo.png`; // Default avatar
// //     }
// //     return postToReturn;
// // };


// // // GET /api/posts - Fetch all posts (public feed)
// // router.get('/', async (req, res) => {
// //     try {
// //         const posts = await Post.find()
// //             .populate('author', 'name email avatarUrl firebaseUid bio')
// //             .sort({ createdAt: -1 })
// //             .limit(50);
        
// //         const formattedPosts = posts.map(formatPostForClient); // Format URLs before sending
// //         res.json(formattedPosts);
// //     } catch (error) {
// //         console.error('Error fetching all posts:', error.message);
// //         res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
// //     }
// // });

// // // NEW ENDPOINT: GET /api/posts/videos - Fetch only video posts (reels)
// // // This endpoint will be used by your ReelsFeed component
// // router.get('/videos', authenticate, async (req, res) => { // Authenticate for reels too
// //     try {
// //         const videoPosts = await Post.find({ mediaType: 'video' })
// //             .populate('author', 'name avatarUrl firebaseUid') // Populate necessary author info
// //             .sort({ createdAt: -1 }) // Sort by latest first
// //             .limit(20); // Limit number of reels for performance

// //         const formattedVideoPosts = videoPosts.map(formatPostForClient); // Format URLs
// //         res.json(formattedVideoPosts);
// //     } catch (error) {
// //         console.error('Error fetching video posts (reels):', error.message);
// //         res.status(500).json({ message: 'Failed to fetch video posts', error: error.message });
// //     }
// // });


// // // GET /api/posts/user/:firebaseUid - Fetch posts by a specific user (public access)
// // router.get('/user/:firebaseUid', async (req, res) => {
// //     try {
// //         const { firebaseUid } = req.params;
// //         const user = await User.findOne({ firebaseUid });
// //         if (!user) {
// //             return res.status(404).json({ message: 'User not found.' });
// //         }

// //         const posts = await Post.find({ author: user._id })
// //             .populate('author', 'name email avatarUrl firebaseUid bio')
// //             .sort({ createdAt: -1 });
        
// //         const formattedPosts = posts.map(formatPostForClient);
// //         res.json(formattedPosts);
// //     } catch (error) {
// //         console.error('Error fetching user-specific posts:', error.message);
// //         res.status(500).json({ message: 'Failed to fetch user posts', error: error.message });
// //     }
// // });

// // // POST /api/posts - Create a new post (Protected by authenticate)
// // router.post('/', authenticate, upload.single('media'), async (req, res) => {
// //     try {
// //         const { uid, _id: mongoUserId } = req.user;
// //         const { text } = req.body; 

// //         let user = await User.findById(mongoUserId);
// //         if (!user) {
// //             return res.status(404).json({ message: 'Authenticated user not found in database.' });
// //         }

// //         const postData = {
// //             author: user._id,
// //             text: text || '',
// //             likes: [],
// //             sharesBy: [],
// //             comments: []
// //         };

// //         if (req.file) {
// //             postData.mediaUrl = `/uploads/${req.file.filename}`;
// //             postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
// //         }

// //         const newPost = new Post(postData);
// //         await newPost.save();
// //         await newPost.populate('author', 'name email avatarUrl firebaseUid bio');

// //         const postToReturn = formatPostForClient(newPost); // Use helper

// //         res.status(201).json({ message: 'Post created successfully', post: postToReturn });
// //     } catch (error) {
// //         console.error('Error creating post:', error.message);
// //         if (req.file) {
// //             try {
// //                 await fs.unlink(req.file.path);
// //                 console.log('Cleaned up uploaded file:', req.file.path);
// //             } catch (unlinkErr) {
// //                 console.error('Error deleting uploaded file after post creation failure:', req.file.path, unlinkErr);
// //             }
// //         }
// //         res.status(500).json({ message: 'Failed to create post', error: error.message });
// //     }
// // });

// // // PUT /api/posts/:id - Edit an existing post (Protected by authenticate, Author-only)
// // router.put('/:id', authenticate, upload.single('media'), async (req, res) => {
// //     try {
// //         const postId = req.params.id;
// //         const { text, removeMedia } = req.body;
// //         const userId = req.user._id;

// //         const post = await Post.findById(postId);

// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         if (post.author.toString() !== userId.toString()) {
// //             return res.status(403).json({ message: 'Not authorized to update this post' });
// //         }

// //         if (text !== undefined) {
// //             post.text = text;
// //         }

// //         if (req.file) {
// //             if (post.mediaUrl) {
// //                 const oldMediaPath = path.join(__dirname, '..', post.mediaUrl);
// //                 try {
// //                     await fs.unlink(oldMediaPath);
// //                 } catch (unlinkError) {
// //                     console.warn('Could not delete old media file (might not exist):', oldMediaPath, unlinkError.message);
// //                 }
// //             }
// //             post.mediaUrl = `/uploads/${req.file.filename}`;
// //             post.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
// //         } else if (removeMedia === 'true') {
// //             if (post.mediaUrl) {
// //                 const oldMediaPath = path.join(__dirname, '..', post.mediaUrl);
// //                 try {
// //                     await fs.unlink(oldMediaPath);
// //                 } catch (unlinkError) {
// //                     console.warn('Could not delete media on explicit removal (might not exist):', oldMediaPath, unlinkError.message);
// //                 }
// //             }
// //             post.mediaUrl = null;
// //             post.mediaType = null;
// //         }

// //         const updatedPost = await post.save();

// //         await updatedPost.populate('author', 'name avatarUrl firebaseUid');

// //         const postToReturn = formatPostForClient(updatedPost); // Use helper

// //         res.status(200).json({
// //             message: 'Post updated successfully',
// //             post: postToReturn,
// //         });

// //     } catch (error) {
// //         console.error('Error updating post:', error);
// //         if (req.file) {
// //             try {
// //                 await fs.unlink(req.file.path);
// //             } catch (unlinkErr) {
// //                 console.error('Error deleting uploaded file after update failure:', req.file.path, unlinkErr);
// //             }
// //         }
// //         if (error.name === 'CastError' && error.kind === 'ObjectId') {
// //             return res.status(400).json({ message: 'Invalid Post ID' });
// //         }
// //         if (error instanceof multer.MulterError) {
// //             return res.status(400).json({ message: `Upload error: ${error.message}` });
// //         }
// //         res.status(500).json({ message: 'Server Error' });
// //     }
// // });


// // // DELETE /api/posts/:postId - Delete a post (Protected by authenticate, Author-only)
// // router.delete('/:postId', authenticate, async (req, res) => {
// //     try {
// //         const { postId } = req.params;
// //         const userId = req.user._id;

// //         const post = await Post.findById(postId).populate('author', 'firebaseUid');
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found.' });
// //         }

// //         if (post.author._id.toString() !== userId.toString()) {
// //             return res.status(403).json({ message: 'You are not authorized to delete this post.' });
// //         }

// //         if (post.mediaUrl) {
// //             const filePath = path.join(__dirname, '..', post.mediaUrl);
// //             try {
// //                 await fs.unlink(filePath);
// //                 console.log('Successfully deleted associated media file:', filePath);
// //             } catch (unlinkError) {
// //                 console.warn('Could not delete associated media file (might not exist):', filePath, unlinkError.message);
// //             }
// //         }

// //         await Post.deleteOne({ _id: postId });

// //         res.json({ message: 'Post deleted successfully.' });

// //     } catch (error) {
// //         console.error('Error deleting post:', error.message);
// //         if (error.name === 'CastError' && error.kind === 'ObjectId') {
// //             return res.status(400).json({ message: 'Invalid Post ID' });
// //         }
// //         res.status(500).json({ message: 'Failed to delete post', error: error.message });
// //     }
// // });

// // // POST /api/posts/:postId/like - Like/unlike a post (Protected by authenticate)
// // router.post('/:postId/like', authenticate, async (req, res) => {
// //     try {
// //         const { uid } = req.user;
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         const hasLiked = post.likes.includes(uid);

// //         if (hasLiked) {
// //             post.likes = post.likes.filter(id => id !== uid);
// //         } else {
// //             post.likes.push(uid);
// //         }

// //         await post.save();

// //         res.json({
// //             updatedLikes: post.likes.length,
// //             isNowLiked: !hasLiked,
// //             message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully'
// //         });
// //     } catch (error) {
// //         console.error('Error liking/unliking post:', error.message);
// //         res.status(500).json({ message: 'Failed to like/unlike post', error: error.message });
// //     }
// // });

// // // GET /api/posts/:postId/check-like - Check if current user has liked a post (Protected by authenticate)
// // router.get('/:postId/check-like', authenticate, async (req, res) => {
// //     try {
// //         const { uid } = req.user;
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         const isLiked = post.likes.includes(uid);
// //         res.json({ isLiked });
// //     } catch (error) {
// //         console.error('Error checking like status:', error.message);
// //         res.status(500).json({ message: 'Error checking like status', error: error.message });
// //     }
// // });

// // // POST /api/posts/:postId/share - Record a post share (Protected by authenticate)
// // router.post('/:postId/share', authenticate, async (req, res) => {
// //     try {
// //         const { uid } = req.user;
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found' });
// //         }

// //         if (post.sharesBy.includes(uid)) {
// //             return res.json({
// //                 message: 'Post already shared by this user.',
// //                 updatedShares: post.sharesBy.length
// //             });
// //         }

// //         post.sharesBy.push(uid);
// //         await post.save();

// //         res.json({ message: 'Post shared successfully.', updatedShares: post.sharesBy.length });
// //     } catch (error) {
// //         console.error('Error sharing post:', error.message);
// //         res.status(500).json({ message: 'Failed to share post', error: error.message });
// //     }
// // });

// // // GET /api/posts/:postId/comments - Fetch comments for a post (Public)
// // router.get('/:postId/comments', async (req, res) => {
// //     try {
// //         const { postId } = req.params;

// //         const post = await Post.findById(postId)
// //             .select('comments')
// //             .populate({
// //                 path: 'comments.user',
// //                 select: 'name avatarUrl firebaseUid',
// //                 strictPopulate: false
// //             });

// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found.' });
// //         }

// //         const formattedComments = post.comments.map(comment => ({
// //             _id: comment._id,
// //             text: comment.text,
// //             createdAt: comment.createdAt,
// //             authorId: comment.user?._id,
// //             authorName: comment.user?.name,
// //             authorAvatarUrl: comment.user?.avatarUrl // This will be the relative path
// //         }));

// //         const commentsToReturn = formattedComments.map(comment => ({
// //             ...comment,
// //             authorAvatarUrl: comment.authorAvatarUrl && !comment.authorAvatarUrl.startsWith('http')
// //                 ? `${BACKEND_URL}${comment.authorAvatarUrl}`
// //                 : comment.authorAvatarUrl || `${BACKEND_URL}/avatars/userLogo.png` // Ensure default avatar also has full URL
// //         }));


// //         res.status(200).json(commentsToReturn);
// //     } catch (error) {
// //         console.error('Error fetching comments for post:', error.message);
// //         res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
// //     }
// // });

// // // POST /api/posts/:postId/comments - Post a new comment (Protected by authenticate)
// // router.post('/:postId/comments', authenticate, async (req, res) => {
// //     try {
// //         const { postId } = req.params;
// //         const { text } = req.body;
// //         const { _id: mongoUserId } = req.user;

// //         if (!text || text.trim() === '') {
// //             return res.status(400).json({ message: 'Comment text cannot be empty.' });
// //         }

// //         const user = await User.findById(mongoUserId);
// //         if (!user) {
// //             return res.status(404).json({ message: 'User not found in database.' });
// //         }

// //         const post = await Post.findById(postId);
// //         if (!post) {
// //             return res.status(404).json({ message: 'Post not found.' });
// //         }

// //         const newComment = {
// //             user: user._id,
// //             text: text,
// //             createdAt: new Date()
// //         };

// //         post.comments.push(newComment);
// //         await post.save();

// //         await post.populate({
// //             path: `comments.${post.comments.length - 1}.user`,
// //             select: 'name avatarUrl firebaseUid'
// //         });

// //         const savedComment = post.comments[post.comments.length - 1];

// //         const responseComment = {
// //             _id: savedComment._id,
// //             text: savedComment.text,
// //             createdAt: savedComment.createdAt,
// //             authorId: savedComment.user._id,
// //             authorName: savedComment.user.name,
// //             authorAvatarUrl: savedComment.user.avatarUrl && !savedComment.user.avatarUrl.startsWith('http')
// //                 ? `${BACKEND_URL}${savedComment.user.avatarUrl}`
// //                 : savedComment.user.avatarUrl || `${BACKEND_URL}/avatars/userLogo.png`
// //         };

// //         return res.status(201).json(responseComment);

// //     } catch (error) {
// //         console.error('Error posting comment:', error.message);
// //         return res.status(500).json({ message: 'Failed to post comment.', error: error.message });
// //     }
// // });

// // module.exports = router;


// /// sahi hi hain 

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs').promises; // Use fs.promises for async/await file operations
// const Post = require('../models/Post');
// const Comment = require('../models/Comment');
// const User = require('../models/User.js'); // Ensure this path is correct
// const authenticate = require('../middleware/authMiddleware'); // Use our unified authenticate middleware

// // Define the base URL for the backend to correctly generate media URLs
// // Make sure this matches your backend server's base URL (e.g., https://vartalaap-r36o.onrender.com)
// // It should NOT end with a slash, as the helper function will add it.
// const BACKEND_URL = process.env.BACKEND_URL || 'https://vartalaap-r36o.onrender.com';

// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: async (req, file, cb) => {
//         const uploadPath = path.join(__dirname, '..', 'uploads');
//         try {
//             await fs.mkdir(uploadPath, { recursive: true }); // Ensure directory exists
//             cb(null, uploadPath);
//         } catch (error) {
//             console.error('Error creating upload directory:', error);
//             cb(error); // Pass error to Multer
//         }
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({
//     storage,
//     limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB file size limit
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only image and video files are allowed!'), false);
//         }
//     }
// });

// // Helper function to format post and user objects with full absolute URLs
// const formatUrlForClient = (relativePath) => {
//     if (!relativePath) {
//         return null; // Handle null or empty paths
//     }
//     // If it's already an absolute URL (http/https/data URI), return as is
//     if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
//         return relativePath;
//     }
//     // Ensure BACKEND_URL doesn't have a trailing slash
//     const cleanedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
//     // Ensure relativePath starts with a single leading slash
//     const cleanedRelativePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

//     return `${cleanedBackendUrl}${cleanedRelativePath}`;
// };

// // Main formatting helper for a post object
// const formatPostForClient = (post) => {
//     // Convert Mongoose document to a plain JavaScript object
//     const postToReturn = post.toObject();

//     // Format mediaUrl
//     if (postToReturn.mediaUrl) {
//         postToReturn.mediaUrl = formatUrlForClient(postToReturn.mediaUrl);
//     }

//     // Format author.avatarUrl
//     if (postToReturn.author) {
//         if (postToReturn.author.avatarUrl) {
//             postToReturn.author.avatarUrl = formatUrlForClient(postToReturn.author.avatarUrl);
//         } else {
//             // Set a default avatar URL if none is present for the author
//             // Ensure this default path exists in your 'uploads/avatars' directory
//             postToReturn.author.avatarUrl = formatUrlForClient('/avatars/userLogo.png');
//         }
//     }

//     // Format comments' author avatar URLs if comments are populated
//     if (postToReturn.comments && postToReturn.comments.length > 0) {
//         postToReturn.comments = postToReturn.comments.map(comment => {
//             if (comment.user && comment.user.avatarUrl) {
//                 comment.user.avatarUrl = formatUrlForClient(comment.user.avatarUrl);
//             } else if (comment.user) {
//                 // Default avatar for comment authors
//                 comment.user.avatarUrl = formatUrlForClient('/avatars/userLogo.png');
//             }
//             return comment;
//         });
//     }

//     return postToReturn;
// };


// // GET /api/posts - Fetch all posts (public feed)
// router.get('/', async (req, res) => {
//     try {
//         const posts = await Post.find()
//             .populate('author', 'name email avatarUrl firebaseUid bio') // Populate author details
//             .sort({ createdAt: -1 })
//             .limit(50);

//         const formattedPosts = posts.map(formatPostForClient); // Format URLs before sending
//         res.json(formattedPosts);
//     } catch (error) {
//         console.error('Error fetching all posts:', error.message);
//         res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
//     }
// });

// // GET /api/posts/videos - Fetch only video posts (reels)
// // This endpoint will be used by your ReelsFeed component
// router.get('/videos', authenticate, async (req, res) => { // Authenticate for reels too
//     try {
//         const videoPosts = await Post.find({ mediaType: 'video' })
//             .populate('author', 'name avatarUrl firebaseUid') // Populate necessary author info
//             .sort({ createdAt: -1 }) // Sort by latest first
//             .limit(20); // Limit number of reels for performance

//         const formattedVideoPosts = videoPosts.map(formatPostForClient); // Format URLs
//         res.json(formattedVideoPosts);
//     } catch (error) {
//         console.error('Error fetching video posts (reels):', error.message);
//         res.status(500).json({ message: 'Failed to fetch video posts', error: error.message });
//     }
// });


// // GET /api/posts/user/:firebaseUid - Fetch posts by a specific user (public access)
// router.get('/user/:firebaseUid', async (req, res) => {
//     try {
//         const { firebaseUid } = req.params;
//         const user = await User.findOne({ firebaseUid });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         const posts = await Post.find({ author: user._id })
//             .populate('author', 'name email avatarUrl firebaseUid bio')
//             .sort({ createdAt: -1 });

//         const formattedPosts = posts.map(formatPostForClient);
//         res.json(formattedPosts);
//     } catch (error) {
//         console.error('Error fetching user-specific posts:', error.message);
//         res.status(500).json({ message: 'Failed to fetch user posts', error: error.message });
//     }
// });

// // POST /api/posts - Create a new post (Protected by authenticate)
// router.post('/', authenticate, upload.single('media'), async (req, res) => {
//     try {
//         const { uid, _id: mongoUserId } = req.user;
//         const { text } = req.body;

//         let user = await User.findById(mongoUserId);
//         if (!user) {
//             return res.status(404).json({ message: 'Authenticated user not found in database.' });
//         }

//         const postData = {
//             author: user._id,
//             text: text || '',
//             likes: [],
//             sharesBy: [],
//             comments: []
//         };

//         if (req.file) {
//             postData.mediaUrl = `/uploads/${req.file.filename}`;
//             postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
//         }

//         const newPost = new Post(postData);
//         await newPost.save();
//         // Populate the author directly after saving so it's available for formatting
//         await newPost.populate('author', 'name email avatarUrl firebaseUid bio');

//         const postToReturn = formatPostForClient(newPost); // Use helper to format URLs

//         res.status(201).json({ message: 'Post created successfully', post: postToReturn });
//     } catch (error) {
//         console.error('Error creating post:', error.message);
//         if (req.file) {
//             try {
//                 await fs.unlink(req.file.path);
//                 console.log('Cleaned up uploaded file:', req.file.path);
//             } catch (unlinkErr) {
//                 console.error('Error deleting uploaded file after post creation failure:', req.file.path, unlinkErr);
//             }
//         }
//         res.status(500).json({ message: 'Failed to create post', error: error.message });
//     }
// });

// // PUT /api/posts/:id - Edit an existing post (Protected by authenticate, Author-only)
// router.put('/:id', authenticate, upload.single('media'), async (req, res) => {
//     try {
//         const postId = req.params.id;
//         const { text, removeMedia } = req.body;
//         const userId = req.user._id;

//         const post = await Post.findById(postId);

//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         if (post.author.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'Not authorized to update this post' });
//         }

//         if (text !== undefined) {
//             post.text = text;
//         }

//         if (req.file) {
//             if (post.mediaUrl) {
//                 const oldMediaPath = path.join(__dirname, '..', post.mediaUrl);
//                 try {
//                     await fs.unlink(oldMediaPath);
//                 } catch (unlinkError) {
//                     console.warn('Could not delete old media file (might not exist):', oldMediaPath, unlinkError.message);
//                 }
//             }
//             post.mediaUrl = `/uploads/${req.file.filename}`;
//             post.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
//         } else if (removeMedia === 'true') {
//             if (post.mediaUrl) {
//                 const oldMediaPath = path.join(__dirname, '..', post.mediaUrl);
//                 try {
//                     await fs.unlink(oldMediaPath);
//                 } catch (unlinkError) {
//                     console.warn('Could not delete media on explicit removal (might not exist):', oldMediaPath, unlinkError.message);
//                 }
//             }
//             post.mediaUrl = null;
//             post.mediaType = null;
//         }

//         const updatedPost = await post.save();
//         // Populate after saving to ensure we have the full author object
//         await updatedPost.populate('author', 'name avatarUrl firebaseUid');

//         const postToReturn = formatPostForClient(updatedPost); // Use helper to format URLs

//         res.status(200).json({
//             message: 'Post updated successfully',
//             post: postToReturn,
//         });

//     } catch (error) {
//         console.error('Error updating post:', error);
//         if (req.file) {
//             try {
//                 await fs.unlink(req.file.path);
//             } catch (unlinkErr) {
//                 console.error('Error deleting uploaded file after update failure:', req.file.path, unlinkErr);
//             }
//         }
//         if (error.name === 'CastError' && error.kind === 'ObjectId') {
//             return res.status(400).json({ message: 'Invalid Post ID' });
//         }
//         if (error instanceof multer.MulterError) {
//             return res.status(400).json({ message: `Upload error: ${error.message}` });
//         }
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // DELETE /api/posts/:postId - Delete a post (Protected by authenticate, Author-only)
// router.delete('/:postId', authenticate, async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const userId = req.user._id;

//         const post = await Post.findById(postId).populate('author', 'firebaseUid');
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found.' });
//         }

//         if (post.author._id.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to delete this post.' });
//         }

//         if (post.mediaUrl) {
//             const filePath = path.join(__dirname, '..', post.mediaUrl);
//             try {
//                 await fs.unlink(filePath);
//                 console.log('Successfully deleted associated media file:', filePath);
//             } catch (unlinkError) {
//                 console.warn('Could not delete associated media file (might not exist):', filePath, unlinkError.message);
//             }
//         }

//         await Post.deleteOne({ _id: postId });

//         res.json({ message: 'Post deleted successfully.' });

//     } catch (error) {
//         console.error('Error deleting post:', error.message);
//         if (error.name === 'CastError' && error.kind === 'ObjectId') {
//             return res.status(400).json({ message: 'Invalid Post ID' });
//         }
//         res.status(500).json({ message: 'Failed to delete post', error: error.message });
//     }
// });

// // POST /api/posts/:postId/like - Like/unlike a post (Protected by authenticate)
// router.post('/:postId/like', authenticate, async (req, res) => {
//     try {
//         const { uid } = req.user;
//         const { postId } = req.params;

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const hasLiked = post.likes.includes(uid);

//         if (hasLiked) {
//             post.likes = post.likes.filter(id => id !== uid);
//         } else {
//             post.likes.push(uid);
//         }

//         await post.save();

//         res.json({
//             updatedLikes: post.likes.length,
//             isNowLiked: !hasLiked,
//             message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully'
//         });
//     } catch (error) {
//         console.error('Error liking/unliking post:', error.message);
//         res.status(500).json({ message: 'Failed to like/unlike post', error: error.message });
//     }
// });

// // GET /api/posts/:postId/check-like - Check if current user has liked a post (Protected by authenticate)
// router.get('/:postId/check-like', authenticate, async (req, res) => {
//     try {
//         const { uid } = req.user;
//         const { postId } = req.params;

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const isLiked = post.likes.includes(uid);
//         res.json({ isLiked });
//     } catch (error) {
//         console.error('Error checking like status:', error.message);
//         res.status(500).json({ message: 'Error checking like status', error: error.message });
//     }
// });

// // POST /api/posts/:postId/share - Record a post share (Protected by authenticate)
// router.post('/:postId/share', authenticate, async (req, res) => {
//     try {
//         const { uid } = req.user;
//         const { postId } = req.params;

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         if (post.sharesBy.includes(uid)) {
//             return res.json({
//                 message: 'Post already shared by this user.',
//                 updatedShares: post.sharesBy.length
//             });
//         }

//         post.sharesBy.push(uid);
//         await post.save();

//         res.json({ message: 'Post shared successfully.', updatedShares: post.sharesBy.length });
//     } catch (error) {
//         console.error('Error sharing post:', error.message);
//         res.status(500).json({ message: 'Failed to share post', error: error.message });
//     }
// });

// // GET /api/posts/:postId/comments - Fetch comments for a post (Public)
// router.get('/:postId/comments', async (req, res) => {
//     try {
//         const { postId } = req.params;

//         const post = await Post.findById(postId)
//             .select('comments')
//             .populate({
//                 path: 'comments.user',
//                 select: 'name avatarUrl firebaseUid',
//                 strictPopulate: false // Needed if you have a deeply nested path like this and User might be null
//             });

//         if (!post) {
//             return res.status(404).json({ message: 'Post not found.' });
//         }

//         const formattedComments = post.comments.map(comment => {
//             const commentToReturn = {
//                 _id: comment._id,
//                 text: comment.text,
//                 createdAt: comment.createdAt,
//                 authorId: comment.user?._id,
//                 authorName: comment.user?.name,
//                 authorAvatarUrl: comment.user?.avatarUrl // This will be the relative path initially
//             };
//             // Format the avatar URL for comments
//             commentToReturn.authorAvatarUrl = formatUrlForClient(commentToReturn.authorAvatarUrl) || formatUrlForClient('/avatars/userLogo.png');
//             return commentToReturn;
//         });

//         res.status(200).json(formattedComments);
//     } catch (error) {
//         console.error('Error fetching comments for post:', error.message);
//         res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
//     }
// });

// // POST /api/posts/:postId/comments - Post a new comment (Protected by authenticate)
// router.post('/:postId/comments', authenticate, async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const { text } = req.body;
//         const { _id: mongoUserId } = req.user;

//         if (!text || text.trim() === '') {
//             return res.status(400).json({ message: 'Comment text cannot be empty.' });
//         }

//         const user = await User.findById(mongoUserId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found in database.' });
//         }

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found.' });
//         }

//         const newComment = {
//             user: user._id, // Store ObjectId
//             text: text,
//             createdAt: new Date()
//         };

//         post.comments.push(newComment);
//         await post.save();

//         // Populate the newly added comment's user field
//         // We need to re-fetch or populate the last added comment to get the user's details
//         // A more robust way might be to find the post again or carefully populate the specific subdocument.
//         // For simplicity, let's assume direct population of the last comment works as intended.
//         await post.populate({
//             path: `comments.${post.comments.length - 1}.user`,
//             select: 'name avatarUrl firebaseUid'
//         });

//         const savedComment = post.comments[post.comments.length - 1].toObject(); // Convert to object for modification

//         const responseComment = {
//             _id: savedComment._id,
//             text: savedComment.text,
//             createdAt: savedComment.createdAt,
//             authorId: savedComment.user._id,
//             authorName: savedComment.user.name,
//             // Format the avatar URL using the new helper
//             authorAvatarUrl: formatUrlForClient(savedComment.user.avatarUrl) || formatUrlForClient('/avatars/userLogo.png')
//         };

//         return res.status(201).json(responseComment);

//     } catch (error) {
//         console.error('Error posting comment:', error.message);
//         return res.status(500).json({ message: 'Failed to post comment.', error: error.message });
//     }
// });

// module.exports = router;






// yeh bhi sahi hain lekin ek error aayega


// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs').promises; // Use fs.promises for async/await file operations
// const Post = require('../models/Post');
// const Comment = require('../models/Comment');
// const User = require('../models/User.js'); // Ensure this path is correct
// const authenticate = require('../middleware/authMiddleware'); // Use our unified authenticate middleware

// // Define the base URL for the backend to correctly generate media URLs
// // Make sure this matches your backend server's base URL (e.g., https://vartalaap-r36o.onrender.com)
// // It should NOT end with a slash, as the helper function will add it.
// const BACKEND_URL = process.env.BACKEND_URL || 'https://vartalaap-r36o.onrender.com';

// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: async (req, file, cb) => {
//         const uploadPath = path.join(__dirname, '..', 'uploads');
//         try {
//             await fs.mkdir(uploadPath, { recursive: true }); // Ensure directory exists
//             cb(null, uploadPath);
//         } catch (error) {
//             console.error('Error creating upload directory:', error);
//             cb(error); // Pass error to Multer
//         }
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({
//     storage,
//     limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB file size limit
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only image and video files are allowed!'), false);
//         }
//     }
// });

// // Helper function to format URL. It will convert relative paths to absolute,
// // but leave absolute paths (http/https/data URI) as they are.
// const formatUrlForClient = (relativePath) => {
//     if (!relativePath) {
//         return null; // Handle null or empty paths
//     }
//     // If it's already an absolute URL (http/https/data URI), return as is
//     if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
//         return relativePath;
//     }
//     // Ensure BACKEND_URL doesn't have a trailing slash
//     const cleanedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
//     // Ensure relativePath starts with a single leading slash (e.g., /uploads/filename.jpg)
//     const cleanedRelativePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

//     return `${cleanedBackendUrl}${cleanedRelativePath}`;
// };

// // Main formatting helper for a post object
// const formatPostForClient = (post) => {
//     // Convert Mongoose document to a plain JavaScript object
//     const postToReturn = post.toObject();

//     // Format mediaUrl - it will now correctly handle both relative and already absolute URLs
//     if (postToReturn.mediaUrl) {
//         postToReturn.mediaUrl = formatUrlForClient(postToReturn.mediaUrl);
//     }

//     // Format author.avatarUrl
//     if (postToReturn.author) {
//         if (postToReturn.author.avatarUrl) {
//             postToReturn.author.avatarUrl = formatUrlForClient(postToReturn.author.avatarUrl);
//         } else {
//             // Set a default avatar URL if none is present for the author
//             postToReturn.author.avatarUrl = formatUrlForClient('/avatars/userLogo.png');
//         }
//     }

//     // Format comments' author avatar URLs if comments are populated
//     if (postToReturn.comments && postToReturn.comments.length > 0) {
//         postToReturn.comments = postToReturn.comments.map(comment => {
//             if (comment.user && comment.user.avatarUrl) {
//                 comment.user.avatarUrl = formatUrlForClient(comment.user.avatarUrl);
//             } else if (comment.user) {
//                 // Default avatar for comment authors
//                 comment.user.avatarUrl = formatUrlForClient('/avatars/userLogo.png');
//             }
//             return comment;
//         });
//     }

//     return postToReturn;
// };


// // GET /api/posts - Fetch all posts (public feed)
// router.get('/', async (req, res) => {
//     try {
//         const posts = await Post.find()
//             .populate('author', 'name email avatarUrl firebaseUid bio') // Populate author details
//             .sort({ createdAt: -1 })
//             .limit(50);

//         const formattedPosts = posts.map(formatPostForClient); // Format URLs before sending
//         res.json(formattedPosts);
//     } catch (error) {
//         console.error('Error fetching all posts:', error.message);
//         res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
//     }
// });

// // GET /api/posts/videos - Fetch only video posts (reels)
// // This endpoint will be used by your ReelsFeed component
// router.get('/videos', authenticate, async (req, res) => { // Authenticate for reels too
//     try {
//         const videoPosts = await Post.find({ mediaType: 'video' })
//             .populate('author', 'name avatarUrl firebaseUid') // Populate necessary author info
//             .sort({ createdAt: -1 }) // Sort by latest first
//             .limit(20); // Limit number of reels for performance

//         const formattedVideoPosts = videoPosts.map(formatPostForClient); // Format URLs
//         res.json(formattedVideoPosts);
//     } catch (error) {
//         console.error('Error fetching video posts (reels):', error.message);
//         res.status(500).json({ message: 'Failed to fetch video posts', error: error.message });
//     }
// });


// // GET /api/posts/user/:firebaseUid - Fetch posts by a specific user (public access)
// router.get('/user/:firebaseUid', async (req, res) => {
//     try {
//         const { firebaseUid } = req.params;
//         const user = await User.findOne({ firebaseUid });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         const posts = await Post.find({ author: user._id })
//             .populate('author', 'name email avatarUrl firebaseUid bio')
//             .sort({ createdAt: -1 });

//         const formattedPosts = posts.map(formatPostForClient);
//         res.json(formattedPosts);
//     } catch (error) {
//         console.error('Error fetching user-specific posts:', error.message);
//         res.status(500).json({ message: 'Failed to fetch user posts', error: error.message });
//     }
// });

// // POST /api/posts - Create a new post (Protected by authenticate)
// router.post('/', authenticate, upload.single('media'), async (req, res) => {
//     try {
//         const { uid, _id: mongoUserId } = req.user;
//         const { text } = req.body;

//         let user = await User.findById(mongoUserId);
//         if (!user) {
//             return res.status(404).json({ message: 'Authenticated user not found in database.' });
//         }

//         const postData = {
//             author: user._id,
//             text: text || '',
//             likes: [],
//             sharesBy: [],
//             comments: []
//         };

//         if (req.file) {
//             // Construct the absolute URL here before saving to the database
//             const cleanedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
//             const relativePath = `/uploads/${req.file.filename}`;
//             // Store the full absolute URL in the database
//             postData.mediaUrl = `${cleanedBackendUrl}${relativePath}`;
//             postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
//         }

//         const newPost = new Post(postData);
//         await newPost.save();
//         // Populate the author directly after saving so it's available for formatting
//         await newPost.populate('author', 'name email avatarUrl firebaseUid bio');

//         // The mediaUrl in `newPost` will now already be the absolute URL.
//         // formatPostForClient will ensure other URLs (like author avatar) are also absolute.
//         const postToReturn = formatPostForClient(newPost);

//         res.status(201).json({ message: 'Post created successfully', post: postToReturn });
//     } catch (error) {
//         console.error('Error creating post:', error.message);
//         if (req.file) {
//             try {
//                 await fs.unlink(req.file.path);
//                 console.log('Cleaned up uploaded file:', req.file.path);
//             } catch (unlinkErr) {
//                 console.error('Error deleting uploaded file after post creation failure:', req.file.path, unlinkErr);
//             }
//         }
//         res.status(500).json({ message: 'Failed to create post', error: error.message });
//     }
// });

// // PUT /api/posts/:id - Edit an existing post (Protected by authenticate, Author-only)
// router.put('/:id', authenticate, upload.single('media'), async (req, res) => {
//     try {
//         const postId = req.params.id;
//         const { text, removeMedia } = req.body;
//         const userId = req.user._id;

//         const post = await Post.findById(postId);

//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         // Ensure the post's author is the current user
//         if (post.author.toString() !== userId.toString()) {
//             // If the media was uploaded, delete it as the user is not authorized
//             if (req.file) {
//                 await fs.unlink(req.file.path);
//             }
//             return res.status(403).json({ message: 'Not authorized to update this post' });
//         }

//         if (text !== undefined) {
//             post.text = text;
//         }

//         if (req.file) {
//             // If new media is uploaded, delete the old one if it exists
//             if (post.mediaUrl) {
//                 // Determine if the old mediaUrl is absolute or relative
//                 let oldRelativePath;
//                 if (post.mediaUrl.startsWith('http://') || post.mediaUrl.startsWith('https://')) {
//                     // Extract relative path from absolute URL (e.g., from https://host/uploads/file.jpg -> /uploads/file.jpg)
//                     const url = new URL(post.mediaUrl);
//                     oldRelativePath = url.pathname;
//                 } else {
//                     oldRelativePath = post.mediaUrl;
//                 }
//                 const oldMediaPath = path.join(__dirname, '..', oldRelativePath);
//                 try {
//                     await fs.unlink(oldMediaPath);
//                     console.log('Successfully deleted old media file:', oldMediaPath);
//                 } catch (unlinkError) {
//                     console.warn('Could not delete old media file (might not exist or path issue):', oldMediaPath, unlinkError.message);
//                 }
//             }
//             // Set the new media URL as absolute
//             const cleanedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
//             const newRelativePath = `/uploads/${req.file.filename}`;
//             post.mediaUrl = `${cleanedBackendUrl}${newRelativePath}`;
//             post.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
//         } else if (removeMedia === 'true') {
//             // If removeMedia flag is true, remove existing media
//             if (post.mediaUrl) {
//                  // Determine if the old mediaUrl is absolute or relative
//                 let oldRelativePath;
//                 if (post.mediaUrl.startsWith('http://') || post.mediaUrl.startsWith('https://')) {
//                     const url = new URL(post.mediaUrl);
//                     oldRelativePath = url.pathname;
//                 } else {
//                     oldRelativePath = post.mediaUrl;
//                 }
//                 const oldMediaPath = path.join(__dirname, '..', oldRelativePath);
//                 try {
//                     await fs.unlink(oldMediaPath);
//                     console.log('Successfully deleted media on explicit removal:', oldMediaPath);
//                 } catch (unlinkError) {
//                     console.warn('Could not delete media on explicit removal (might not exist or path issue):', oldMediaPath, unlinkError.message);
//                 }
//             }
//             post.mediaUrl = null;
//             post.mediaType = null;
//         }

//         const updatedPost = await post.save();
//         // Populate after saving to ensure we have the full author object
//         await updatedPost.populate('author', 'name avatarUrl firebaseUid');

//         // Format the post before sending the response
//         const postToReturn = formatPostForClient(updatedPost);

//         res.status(200).json({
//             message: 'Post updated successfully',
//             post: postToReturn,
//         });

//     } catch (error) {
//         console.error('Error updating post:', error);
//         // Clean up uploaded file if an error occurred during update processing
//         if (req.file) {
//             try {
//                 await fs.unlink(req.file.path);
//             } catch (unlinkErr) {
//                 console.error('Error deleting uploaded file after update failure:', req.file.path, unlinkErr);
//             }
//         }
//         if (error.name === 'CastError' && error.kind === 'ObjectId') {
//             return res.status(400).json({ message: 'Invalid Post ID' });
//         }
//         if (error instanceof multer.MulterError) {
//             return res.status(400).json({ message: `Upload error: ${error.message}` });
//         }
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // DELETE /api/posts/:postId - Delete a post (Protected by authenticate, Author-only)
// router.delete('/:postId', authenticate, async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const userId = req.user._id;

//         const post = await Post.findById(postId).populate('author', 'firebaseUid');
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found.' });
//         }

//         if (post.author._id.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to delete this post.' });
//         }

//         if (post.mediaUrl) {
//             // Determine if the mediaUrl is absolute or relative to correctly form the file path
//             let relativePathToDelete;
//             if (post.mediaUrl.startsWith('http://') || post.mediaUrl.startsWith('https://')) {
//                 // Extract relative path from absolute URL (e.g., from https://host/uploads/file.jpg -> /uploads/file.jpg)
//                 const url = new URL(post.mediaUrl);
//                 relativePathToDelete = url.pathname;
//             } else {
//                 relativePathToDelete = post.mediaUrl;
//             }
//             const filePath = path.join(__dirname, '..', relativePathToDelete);
//             try {
//                 await fs.unlink(filePath);
//                 console.log('Successfully deleted associated media file:', filePath);
//             } catch (unlinkError) {
//                 console.warn('Could not delete associated media file (might not exist or path issue):', filePath, unlinkError.message);
//             }
//         }

//         await Post.deleteOne({ _id: postId });

//         res.json({ message: 'Post deleted successfully.' });

//     } catch (error) {
//         console.error('Error deleting post:', error.message);
//         if (error.name === 'CastError' && error.kind === 'ObjectId') {
//             return res.status(400).json({ message: 'Invalid Post ID' });
//         }
//         res.status(500).json({ message: 'Failed to delete post', error: error.message });
//     }
// });

// // POST /api/posts/:postId/like - Like/unlike a post (Protected by authenticate)
// router.post('/:postId/like', authenticate, async (req, res) => {
//     try {
//         const { uid } = req.user;
//         const { postId } = req.params;

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const hasLiked = post.likes.includes(uid);

//         if (hasLiked) {
//             post.likes = post.likes.filter(id => id !== uid);
//         } else {
//             post.likes.push(uid);
//         }

//         await post.save();

//         res.json({
//             updatedLikes: post.likes.length,
//             isNowLiked: !hasLiked,
//             message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully'
//         });
//     } catch (error) {
//         console.error('Error liking/unliking post:', error.message);
//         res.status(500).json({ message: 'Failed to like/unlike post', error: error.message });
//     }
// });

// // GET /api/posts/:postId/check-like - Check if current user has liked a post (Protected by authenticate)
// router.get('/:postId/check-like', authenticate, async (req, res) => {
//     try {
//         const { uid } = req.user;
//         const { postId } = req.params;

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const isLiked = post.likes.includes(uid);
//         res.json({ isLiked });
//     } catch (error) {
//         console.error('Error checking like status:', error.message);
//         res.status(500).json({ message: 'Error checking like status', error: error.message });
//     }
// });

// // POST /api/posts/:postId/share - Record a post share (Protected by authenticate)
// router.post('/:postId/share', authenticate, async (req, res) => {
//     try {
//         const { uid } = req.user;
//         const { postId } = req.params;

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         if (post.sharesBy.includes(uid)) {
//             return res.json({
//                 message: 'Post already shared by this user.',
//                 updatedShares: post.sharesBy.length
//             });
//         }

//         post.sharesBy.push(uid);
//         await post.save();

//         res.json({ message: 'Post shared successfully.', updatedShares: post.sharesBy.length });
//     } catch (error) {
//         console.error('Error sharing post:', error.message);
//         res.status(500).json({ message: 'Failed to share post', error: error.message });
//     }
// });

// // GET /api/posts/:postId/comments - Fetch comments for a post (Public)
// router.get('/:postId/comments', async (req, res) => {
//     try {
//         const { postId } = req.params;

//         const post = await Post.findById(postId)
//             .select('comments')
//             .populate({
//                 path: 'comments.user',
//                 select: 'name avatarUrl firebaseUid',
//                 strictPopulate: false // Needed if you have a deeply nested path like this and User might be null
//             });

//         if (!post) {
//             return res.status(404).json({ message: 'Post not found.' });
//         }

//         const formattedComments = post.comments.map(comment => {
//             const commentToReturn = {
//                 _id: comment._id,
//                 text: comment.text,
//                 createdAt: comment.createdAt,
//                 authorId: comment.user?._id,
//                 authorName: comment.user?.name,
//                 authorAvatarUrl: comment.user?.avatarUrl // This will be the relative path initially if stored as relative
//             };
//             // Format the avatar URL for comments
//             commentToReturn.authorAvatarUrl = formatUrlForClient(commentToReturn.authorAvatarUrl) || formatUrlForClient('/avatars/userLogo.png');
//             return commentToReturn;
//         });

//         res.status(200).json(formattedComments);
//     } catch (error) {
//         console.error('Error fetching comments for post:', error.message);
//         res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
//     }
// });

// // POST /api/posts/:postId/comments - Post a new comment (Protected by authenticate)
// router.post('/:postId/comments', authenticate, async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const { text } = req.body;
//         const { _id: mongoUserId } = req.user;

//         if (!text || text.trim() === '') {
//             return res.status(400).json({ message: 'Comment text cannot be empty.' });
//         }

//         const user = await User.findById(mongoUserId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found in database.' });
//         }

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found.' });
//         }

//         const newComment = {
//             user: user._id, // Store ObjectId
//             text: text,
//             createdAt: new Date()
//         };

//         post.comments.push(newComment);
//         await post.save();

//         // Populate the newly added comment's user field to get full user details for the response
//         // Using a direct find on the last comment is generally safer for subdocuments after save
//         const savedCommentDoc = post.comments[post.comments.length - 1];
//         await savedCommentDoc.populate('user', 'name avatarUrl firebaseUid');

//         const savedComment = savedCommentDoc.toObject(); // Convert to object for modification

//         const responseComment = {
//             _id: savedComment._id,
//             text: savedComment.text,
//             createdAt: savedComment.createdAt,
//             authorId: savedComment.user._id,
//             authorName: savedComment.user.name,
//             // Format the avatar URL using the new helper
//             authorAvatarUrl: formatUrlForClient(savedComment.user.avatarUrl) || formatUrlForClient('/avatars/userLogo.png')
//         };

//         return res.status(201).json(responseComment);

//     } catch (error) {
//         console.error('Error posting comment:', error.message);
//         return res.status(500).json({ message: 'Failed to post comment.', error: error.message });
//     }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Use fs.promises for async/await file operations
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Not directly used here, but good to keep if needed
const User = require('../models/User.js');
const authenticate = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2; // Cloudinary import

// --- Cloudinary Configuration ---
// Make sure these environment variables are set in your Render service dashboard!
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Use HTTPS
});

// Define the base URL for default static assets if needed (e.g., default avatars)
// Cloudinary will provide absolute URLs, so this is less critical for post media now.
const BACKEND_URL = process.env.BACKEND_URL || 'https://vartalaap-r36o.onrender.com';

// --- Multer storage configuration for POST MEDIA (local temporary file system) ---
// Files are saved locally first, then uploaded to Cloudinary, then deleted locally.
const tempUploadsDir = path.join(__dirname, '..', 'temp_uploads'); // Temporary directory for Multer

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(tempUploadsDir, { recursive: true }); // Ensure directory exists
            cb(null, tempUploadsDir);
        } catch (error) {
            console.error('Error creating temporary upload directory:', error);
            cb(error); // Pass error to Multer
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50 MB for videos, adjust as needed
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

// Helper function to format URL.
// This function needs to handle:
// 1. Post media URLs: Now these will be absolute Cloudinary URLs.
// 2. Avatar URLs: Absolute Cloudinary URLs (from avatar upload) OR relative default paths.
const formatUrlForClient = (url) => {
    if (!url) {
        return null;
    }

    // If it's already an absolute URL (http/https/data URI), return as is (e.g., Cloudinary URLs, external images)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }

    // Otherwise, assume it's a relative path from the server's root that needs BACKEND_URL
    // This typically applies to default static assets like /avatars/userLogo.png
    const cleanedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    // Ensure relativePath starts with a single leading slash
    const cleanedRelativePath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanedBackendUrl}${cleanedRelativePath}`;
};


// Main formatting helper for a post object
const formatPostForClient = (post) => {
    // Ensure post is a plain JavaScript object before modification
    const postToReturn = post.toObject ? post.toObject() : { ...post };

    // mediaUrl will already be an absolute Cloudinary URL from the DB, so no change needed here.
    // If you had old local URLs in the DB, they might still be prepended by BACKEND_URL.
    // For *new* posts, mediaUrl will be from Cloudinary.

    // Format author.avatarUrl (will be an absolute Cloudinary URL or a default local path)
    if (postToReturn.author) {
        if (postToReturn.author.avatarUrl) {
            postToReturn.author.avatarUrl = formatUrlForClient(postToReturn.author.avatarUrl);
        } else {
            // Default avatar URL. If userLogo.png is local, it needs to be served statically.
            postToReturn.author.avatarUrl = formatUrlForClient('/avatars/userLogo.png');
        }
    }

    // Format comments' author avatar URLs
    if (postToReturn.comments && postToReturn.comments.length > 0) {
        postToReturn.comments = postToReturn.comments.map(comment => {
            // Ensure comment user object exists and has avatarUrl
            if (comment.user) {
                if (comment.user.avatarUrl) {
                    comment.user.avatarUrl = formatUrlForClient(comment.user.avatarUrl);
                } else {
                    comment.user.avatarUrl = formatUrlForClient('/avatars/userLogo.png');
                }
            }
            return comment;
        });
    }

    return postToReturn;
};

// --- Helper to extract public ID from Cloudinary URL ---
const getPublicIdFromCloudinaryUrl = (url) => {
    if (!url || !url.includes('res.cloudinary.com')) {
        return null;
    }
    // Regex to match the part after /upload/ and before the file extension or transformations
    const regex = /\/v\d+\/([a-zA-Z0-9_\-\/]+)\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm|flv)/;
    const match = url.match(regex);
    if (match && match[1]) {
        // Return the matched path, which is the public_id
        return match[1];
    }
    return null;
};


// --- API Routes ---

// GET /api/posts - Fetch all posts (public feed)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name email avatarUrl firebaseUid bio')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to a reasonable number for performance

        const formattedPosts = posts.map(formatPostForClient);
        res.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching all posts:', error.message);
        res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
    }
});

// GET /api/posts/videos - Fetch only video posts (reels)
router.get('/videos', authenticate, async (req, res) => {
    try {
        const videoPosts = await Post.find({ mediaType: 'video' })
            .populate('author', 'name avatarUrl firebaseUid')
            .sort({ createdAt: -1 })
            .limit(20);

        const formattedVideoPosts = videoPosts.map(formatPostForClient);
        res.json(formattedVideoPosts);
    } catch (error) {
        console.error('Error fetching video posts (reels):', error.message);
        res.status(500).json({ message: 'Failed to fetch video posts', error: error.message });
    }
});

// GET /api/posts/user/:firebaseUid - Fetch posts by a specific user (public access)
router.get('/user/:firebaseUid', async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const posts = await Post.find({ author: user._id })
            .populate('author', 'name email avatarUrl firebaseUid bio')
            .sort({ createdAt: -1 });

        const formattedPosts = posts.map(formatPostForClient);
        res.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching user-specific posts:', error.message);
        res.status(500).json({ message: 'Failed to fetch user posts', error: error.message });
    }
});

// POST /api/posts - Create a new post (Protected by authenticate)
router.post('/', authenticate, upload.single('media'), async (req, res) => {
    let uploadedFilePath = req.file ? req.file.path : null; // Path to the temporarily saved file
    try {
        const { uid, _id: mongoUserId } = req.user;
        const { text } = req.body;

        let user = await User.findById(mongoUserId);
        if (!user) {
            return res.status(404).json({ message: 'Authenticated user not found in database.' });
        }

        const postData = {
            author: user._id,
            text: text || '',
            likes: [],
            sharesBy: [],
            comments: []
        };

        if (req.file) {
            // Upload to Cloudinary
            const uploadOptions = {
                folder: 'vartalaap_posts', // Optional: Folder in your Cloudinary account
                resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
            };
            
            const result = await cloudinary.uploader.upload(uploadedFilePath, uploadOptions);
            
            postData.mediaUrl = result.secure_url; // Store Cloudinary URL
            postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        }

        const newPost = new Post(postData);
        await newPost.save();
        await newPost.populate('author', 'name email avatarUrl firebaseUid bio');

        const postToReturn = formatPostForClient(newPost);

        res.status(201).json({ message: 'Post created successfully', post: postToReturn });
    } catch (error) {
        console.error('Error creating post:', error.message);
        res.status(500).json({ message: 'Failed to create post', error: error.message });
    } finally {
        // Always delete the temporary local file after processing
        if (uploadedFilePath) {
            try {
                await fs.unlink(uploadedFilePath);
                console.log('Cleaned up temporary uploaded file:', uploadedFilePath);
            } catch (unlinkErr) {
                console.error('Error deleting temporary uploaded file:', uploadedFilePath, unlinkErr);
            }
        }
    }
});

// PUT /api/posts/:id - Edit an existing post (Protected by authenticate, Author-only)
router.put('/:id', authenticate, upload.single('media'), async (req, res) => {
    let uploadedFilePath = req.file ? req.file.path : null;
    try {
        const postId = req.params.id;
        const { text, removeMedia } = req.body;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== userId.toString()) {
            // If the media was uploaded, delete its temp local copy as the user is not authorized
            if (uploadedFilePath) {
                await fs.unlink(uploadedFilePath);
            }
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        if (text !== undefined) {
            post.text = text;
        }

        if (req.file) {
            // If new media is uploaded, delete the old one from Cloudinary if it exists
            if (post.mediaUrl && post.mediaUrl.includes('res.cloudinary.com')) {
                const publicId = getPublicIdFromCloudinaryUrl(post.mediaUrl);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId, {
                            resource_type: post.mediaType // Specify resource type (image/video)
                        });
                        console.log('Successfully deleted old Cloudinary asset:', publicId);
                    } catch (cloudinaryErr) {
                        console.warn('Could not delete old Cloudinary asset:', publicId, cloudinaryErr.message);
                    }
                }
            }

            // Upload the new file to Cloudinary
            const uploadOptions = {
                folder: 'vartalaap_posts',
                resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
            };
            const result = await cloudinary.uploader.upload(uploadedFilePath, uploadOptions);

            post.mediaUrl = result.secure_url;
            post.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        } else if (removeMedia === 'true') {
            // If removeMedia flag is true, remove existing media from Cloudinary
            if (post.mediaUrl && post.mediaUrl.includes('res.cloudinary.com')) {
                const publicId = getPublicIdFromCloudinaryUrl(post.mediaUrl);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId, {
                            resource_type: post.mediaType // Specify resource type (image/video)
                        });
                        console.log('Successfully deleted Cloudinary asset on explicit removal:', publicId);
                    } catch (cloudinaryErr) {
                        console.warn('Could not delete Cloudinary asset on explicit removal:', publicId, cloudinaryErr.message);
                    }
                }
            }
            post.mediaUrl = null;
            post.mediaType = null;
        }

        const updatedPost = await post.save();
        await updatedPost.populate('author', 'name avatarUrl firebaseUid');

        const postToReturn = formatPostForClient(updatedPost);

        res.status(200).json({
            message: 'Post updated successfully',
            post: postToReturn,
        });

    } catch (error) {
        console.error('Error updating post:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Post ID' });
        }
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${error.message}` });
        }
        res.status(500).json({ message: 'Server Error' });
    } finally {
        // Always delete the temporary local file after processing
        if (uploadedFilePath) {
            try {
                await fs.unlink(uploadedFilePath);
                console.log('Cleaned up temporary uploaded file:', uploadedFilePath);
            } catch (unlinkErr) {
                console.error('Error deleting temporary uploaded file:', uploadedFilePath, unlinkErr);
            }
        }
    }
});


// DELETE /api/posts/:postId - Delete a post (Protected by authenticate, Author-only)
router.delete('/:postId', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this post.' });
        }

        // If the post has media, delete it from Cloudinary
        if (post.mediaUrl && post.mediaUrl.includes('res.cloudinary.com')) {
            const publicId = getPublicIdFromCloudinaryUrl(post.mediaUrl);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: post.mediaType // Specify resource type (image/video)
                    });
                    console.log('Successfully deleted Cloudinary asset for post:', publicId);
                } catch (cloudinaryErr) {
                    console.warn('Could not delete Cloudinary asset:', publicId, cloudinaryErr.message);
                }
            }
        }

        await Post.deleteOne({ _id: postId });

        res.json({ message: 'Post deleted successfully.' });

    } catch (error) {
        console.error('Error deleting post:', error.message);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Post ID' });
        }
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
});

// POST /api/posts/:postId/like - Like/unlike a post (Protected by authenticate)
router.post('/:postId/like', authenticate, async (req, res) => {
    try {
        const { uid } = req.user;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const hasLiked = post.likes.includes(uid);

        if (hasLiked) {
            post.likes = post.likes.filter(id => id !== uid);
        } else {
            post.likes.push(uid);
        }

        await post.save();

        res.json({
            updatedLikes: post.likes.length,
            isNowLiked: !hasLiked,
            message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully'
        });
    } catch (error) {
        console.error('Error liking/unliking post:', error.message);
        res.status(500).json({ message: 'Failed to like/unlike post', error: error.message });
    }
});

// GET /api/posts/:postId/check-like - Check if current user has liked a post (Protected by authenticate)
router.get('/:postId/check-like', authenticate, async (req, res) => {
    try {
        const { uid } = req.user;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.includes(uid);
        res.json({ isLiked });
    } catch (error) {
        console.error('Error checking like status:', error.message);
        res.status(500).json({ message: 'Error checking like status', error: error.message });
    }
});

// POST /api/posts/:postId/share - Record a post share (Protected by authenticate)
router.post('/:postId/share', authenticate, async (req, res) => {
    try {
        const { uid } = req.user;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.sharesBy.includes(uid)) {
            return res.json({
                message: 'Post already shared by this user.',
                updatedShares: post.sharesBy.length
            });
        }

        post.sharesBy.push(uid);
        await post.save();

        res.json({ message: 'Post shared successfully.', updatedShares: post.sharesBy.length });
    } catch (error) {
        console.error('Error sharing post:', error.message);
        res.status(500).json({ message: 'Failed to share post', error: error.message });
    }
});

// GET /api/posts/:postId/comments - Fetch comments for a post (Public)
router.get('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .select('comments')
            .populate({
                path: 'comments.user',
                select: 'name avatarUrl firebaseUid',
                strictPopulate: false
            });

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const formattedComments = post.comments.map(comment => {
            const commentToReturn = {
                _id: comment._id,
                text: comment.text,
                createdAt: comment.createdAt,
                authorId: comment.user?._id,
                authorName: comment.user?.name,
                authorAvatarUrl: comment.user?.avatarUrl // Initial URL
            };
            // Format the avatar URL for comments
            commentToReturn.authorAvatarUrl = formatUrlForClient(commentToReturn.authorAvatarUrl) || formatUrlForClient('/avatars/userLogo.png');
            return commentToReturn;
        });

        res.status(200).json(formattedComments);
    } catch (error) {
        console.error('Error fetching comments for post:', error.message);
        res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
    }
});

// POST /api/posts/:postId/comments - Post a new comment (Protected by authenticate)
router.post('/:postId/comments', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const { _id: mongoUserId } = req.user;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text cannot be empty.' });
        }

        const user = await User.findById(mongoUserId);
        if (!user) {
            return res.status(404).json({ message: 'User not found in database.' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const newComment = {
            user: user._id,
            text: text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        const savedCommentDoc = post.comments[post.comments.length - 1];
        await savedCommentDoc.populate('user', 'name avatarUrl firebaseUid');

        const savedComment = savedCommentDoc.toObject();

        const responseComment = {
            _id: savedComment._id,
            text: savedComment.text,
            createdAt: savedComment.createdAt,
            authorId: savedComment.user._id,
            authorName: savedComment.user.name,
            authorAvatarUrl: formatUrlForClient(savedComment.user.avatarUrl) || formatUrlForClient('/avatars/userLogo.png')
        };

        return res.status(201).json(responseComment);

    } catch (error) {
        console.error('Error posting comment:', error.message);
        return res.status(500).json({ message: 'Failed to post comment.', error: error.message });
    }
});

module.exports = router;