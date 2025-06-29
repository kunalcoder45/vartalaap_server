// utils/avatarUtils.js
const path = require('path');

const BACKEND_BASE_URL = process.env.BACKEND_MEDIA_URL || 'http://localhost:5001';

/**
 * Returns full URL for avatar.
 * If already absolute (starts with http or data:), return as is.
 * Otherwise, prepend backend static base URL.
 */
const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath || typeof avatarPath !== 'string') return '';

    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
        return avatarPath;
    }

    const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    return `${BACKEND_BASE_URL}${cleanPath}`;
};

module.exports = {
    getFullAvatarUrl,
};
