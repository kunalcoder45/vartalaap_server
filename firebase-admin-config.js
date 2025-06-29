// server/firebase-admin-config.js

const admin = require('firebase-admin');

const fs = require('fs'); // Node.js built-in file system module

const path = require('path'); // Node.js built-in path module



let serviceAccountConfig;



// Check if the environment variable pointing to the service account file is set

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_FILE) {

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_FILE;

    try {

        // Read the file content from the specified path

        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');

        // Parse the content as JSON

        serviceAccountConfig = JSON.parse(fileContent);

        console.log(`Firebase Admin SDK: Using service account from file specified by environment variable: ${serviceAccountPath}`);

    } catch (error) {

        console.error(`Error loading or parsing Firebase service account JSON from file at ${serviceAccountPath}:`, error);

        // It's critical to stop the application if credentials are bad in production

        throw new Error("Invalid Firebase service account file or path specified by environment variable.");

    }

} else {

    // Fallback for local development if the JSON file is directly in the project.

    // IMPORTANT: Ensure 'vartalaap45-firebase-adminsdk-fbsvc-f81299f818.json' is NOT committed to Git!

    const localServiceAccountPath = path.join(__dirname, 'vartalaap45-firebase-adminsdk-fbsvc-f81299f818.json');

    try {

        serviceAccountConfig = require(localServiceAccountPath);

        console.log(`Firebase Admin SDK: Using service account from local JSON file: ${localServiceAccountPath} (development).`);

    } catch (error) {

        console.error(

            "Error loading local Firebase service account JSON file. " +

            "If this is a production environment, ensure FIREBASE_SERVICE_ACCOUNT_JSON_FILE env var points to the correct file. " +

            `If local, ensure '${path.basename(localServiceAccountPath)}' exists at the correct path (${path.dirname(localServiceAccountPath)}).`,

            error

        );

        // Fail fast if credentials aren't found in a development setup too

        throw new Error("Firebase service account JSON file not found locally or environment variable is missing.");

    }

}



// Initialize Firebase Admin SDK only if it hasn't been initialized already

if (!admin.apps.length) {

    admin.initializeApp({

        credential: admin.credential.cert(serviceAccountConfig),

    });

    console.log("Firebase Admin SDK initialized successfully.");

} else {

    console.log("Firebase Admin SDK already initialized.");

}



module.exports = admin;
