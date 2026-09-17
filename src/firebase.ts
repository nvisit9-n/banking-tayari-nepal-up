import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

/**
 * Hardcoded Firebase authDomain:
 * Harmonized to 'plasma-tribute-kf6jr.firebaseapp.com' so authentication popups
 * work seamlessly on all domain aliases without domain rejection errors.
 */
export const firebaseConfig = {
  ...rawConfig,
  authDomain: 'plasma-tribute-kf6jr.firebaseapp.com',
};

export const app: FirebaseApp = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, rawConfig.firestoreDatabaseId || undefined);

export default app;
