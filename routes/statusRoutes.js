// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/uploadStatus');
// const verifyToken = require('../middleware/verifyFirebaseToken');
// const {
//   uploadStatus,
//   getStatuses,
//   getStatusByUserId
// } = require('../controllers/statusController');
// const { getLatestStatusMedia } = require('../controllers/getLatestStatusMedia');
// const path = require('path');
// const fs = require('fs');
// const Status = require('../models/Status');

// router.post('/status/upload', verifyToken, upload.single('media'), uploadStatus);
// router.get('/status', verifyToken, getStatuses);
// router.get('/status/:userId', verifyToken, getStatusByUserId);

// router.get('/status/view/:userId', verifyToken, getLatestStatusMedia);
// // router.get('/status/view/:userId', getLatestStatusMedia);
// // router.get('/view/:userId',verifyToken, getStatusByUserId);

// // router.get('/view/:userId', async (req, res) => {
// //   const userId = req.params.userId;

// //   // Example: find the status video file path for this userId from DB or file system
// //   // For example, fetch status from DB:
// //   const status = await StatusModel.findOne({ userId, createdAt: { $gte: Date.now() - 24*3600*1000 } });
// //   if (!status) return res.status(404).send('No active status');

// //   const filePath = path.resolve(__dirname, '..', 'uploads', 'statuses', status.filename);

// //   // Set proper content-type for video/mp4 (or based on file ext)
// //   res.setHeader('Content-Type', 'video/mp4');

// //   // Send the file (stream preferred)
// //   res.sendFile(filePath, (err) => {
// //     if (err) {
// //       console.error('Error sending video file:', err);
// //       res.status(500).send('Error loading video');
// //     }
// //   });
// // });

// // router.get('/status/view/:userId', getLatestStatusMedia);



// // router.get('/status/view/:userId', async (req, res) => {
// //   try {
// //     const userId = req.params.userId;

// //     // Get latest active status
// //     const status = await Status.findOne({ userId })
// //       .sort({ createdAt: -1 });

// //     if (!status) return res.status(404).send('No active status');

// //     if (status.mediaType !== 'video') {
// //       return res.status(400).send('Status is not a video.');
// //     }

// //     // Extract the filename from mediaUrl
// //     const filename = status.mediaUrl.split('/').pop();
// //     const filePath = path.join(__dirname, '..', 'uploads', 'statuses', filename);

// //     // Set content type
// //     res.setHeader('Content-Type', 'video/mp4');

// //     // Send the file
// //     res.sendFile(filePath, err => {
// //       if (err) {
// //         console.error('Error sending file:', err);
// //         res.status(500).send('Error loading video.');
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Fetch status video error:', error);
// //     res.status(500).send('Internal Server Error');
// //   }
// // });

// // router.get('/status/view/:userId',verifyToken, async (req, res) => {
// //   try {
// //     const status = await Status.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
// //     if (!status || status.mediaType !== 'video') {
// //       return res.status(404).send('No video status found');
// //     }

// //     const filename = path.basename(status.mediaUrl);
// //     const videoPath = path.join(__dirname, '..', 'uploads', 'statuses', filename);

// //     if (!fs.existsSync(videoPath)) {
// //       return res.status(404).send('File not found');
// //     }

// //     const stat = fs.statSync(videoPath);
// //     const fileSize = stat.size;
// //     const range = req.headers.range;

// //     if (range) {
// //       const parts = range.replace(/bytes=/, '').split('-');
// //       const start = parseInt(parts[0], 10);
// //       const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
// //       const chunkSize = end - start + 1;

// //       const file = fs.createReadStream(videoPath, { start, end });
// //       res.writeHead(206, {
// //         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
// //         'Accept-Ranges': 'bytes',
// //         'Content-Length': chunkSize,
// //         'Content-Type': 'video/mp4',
// //       });
// //       file.pipe(res);
// //     } else {
// //       res.writeHead(200, {
// //         'Content-Length': fileSize,
// //         'Content-Type': 'video/mp4',
// //       });
// //       fs.createReadStream(videoPath).pipe(res);
// //     }

// //   } catch (err) {
// //     console.error('Video stream error:', err);
// //     if (!res.headersSent) {
// //       res.status(500).send('Server error');
// //     }
// //   }
// // });

// module.exports = router;










// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/uploadStatus');
// const verifyToken = require('../middleware/verifyFirebaseToken');

// // Import all controller functions
// const {
//   uploadStatus,
//   getStatuses,
//   getStatusByUserId
// } = require('../controllers/statusController');

// const { getLatestStatusMedia } = require('../controllers/getLatestStatusMedia');

// // Upload status
// router.post('/upload', verifyToken, upload.single('media'), uploadStatus);

// // Get all statuses (for timeline)
// router.get('/', verifyToken, getStatuses);

// // Get specific user's statuses
// router.get('/user/:userId', verifyToken, getStatusByUserId);

// // View/stream status media by userId
// router.get('/view/:userId', verifyToken, getLatestStatusMedia);

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/uploadStatus');
// const verifyToken = require('../middleware/verifyFirebaseToken');

// // Import all controller functions
// const {
//   uploadStatus,
//   getStatuses,
//   getStatusByUserId,
//   markStatusAsViewed,
//   deleteStatus,
//   getStatusAnalytics,
//   cleanupExpiredStatuses
// } = require('../controllers/statusController');

// const { getLatestStatusMedia } = require('../controllers/getLatestStatusMedia');

// // Upload status
// router.post('/upload', verifyToken, upload.single('media'), uploadStatus);

// // Get all statuses (for timeline/activity bar)
// router.get('/', verifyToken, getStatuses);

// // Get specific user's statuses
// router.get('/user/:userId', verifyToken, getStatusByUserId);

// // View/stream status media by userId
// router.get('/view/:userId', verifyToken, getLatestStatusMedia);

// // Mark status as viewed
// router.post('/view/:statusId', verifyToken, markStatusAsViewed);

// // Delete status (only own status)
// router.delete('/:statusId', verifyToken, deleteStatus);

// // Get status analytics (who viewed - only for own status)
// router.get('/analytics/:statusId', verifyToken, getStatusAnalytics);

// // Admin/utility route to cleanup expired statuses
// router.post('/cleanup', verifyToken, async (req, res) => {
//   try {
//     // You might want to add admin check here
//     const deletedCount = await cleanupExpiredStatuses();
//     res.json({ 
//       message: 'Cleanup completed',
//       deletedCount 
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Cleanup failed' });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadStatus'); // This file seems to contain your multer setup
const verifyToken = require('../middleware/verifyFirebaseToken');

// Import all controller functions
const {
    uploadStatus,
    getStatuses,
    getStatusByUserId,
    markStatusAsViewed,
    deleteStatus,
    getStatusAnalytics,
    cleanupExpiredStatuses
} = require('../controllers/statusController');

// Upload status
router.post('/upload', verifyToken, upload.single('media'), uploadStatus);

// Get all statuses (for timeline/activity bar)
router.get('/', verifyToken, getStatuses);

// Get specific user's statuses
router.get('/user/:userId', verifyToken, getStatusByUserId);

// Mark status as viewed
router.post('/view/:statusId', verifyToken, markStatusAsViewed);

// Delete status (only own status)
router.delete('/:statusId', verifyToken, deleteStatus);

// Get status analytics (who viewed - only for own status)
router.get('/analytics/:statusId', verifyToken, getStatusAnalytics);

// Admin/utility route to cleanup expired statuses
router.post('/cleanup', verifyToken, async (req, res) => {
    try {
        const deletedCount = await cleanupExpiredStatuses();
        res.json({
            message: 'Cleanup completed',
            deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Cleanup failed' });
    }
});

module.exports = router;