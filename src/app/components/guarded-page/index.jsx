import React, { createContext, useEffect, useState, useContext } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { redirect, useRouter } from "next/navigation";

import { app } from "../../../config/firebaseConfig";
import { AuthProvider, useAuth } from "../auth-provider";

import { getAuth } from "firebase/auth";




/**
 *
 * @param {*} param0
 * @returns
 */
const GuardedPageNoAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  let auth;

  const router = useRouter();
  try {
    auth = getAuth(app);
  } catch (error) {
    console.log("Error authenticating.");
    console.log(error);
  }

  useEffect(() => {
    const listener = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("User signed out.");
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
    return () => {
      listener();
    };
  }, [auth, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {auth.currentUser.email}
      {children}
    </div>
  );
};

const GuardedPage = (props) => {
  return (
    <AuthProvider>
      <GuardedPageNoAuth {...props} />
    </AuthProvider>
  );
}

export default GuardedPage;
