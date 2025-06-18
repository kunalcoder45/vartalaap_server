const mongoose = require('mongoose');
const User = require('../models/User');

// Get following list of a user
exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid user ID format.' });

    const user = await User.findById(userId)
      .populate('following', 'name username email avatarUrl bio createdAt')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const formattedFollowing = (user.following || []).map(f => ({
      _id: f._id,
      name: f.name || 'Unknown User',
      username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'),
      email: f.email,
      avatarUrl: f.avatarUrl || null,
      bio: f.bio || '',
      createdAt: f.createdAt,
    }));

    res.status(200).json(formattedFollowing);

  } catch (error) {
    console.error('Error in getFollowing:', error);
    next(error);
  }
};

// Get followers list of a user
exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid user ID format.' });

    const user = await User.findById(userId)
      .populate('followers', 'name username email avatarUrl bio createdAt')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const formattedFollowers = (user.followers || []).map(f => ({
      _id: f._id,
      name: f.name || 'Unknown User',
      username: f.username || (f.email ? f.email.split('@')[0] : 'unknown'),
      email: f.email,
      avatarUrl: f.avatarUrl || null,
      bio: f.bio || '',
      createdAt: f.createdAt,
    }));

    res.status(200).json(formattedFollowers);

  } catch (error) {
    console.error('Error in getFollowers:', error);
    next(error);
  }
};

exports.getUserConnections = async (req, res) => {
    try {
        const userId = req.params.userId;

        const followRequests = await FollowRequest.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: 'accepted',
        }).populate('sender receiver', 'name avatarUrl');

        const followers = followRequests
            .filter(req => req.receiver._id.toString() === userId)
            .map(req => ({
                _id: req.sender._id,
                name: req.sender.name,
                avatarUrl: req.sender.avatarUrl,
            }));

        const following = followRequests
            .filter(req => req.sender._id.toString() === userId)
            .map(req => ({
                _id: req.receiver._id,
                name: req.receiver.name,
                avatarUrl: req.receiver.avatarUrl,
            }));

        return res.status(200).json({ followers, following });
    } catch (error) {
        console.error('Error in getUserConnections:', error);
        res.status(500).json({ message: 'Failed to fetch user connections' });
    }
};

exports.getUsersByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: 'ids must be an array' });
        }

        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

        const users = await User.find({ _id: { $in: objectIds } })
            .select('_id name avatarUrl');

        res.json(users);
    } catch (error) {
        console.error('Error fetching users by IDs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// exports.getFollowDetails = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findById(userId)
//       .populate('followers', 'name avatarUrl')
//       .populate('following', 'name avatarUrl');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     return res.json({
//       followers: user.followers || [],
//       following: user.following || [],
//     });
//   } catch (error) {
//     console.error('Error fetching follow details:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };


exports.getMongoUserByFirebaseUid = async (req, res) => {
    try {
        const { firebaseUid } = req.params;

        // Ensure your User model has a 'firebaseUid' field that stores the Firebase UID.
        // For example, in your User model schema:
        // firebaseUid: { type: String, required: true, unique: true },
        const user = await User.findOne({ firebaseUid: firebaseUid });

        if (!user) {
            return res.status(404).json({ message: 'User not found for the provided Firebase UID.' });
        }

        // Return the MongoDB _id
        return res.json({ _id: user._id });
    } catch (error) {
        console.error('Error in getMongoUserByFirebaseUid:', error);
        return res.status(500).json({ message: 'Server error while fetching user by Firebase UID.' });
    }
};


// In controllers/userController.js
exports.getFollowDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId if needed
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    // Fetch user by ID, populate followers and following
    const user = await User.findById(userId)
      .populate('followers', 'name avatarUrl')   // adjust field names to your schema
      .populate('following', 'name avatarUrl');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      followers: user.followers || [],
      following: user.following || [],
    });
  } catch (error) {
    console.error('Error fetching follow details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
