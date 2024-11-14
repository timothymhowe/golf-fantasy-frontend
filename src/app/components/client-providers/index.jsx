"use client";

import { AuthProvider } from "../auth-provider";

export function ClientProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
} 