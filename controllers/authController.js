
// const User = require('../models/User');

// exports.syncProfile = async (req, res) => {
//     console.log('SYNC_PROFILE_CONTROLLER: Entering syncProfile controller.');
//     console.log('SYNC_PROFILE_CONTROLLER: req.firebaseUser:', req.firebaseUser);

//     const { uid: firebaseUid, email, name, picture } = req.firebaseUser;

//     if (!firebaseUid || !email) {
//         return res.status(400).json({ message: "Firebase UID and email are required for sync." });
//     }

//     try {
//         let user = await User.findOne({ firebaseUid: firebaseUid });

//         // Generate a default name from email if Firebase name is not provided
//         const defaultName = email.split('@')[0] || 'User';

//         if (user) {
//             // User already exists, update necessary fields
//             user.lastLogin = new Date();
//             // Update name only if it's different and a valid name is provided by Firebase
//             if (name && user.name !== name) {
//                 user.name = name;
//             } else if (!user.name || user.name === 'Anonymous User') { // If user's current name is generic, update it
//                 user.name = name || defaultName;
//             }

//             if (email && user.email !== email) {
//                 user.email = email;
//             }
//             // Update avatarUrl from Firebase picture if available and different
//             if (picture && user.avatarUrl !== picture) {
//                 user.avatarUrl = picture;
//             }
//             await user.save();
//             return res.status(200).json({
//                 message: 'Profile updated successfully',
//                 user: {
//                     _id: user._id,
//                     firebaseUid: user.firebaseUid,
//                     name: user.name,
//                     email: user.email,
//                     avatarUrl: user.avatarUrl,
//                     bio: user.bio,
//                 }
//             });

//         } else {
//             // User does not exist, create a new entry in MongoDB
//             user = new User({
//                 firebaseUid: firebaseUid,
//                 name: name || defaultName, // Use Firebase name or generated default
//                 email: email,
//                 avatarUrl: picture || `${process.env.BACKEND_URL}/avatars/default-avatar.png`, // Use Firebase picture or default
//             });
//             await user.save();
//             return res.status(201).json({
//                 message: 'Profile created successfully',
//                 user: {
//                     _id: user._id,
//                     firebaseUid: user.firebaseUid,
//                     name: user.name,
//                     email: user.email,
//                     avatarUrl: user.avatarUrl,
//                     bio: user.bio,
//                 }
//             });
//         }

//     } catch (error) {
//         console.error('SYNC_PROFILE_CONTROLLER: Error in syncProfile controller:', error.message);
//         res.status(500).json({ message: 'Server error during profile sync', error: error.message });
//     }
// };



const User = require('../models/User');

exports.syncProfile = async (req, res) => {
    console.log('SYNC_PROFILE_CONTROLLER: Entering syncProfile controller.');
    console.log('SYNC_PROFILE_CONTROLLER: req.firebaseUser:', req.firebaseUser);

    const { uid: firebaseUid, email, name, picture } = req.firebaseUser;

    if (!firebaseUid || !email) {
        return res.status(400).json({ message: "Firebase UID and email are required for sync." });
    }

    try {
        let user = await User.findOne({ firebaseUid: firebaseUid });

        const defaultName = email.split('@')[0] || 'User';

        if (user) {
            user.lastLogin = new Date();
            if (name && user.name !== name) {
                user.name = name;
            } else if (!user.name || user.name === 'Anonymous User') {
                user.name = name || defaultName;
            }

            if (email && user.email !== email) {
                user.email = email;
            }
            if (picture && user.avatarUrl !== picture) {
                user.avatarUrl = picture;
            }
            await user.save();
            
            // --- यहाँ बदलाव है: सीधे यूजर ऑब्जेक्ट भेजें ---
            return res.status(200).json({
                _id: user._id,
                firebaseUid: user.firebaseUid,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
            });

        } else {
            user = new User({
                firebaseUid: firebaseUid,
                name: name || defaultName,
                email: email,
                avatarUrl: picture || `${process.env.BACKEND_URL}/avatars/default-avatar.png`,
            });
            await user.save();
            
            // --- यहाँ बदलाव है: सीधे यूजर ऑब्जेक्ट भेजें ---
            return res.status(201).json({
                _id: user._id,
                firebaseUid: user.firebaseUid,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
            });
        }

    } catch (error) {
        console.error('SYNC_PROFILE_CONTROLLER: Error in syncProfile controller:', error.message);
        res.status(500).json({ message: 'Server error during profile sync', error: error.message });
    }
};