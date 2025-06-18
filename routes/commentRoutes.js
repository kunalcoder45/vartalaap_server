// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware'); // Import your middleware

// GET all comments for a specific post
// Public route - anyone can view comments
// GET all comments for a specific post
router.get('/posts/:postId/comments', commentController.getCommentsForPost);

// POST a new comment to a post
router.post('/posts/:postId/comments', verifyFirebaseToken, commentController.addCommentToPost);

module.exports = router;