"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import firebase from '../../../config/firebaseConfig';

const FirebaseContext = createContext(null);

export function FirebaseProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    return <div>Loading...</div>;
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