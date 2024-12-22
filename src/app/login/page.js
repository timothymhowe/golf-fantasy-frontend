"use client";
import React from "react";
import LogInForm from "../components/forms/log-in";
import HeroContainer from '../components/hero-container';
import FloatingText from "../components/floating-text";
import {Logo} from "../components/logo";

const SUBTITLES = [
  "If you're reading this, you have strong opinions on the LIV/PGA merger.",
  "100% funded by the Saudi Public Investment Fund!",
  "If its not Poa Annua, I won't play on it.",
  "The Cognizant Classic in the Palm Beaches isn't going to watch itself.",
  "You definitely could have gone pro.",
  "Zach Johnson was a great captain, actually.",
  "Sponsored by P.F. Chang's."
];

const LoginPage = () => {
  // Get random subtitle on component mount
  const [subtitle] = React.useState(() => 
    SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-top px-6 pb-[env(safe-area-inset-bottom,24px)]">
      <div className="w-full max-w-[1000px]">
        <div className="flex flex-row items-center mt-10">
          <Logo className="mb-4 z-10" logoSize={100} />
          <div className="flex flex-col mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.9] tracking-tighter bg-gradient-to-t from-gray-400 to-white bg-clip-text text-transparent pb-2 md:pb-3 lg:pb-4">
              pick.golf<span className="text-sm text-gray-500 tracking-tight">(beta)</span>
            </h1>
          </div>
        </div>
      </div>
      
      <HeroContainer>
        <div className="flex flex-col items-center w-full gap-4">
          <FloatingText>
            <p className="text-gray-800 text-lg md:text-xl italic font-medium text-center max-w-[280px] md:max-w-md tracking-tight">
              {subtitle}
            </p>
          </FloatingText>

          <div className="w-full max-w-xs backdrop-blur-md bg-black/30 p-6 rounded-2xl shadow-2xl border border-white/20">
            <LogInForm />
          </div>
        </div>
      </HeroContainer>

      <p className="text-gray-300 mt-8 mb-8 text-sm italic">
        Need help? Email jmonahan@pgatour.com
      </p>
    </div>
  );
};

export default LoginPage;