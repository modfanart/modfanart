// Creates (or reuses) a Firebase Auth user and prints the Firebase UID plus a
// fresh ID token, so an admin can be seeded into the DB and signed in to the
// dashboard without a password-login endpoint.
//
// Usage:
//   ADMIN_EMAIL=admin@modfanofficial.com ADMIN_PASSWORD='...' \
//   FIREBASE_WEB_API_KEY=... node src/scripts/create-admin.js

const admin = require('../config/firebase');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const webApiKey = process.env.FIREBASE_WEB_API_KEY;

async function findOrCreateUser() {
  try {
    const existing = await admin.auth().getUserByEmail(email);
    // Reset the password so the caller knows the credentials work
    await admin.auth().updateUser(existing.uid, { password, emailVerified: true });
    return { uid: existing.uid, created: false };
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    const created = await admin.auth().createUser({ email, password, emailVerified: true });
    return { uid: created.uid, created: true };
  }
}

async function signIn() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${webApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const body = await res.json();
  if (!res.ok) throw new Error(`Sign-in failed: ${JSON.stringify(body)}`);
  return body;
}

(async () => {
  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
    process.exit(1);
  }

  const { uid, created } = await findOrCreateUser();
  console.log(`Firebase user ${created ? 'created' : 'updated'}`);
  console.log('firebase_uid:', uid);

  if (!webApiKey) {
    console.log('\nFIREBASE_WEB_API_KEY not set — skipping ID token fetch.');
    process.exit(0);
  }

  const { idToken, refreshToken } = await signIn();
  console.log('\nidToken (expires in 1 hour):\n', idToken);
  console.log('\nrefreshToken:\n', refreshToken);
  process.exit(0);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
