const multer = require('multer');
const { avatarStorage } = require('../config/cloudinary');

const uploadAvatar = multer({ storage: avatarStorage });

module.exports = uploadAvatar;
