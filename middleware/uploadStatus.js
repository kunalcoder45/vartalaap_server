// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = 'uploads/statuses/';
//         console.log(`[Multer] Destination path: ${uploadPath}`);
//         cb(null, uploadPath); // Ensure this directory exists and is writable
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//         console.log(`[Multer] Generated filename: ${uniqueName}`);
//         cb(null, uniqueName);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     const allowed = ['video/mp4', 'image/jpeg', 'image/png'];
//     const isValid = allowed.includes(file.mimetype);
//     console.log(`[Multer] File filter for ${file.originalname}: MimeType=${file.mimetype}, IsValid=${isValid}`);
//     cb(null, isValid);
// };

// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 10 * 1024 * 1024 } // Optional: Limit file size (e.g., 10MB)
// });

// module.exports = upload;






// cloudnary //
// middleware/uploadStatus.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vartalaap_statuses',
    allowed_formats: ['mp4', 'jpeg', 'jpg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const originalnameWithoutExt = path.parse(file.originalname).name;
      return `status-${originalnameWithoutExt}-${timestamp}-${random}`;
    },
    resource_type: (req, file) => {
      return file.mimetype.startsWith('video/') ? 'video' : 'image';
    },
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['video/mp4', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const isAllowed = allowedMimeTypes.includes(file.mimetype);

  if (!isAllowed) {
    console.warn(`[Multer FileFilter] Blocked file: ${file.originalname} (${file.mimetype})`);
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type.'), false);
  }
  console.log(`[Multer FileFilter] Allowed file: ${file.originalname}`);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = upload;