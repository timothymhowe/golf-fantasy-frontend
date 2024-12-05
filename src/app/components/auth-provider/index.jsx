"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../config/firebaseConfig";
import { useFirebase } from "../firebase-provider";
import LoadingScreen from "../loading-screen";
/**
 * Context for managing authentication state.
 * @typedef {Object} AuthContext
 * @property {Object} AuthContext.Provider - Provider component for the authentication context.
 * @property {function} useAuth - Hook for accessing the authentication context.
 */
const AuthContext = createContext(null);

/**
 * Custom hook for accessing the authentication context.
 * @returns {AuthContext} The authentication context.
 */
export const useAuth = () => {
  const { auth } = useFirebase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/user/leagues', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setLeagues(data.data);
          }
        } catch (error) {
          console.error('Error fetching user leagues:', error);
          setLeagues([]);
        }
        setUser(user);
      } else {
        setUser(null);
        setLeagues(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, auth, leagues };
};

/**
 * Provider component for the authentication context.
 * Manages user authentication state and provides it to child components.
 * 
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The authentication provider component.
 */
export const AuthProvider = ({ children }) => {
  const { user, loading, leagues } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, leagues }}>
      {children}
    </AuthContext.Provider>
  );
};
