import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./components/client-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Golf Pick'em 2024",
  description: "Show me what you got.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}