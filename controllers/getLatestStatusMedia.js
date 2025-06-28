// // const path = require('path');
// // const fs = require('fs');
// // const StatusModel = require('../models/Status'); // jo bhi model hai

// // exports.getLatestStatusMedia = async (req, res) => {
// //   try {
// //     const userId = req.params.userId;

// //     const status = await StatusModel.findOne({ 
// //       userId, 
// //       createdAt: { $gte: Date.now() - 24 * 60 * 60 * 1000 } 
// //     }).sort({ createdAt: -1 });

// //     if (!status) {
// //       return res.status(404).send('No active status');
// //     }

// //     const filename = path.basename(status.mediaUrl); // filename nikal lo

// //     const filePath = path.resolve(__dirname, '..', 'uploads', 'statuses', filename);

// //     if (!fs.existsSync(filePath)) {
// //       return res.status(404).send('Status file not found');
// //     }

// //     // MIME type set karo
// //     const ext = path.extname(filename).toLowerCase();
// //     let contentType = 'application/octet-stream';
// //     if (ext === '.mp4') contentType = 'video/mp4';
// //     else if (ext === '.mov') contentType = 'video/quicktime';
// //     else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
// //     else if (ext === '.png') contentType = 'image/png';

// //     res.setHeader('Content-Type', contentType);

// //     const readStream = fs.createReadStream(filePath);
// //     readStream.pipe(res);

// //   } catch (error) {
// //     console.error('Error fetching status media:', error);
// //     res.status(500).send('Internal server error');
// //   }
// // };










// const path = require('path');
// const fs = require('fs');
// const StatusModel = require('../models/Status');

// exports.getLatestStatusMedia = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log('Fetching status for userId:', userId);

//     // 24 hours ago timestamp
//     const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
//     const status = await StatusModel.findOne({
//       userId,
//       createdAt: { $gte: twentyFourHoursAgo }
//     }).sort({ createdAt: -1 });

//     if (!status) {
//       console.log('No active status found for user:', userId);
//       return res.status(404).json({ message: 'No active status found' });
//     }

//     console.log('Status found:', status);

//     // Extract filename from mediaUrl or use filename field
//     let filename;
//     if (status.filename) {
//       filename = status.filename;
//     } else if (status.mediaUrl) {
//       // Extract filename from URL like: https://vartalaap-r36o.onrender.com/uploads/statuses/filename.jpg
//       filename = path.basename(status.mediaUrl);
//     } else {
//       return res.status(404).json({ message: 'Media file reference not found' });
//     }

//     console.log('Looking for file:', filename);

//     // Construct file path
//     const filePath = path.resolve(__dirname, '..', 'uploads', 'statuses', filename);
//     console.log('File path:', filePath);

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       console.error('File not found at path:', filePath);
//       return res.status(404).json({ message: 'Status file not found on disk' });
//     }

//     // Get file stats
//     const stats = fs.statSync(filePath);
//     console.log('File size:', stats.size);

//     // Set appropriate MIME type
//     const ext = path.extname(filename).toLowerCase();
//     let contentType = 'application/octet-stream';
    
//     switch (ext) {
//       case '.mp4':
//         contentType = 'video/mp4';
//         break;
//       case '.mov':
//         contentType = 'video/quicktime';
//         break;
//       case '.avi':
//         contentType = 'video/avi';
//         break;
//       case '.jpg':
//       case '.jpeg':
//         contentType = 'image/jpeg';
//         break;
//       case '.png':
//         contentType = 'image/png';
//         break;
//       case '.gif':
//         contentType = 'image/gif';
//         break;
//       case '.webp':
//         contentType = 'image/webp';
//         break;
//       default:
//         console.warn('Unknown file extension:', ext);
//     }

//     // Set headers
//     res.setHeader('Content-Type', contentType);
//     res.setHeader('Content-Length', stats.size);
//     res.setHeader('Accept-Ranges', 'bytes');
//     res.setHeader('Cache-Control', 'public, max-age=31536000');
    
//     // Handle range requests for video streaming
//     const range = req.headers.range;
//     if (range && contentType.startsWith('video/')) {
//       const parts = range.replace(/bytes=/, "").split("-");
//       const start = parseInt(parts[0], 10);
//       const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
//       const chunksize = (end - start) + 1;
      
//       const readStream = fs.createReadStream(filePath, { start, end });
      
//       res.writeHead(206, {
//         'Content-Range': `bytes ${start}-${end}/${stats.size}`,
//         'Content-Length': chunksize,
//         'Content-Type': contentType,
//       });
      
//       readStream.pipe(res);
//     } else {
//       // Stream the entire file
//       const readStream = fs.createReadStream(filePath);
      
//       readStream.on('error', (error) => {
//         console.error('Stream error:', error);
//         if (!res.headersSent) {
//           res.status(500).json({ message: 'Error streaming file' });
//         }
//       });
      
//       readStream.pipe(res);
//     }

//   } catch (error) {
//     console.error('Error fetching status media:', error);
//     if (!res.headersSent) {
//       res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
//   }
// };


const path = require('path');
const fs = require('fs');
const StatusModel = require('../models/Status');

exports.getLatestStatusMedia = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('🎥 Fetching status media for userId:', userId);

    // 24 hours ago timestamp
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const status = await StatusModel.findOne({
      userId,
      createdAt: { $gte: twentyFourHoursAgo }
    }).sort({ createdAt: -1 });

    if (!status) {
      console.log('❌ No active status found for user:', userId);
      return res.status(404).json({ message: 'No active status found' });
    }

    console.log('✅ Status found:', {
      id: status._id,
      filename: status.filename,
      mediaType: status.mediaType
    });

    // Extract filename
    let filename;
    if (status.filename) {
      filename = status.filename;
    } else if (status.mediaUrl) {
      filename = path.basename(status.mediaUrl);
    } else {
      return res.status(404).json({ message: 'Media file reference not found' });
    }

    // Construct file path
    const filePath = path.resolve(__dirname, '..', 'uploads', 'statuses', filename);
    console.log('📁 Looking for file:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      return res.status(404).json({ message: 'Status file not found on disk' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    console.log('📊 File size:', stats.size, 'bytes');

    // Set appropriate MIME type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.mov':
        contentType = 'video/quicktime';
        break;
      case '.avi':
        contentType = 'video/avi';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      default:
        console.warn('⚠️ Unknown file extension:', ext);
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Handle range requests for video streaming
    const range = req.headers.range;
    if (range && contentType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      const readStream = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      
      readStream.pipe(res);
    } else {
      // Stream the entire file
      const readStream = fs.createReadStream(filePath);
      
      readStream.on('error', (error) => {
        console.error('❌ Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming file' });
        }
      });
      
      readStream.pipe(res);
    }

    console.log('✅ Media served successfully');

  } catch (error) {
    console.error('❌ Error fetching status media:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
};