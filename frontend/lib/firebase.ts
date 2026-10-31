import { initializeApp, getApps } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY']!,
  authDomain: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN']!,
  projectId: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID']!,
  storageBucket: process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET']!,
  messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID']!,
  appId: process.env['NEXT_PUBLIC_FIREBASE_APP_ID']!,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

// Local development against the Firebase Auth emulator (`firebase emulators:start --only auth`),
// so the whole stack can run without touching the real project's accounts. The backend honours the
// matching FIREBASE_AUTH_EMULATOR_HOST. Never set in production builds.
const emulatorHost = process.env['NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST'];

if (emulatorHost && !firebaseAuth.emulatorConfig) {
  connectAuthEmulator(firebaseAuth, `http://${emulatorHost}`, { disableWarnings: true });
}
