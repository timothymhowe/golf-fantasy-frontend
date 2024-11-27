"use client";
import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { useRouter } from 'next/navigation';

import { useFirebase } from '../../firebase-provider';
import { createUserInDatabase } from "../../../utils/database";
import Image from "next/image";
const ERROR_MESSAGES = {
  'auth/email-already-in-use': "An account with this email already exists.",
  'auth/weak-password': "Password should be at least 6 characters.",
  'auth/invalid-email': "Please enter a valid email address.",
  'auth/popup-closed-by-user': "Sign in was cancelled.",
  'auth/cancelled-popup-request': "Sign in was cancelled.",
  'auth/google-sign-in-cancelled': "Sign in was cancelled.",
  'auth/network-request-failed': "Network error. Please check your connection.",
  'auth/too-many-requests': "Too many attempts. Please try again later.",
  'auth/invalid-credential': "Invalid credentials provided.",
  'validation/passwords-dont-match': "Passwords do not match.",
  'validation/password-too-short': "Password must be at least 6 characters.",
  'validation/missing-fields': "Please fill in all required fields.",
  default: "Could not create account. Please try again."
};

const SIGNUP_LABEL_CLASS = "text-gray-300 text-sm";
const SIGNUP_INPUT_CLASS = "bg-black/50 border border-white/20 rounded-md text-sm p-2 text-white w-full focus:outline-none focus:border-gray-400 transition-colors";
const FIELD_CONTAINER_CLASS = "flex flex-col space-y-1";
const BUTTON_BASE_CLASS = "font-sans h-10 rounded-md font-medium px-4 transition-colors duration-200";

const SignUpForm = () => {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState(null);

  const { auth } = useFirebase();
  const router = useRouter();

  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      setError(ERROR_MESSAGES['validation/missing-fields']);
      return false;
    }
    
    if (password !== passwordConfirm) {
      setError(ERROR_MESSAGES['validation/passwords-dont-match']);
      return false;
    }

    if (password.length < 6) {
      setError(ERROR_MESSAGES['validation/password-too-short']);
      return false;
    }

    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
     
      if (!auth) throw new Error('Auth not initialized');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: displayName || `${firstName} ${lastName}`,
        photoURL: avatarUrl || null
      });

      await createUserInDatabase(userCredential.user, firstName, lastName);
      console.log("User signed up successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign up error:", error.code, error.message);
      setError(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      if (!auth) throw new Error('Auth not initialized');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        const nameParts = (result.user.displayName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        try {
          await createUserInDatabase(result.user, firstName, lastName);
          console.log("New user created via Google signup");
        } catch (dbError) {
          console.error("Database creation error:", dbError);
          setError("Failed to create user profile. Please try again.");
          return;
        }
      } else {
        console.log("Existing user logged in via Google");
      }

      router.push("/dashboard");
    } catch (error) {
      // Only log non-user-initiated errors
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request') {
        console.error("Google signup error:", error.code, error.message);
        setError(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default);
      } else {
        console.debug("User cancelled Google signup");
      }
    }
  };

  // Clear error when component unmounts or when user starts typing
  useEffect(() => {
    return () => setError(null);
  }, []);

  useEffect(() => {
    // Clear error when user modifies any input
    setError(null);
  }, [email, password, passwordConfirm, firstName, lastName, displayName]);

  const handleLoginClick = () => {
    setError(null);
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <button
        type="button"
        onClick={handleGoogleSignUp}
        className={`${BUTTON_BASE_CLASS} w-full border border-white/20 hover:bg-white/5 text-white flex items-center justify-center space-x-2 mb-6`}
      >
        <Image src="/google-logo.svg" alt="Google" className="w-5 h-5" width={20} height={20}/>
        <span>Continue with Google</span>
      </button>

      <div className="relative flex items-center w-full mb-6">
        <div className="flex-grow border-t border-white/20"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
        <div className="flex-grow border-t border-white/20"></div>
      </div>

      <form onSubmit={handleSignUp} className="w-full max-w-sm space-y-4">
        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="firstName" className={SIGNUP_LABEL_CLASS}>First Name:</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={SIGNUP_INPUT_CLASS}
          />
        </div>

        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="lastName" className={SIGNUP_LABEL_CLASS}>Last Name:</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={SIGNUP_INPUT_CLASS}
          />
        </div>

        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="displayName" className={SIGNUP_LABEL_CLASS}>Display Name:</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={SIGNUP_INPUT_CLASS}
          />
        </div>

        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="email" className={SIGNUP_LABEL_CLASS}>Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={SIGNUP_INPUT_CLASS}
          />
        </div>

        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="password" className={SIGNUP_LABEL_CLASS}>Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={SIGNUP_INPUT_CLASS}
          />
        </div>

        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="passwordConfirm" className={SIGNUP_LABEL_CLASS}>Confirm Password:</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={SIGNUP_INPUT_CLASS}
          />
        </div>

        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="Avatar URL" className={SIGNUP_LABEL_CLASS}>Avatar URL (optional):</label>
          <input
            id="avatar_url"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className={SIGNUP_INPUT_CLASS}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-right">{error}</p>
        )}

        <div className="flex justify-between items-center pt-2">
          <a
            href="/login"
            className="text-gray-300 hover:text-white text-sm"
          >
            Back to Login
          </a>
          
          <button
            type="submit"
            className={`${BUTTON_BASE_CLASS} bg-white/10 hover:bg-white/20 text-white`}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;