"use client";
import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../../../../config/firebaseConfig";
import { createUserInDatabase } from "../../../utils/database";
import "./log-in-styles.css";

const LOGIN_LABEL_CLASS = "text-gray-300 text-sm";
const LOGIN_INPUT_CLASS = "bg-black/50 border border-white/20 rounded-md text-sm p-2 text-white w-full focus:outline-none focus:border-gray-400 transition-colors";
const FIELD_CONTAINER_CLASS = "flex flex-col space-y-1";
const BUTTON_BASE_CLASS = "font-sans h-10 rounded-md font-medium px-4 transition-colors duration-200";

const ERROR_MESSAGES = {
  'auth/invalid-email': "Please enter a valid email address.",
  'auth/user-not-found': "No account found with this email.",
  'auth/wrong-password': "Incorrect password.",
  'auth/too-many-requests': "Too many failed attempts. Please try again later.",
  'auth/user-disabled': "This account has been disabled.",
  'auth/popup-closed-by-user': "Sign in was cancelled.",
  'auth/google-sign-in-cancelled': "Sign in was cancelled.",
  'auth/account-exists-with-different-credential': "An account already exists with this email.",
  default: "Could not sign in. Please check your credentials and try again."
};

const LogInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);

  // Clear error state when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
      setResetEmailSent(false);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setResetEmailSent(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      setError(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // If we get here, the popup wasn't closed early
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        const nameParts = (result.user.displayName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await createUserInDatabase(result.user, firstName, lastName);
        console.log("New user created via Google login");
      }

      console.log("Google login successful");
      router.push("/dashboard");
    } catch (error) {
      // Only log non-user-initiated errors
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request' &&
          error.code !== 'auth/google-sign-in-cancelled') {
        console.error("Google login error:", error.code, error.message);
        setError(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default);
      } else {
        // Optionally log user cancellation at debug level
        console.debug("User cancelled Google login");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter email address to receive password reset link.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError(null);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(ERROR_MESSAGES[error.code] || "Failed to send reset email. Please try again.");
    }
  };

  const handleSignupClick = () => {
    setError(null); // Also clear error before navigation
    router.push('/signup');
  };

  return (
    <div className="flex flex-col space-y-6 w-full">
      {/* Google SSO Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className={`${BUTTON_BASE_CLASS} w-full border border-white/20 hover:bg-white/5 text-white flex items-center justify-center space-x-2`}
      >
        <img src="/google-logo.svg" alt="Google" className="w-5 h-5" />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-white/20"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
        <div className="flex-grow border-t border-white/20"></div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="email" className={LOGIN_LABEL_CLASS}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={LOGIN_INPUT_CLASS}
            required
          />
        </div>

        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="password" className={LOGIN_LABEL_CLASS}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={LOGIN_INPUT_CLASS}
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-right">{error}</p>
        )}

        {resetEmailSent && (
          <p className="text-green-400 text-sm text-right">
            Password reset email sent! Please check your inbox.
          </p>
        )}

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-gray-300 hover:text-white text-sm"
          >
            Forgot Password?
          </button>
          
          <button
            type="submit"
            className={`${BUTTON_BASE_CLASS} bg-white/10 hover:bg-white/20 text-white border border-white/20`}
          >
            Sign In
          </button>
        </div>
      </form>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-white/20">
        <p className="text-gray-400 text-sm">
          Don't have an account?{' '}
          <button 
            onClick={handleSignupClick}
            className="text-white hover:text-gray-300 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LogInForm;
