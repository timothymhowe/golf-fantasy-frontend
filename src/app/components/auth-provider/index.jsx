import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { app } from "../../../config/firebaseConfig";
import { set } from "date-fns";

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
  return useContext(AuthContext);
};

/**
 * Provider component for the authentication context.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The authentication provider component.
 */
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    const authInstance = getAuth(app);
    if (authInstance) {
      setAuth(authInstance);
      setLoading(false);

      // Set up a listener for ID token changes
      const unsubscribe = onIdTokenChanged(authInstance, (user) => {
        if (user) {
          user.getIdToken().then(setIdToken);
        } else {
          setIdToken(null);
        }
      });

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={{auth,idToken}}>{children}</AuthContext.Provider>;
};
