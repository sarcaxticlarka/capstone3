import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/ToastProvider";
import ClientSessionProvider from "../components/ClientSessionProvider";
import SessionSync from "../components/SessionSync";
import GoogleAuthSync from "../components/GoogleAuthSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineScope - Discover Movies & TV Shows",
  description: "A full-stack Netflix-style streaming platform for discovering and watching movies & TV shows. Browse trending content, search thousands of titles, and manage your watchlist.",
  keywords: ["movies", "tv shows", "streaming", "entertainment", "TMDB", "watch online", "CineScope"],
 
  publisher: "CineScope",
  openGraph: {
    title: "CineScope - Discover Movies & TV Shows",
    description: "Discover, search, and watch movies & TV shows from one platform",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineScope - Discover Movies & TV Shows",
    description: "Discover, search, and watch movies & TV shows from one platform",
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSessionProvider>
          <SessionSync />
          <GoogleAuthSync />
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
