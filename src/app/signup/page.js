"use client";
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { app } from "../../config/firebaseConfig";
import { useRouter } from 'next/navigation';
import SignUpForm from "../components/forms/sign-up";

const ERROR_MESSAGES = {
  'auth/email-already-in-use': "An account with this email already exists.",
  'auth/weak-password': "Password should be at least 6 characters.",
  'auth/invalid-email': "Please enter a valid email address.",
  default: "Could not create account. Please try again."
};

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const auth = getAuth(app);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password || !firstName || !lastName || !displayName) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName,
        photoURL: avatarUrl || null
      });

      console.log("User signed up successfully:", userCredential.user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign up error:", error.code, error.message);
      setError(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      
      // Only set photoURL if this appears to be first sign in
      // Firebase sets lastLoginAt and createdAt to the same value on first sign in
      if (result.user.metadata.lastLoginAt === result.user.metadata.createdAt) {
        const photoURL = result.user.photoURL;
        if (photoURL) {
          await updateProfile(result.user, {
            photoURL: photoURL
          });
        }
      }

      console.log("Google sign up successful:", result.user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Google sign up error:", error.code, error.message);
      setError(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[1000px] flex flex-col mb-4">
        <h1 className="text-white text-6xl font-bold leading-[0.9]">
          Golf
          Pick'em
        </h1>
      </div>

      <div className="w-full max-w-sm backdrop-blur-md bg-black/30 p-8 rounded-2xl shadow-2xl border border-white/20">
        <SignUpForm
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          displayName={displayName}
          setDisplayName={setDisplayName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          handleSignUp={handleSignUp}
          handleGoogleSignUp={handleGoogleSignUp}
          error={error}
        />
      </div>

      <p className="text-gray-500 mt-8 text-sm">
        Need help? Email jmonahan@pgatour.com
      </p>
    </div>
  );
};

export default SignUpPage;
