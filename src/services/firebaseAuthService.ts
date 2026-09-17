import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  Auth
} from 'firebase/auth';
import { getFirestore, doc, setDoc, Firestore } from 'firebase/firestore';
import { UserProfile } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);
} catch (e) {
  console.warn('Firebase init warning:', e);
}

export class FirebaseAuthService {
  static getAuthInstance(): Auth {
    if (!auth) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);
      auth = getAuth(app);
    }
    return auth;
  }

  static getFirestoreInstance(): Firestore {
    if (!db) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);
      db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);
    }
    return db;
  }

  /**
   * Real Google OAuth Pop-up
   */
  static async signInWithGoogle(): Promise<UserProfile> {
    const authInst = this.getAuthInstance();
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(authInst, provider);
    const fbUser = result.user;

    const email = fbUser.email?.toLowerCase().trim() || '';
    const displayName = fbUser.displayName?.trim() || email.split('@')[0] || 'परीक्षार्थी';
    const photoURL = fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0B2046&color=fff&size=256`;
    const uid = fbUser.uid || `usr_${Date.now()}`;

    const profile: UserProfile = {
      id: uid,
      authUid: uid,
      authProvider: 'google',
      isGoogleUser: true,
      name: displayName,
      displayName,
      email,
      photoURL,
      avatarUrl: photoURL,
      phone: fbUser.phoneNumber || '',
      province: 'बागमती प्रदेश',
      district: 'काठमाडौं',
      targetExam: 'नेपाल राष्ट्र बैंक (NRB) - सहायक ४',
      xp: 250,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toISOString(),
      questionsSolved: 0,
      quizzesCompleted: 0,
      accuracy: 100,
      rank: 'तह ४: नयाँ प्रतियोगी (Aspirant)',
      isRegistered: true,
      isGuest: false,
      profileCompletion: 85,
      hasReceivedCompletionBonus: false
    };

    // Save to Firestore asynchronously
    try {
      const firestore = this.getFirestoreInstance();
      await setDoc(doc(firestore, 'users', uid), {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Could not sync user to Firestore:', dbErr);
    }

    return profile;
  }

  /**
   * Email/Password Sign-In
   */
  static async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const authInst = this.getAuthInstance();
    const result = await signInWithEmailAndPassword(authInst, email.trim().toLowerCase(), pass);
    const fbUser = result.user;

    const cleanEmail = fbUser.email?.toLowerCase().trim() || email.toLowerCase().trim();
    const displayName = fbUser.displayName?.trim() || cleanEmail.split('@')[0] || 'विद्यार्थी';
    const photoURL = fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0B2046&color=fff&size=256`;
    const uid = fbUser.uid;

    const profile: UserProfile = {
      id: uid,
      authUid: uid,
      authProvider: 'email',
      isGoogleUser: false,
      name: displayName,
      displayName,
      email: cleanEmail,
      photoURL,
      avatarUrl: photoURL,
      phone: fbUser.phoneNumber || '',
      province: 'बागमती प्रदेश',
      district: 'काठमाडौं',
      targetExam: 'नेपाल राष्ट्र बैंक (NRB) - सहायक ४',
      xp: 150,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toISOString(),
      questionsSolved: 0,
      quizzesCompleted: 0,
      accuracy: 100,
      rank: 'तह ४: नयाँ प्रतियोगी (Aspirant)',
      isRegistered: true,
      isGuest: false,
      profileCompletion: 70,
      hasReceivedCompletionBonus: false
    };

    return profile;
  }

  /**
   * Email/Password Sign-Up
   */
  static async signUpWithEmail(name: string, email: string, pass: string, targetExam?: string): Promise<UserProfile> {
    const authInst = this.getAuthInstance();
    const result = await createUserWithEmailAndPassword(authInst, email.trim().toLowerCase(), pass);
    const fbUser = result.user;

    const cleanEmail = fbUser.email?.toLowerCase().trim() || email.toLowerCase().trim();
    const cleanName = name.trim() || cleanEmail.split('@')[0] || 'नयाँ परीक्षार्थी';
    const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0B2046&color=fff&size=256`;
    const uid = fbUser.uid;

    const profile: UserProfile = {
      id: uid,
      authUid: uid,
      authProvider: 'email',
      isGoogleUser: false,
      name: cleanName,
      displayName: cleanName,
      email: cleanEmail,
      photoURL,
      avatarUrl: photoURL,
      phone: '',
      province: 'बागमती प्रदेश',
      district: 'काठमाडौं',
      targetExam: targetExam || 'नेपाल राष्ट्र बैंक (NRB) - सहायक ४',
      xp: 200,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toISOString(),
      questionsSolved: 0,
      quizzesCompleted: 0,
      accuracy: 100,
      rank: 'तह ४: नयाँ प्रतियोगी (Aspirant)',
      isRegistered: true,
      isGuest: false,
      profileCompletion: 80,
      hasReceivedCompletionBonus: false
    };

    // Save to Firestore
    try {
      const firestore = this.getFirestoreInstance();
      await setDoc(doc(firestore, 'users', uid), {
        ...profile,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Could not sync new user to Firestore:', dbErr);
    }

    return profile;
  }

  /**
   * Send Password Reset Link
   */
  static async sendPasswordReset(email: string): Promise<void> {
    const authInst = this.getAuthInstance();
    await sendPasswordResetEmail(authInst, email.trim().toLowerCase());
  }

  /**
   * Sign Out
   */
  static async signOutUser(): Promise<void> {
    try {
      const authInst = this.getAuthInstance();
      await signOut(authInst);
    } catch (e) {
      console.warn('Firebase sign out error:', e);
    }
  }
}
