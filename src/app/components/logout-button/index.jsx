import React from "react";
import firebase from "firebase/app";

import { useAuth } from "../auth-provider";
import { useRouter } from "next/navigation";

import { signOut } from "firebase/auth";

const LogoutButton = () => {
  const { auth } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      router.replace('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 border border-green-700 shadow-lg m-2 h-auto transition duration-500 ease-in-out rounded"
    >
      Logout
    </button>
  );
};
 
export default LogoutButton;
