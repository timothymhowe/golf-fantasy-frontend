import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "./components/firebase-provider";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "pick.golf",
  description: "Show me what you got.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'pick.golf',
  },
  openGraph: {
    title: 'Fantasy Golf',
    description: 'Show me what you got.',
    url: 'https://www.pick.golf',
    siteName: 'www.pick.golf',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fantasy Golf',
    description: 'Show me what you got.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ]
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        <FirebaseProvider>
          <SpeedInsights />
          <Analytics />
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}