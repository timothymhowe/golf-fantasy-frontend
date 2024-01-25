import React, { useState } from "react";
import "./log-in-styles.css";

const LOGIN_LABEL_CLASS = "text-gray-700 text-sm";
const LOGIN_INPUT_CLASS = "border-2 border-gray-300 rounded-md text-sm";
const FIELD_CONTAINER_CLASS = "flex items-center space-x-2 justify-end";

const LogInForm = ({
  title,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  loginError,
}) => {
  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col justify-center space-y-2"
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
        <div className="pb-2">
          {loginError && (
            <p className="flash text-red-500 text-sm">{loginError}</p>
          )}
        </div>
        <div className="flex justify-end">
            
          <button
            type="submit"
            className="text-white bg-blue-500 hover:bg-blue-700 rounded font-sans h-8 w-20"
          >
            Login
          </button>
        </div>
    </form>
  );
};

export default LogInForm;
