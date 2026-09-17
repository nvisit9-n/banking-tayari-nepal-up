import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

/**
 * Resolves Firebase authDomain:
 * Explicitly sets to 'banking-tayari-nepal.vercel.app' as requested,
 * with location.host fallback for custom Vercel deployments or hosting environments.
 */
export const getAuthDomain = (): string => {
  if (typeof window !== 'undefined' && window.location?.host) {
    const host = window.location.host;
    if (host.includes('banking-tayari-nepal.vercel.app') || host.includes('vercel.app')) {
      return host;
    }
    // Location host fallback
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return host;
    }
  }
  return 'banking-tayari-nepal.vercel.app';
};

export const firebaseConfig = {
  ...rawConfig,
  authDomain: 'banking-tayari-nepal.vercel.app', // Explicitly set to banking-tayari-nepal.vercel.app
};

export const resolvedFirebaseConfig = {
  ...rawConfig,
  authDomain: getAuthDomain(),
};

export const app: FirebaseApp = getApps().length > 0 
  ? getApp() 
  : initializeApp(resolvedFirebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, rawConfig.firestoreDatabaseId || undefined);

export default app;
