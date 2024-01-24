import React from "react";
import firebase from "firebase/app";

import { useAuth } from "../auth-provider";
import { useRouter } from "next/navigation";

import { signOut } from "firebase/auth";

const LogoutButton = () => {
  const auth = useAuth();
  const router = useRouter();

  // try {
  //     auth = getAuth(app);
  // } catch (error) {
  //     console.log(" Authentication error. SOURCE: SIGN OUT BUTTON");
  //     console.log(error);
  // }
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out.");
        // router.push("/login");
      })
      .catch((error) => {
        console.log("Error signing out.");
        console.log(error);
      });
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
