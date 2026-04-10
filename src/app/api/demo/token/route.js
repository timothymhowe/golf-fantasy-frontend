import { NextResponse } from "next/server";
import admin from "firebase-admin";

/**
 * Server-side demo token endpoint.
 *
 * Mints a short-lived Firebase custom auth token for the demo user.
 * No credentials are exposed to the client — the service account key
 * stays server-side via FIREBASE_ADMIN_SDK_KEY (non-NEXT_PUBLIC_).
 *
 * Rate limited to 20 requests per minute per IP to prevent abuse.
 */

const DEMO_EMAIL = "ailettedemo@gmail.com";

// Simple in-memory rate limiter
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { timestamp: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Initialize Firebase Admin (singleton)
function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY);

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function GET(request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const app = getAdminApp();
    const auth = admin.auth(app);

    // Look up demo user by email, mint a custom token
    const user = await auth.getUserByEmail(DEMO_EMAIL);
    const token = await auth.createCustomToken(user.uid);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Demo token error:", error);
    return NextResponse.json(
      { error: "Demo is temporarily unavailable" },
      { status: 500 }
    );
  }
}
