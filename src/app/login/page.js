"use client";
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseConfig, { app } from "../../config/firebaseConfig";
import { useRouter } from "next/navigation";

import PageLayout from "../components/hg-layout";
import LogInForm from "../components/forms/log-in";

const ERROR_MESSAGE = "The username or password is incorrect.";

// try to initialize firebase
try {
  var auth = getAuth(app);
} catch (e) {
  console.log("Error authenticating.");
  console.log(auth.app.name);
  console.log(e);
}

const title = () => {
  return <div className="text-green-800 font-bold text-2xl">Log In</div>;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");

  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User successfully logged in
        const user = userCredential.user;
        console.log("User logged in:", user);
        router.push("/dashboard");
      })
      .catch((error) => {
        // Error occurred during login
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
        setLoginError(ERROR_MESSAGE); 
      });
  };

  return (
    <PageLayout>
      <LogInForm
        title={title()}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        loginError={loginError}
      />
    </PageLayout>
  );
};

export default LoginPage;
