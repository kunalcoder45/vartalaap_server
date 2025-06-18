// server/firebase-admin-config.js
const admin = require('firebase-admin');
const serviceAccount = require('./vartalaap45-firebase-adminsdk-fbsvc-f81299f818.json'); // Adjust path as needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;