
const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken'); // Correct import
const { syncProfile } = require('../controllers/authController');

// POST /api/auth/syncProfile
// This route is for syncing a user's Firebase profile with your MongoDB.
// It is protected by verifyFirebaseToken to ensure the request is from a legitimate Firebase user.
router.post('/syncProfile', verifyFirebaseToken, syncProfile);

module.exports = router;