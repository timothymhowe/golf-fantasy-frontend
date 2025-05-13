"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
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
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          
          // Fetch both profile and leagues data
          const [profileResponse, leaguesResponse] = await Promise.all([
            fetch('/api/user/profile', {
              headers: { 'Authorization': `Bearer ${token}` },
            }),
            fetch('/api/user/leagues', {
              headers: { 'Authorization': `Bearer ${token}` },
            })
          ]);

          const [profileData, leaguesData] = await Promise.all([
            profileResponse.json(),
            leaguesResponse.json()
          ]);

          if (profileData.success) {
            setUserProfile(profileData.data);
          }
          if (leaguesData.success) {
            setLeagues(leaguesData.data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLeagues([]);
        }
        setUser(user);
      } else {
        setUser(null);
        setUserProfile(null);
        setLeagues(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, auth, leagues, userProfile };
};

export const AuthProvider = ({ children }) => {
  const { user, loading, auth, leagues, userProfile } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, leagues, auth, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};