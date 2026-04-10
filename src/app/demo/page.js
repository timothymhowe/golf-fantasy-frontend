"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { app } from "../../config/firebaseConfig";
import { useAuth } from "../components/auth-provider";
import PageLayout from "../components/hg-layout";
import LoadingScreen from "../components/loading-screen";
import { Logo } from "../components/logo";

const DEMO_EMAIL = "ailettedemo@gmail.com";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

const WIDGET_IDS = ["#widget-pick", "#widget-leaderboard", "#widget-pick-history", "#widget-league-picks"];

/**
 * Expands a widget if collapsed. On mobile, collapses all other widgets first.
 */
const expandWidget = (id) => {
  const isMobile = window.innerWidth < 1024;

  if (isMobile) {
    WIDGET_IDS.forEach((wid) => {
      if (wid === id) return;
      const widget = document.querySelector(wid);
      if (!widget) return;
      const content = widget.querySelector('[style*="overflow: hidden"]');
      if (content && content.offsetHeight > 0) {
        const btn = widget.querySelector('button[aria-label="Toggle widget"]');
        if (btn) btn.click();
      }
    });
  }

  const widget = document.querySelector(id);
  if (!widget) return;
  const content = widget.querySelector('[style*="overflow: hidden"]');
  if (content && content.offsetHeight === 0) {
    const btn = widget.querySelector('button[aria-label="Toggle widget"]');
    if (btn) btn.click();
  }
};

const LEADERBOARD_STEP_INDEX = 2;
const MODAL_STEP_INDEX = 3;

const TOUR_STEPS = [
  {
    popover: {
      title: "Welcome to pick.golf!",
      description: "Every week, you pick one golfer to represent you in that week's PGA tournament. But you can only pick a golfer once per season! Let's walk through the dashboard.",
    },
  },
  {
    element: "#widget-pick",
    popover: {
      title: "Your Pick",
      description: "This is where you make your weekly pick. Choose any golfer in the field before the tournament starts. Hit 'Change Pick' to try it out!",
    },
    onHighlightStarted: () => expandWidget("#widget-pick"),
  },
  {
    element: "#widget-leaderboard",
    popover: {
      title: "League Scoreboard",
      description: "See how you stack up against your league. Points are based on how your golfer finishes each week. Click any member's name to see their pick history — let's try it.",
    },
    onHighlightStarted: () => expandWidget("#widget-leaderboard"),
  },
  {
    element: "#pick-history-modal",
    popover: {
      title: "Pick History Modal",
      description: "Here's a member's full season — toggle between table and graph view. Every pick, result, and point total at a glance.",
    },
  },
  {
    element: "#widget-pick-history",
    popover: {
      title: "Pick History",
      description: "Your full season at a glance — every pick, every result, every point. Wins are highlighted in gold. Missed picks cost you points, so don't forget!",
    },
    onHighlightStarted: () => expandWidget("#widget-pick-history"),
  },
  {
    element: "#widget-league-picks",
    popover: {
      title: "League Picks",
      description: "See who everyone in your league picked this week. No duplicate restrictions — multiple people can pick the same golfer.",
    },
    onHighlightStarted: () => expandWidget("#widget-league-picks"),
  },
  {
    popover: {
      title: "That's the tour!",
      description: "Go ahead and explore — make a pick, check the leaderboard. When you're ready, hit 'Sign Up Free' to create your own league.",
    },
  },
];

const DemoPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [demoLoading, setDemoLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tourReady, setTourReady] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);

    const signInDemo = async () => {
      try {
        if (auth.currentUser?.email === DEMO_EMAIL) {
          setDemoLoading(false);
          return;
        }

        if (auth.currentUser) {
          await signOut(auth);
        }

        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
        setDemoLoading(false);
      } catch (err) {
        console.error("Demo sign-in failed:", err);
        setError("Demo is temporarily unavailable. Please try again later.");
        setDemoLoading(false);
      }
    };

    if (!authLoading) {
      signInDemo();
    }
  }, [authLoading]);

  // Start the tour once widgets have had time to render
  useEffect(() => {
    if (!demoLoading && !authLoading && user && !tourReady) {
      const timer = setTimeout(() => setTourReady(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [demoLoading, authLoading, user, tourReady]);

  useEffect(() => {
    if (!tourReady) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      allowKeyboardControl: true,
      disableActiveInteraction: true,
      overlayColor: "black",
      overlayOpacity: 0.75,
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: "demo-tour-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Let's go!",
      showButtons: ["next", "previous", "close"],
      steps: TOUR_STEPS,
      onNextClick: () => {
        const stepIndex = driverObj.getActiveIndex();

        if (stepIndex === LEADERBOARD_STEP_INDEX) {
          // Programmatically click the first name to open pick history modal
          const name = document.querySelector("#widget-leaderboard span.cursor-pointer");
          if (name) name.click();
          // Wait for modal to open, then advance
          setTimeout(() => driverObj.moveNext(), 200);
          return;
        }

        if (stepIndex === MODAL_STEP_INDEX) {
          // Close the modal before advancing
          const closeBtn = document.querySelector("#pick-history-modal button[aria-label='Close dialog']");
          if (closeBtn) closeBtn.click();
          setTimeout(() => driverObj.moveNext(), 200);
          return;
        }

        driverObj.moveNext();
      },
      onPrevClick: () => {
        const stepIndex = driverObj.getActiveIndex();

        if (stepIndex === MODAL_STEP_INDEX) {
          // Close the modal before going back
          const closeBtn = document.querySelector("#pick-history-modal button[aria-label='Close dialog']");
          if (closeBtn) closeBtn.click();
          setTimeout(() => driverObj.movePrevious(), 200);
          return;
        }

        driverObj.movePrevious();
      },
    });

    driverObj.drive();

    return () => driverObj.destroy();
  }, [tourReady]);

  const handleExitDemo = async () => {
    const auth = getAuth(app);
    if (auth.currentUser?.email === DEMO_EMAIL) {
      await signOut(auth);
    }
    router.push("/login");
  };

  if (demoLoading || authLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <Logo logoSize={80} className="mb-6" />
        <p className="text-white/70 text-lg mb-4">{error}</p>
        <Link
          href="/login"
          className="text-[#BFFF00] hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-[#BFFF00]/10 via-[#BFFF00]/20 to-[#BFFF00]/10 border-b border-[#BFFF00]/20 relative z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#BFFF00] animate-pulse flex-shrink-0" />
            <p className="text-white/80 text-sm">
              <span className="font-semibold text-[#BFFF00]">Demo Mode</span>
              <span className="hidden sm:inline">
                {" "}&mdash; explore the dashboard, make real picks
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleExitDemo}
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Exit Demo
            </button>
            <Link
              href="/signup"
              onClick={handleExitDemo}
              className="px-4 py-1.5 rounded-lg bg-[#BFFF00] text-black font-semibold text-sm hover:bg-[#9FDF00] transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>

      {/* Real dashboard */}
      <PageLayout disableSidebar />
    </>
  );
};

export default DemoPage;
