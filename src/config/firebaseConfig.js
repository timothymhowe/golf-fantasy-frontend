import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let firebase = {
  app: null,
  auth: null,
  firestore: null,
  analytics: null,
};

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    firebase.app = initializeApp(firebaseConfig);
    firebase.auth = getAuth(firebase.app);
    firebase.firestore = getFirestore(firebase.app);
    firebase.analytics = getAnalytics(firebase.app);
  } else {
    firebase.app = getApps()[0];
    firebase.auth = getAuth(firebase.app);
    firebase.firestore = getFirestore(firebase.app);
    firebase.analytics = getAnalytics(firebase.app);
  }
}

export default firebase;

// For backward compatibility with your existing code
export const app = firebase.app;
export const auth = firebase.auth;
export const firestoreDb = firebase.firestore;
