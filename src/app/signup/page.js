"use client";
import React from "react";
import SignUpForm from "../components/forms/sign-up";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[1000px] flex flex-col mb-4">
        <h1 className="text-7xl font-bold leading-[0.9] mt-6 tracking-tighter bg-gradient-to-t from-gray-400 to-white bg-clip-text text-transparent pb-2">
          pick.golf<span className="text-lg text-gray-500 tracking-tight">(beta)</span>
        </h1>
      </div>

      <div className="w-full max-w-sm backdrop-blur-md bg-black/30 p-8 rounded-2xl shadow-2xl border border-white/20">
        <SignUpForm />
      </div>

      <p className="text-gray-500 mt-8 text-sm">
        Need help? Email jmonahan@pgatour.com
      </p>
    </div>
  );
};

export default SignUpPage;
