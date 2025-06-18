// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/statuses/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = ['video/mp4', 'image/jpeg', 'image/png'];
//   cb(null, allowed.includes(file.mimetype));
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;


// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/statuses/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = ['video/mp4', 'image/jpeg', 'image/png'];
//   cb(null, allowed.includes(file.mimetype));
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/statuses/';
        console.log(`[Multer] Destination path: ${uploadPath}`);
        cb(null, uploadPath); // Ensure this directory exists and is writable
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        console.log(`[Multer] Generated filename: ${uniqueName}`);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['video/mp4', 'image/jpeg', 'image/png'];
    const isValid = allowed.includes(file.mimetype);
    console.log(`[Multer] File filter for ${file.originalname}: MimeType=${file.mimetype}, IsValid=${isValid}`);
    cb(null, isValid);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Optional: Limit file size (e.g., 10MB)
});

module.exports = upload;