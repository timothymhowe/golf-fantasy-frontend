"use client";
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseConfig, {app} from "../../config/firebaseConfig";

import { useRouter } from 'next/navigation';
import SignUpForm from "../components/forms/sign-up";
import PageLayout from "../components/hg-layout";


// try to initialize firebase
try{
    var auth = getAuth(app);
} catch (e) {
    console.log("Error authenticating.")
    console.log(auth.app.name)
    console.log(e);

}


const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);


  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

    //   console.log('User created:', user);

    //   await user.updateProfile({
    //     displayName: displayName,
    //     phoneNumber: phoneNumber,
    //   });

      console.log("User signed up:", user);
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  return (
    <PageLayout>
         <SignUpForm
         title={'Sign Up'}
         maxHeight={'h-200'}
         firstName={firstName}
         setFirstName={setFirstName}
         lastName={lastName}
         setLastName={setLastName}
         phoneNumber={phoneNumber}
         setPhoneNumber={setPhoneNumber}
         displayName={displayName}
         setDisplayName={setDisplayName}
         email={email}
         setEmail={setEmail}
         password={password}
         setPassword={setPassword}
         handleSignUp={handleSignUp}
         error={error}
       />


     

    </PageLayout>
  );
};

export default SignUpPage;
