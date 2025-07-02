// scripts/cleanLocalMedia.js

const mongoose = require('mongoose');
const Status = require('../models/Status');
const Post = require('../models/Post'); // remove if not needed

const MONGO_URI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority'; // replace this

async function cleanUpInvalidMedia() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const res1 = await Status.deleteMany({ mediaUrl: { $regex: 'localhost:5001/uploads' } });
    console.log(`🧹 Deleted ${res1.deletedCount} statuses with local media URLs.`);

    const res2 = await Post.deleteMany({ mediaUrl: { $regex: 'localhost:5001/uploads' } });
    console.log(`🧹 Deleted ${res2.deletedCount} posts with local media URLs.`);

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected. Cleanup done.');
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
    process.exit(1);
  }
}

cleanUpInvalidMedia();
