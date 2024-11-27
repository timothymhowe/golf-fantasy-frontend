import { Inter } from "next/font/google";
import "./globals.css";
// import { ClientProviders } from "./components/client-providers";
import { FirebaseProvider } from "./components/firebase-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Golf Pick'em 2024",
  description: "Show me what you got.",
};

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