"use client";
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebaseConfig, { app } from "../../config/firebaseConfig";
import { useRouter } from "next/navigation";
import LogInForm from "../components/forms/log-in";
import HeroContainer from '../components/hero-container';
import FloatingText from "../components/floating-text";

const ERROR_MESSAGE = "The username or password is incorrect.";



const SUBTITLES = [
  "If you're reading this, you have strong opinions on the LIV/PGA merger.",
  "100% funded by the Saudi Public Investment Fund!",
  "If its not Poa Annua, I won't play on it.",
  "The Cognizant Classic in the Palm Beaches isn't going to watch itself.",
  "You definitely could have gone pro.",
  "Zach Johnson was a great Ryder Cup captain, actually.",
  "Sponsored by P.F. Chang's."
];

try {
  var auth = getAuth(app);
} catch (e) {
  console.log("Error authenticating.");
  console.log(auth.app.name);
  console.log(e);
}

const ERROR_MESSAGES = {
  'auth/popup-closed-by-user': "Sign in was cancelled.",
  'auth/google-sign-in-cancelled': "Sign in was cancelled.",
  'auth/account-exists-with-different-credential': "An account already exists with this email.",
  default: "Could not sign in with Google. Please try again."
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();
  
  // Get random subtitle on component mount
  const [subtitle] = useState(() => 
    SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]
  );

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User logged in:", userCredential.user);
        router.push("/dashboard");
      })
      .catch((error) => {
        console.error("Login error:", error.code, error.message);
        setLoginError(ERROR_MESSAGE); 
      });
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for profile and email
      provider.addScope('profile');
      provider.addScope('email');
      
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      
      console.log("Google sign in successful:", result.user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Google sign in error:", error.code, error.message);
      setLoginError(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default);
    }
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
    <div className="w-full max-w-[1000px] flex flex-col mb-4">
      <h1 className="text-white text-6xl font-bold leading-[0.9]">
        Golf
        Pick'em
      </h1>
    </div>
      
      
      <HeroContainer>
      <div className="flex flex-col items-center w-full"> {/* Added wrapper div */}

        {/* Random Subtitle */}{/* Random Subtitle */}

        <FloatingText>
        <p className="text-gray-800 text-xl mb-10  italic font-medium text-center max-w-md">
        {subtitle}
      </p>
        </FloatingText>
     

        {/* Glass Container */}
        <div className="w-full max-w-xs backdrop-blur-md bg-black/30 p-8 rounded-2xl shadow-2xl border border-white/20">

          <LogInForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            handleGoogleLogin={handleGoogleLogin}
            loginError={loginError}
            handleSignupClick={handleSignupClick}
          />
        </div>
        </div>
      </HeroContainer>

      {/* Footer Text */}
      <p className="text-gray-500 mt-8 text-sm">
        Need help? Email jmonahan@pgatour.com
      </p>
    </div>
  );
};

export default LoginPage;
