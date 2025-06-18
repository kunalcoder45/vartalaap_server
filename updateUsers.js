// server/updateUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const admin = require('firebase-admin'); // If you need to fetch from Firebase

// Initialize Firebase Admin SDK if not already initialized
// You'll need your service account key here
const serviceAccount = require('./path/to/your/serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const updateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for user update script.');

        const usersToUpdate = await User.find({
            $or: [
                { name: 'Anonymous' },
                { name: { $exists: false } },
                { firebaseUid: { $exists: false } }
            ]
        });

        console.log(`Found ${usersToUpdate.length} users to potentially update.`);

        for (const user of usersToUpdate) {
            let updated = false;
            let firebaseUserData = null;

            // Try to fetch from Firebase using email if firebaseUid is missing
            if (!user.firebaseUid && user.email) {
                try {
                    const userRecord = await admin.auth().getUserByEmail(user.email);
                    firebaseUserData = userRecord;
                    user.firebaseUid = userRecord.uid;
                    updated = true;
                    console.log(`Updated firebaseUid for ${user.email}`);
                } catch (firebaseError) {
                    console.warn(`Could not find Firebase user for email ${user.email}: ${firebaseError.message}`);
                }
            } else if (user.firebaseUid) {
                // If firebaseUid exists, try to get user record to ensure name is updated
                try {
                    const userRecord = await admin.auth().getUser(user.firebaseUid);
                    firebaseUserData = userRecord;
                } catch (firebaseError) {
                    console.warn(`Could not find Firebase user for UID ${user.firebaseUid}: ${firebaseError.message}`);
                }
            }

            // Update name if it's 'Anonymous' or missing, using Firebase data or email prefix
            if (user.name === 'Anonymous' || !user.name) {
                const newName = (firebaseUserData && firebaseUserData.displayName)
                                || (user.email ? user.email.split('@')[0] : 'Unnamed User');
                if (user.name !== newName) {
                    user.name = newName;
                    updated = true;
                    console.log(`Updated name for user ${user.email || user._id} to: ${newName}`);
                }
            }

            // Update avatarUrl if it's missing or if Firebase has a better one
            if ((!user.avatarUrl || user.avatarUrl.includes('default-avatar')) && firebaseUserData && firebaseUserData.photoURL) {
                if (user.avatarUrl !== firebaseUserData.photoURL) {
                    user.avatarUrl = firebaseUserData.photoURL;
                    updated = true;
                    console.log(`Updated avatarUrl for user ${user.email || user._id}`);
                }
            }


            if (updated) {
                await user.save();
            }
        }

        console.log('User update script finished.');

    } catch (error) {
        console.error('Error running user update script:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

updateUsers();