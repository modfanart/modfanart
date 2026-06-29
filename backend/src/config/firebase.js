const admin = require('firebase-admin');

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production: JSON string stored in env var
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Local dev: GOOGLE_APPLICATION_CREDENTIALS env var points to JSON file
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({ credential });
}

module.exports = admin;
