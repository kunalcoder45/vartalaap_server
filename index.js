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
// // For example, an image at /uploads/statuses/some_image.jpg will be accessible at https://vartalaap-r36o.onrender.com/uploads/statuses/some_image.jpg
// // And a file at /uploads/profile_pics/user1.jpg would be accessible at https://vartalaap-r36o.onrender.com/uploads/profile_pics/user1.jpg
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




// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const fs = require('fs');
// require('dotenv').config();
// require('./firebase-admin-config');

// // Route Imports
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const groupRoutes = require('./routes/groupRoutes');
// const followRoutes = require('./routes/followRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const statusRoutes = require('./routes/statusRoutes');
// const chatRoutes = require('./routes/chatRoutes');

// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // --- MongoDB Connection ---
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.error('MongoDB connection error:', err));

// // --- Ensure Directories Exist ---
// const uploadsBaseDir = path.join(__dirname, 'uploads');
// const defaultAvatarsPublicDir = path.join(__dirname, 'public', 'avatars');

// const ensureDirectoryExists = (dir) => {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//         console.log(`[App] Created directory: ${dir}`);
//     }
// };

// ensureDirectoryExists(uploadsBaseDir);
// ensureDirectoryExists(path.join(uploadsBaseDir, 'avatars'));
// ensureDirectoryExists(path.join(uploadsBaseDir, 'statuses'));
// ensureDirectoryExists(defaultAvatarsPublicDir);


// // --- CORS Configuration (Unified for Express and Socket.IO) ---
// const allowedOrigins = [
//     'http://localhost:3000', // Your local development URL
//     'https://49ph994c-3000.inc1.devtunnels.ms', // Your devtunnel URL
//     process.env.FRONTEND_URL // Your production Vercel URL
// ].filter(Boolean); // Filter out any empty strings

// app.use(cors({
//     origin: function (origin, callback) {
//         // Allow requests with no origin (like mobile apps or curl requests)
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     },
//     credentials: true,
//     exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // --- Static File Serving ---
// app.use('/uploads', express.static(uploadsBaseDir));
// app.use('/avatars', express.static(defaultAvatarsPublicDir));


// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes); // Consider removing if /api/users is sufficient
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/status', statusRoutes);
// app.use('/api/chats', chatRoutes);

// // --- Socket.IO ---
// const io = socketIo(server, {
//     cors: {
//         // origin: function (origin, callback) {
//         //     // Allow requests with no origin (like mobile apps or curl requests)
//         //     if (!origin) return callback(null, true);
//         //     if (allowedOrigins.indexOf(origin) === -1) {
//         //         const msg = `The CORS policy for this site does not allow Socket.IO access from the specified Origin: ${origin}`;
//         //         return callback(new Error(msg), false);
//         //     }
//         //     return callback(null, true);
//         // },
//         origin: {'*': true}, // Allow all origins for Socket.IO
//         allowedHeaders: ['Content-Type'],
//         methods: ['GET', 'POST'],
//         credentials: true
//     }
// });

// require('./socket/socketHandlers')(io); // custom socket logic including calls
// app.set('io', io); // Make 'io' instance available to routes if needed

// // --- Health Check ---
// app.get('/', (req, res) => {
//     res.send('Unified Social App Backend is Running!');
// });

// // --- Debug Uploads Route (Helpful for verifying directory and files) ---
// app.get('/api/debug/uploads', (req, res) => {
//     try {
//         const avatarsFiles = fs.readdirSync(path.join(uploadsBaseDir, 'avatars'));
//         const statusesFiles = fs.readdirSync(path.join(uploadsBaseDir, 'statuses'));
//         res.json({
//             uploadsBasePath: uploadsBaseDir,
//             avatarsPath: path.join(uploadsBaseDir, 'avatars'),
//             statusesPath: path.join(uploadsBaseDir, 'statuses'),
//             avatarsExist: fs.existsSync(path.join(uploadsBaseDir, 'avatars')),
//             statusesExist: fs.existsSync(path.join(uploadsBaseDir, 'statuses')),
//             avatarsFiles: avatarsFiles,
//             statusesFiles: statusesFiles,
//         });
//     } catch (error) {
//         res.status(500).json({
//             uploadsBasePath: uploadsBaseDir,
//             error: error.message,
//             message: 'Error reading uploads directories. Check permissions.',
//             avatarsExist: fs.existsSync(path.join(uploadsBaseDir, 'avatars')),
//             statusesExist: fs.existsSync(path.join(uploadsBaseDir, 'statuses')),
//         });
//     }
// });

// // --- Error Handling ---
// app.use((err, req, res, next) => {
//     console.error('Global Error:', err.stack);
//     res.status(err.statusCode || 500).json({
//         message: err.message || 'Internal Server Error',
//         error: process.env.NODE_ENV === 'development' ? err.stack : {}
//     });
// });

// // --- 404 Fallback ---
// app.use((req, res) => {
//     res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
// });

// server.listen(PORT, () => {
//     console.log(`Server started on port ${PORT}`);
//     console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
// });



// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const fs = require('fs');
// require('dotenv').config();
// require('./firebase-admin-config');

// // Route Imports
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const groupRoutes = require('./routes/groupRoutes');
// const followRoutes = require('./routes/followRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const statusRoutes = require('./routes/statusRoutes');
// const chatRoutes = require('./routes/chatRoutes');

// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // --- MongoDB Connection ---
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('✅ MongoDB Connected'))
//     .catch(err => console.error('❌ MongoDB connection error:', err));

// // --- Ensure Upload Directories Exist ---
// const uploadsBaseDir = path.join(__dirname, 'uploads');
// const defaultAvatarsPublicDir = path.join(__dirname, 'public', 'avatars');

// const ensureDirectoryExists = (dir) => {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//         console.log(`📁 Created directory: ${dir}`);
//     }
// };

// ensureDirectoryExists(uploadsBaseDir);
// ensureDirectoryExists(path.join(uploadsBaseDir, 'avatars'));
// ensureDirectoryExists(path.join(uploadsBaseDir, 'statuses'));
// ensureDirectoryExists(defaultAvatarsPublicDir);

// // --- CORS Configuration (Unified for Express and Socket.IO) ---
// const allowedOrigins = [
//     'http://localhost:3000',
//     'https://49ph994c-3000.inc1.devtunnels.ms',
//     process.env.FRONTEND_URL
// ].filter(Boolean);

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin) return callback(null, true);
//         if (!allowedOrigins.includes(origin)) {
//             console.warn(`❌ [CORS BLOCKED]: ${origin}`);
//             return callback(new Error(`CORS not allowed for ${origin}`), false);
//         }
//         console.log(`✅ [CORS ALLOWED]: ${origin}`);
//         return callback(null, true);
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     exposedHeaders: ['Content-Type', 'Content-Length']
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // --- Static File Serving ---
// app.use('/uploads', express.static(uploadsBaseDir));
// app.use('/avatars', express.static(defaultAvatarsPublicDir));

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes); // Optional alias
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/status', statusRoutes);
// app.use('/api/chats', chatRoutes);

// // --- Health Check ---
// app.get('/', (req, res) => {
//     res.send('🌐 Unified Social App Backend is Running!');
// });

// // --- Debug Uploads Route ---
// app.get('/api/debug/uploads', (req, res) => {
//     try {
//         const avatarsFiles = fs.readdirSync(path.join(uploadsBaseDir, 'avatars'));
//         const statusesFiles = fs.readdirSync(path.join(uploadsBaseDir, 'statuses'));
//         res.json({
//             uploadsBasePath: uploadsBaseDir,
//             avatarsExist: fs.existsSync(path.join(uploadsBaseDir, 'avatars')),
//             statusesExist: fs.existsSync(path.join(uploadsBaseDir, 'statuses')),
//             avatarsFiles,
//             statusesFiles
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error reading uploads directories.', error: error.message });
//     }
// });

// // --- Socket.IO Setup ---
// const io = socketIo(server, {
//     cors: {
//         origin: allowedOrigins,
//         methods: ['GET', 'POST'],
//         credentials: true
//     }
// });

// require('./socket/socketHandlers')(io); // Your custom socket logic
// app.set('io', io); // Make io instance available in routes

// // --- Global Error Handler ---
// app.use((err, req, res, next) => {
//     console.error('🔥 Global Error:', err.stack);
//     res.status(err.statusCode || 500).json({
//         message: err.message || 'Internal Server Error',
//         error: process.env.NODE_ENV === 'development' ? err.stack : {}
//     });
// });

// // --- 404 Fallback ---
// app.use((req, res) => {
//     res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
// });

// // --- Start Server ---
// server.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`🔗 Frontend allowed: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
// });










const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
// const fs = require('fs'); // Only keep if genuinely needed elsewhere for local file ops
require('dotenv').config();
require('./firebase-admin-config');

// --- Import Multer for error handling ---
const multer = require('multer');

// --- Import Cloudinary config to ensure it's initialized ---
const { cloudinary } = require('./config/cloudinary');

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
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Removed local upload directory management for statuses ---
// Keep uploadsBaseDir and defaultAvatarsPublicDir only if local storage is still used for avatars or other uploads.
// Based on your `config/cloudinary.js`, avatars also seem to be on Cloudinary,
// so you might not need any local file system management or static serving for uploads at all.

// const uploadsBaseDir = path.join(__dirname, 'uploads');
// const defaultAvatarsPublicDir = path.join(__dirname, 'public', 'avatars');

// const ensureDirectoryExists = (dir) => {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//         console.log(`📁 Created directory: ${dir}`);
//     }
// };

// If you're using Cloudinary for all media (avatars, statuses, posts etc.),
// then you can safely remove all `ensureDirectoryExists` calls and static file serving for `/uploads`.
// If `defaultAvatarsPublicDir` is for placeholder/default avatars, you might keep that part.
// For now, I'll comment out the parts related to `uploads` and `statuses` that are no longer strictly needed.

// ensureDirectoryExists(uploadsBaseDir); // Might not be needed
// ensureDirectoryExists(path.join(uploadsBaseDir, 'avatars')); // Might not be needed
// ensureDirectoryExists(path.join(uploadsBaseDir, 'statuses')); // Definitely not needed for Cloudinary statuses
// ensureDirectoryExists(defaultAvatarsPublicDir); // Keep if you serve default avatars locally

// --- CORS Configuration (Unified for Express and Socket.IO) ---
const allowedOrigins = [
    'http://localhost:3000',
    'https://49ph994c-3000.inc1.devtunnels.ms',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (!allowedOrigins.includes(origin)) {
            console.warn(`❌ [CORS BLOCKED]: ${origin}`);
            return callback(new Error(`CORS not allowed for ${origin}`), false);
        }
        console.log(`✅ [CORS ALLOWED]: ${origin}`);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Content-Length']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static File Serving ---
// Remove these if all media (including avatars) are served from Cloudinary.
// If you still have some local static files (e.g., default user avatars), keep relevant lines.
// app.use('/uploads', express.static(uploadsBaseDir));
// app.use('/avatars', express.static(defaultAvatarsPublicDir));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // Optional alias
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/chats', chatRoutes);

// --- Health Check ---
app.get('/', (req, res) => {
    res.send('🌐 Unified Social App Backend is Running!');
});

// --- Debug Uploads Route (UPDATED for Cloudinary status storage) ---
app.get('/api/debug/uploads', (req, res) => {
    try {
        // This route is less relevant for Cloudinary-stored files.
        // If you need to debug Cloudinary, use Cloudinary's Admin API or dashboard.
        // For local files (e.g., default avatars if still used), this can stay.
        // For clarity, I'm modifying it to indicate statuses are now cloud-based.

        // const avatarsFiles = fs.readdirSync(path.join(uploadsBaseDir, 'avatars')); // Only if local avatars exist
        // res.json({
        //     message: 'Statuses are now stored on Cloudinary. Local upload debug is for other files if any.',
        //     // uploadsBasePath: uploadsBaseDir, // Can remove if no local uploads are used
        //     // avatarsExist: fs.existsSync(path.join(uploadsBaseDir, 'avatars')), // Can remove
        //     // avatarsFiles, // Can remove
        //     cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'NOT CONFIGURED',
        // });
        // Keeping a simplified response.
        res.json({
            message: 'Local file system debug is limited as status media is stored on Cloudinary.',
            cloudinary_status: process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary configured.' : 'Cloudinary environment variables missing.'
        });
    } catch (error) {
        // If you remove fs completely, you might not even need this catch block here.
        res.status(500).json({ message: 'Error accessing debug info.', error: error.message });
    }
});

// --- Socket.IO Setup ---
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

require('./socket/socketHandlers')(io); // Your custom socket logic
app.set('io', io); // Make io instance available in routes

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('🔥 Global Error:', err.stack);

    // Handle Multer specific errors
    if (err instanceof multer.MulterError) {
        console.error(`Multer Error caught: ${err.code} - ${err.message}`);
        return res.status(400).json({
            message: `File upload error: ${err.message}`,
            code: err.code
        });
    }

    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// --- 404 Fallback ---
app.use((req, res) => {
    res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// --- Start Server ---
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Frontend allowed: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});