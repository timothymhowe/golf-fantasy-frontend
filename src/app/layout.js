import { Inter } from "next/font/google";
import "./globals.css";
// import { ClientProviders } from "./components/client-providers";
import { FirebaseProvider } from "./components/firebase-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Golf Pick'em 2024",
  description: "Show me what you got.",
  openGraph: {
    title: 'Fantasy Golf',
    description: 'Show me what you got.',
    url: 'https://www.pick.golf',
    siteName: 'Fantasy Golf',
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
    other: [
      { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}