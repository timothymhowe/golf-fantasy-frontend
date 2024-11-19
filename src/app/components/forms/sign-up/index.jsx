import React from 'react';

const SIGNUP_LABEL_CLASS = "text-gray-300 text-sm";
const SIGNUP_INPUT_CLASS = "bg-black/50 border border-white/20 rounded-md text-sm p-2 text-white w-full focus:outline-none focus:border-gray-400 transition-colors";
const FIELD_CONTAINER_CLASS = "flex flex-col space-y-1";
const BUTTON_BASE_CLASS = "font-sans h-10 rounded-md font-medium px-4 transition-colors duration-200";

const SignUpForm = ({ 
  firstName, setFirstName,
  lastName, setLastName,
  phoneNumber, setPhoneNumber,
  displayName, setDisplayName,
  email, setEmail,
  password, setPassword,
  avatarUrl, setAvatarUrl,
  handleSignUp,
  handleGoogleSignUp,
  error 
}) => (
  <div className="flex flex-col items-center justify-center px-4">
    <button
      type="button"
      onClick={handleGoogleSignUp}
      className={`${BUTTON_BASE_CLASS} w-full border border-white/20 hover:bg-white/5 text-white flex items-center justify-center space-x-2 mb-6`}
    >
      <img 
        src="/google-logo.svg" 
        alt="Google" 
        className="w-5 h-5"
      />
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

export default SignUpForm;