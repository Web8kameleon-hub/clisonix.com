import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RequestLogger } from "../src/components/telemetry/RequestLogger";
import { DynamicFavicon } from "../src/components/DynamicFavicon";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 🚀 AGGRESSIVE SEO - Maximum visibility
export const metadata: Metadata = {
  metadataBase: new URL('https://clisonix.cloud'),
  title: {
    default: "Clisonix Cloud - AI-Powered Industrial Intelligence Platform",
    template: "%s | Clisonix Cloud"
  },
  description: "Clisonix Cloud: The next-generation AI platform for industrial intelligence, behavioral science, and real-time analytics. Transform your data into actionable insights with our advanced machine learning solutions.",
  keywords: [
    "AI platform", "industrial intelligence", "machine learning", "behavioral science",
    "real-time analytics", "cloud computing", "neural networks", "data science",
    "IoT analytics", "predictive analytics", "cognitive computing", "deep learning",
    "automation", "smart manufacturing", "Industry 4.0", "digital transformation",
    "Clisonix", "AGI", "artificial general intelligence"
  ],
  authors: [{ name: "Clisonix", url: "https://clisonix.cloud" }],
  creator: "Clisonix",
  publisher: "Clisonix Cloud",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clisonix.cloud',
    siteName: 'Clisonix Cloud',
    title: 'Clisonix Cloud - AI-Powered Industrial Intelligence',
    description: 'Transform your industrial operations with AI-powered analytics, behavioral science insights, and real-time monitoring.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clisonix Cloud - Industrial AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clisonix Cloud - AI-Powered Industrial Intelligence',
    description: 'Next-generation AI platform for industrial intelligence and behavioral science.',
    images: ['/og-image.png'],
    creator: '@clisonix',
  },
  alternates: {
    canonical: 'https://clisonix.cloud',
  },
  category: 'Technology',
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Add after Google Search Console setup
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Schema.org Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Clisonix Cloud",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "150"
              },
              "description": "AI-powered industrial intelligence and behavioral science platform",
              "url": "https://clisonix.cloud",
              "author": {
                "@type": "Organization",
                "name": "Clisonix",
                "url": "https://clisonix.cloud"
              }
            })
          }}
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Clisonix",
              "url": "https://clisonix.cloud",
              "logo": "https://clisonix.cloud/logo.png",
              "sameAs": [
                "https://github.com/LedjanAhmati/Clisonix-cloud",
                "https://twitter.com/clisonix"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "availableLanguage": ["English", "Albanian"]
              }
            })
          }}
        />
        <link rel="canonical" href="https://clisonix.cloud" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* BETA banner removed - platform is now stable
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-center py-2 px-4 text-sm font-medium shadow-lg z-50 relative">
          <span className="inline-flex items-center gap-2">
            🚧 <strong>BETA</strong> - System is under construction 🚧
          </span>
        </div>
        */}
        {/* DynamicFavicon disabled - causing too many requests in dev mode */}
        {/* <DynamicFavicon /> */}
        <RequestLogger />
        {children}
      </body>
    </html>
  );
}


