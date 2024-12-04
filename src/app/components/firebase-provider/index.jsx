"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import firebase from '../../../config/firebaseConfig';
import { useRouter } from 'next/navigation';
import { auth } from '../../../config/firebaseConfig';
import LoadingScreen from '../loading-screen';

const FirebaseContext = createContext(null);

export function FirebaseProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    let inactivityTimeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        // Sign out user and redirect to login
        auth.signOut()
          .then(() => {
            router.push('/login');
          })
          .catch((error) => {
            console.error('Error signing out:', error);
          });
      }, 30*60*1000); // 30 minutes
    };

    // Reset timer on user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);

    // Initial timer
    resetTimer();

    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [router]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}