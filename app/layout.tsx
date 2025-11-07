import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PantryPlus - Smart Pantry Manager",
  description: "A smart offline-first kitchen PWA for managing pantry inventory, shopping lists, and recipes",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PantryPlus",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
