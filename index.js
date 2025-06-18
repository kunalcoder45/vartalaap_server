// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
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

// // Initialize express and server
// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // Configure CORS
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     // 'https://yourfrontend.vercel.app', // add your production frontend URL here
//   ],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // Setup Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// });

// // Import socket handlers and initialize socket connection handling
// const handleSocketConnection = require('./socket/socketHandlers');
// handleSocketConnection(io);

// // Make io accessible in routes via app locals
// app.set('io', io);

// // Middleware to parse JSON and urlencoded bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files for uploads and avatars
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api', statusRoutes);

// // ✅ Make sure this line is here
// // const userRoutes = require('./routes/userRoutes');
// app.use('/api', userRoutes); // 👈 this mounts /api/follow-details/:userId
// // app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api', statusRoutes);


// // Root route for quick health check
// app.get('/', (req, res) => {
//   res.send('Unified Social App Backend is Running!');
// });

// // Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error('Global Error Handler:', err.stack);
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     message: err.message || 'Something went wrong on the server.',
//   });
// });

// // 404 Not Found Middleware
// app.use((req, res, next) => {
//   res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
// });

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
//   console.log(`Serving static uploads from: ${path.join(__dirname, 'uploads')}`);
//   console.log(`Serving default avatars from: ${path.join(__dirname, 'public/avatars')}`);
// });


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
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

// // Initialize express and server
// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // Configure CORS
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     // 'https://yourfrontend.vercel.app', // add your production frontend URL here
//   ],
//   credentials: true,
//   exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // Setup Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// });

// // Import socket handlers and initialize socket connection handling
// const handleSocketConnection = require('./socket/socketHandlers');
// handleSocketConnection(io);

// // Make io accessible in routes via app.locals
// app.set('io', io);

// // Middleware to parse JSON and urlencoded bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
// // app.use('/uploads/statuses', express.static(path.join(__dirname, 'uploads/statuses')));
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// // app.use('/uploads/statuses', express.static(path.join(__dirname, 'uploads/statuses')));
// app.use('/uploads/statuses', express.static(path.join(__dirname, 'uploads/statuses')));



// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes); // If you have routes like /api/user/:id
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api', statusRoutes); // status endpoints: /api/status, etc.
// // app.use('/api', statusRoutes);
// app.use('/api/status', statusRoutes);


// // ✅ Avoid duplicate route mounting
// // app.use('/api', userRoutes); ❌ Already covered above as '/api/users' and '/api/user'

// // Root route for quick health check
// app.get('/', (req, res) => {
//   res.send('Unified Social App Backend is Running!');
// });

// // Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error('Global Error Handler:', err.stack);
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     message: err.message || 'Something went wrong on the server.',
//   });
// });

// // 404 Not Found Middleware
// app.use((req, res, next) => {
//   res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
// });

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
//   console.log(`Serving static uploads from: ${path.join(__dirname, 'uploads')}`);
//   console.log(`Serving default avatars from: ${path.join(__dirname, 'public/avatars')}`);
// });








// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
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

// // Initialize express and server
// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // Configure CORS
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     // 'https://yourfrontend.vercel.app', // add your production frontend URL here
//   ],
//   credentials: true,
//   exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // Setup Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// });

// // Import socket handlers and initialize socket connection handling
// const handleSocketConnection = require('./socket/socketHandlers');
// handleSocketConnection(io);

// // Make io accessible in routes via app.locals
// app.set('io', io);

// // Middleware to parse JSON and urlencoded bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files - FIXED ORDER AND PATHS
// app.use('/uploads/statuses', express.static(path.join(__dirname, 'uploads', 'statuses')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes); // If you have routes like /api/user/:id
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/status', statusRoutes); // All status routes under /api/status

// // Root route for quick health check
// app.get('/', (req, res) => {
//   res.send('Unified Social App Backend is Running!');
// });

// // Add debugging route to check uploads directory
// app.get('/api/debug/uploads', (req, res) => {
//   const fs = require('fs');
//   const uploadsPath = path.join(__dirname, 'uploads', 'statuses');
  
//   try {
//     const files = fs.readdirSync(uploadsPath);
//     res.json({
//       uploadsPath,
//       files,
//       exists: fs.existsSync(uploadsPath)
//     });
//   } catch (error) {
//     res.json({
//       uploadsPath,
//       error: error.message,
//       exists: fs.existsSync(uploadsPath)
//     });
//   }
// });

// // Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error('Global Error Handler:', err.stack);
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     message: err.message || 'Something went wrong on the server.',
//   });
// });

// // 404 Not Found Middleware
// app.use((req, res, next) => {
//   console.log('404 Not Found:', req.originalUrl);
//   res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
// });

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
//   console.log(`Serving static uploads from: ${path.join(__dirname, 'uploads')}`);
//   console.log(`Serving status uploads from: ${path.join(__dirname, 'uploads', 'statuses')}`);
//   console.log(`Serving default avatars from: ${path.join(__dirname, 'public/avatars')}`);
// });











const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs'); // Import fs for directory check/creation
require('dotenv').config();

require('./firebase-admin-config'); // Your Firebase admin SDK setup

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const groupRoutes = require('./routes/groupRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statusRoutes = require('./routes/statusRoutes');

// Initialize express and server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Ensure Uploads Directories Exist ---
// Define paths for uploads
const uploadsBaseDir = path.join(__dirname, 'uploads');
const statusesUploadDir = path.join(uploadsBaseDir, 'statuses');
const avatarsPublicDir = path.join(__dirname, 'public', 'avatars'); // Assuming public/avatars for default user images

// Create directories if they don't exist
const ensureDirectoryExists = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`Created directory: ${directoryPath}`);
    }
};

ensureDirectoryExists(uploadsBaseDir);
ensureDirectoryExists(statusesUploadDir);
ensureDirectoryExists(avatarsPublicDir); // Ensure default avatar directory also exists if used for uploads

// --- Configure CORS ---
app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL, // Use environment variable for production URL
    ].filter(Boolean), // Filter out undefined/null if FRONTEND_URL is not set
    credentials: true,
    exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Setup Socket.IO ---
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
});

// Import socket handlers and initialize socket connection handling
const handleSocketConnection = require('./socket/socketHandlers');
handleSocketConnection(io);

// Make io accessible in routes via app.locals
app.set('io', io);

// --- Middleware to parse JSON and urlencoded bodies ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve Static Files ---
// This serves anything inside 'uploads' directly under the /uploads URL path
// For example, an image at /uploads/statuses/some_image.jpg will be accessible at http://localhost:5001/uploads/statuses/some_image.jpg
// And a file at /uploads/profile_pics/user1.jpg would be accessible at http://localhost:5001/uploads/profile_pics/user1.jpg
app.use('/uploads', express.static(uploadsBaseDir));
// If you have specific public avatars that are not part of 'uploads'
app.use('/avatars', express.static(avatarsPublicDir));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // If you have routes like /api/user/:id, this is fine
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/status', statusRoutes); // All status routes under /api/status

// Root route for quick health check
app.get('/', (req, res) => {
    res.send('Unified Social App Backend is Running!');
});

// Add debugging route to check uploads directory
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
            message: "Error reading uploads/statuses directory. Check permissions."
        });
    }
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Something went wrong on the server.',
        error: process.env.NODE_ENV === 'development' ? err.stack : {} // Send stack only in dev
    });
});

// --- 404 Not Found Middleware ---
// This should always be the LAST middleware
app.use((req, res, next) => {
    console.log('404 Not Found:', req.originalUrl);
    res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Frontend URL allowed: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`Serving static uploads from: ${uploadsBaseDir} at /uploads`);
    console.log(`Serving default avatars from: ${avatarsPublicDir} at /avatars`);
});











// advance


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const fs = require('fs');
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

// // Initialize express and server
// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5001;

// // Configure CORS
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'https://yourfrontend.vercel.app', // add your production frontend URL here
//   ],
//   credentials: true,
//   exposedHeaders: ['Content-Range', 'Content-Type', 'Content-Length', 'Accept-Ranges'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
// }));

// // Setup Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// });

// // Import socket handlers and initialize socket connection handling
// const handleSocketConnection = require('./socket/socketHandlers');
// handleSocketConnection(io);

// // Make io accessible in routes via app.locals
// app.set('io', io);

// // Middleware to parse JSON and urlencoded bodies
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Create uploads directories if they don't exist
// const uploadsDir = path.join(__dirname, 'uploads');
// const statusesDir = path.join(__dirname, 'uploads', 'statuses');
// const avatarsDir = path.join(__dirname, 'public', 'avatars');

// [uploadsDir, statusesDir, avatarsDir].forEach(dir => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//     console.log(`Created directory: ${dir}`);
//   }
// });

// // Serve static files with proper headers
// app.use('/uploads/statuses', (req, res, next) => {
//   // Add security headers
//   res.setHeader('X-Content-Type-Options', 'nosniff');
//   res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
//   next();
// }, express.static(path.join(__dirname, 'uploads', 'statuses')));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/avatars', express.static(path.join(__dirname, 'public', 'avatars')));

// // MongoDB connection with better error handling
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   maxPoolSize: 10, // Maintain up to 10 socket connections
//   serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
//   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
// })
//   .then(() => {
//     console.log('MongoDB Connected');
    
//     // Start cleanup job for expired statuses
//     const { cleanupExpiredStatuses } = require('./controllers/statusController');
    
//     // Run cleanup every hour
//     setInterval(async () => {
//       try {
//         const deletedCount = await cleanupExpiredStatuses();
//         if (deletedCount > 0) {
//           console.log(`Cleaned up ${deletedCount} expired statuses`);
//         }
//       } catch (error) {
//         console.error('Error during status cleanup:', error);
//       }
//     }, 60 * 60 * 1000); // 1 hour
    
//     // Initial cleanup on startup
//     cleanupExpiredStatuses().catch(console.error);
//   })
//   .catch(err => console.error('MongoDB connection error:', err));

// // Health check middleware
// app.use((req, res, next) => {
//   req.startTime = Date.now();
//   next();
// });

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
//   next();
// });

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/user', userRoutes); // If you have routes like /api/user/:id
// app.use('/api/posts', postRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/follow', followRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/status', statusRoutes); // All status routes under /api/status

// // Root route for quick health check
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Unified Social App Backend is Running!',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
//   });
// });

// // Add debugging route to check uploads directory
// app.get('/api/debug/uploads', (req, res) => {
//   const uploadsPath = path.join(__dirname, 'uploads', 'statuses');
  
//   try {
//     const files = fs.readdirSync(uploadsPath);
//     res.json({
//       uploadsPath,
//       files: files.slice(0, 10), // Limit to first 10 files
//       totalFiles: files.length,
//       exists: fs.existsSync(uploadsPath),
//       permissions: fs.constants.F_OK
//     });
//   } catch (error) {
//     res.json({
//       uploadsPath,
//       error: error.message,
//       exists: fs.existsSync(uploadsPath)
//     });
//   }
// });

// // Response time logging
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     const responseTime = Date.now() - req.startTime;
//     if (responseTime > 1000) { // Log slow requests
//       console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
//     }
//   });
//   next();
// });

// // Rate limiting for uploads
// const uploadLimiter = require('express-rate-limit')({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 10 uploads per windowMs
//   message: {
//     error: 'Too many uploads, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/status/upload', uploadLimiter);

// // Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error('Global Error Handler:', {
//     error: err.message,
//     stack: err.stack,
//     url: req.originalUrl,
//     method: req.method,
//     timestamp: new Date().toISOString()
//   });
  
//   const statusCode = err.statusCode || 500;
//   const message = process.env.NODE_ENV === 'production' 
//     ? 'Something went wrong on the server.' 
//     : err.message;
    
//   res.status(statusCode).json({
//     error: message,
//     requestId: req.headers['x-request-id'] || 'unknown'
//   });
// });

// // 404 Not Found Middleware
// app.use((req, res, next) => {
//   console.log('404 Not Found:', req.originalUrl);
//   res.status(404).json({ 
//     error: `Not Found - ${req.originalUrl}`,
//     timestamp: new Date().toISOString()
//   });
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   server.close(() => {
//     console.log('Process terminated');
//     mongoose.connection.close();
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down gracefully');
//   server.close(() => {
//     console.log('Process terminated');
//     mongoose.connection.close();
//   });
// });

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`Serving static uploads from: ${path.join(__dirname, 'uploads')}`);
//   console.log(`Serving status uploads from: ${path.join(__dirname, 'uploads', 'statuses')}`);
//   console.log(`Serving default avatars from: ${path.join(__dirname, 'public', 'avatars')}`);
// });