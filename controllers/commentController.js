const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Ensure Comment model is imported
const User = require('../models/User'); // User model might be useful for direct lookups if needed elsewhere

// @desc    Get comments for a specific post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getCommentsForPost = async (req, res) => {
    try {
        const postId = req.params.postId;

        // Find the post and populate its comments.
        // For each comment, populate its 'author' field.
        const post = await Post.findById(postId)
            .populate({
                path: 'comments', // Populate the comments array in the Post model
                populate: {
                    path: 'author', // For each comment, populate its 'author' field
                    model: 'User', // Explicitly specify the model, though 'ref' in schema usually handles this
                    select: 'name avatarUrl firebaseUid', // Select these specific fields from the User document
                },
                options: { sort: { createdAt: 1 } } // Sort comments by creation date
            });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Map over comments to ensure avatar URLs are absolute and handle missing author data gracefully
        const commentsWithFullAvatars = post.comments.map(comment => {
            // Convert to a plain JavaScript object to allow modification
            const commentObj = comment.toObject();

            // Handle cases where author might not be found (e.g., deleted user in DB)
            if (!commentObj.author) {
                console.warn(`Comment ${commentObj._id} has no author populated or author doesn't exist. Setting default.`);
                commentObj.author = {
                    _id: 'deleted',
                    name: 'Deleted User',
                    avatarUrl: `${process.env.BACKEND_URL}/avatars/default-avatar.png`,
                    firebaseUid: 'deleted', // Provide a fallback UID for the link
                };
            } else {
                // Ensure avatarUrl is a full URL.
                // If it starts with 'http' (Firebase/Google URL) or 'data:' (base64), use as is.
                // Otherwise, prepend BACKEND_URL. If empty, use default.
                const originalAvatarUrl = commentObj.author.avatarUrl;
                if (originalAvatarUrl && !originalAvatarUrl.startsWith('http') && !originalAvatarUrl.startsWith('data:')) {
                    commentObj.author.avatarUrl = `${process.env.BACKEND_URL}/${originalAvatarUrl.replace(/^\//, '')}`;
                } else if (!originalAvatarUrl) {
                    commentObj.author.avatarUrl = `${process.env.BACKEND_URL}/avatars/default-avatar.png`;
                }
                // If it starts with 'http' or 'data:', it's already a full URL, no change needed.
            }
            return commentObj;
        });

        res.status(200).json(commentsWithFullAvatars);

    } catch (error) {
        console.error('Error fetching comments for post:', error);
        res.status(500).json({ message: 'Server error fetching comments', error: error.message });
    }
};

// @desc    Add a new comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.addCommentToPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newCommentData = {
            text,
            author: req.user.id, // req.user.id is the MongoDB _id of the current authenticated user
            createdAt: new Date(),
        };

        const createdComment = await Comment.create(newCommentData);

        post.comments.push(createdComment._id);
        await post.save();

        // Populate the author data immediately before sending the new comment back
        // This ensures the frontend receives the full author information for the newly added comment
        await createdComment.populate('author', 'name avatarUrl firebaseUid');

        const commentToSend = createdComment.toObject();
        // Ensure avatarUrl for the newly created comment is also a full URL
        const originalAvatarUrl = commentToSend.author.avatarUrl;
        if (originalAvatarUrl && !originalAvatarUrl.startsWith('http') && !originalAvatarUrl.startsWith('data:')) {
            commentToSend.author.avatarUrl = `${process.env.BACKEND_URL}/${originalAvatarUrl.replace(/^\//, '')}`;
        } else if (!originalAvatarUrl) {
            commentToSend.author.avatarUrl = `${process.env.BACKEND_URL}/avatars/default-avatar.png`;
        }


        res.status(201).json(commentToSend);

    } catch (error) {
        console.error('Error adding comment to post:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ message: 'Invalid Post ID' });
        }
        res.status(500).json({ message: 'Server error adding comment', error: error.message });
    }
};