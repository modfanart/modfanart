const admin = require('firebase-admin');

if (!admin.getApps().length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.cert(serviceAccount);
  } else {
    credential = admin.applicationDefault();
  }

  admin.initializeApp({ credential });
}

module.exports = admin;
