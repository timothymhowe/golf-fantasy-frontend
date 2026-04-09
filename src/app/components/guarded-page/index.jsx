"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth-provider";
import LoadingScreen from "../loading-screen";

const GuardedPage = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isDemoUser = user?.email === "ailettedemo@gmail.com";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && isDemoUser) {
      router.replace("/demo");
    }
  }, [user, loading, router, isDemoUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || isDemoUser) {
    return null;
  }

  return children;
};

export default GuardedPage;
