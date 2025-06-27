// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const fs = require('fs'); // Import fs for directory check/creation
// require('dotenv').config();

// require('./firebase-admin-config'); // Your Firebase admin SDK setup

// // Import route modules
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const groupRoutes = require('./routes/groupRoutes');
// const followRoutes = require('./routes/followRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const statusRoutes = require('./routes/statusRoutes');
// const chatRoutes = require('./routes/chatRoutes');

// // Initialize express and server
// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // --- Database Connection ---
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.error('MongoDB connection error:', err));

// // --- Ensure Uploads Directories Exist ---
// // Define paths for uploads
// const uploadsBaseDir = path.join(__dirname, 'uploads');
// const statusesUploadDir = path.join(uploadsBaseDir, 'statuses');
// const avatarsPublicDir = path.join(__dirname, 'public', 'avatars'); // Assuming public/avatars for default user images

// // Create directories if they don't exist
// const ensureDirectoryExists = (directoryPath) => {
//     if (!fs.existsSync(directoryPath)) {
//         fs.mkdirSync(directoryPath, { recursive: true });
//         console.log(`Created directory: ${directoryPath}`);
//     }
// };

// ensureDirectoryExists(uploadsBaseDir);
// ensureDirectoryExists(statusesUploadDir);
// ensureDirectoryExists(avatarsPublicDir); // Ensure default avatar directory also exists if used for uploads

// // --- Configure CORS ---
// app.use(cors({
//     origin: [
//         'http://localhost:3000',
//         process.env.FRONTEND_URL, // Use environment variable for production URL
//     ].filter(Boolean), // Filter out undefined/null if FRONTEND_URL is not set
//     credentials: true,
//     exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // --- Setup Socket.IO ---
// const io = socketIo(server, {
//     cors: {
//         origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//         methods: ['GET', 'POST'],
//     }
// });

// // Import socket handlers and initialize socket connection handling
// const handleSocketConnection = require('./socket/socketHandlers');
// handleSocketConnection(io);

// // Make io accessible in routes via app.locals
// app.set('io', io);

// // --- Middleware to parse JSON and urlencoded bodies ---
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // --- Serve Static Files ---
// // This serves anything inside 'uploads' directly under the /uploads URL path
// // For example, an image at /uploads/statuses/some_image.jpg will be accessible at http://localhost:5001/uploads/statuses/some_image.jpg
// // And a file at /uploads/profile_pics/user1.jpg would be accessible at http://localhost:5001/uploads/profile_pics/user1.jpg
// app.use('/uploads', express.static(uploadsBaseDir));
// // If you have specific public avatars that are not part of 'uploads'
// app.use('/avatars', express.static(avatarsPublicDir));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes); // If you have routes like /api/user/:id, this is fine
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/status', statusRoutes); // All status routes under /api/status
// app.use('/api/chats', chatRoutes);

// // Root route for quick health check
// app.get('/', (req, res) => {
//     res.send('Unified Social App Backend is Running!');
// });

// // Add debugging route to check uploads directory
// app.get('/api/debug/uploads', (req, res) => {
//     try {
//         const files = fs.readdirSync(statusesUploadDir);
//         res.json({
//             uploadsPath: statusesUploadDir,
//             files,
//             exists: fs.existsSync(statusesUploadDir)
//         });
//     } catch (error) {
//         res.status(500).json({
//             uploadsPath: statusesUploadDir,
//             error: error.message,
//             exists: fs.existsSync(statusesUploadDir),
//             message: "Error reading uploads/statuses directory. Check permissions."
//         });
//     }
// });

// // --- Global Error Handling Middleware ---
// app.use((err, req, res, next) => {
//     console.error('Global Error Handler:', err.stack);
//     const statusCode = err.statusCode || 500;
//     res.status(statusCode).json({
//         message: err.message || 'Something went wrong on the server.',
//         error: process.env.NODE_ENV === 'development' ? err.stack : {} // Send stack only in dev
//     });
// });

// // --- 404 Not Found Middleware ---
// // This should always be the LAST middleware
// app.use((req, res, next) => {
//     console.log('404 Not Found:', req.originalUrl);
//     res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
// });

// // Start the server
// server.listen(PORT, () => {
//     console.log(`Server started on port ${PORT}`);
//     console.log(`Frontend URL allowed: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
//     console.log(`Serving static uploads from: ${uploadsBaseDir} at /uploads`);
//     console.log(`Serving default avatars from: ${avatarsPublicDir} at /avatars`);
// });










// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const fs = require('fs'); // Import fs for directory check/creation
// require('dotenv').config();

// require('./firebase-admin-config'); // Your Firebase admin SDK setup

// // Import route modules
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const groupRoutes = require('./routes/groupRoutes');
// const followRoutes = require('./routes/followRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const statusRoutes = require('./routes/statusRoutes');
// const chatRoutes = require('./routes/chatRoutes');

// // Initialize express and server
// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // --- Database Connection ---
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.error('MongoDB connection error:', err));

// // --- Ensure Uploads Directories Exist ---
// // Define paths for uploads
// const uploadsBaseDir = path.join(__dirname, 'uploads');
// const statusesUploadDir = path.join(uploadsBaseDir, 'statuses');
// const avatarsPublicDir = path.join(__dirname, 'public', 'avatars'); // Assuming public/avatars for default user images

// // Create directories if they don't exist
// const ensureDirectoryExists = (directoryPath) => {
//     if (!fs.existsSync(directoryPath)) {
//         fs.mkdirSync(directoryPath, { recursive: true });
//         console.log(`Created directory: ${directoryPath}`);
//     }
// };

// ensureDirectoryExists(uploadsBaseDir);
// ensureDirectoryExists(statusesUploadDir);
// ensureDirectoryExists(avatarsPublicDir); // Ensure default avatar directory also exists if used for uploads

// // --- Configure CORS ---
// app.use(cors({
//     origin: [
//         'http://localhost:3000',
//         process.env.FRONTEND_URL, // Use environment variable for production URL
//     ].filter(Boolean), // Filter out undefined/null if FRONTEND_URL is not set
//     credentials: true,
//     exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // --- Setup Socket.IO ---
// const io = socketIo(server, {
//     cors: {
//         origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//         methods: ['GET', 'POST'],
//     }
// });

// // Import socket handlers and initialize socket connection handling
// const handleSocketConnection = require('./socket/socketHandlers');
// handleSocketConnection(io); // This function will contain your call signaling logic

// // Make io accessible in routes via app.locals
// app.set('io', io);

// // --- Middleware to parse JSON and urlencoded bodies ---
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // --- Serve Static Files ---
// app.use('/uploads', express.static(uploadsBaseDir));
// app.use('/avatars', express.static(avatarsPublicDir));
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // This line is redundant if uploadsBaseDir already covers it

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/status', statusRoutes);
// app.use('/api/chats', chatRoutes);

// // Root route for quick health check
// app.get('/', (req, res) => {
//     res.send('Unified Social App Backend is Running!');
// });

// // Add debugging route to check uploads directory
// app.get('/api/debug/uploads', (req, res) => {
//     try {
//         const files = fs.readdirSync(statusesUploadDir);
//         res.json({
//             uploadsPath: statusesUploadDir,
//             files,
//             exists: fs.existsSync(statusesUploadDir)
//         });
//     } catch (error) {
//         res.status(500).json({
//             uploadsPath: statusesUploadDir,
//             error: error.message,
//             exists: fs.existsSync(statusesUploadDir),
//             message: "Error reading uploads/statuses directory. Check permissions."
//         });
//     }
// });

// // --- Global Error Handling Middleware ---
// app.use((err, req, res, next) => {
//     console.error('Global Error Handler:', err.stack);
//     const statusCode = err.statusCode || 500;
//     res.status(statusCode).json({
//         message: err.message || 'Something went wrong on the server.',
//         error: process.env.NODE_ENV === 'development' ? err.stack : {} // Send stack only in dev
//     });
// });

// // --- 404 Not Found Middleware ---
// // This should always be the LAST middleware
// app.use((req, res, next) => {
//     console.log('404 Not Found:', req.originalUrl);
//     res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
// });

// // Start the server
// server.listen(PORT, () => {
//     console.log(`Server started on port ${PORT}`);
//     console.log(`Frontend URL allowed: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
//     console.log(`Serving static uploads from: ${uploadsBaseDir} at /uploads`);
//     console.log(`Serving default avatars from: ${avatarsPublicDir} at /avatars`);
// });





// server.js (or index.js)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
require('dotenv').config();
require('./firebase-admin-config');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const groupRoutes = require('./routes/groupRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statusRoutes = require('./routes/statusRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Ensure Directories Exist ---
const uploadsBaseDir = path.join(__dirname, 'uploads');
const statusesUploadDir = path.join(uploadsBaseDir, 'statuses');
const avatarsPublicDir = path.join(__dirname, 'public', 'avatars');

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

ensureDirectoryExists(uploadsBaseDir);
ensureDirectoryExists(statusesUploadDir);
ensureDirectoryExists(avatarsPublicDir);

// --- Middleware ---
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://49ph994c-3000.inc1.devtunnels.ms',
  //   process.env.FRONTEND_URL
  ].filter(Boolean),
  // origin: '*', // For development, you can restrict this in production
  credentials: true,
  exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadsBaseDir));
app.use('/avatars', express.static(avatarsPublicDir));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/chats', chatRoutes);

// --- Socket.IO ---
const io = socketIo(server, {
  cors: {
    // origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

require('./socket/socketHandlers')(io); // custom socket logic including calls
app.set('io', io);

// --- Health Check ---
app.get('/', (req, res) => {
  res.send('Unified Social App Backend is Running!');
});

app.get('/api/debug/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(statusesUploadDir);
    res.json({
      uploadsPath: statusesUploadDir,
      files,
      exists: fs.existsSync(statusesUploadDir)
    });
  } catch (error) {
    res.status(500).json({
      uploadsPath: statusesUploadDir,
      error: error.message,
      exists: fs.existsSync(statusesUploadDir),
      message: 'Error reading uploads/statuses directory.'
    });
  }
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// --- 404 Fallback ---
app.use((req, res) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
