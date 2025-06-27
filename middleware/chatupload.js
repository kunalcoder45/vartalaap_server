
// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // We'll create a dedicated 'chat_media' subfolder within 'uploads'
        const uploadPath = path.join(__dirname, '..', 'uploads', 'chat_media');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: originalname-timestamp.ext
        const ext = path.extname(file.originalname);
        // Sanitize the filename to prevent issues (remove non-alphanumeric characters except dots/hyphens/spaces)
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9.\-_ ]/g, '');
        cb(null, `${name.substring(0, 50)}-${Date.now()}${ext}`); // Limit name length for safety
    }
});

// Filter for various media file types
const fileFilter = (req, file, cb) => {
    // Regex for common image, video, audio, and document types
    const allowedMimeTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm|flv|mkv|mp3|wav|ogg|aac|pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const mimetypeTest = allowedMimeTypes.test(file.mimetype);
    const extnameTest = allowedMimeTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetypeTest && extnameTest) {
        return cb(null, true);
    } else {
        cb(new Error('Unsupported file type! Only common images, videos, audio, and documents (PDF, Doc, Xls, Ppt) are allowed.'), false);
    }
};

// Initialize multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // Increased to 20 MB for media files
    }
});

module.exports = upload;