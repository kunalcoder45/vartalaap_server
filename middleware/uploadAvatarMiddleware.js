// // middleware/uploadAvatarMiddleware.js
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs/promises'); // Use fs.promises for async operations

// // Define the directory where avatars will be stored relative to the backend root
// // This should resolve to: [YOUR_BACKEND_ROOT]/uploads/avatars
// const avatarsUploadDir = path.join(__dirname, '..', 'uploads', 'avatars');

// // Function to ensure the upload directory exists
// const ensureDirectoryExists = async (dir) => {
//     try {
//         await fs.mkdir(dir, { recursive: true });
//         console.log(`[Multer Config] Ensured directory exists: ${dir}`);
//     } catch (err) {
//         console.error(`[Multer Config] Error creating directory ${dir}:`, err);
//         throw err; // Re-throw to prevent Multer from proceeding if directory cannot be created
//     }
// };

// const storage = multer.diskStorage({
//     destination: async (req, file, cb) => {
//         // Multer's destination function needs to ensure the directory exists
//         await ensureDirectoryExists(avatarsUploadDir);
//         cb(null, avatarsUploadDir); // This is the physical path where the file will be saved
//     },
//     filename: (req, file, cb) => {
//         // Generate a unique filename using a timestamp and a random number
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         // Extract the original file extension
//         const fileExtension = path.extname(file.originalname);
//         // Create the final filename
//         const filename = `dev-${uniqueSuffix}${fileExtension}`;
//         console.log(`[Multer Config] Generated filename for upload: ${filename}`);
//         cb(null, filename); // This filename will be available as req.file.filename
//     }
// });

// const fileFilter = (req, file, cb) => {
//     // Accept only image files
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only image files are allowed!'), false);
//     }
// };

// const uploadAvatar = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // 5 MB file size limit
//     }
// });

// module.exports = uploadAvatar;












const multer = require('multer');
const { avatarStorage } = require('../config/cloudinary');

const uploadAvatar = multer({ storage: avatarStorage });

module.exports = uploadAvatar;
