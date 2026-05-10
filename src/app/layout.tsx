import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NavigationProgress } from "@/components/progress-bar";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fbfaf7',
};

export const metadata: Metadata = {
  title: {
    default: "OnNepal — Everything Local. One Place.",
    template: '%s | OnNepal',
  },
  description: "Nepal's local platform — business directory, classifieds, jobs, events, and lost & found. Create your own business page at yourname.onnepal.com.",
  keywords: ['Nepal', 'business directory', 'classifieds', 'yellow pages', 'jobs Nepal', 'events Nepal', 'lost and found Nepal', 'local platform Nepal'],
  authors: [{ name: 'OnNepal' }],
  creator: 'OnNepal',
  // SVG for modern browsers (sharp at any DPI), .ico fallback for legacy /
  // taskbar integrations, apple-touch for iOS home-screen pin.
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  metadataBase: new URL('https://onnepal.com'),
  openGraph: {
    title: "OnNepal — Everything Local. One Place.",
    description: "Nepal's local platform — businesses, classifieds, jobs, events, and more.",
    siteName: 'OnNepal',
    type: 'website',
    locale: 'en_US',
    url: 'https://onnepal.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: "OnNepal — Everything Local. One Place.",
    description: "Nepal's local platform — businesses, classifieds, jobs, events, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://onnepal.com',
  },
  manifest: '/manifest.webmanifest',
  other: {
    'geo.region': 'NP',
    'geo.placename': 'Nepal',
    'geo.position': '27.7172;85.3240',
    'ICBM': '27.7172, 85.3240',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Tiro+Devanagari+Sanskrit&display=swap"
        />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'OnNepal',
                url: 'https://onnepal.com',
                description: "Nepal's local platform — businesses, classifieds, jobs, events, and more.",
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://onnepal.com/search?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'OnNepal',
                url: 'https://onnepal.com',
                logo: 'https://onnepal.com/icon.svg',
                description: "Nepal's local platform for businesses, classifieds, jobs, events, and community.",
              },
            ]),
          }}
        />
        <NavigationProgress>
          <SiteHeader />
          {children}
          <SiteFooter />
        </NavigationProgress>
        <Toaster position="bottom-right" toastOptions={{ style: { fontSize: '14px' } }} />
      </body>
    </html>
  );
}
