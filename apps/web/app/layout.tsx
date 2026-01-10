import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RequestLogger } from "../src/components/telemetry/RequestLogger";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clisonix Cloud - Industrial AGI Dashboard",
  description: "The Most Advanced AGI in the World - Industrial Backend with Payment Processing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Construction/Beta Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-center py-2 px-4 text-sm font-medium shadow-lg z-50 relative">
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            🚧 <strong>BETA</strong> - System is under construction and testing. Some features may not be available. 
            <span className="hidden sm:inline">| Industrial AGI Platform v2.1.0</span>
            🚧
          </span>
        </div>
        <RequestLogger />
        {children}
      </body>
    </html>
  );
}


