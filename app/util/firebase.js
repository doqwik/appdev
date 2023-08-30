const admin = require("firebase-admin");

/**
 * Firebase DB connection of Official Latdour project
 */
const serviceAccount = require('../../ServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_URL,
});

// Firebase db connection
const db = admin.firestore();

module.exports = {
  admin: admin,
  db: db,
};
