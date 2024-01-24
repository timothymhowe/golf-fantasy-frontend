// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3xd1zpQFgHUtlBeC6d8b-eYPfBjPjCh0",
  authDomain: "golf-pickem.firebaseapp.com",
  projectId: "golf-pickem",
  storageBucket: "golf-pickem.appspot.com",
  messagingSenderId: "371710577879",
  appId: "1:371710577879:web:073810b7e0b14ca7ceb492",
  measurementId: "G-LDFZLMGFLG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;

if (typeof window !== 'undefined'){
   analytics = getAnalytics(app);
};

export { app, analytics };
export default firebaseConfig;
