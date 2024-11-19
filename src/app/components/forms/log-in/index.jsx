import React from "react";
import "./log-in-styles.css";

const LOGIN_LABEL_CLASS = "text-gray-300 text-sm";
const LOGIN_INPUT_CLASS = "bg-black/50 border border-white/20 rounded-md text-sm p-2 text-white w-full focus:outline-none focus:border-gray-400 transition-colors";
const FIELD_CONTAINER_CLASS = "flex flex-col space-y-1";
const BUTTON_BASE_CLASS = "font-sans h-10 rounded-md font-medium px-4 transition-colors duration-200";

const LogInForm = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  handleGoogleLogin,
  handleSignupClick,
  loginError,
  isSigningUp, // prop to toggle between login/signup views
  setIsSigningUp //prop to toggle state of signup form
}) => {
  return (
    <div className="flex flex-col space-y-6 w-full">
      
     

      {/* Google SSO Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className={`${BUTTON_BASE_CLASS} w-full border border-white/20 hover:bg-white/5 text-white flex items-center justify-center space-x-2`}
      >
        <img 
          src="/google-logo.svg" 
          alt="Google" 
          className="w-5 h-5"
        />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-white/20"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
        <div className="flex-grow border-t border-white/20"></div>
      </div>

       {/* Email/Password Form */}
       <form
        onSubmit={handleLogin}
        className="flex flex-col space-y-4"
      >
        <div className={FIELD_CONTAINER_CLASS}>
          <label
            htmlFor="email"
            className={LOGIN_LABEL_CLASS}
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            placeholder="mindy.lawton@dennys.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={LOGIN_INPUT_CLASS}
          />
        </div>
        <div className={FIELD_CONTAINER_CLASS}>
          <label htmlFor="password" className={LOGIN_LABEL_CLASS}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={LOGIN_INPUT_CLASS}
          />
        </div>
      

      

        {loginError && (
          <p className="flash text-red-400 text-sm text-right">{loginError}</p>
        )}

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleSignupClick}
            className="text-gray-300 hover:text-white text-sm"
          >
            Sign Up
          </button>
          
          <button
            type="submit"
            className={`${BUTTON_BASE_CLASS} bg-white/10 hover:bg-white/20 text-white border border-white/20`}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogInForm;
