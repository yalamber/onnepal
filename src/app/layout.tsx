import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { NavigationProgress } from "@/components/progress-bar";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
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
  icons: { icon: '/icon.svg' },
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
      <body
        className={`${inter.variable} antialiased bg-white`}
        style={{ fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif' }}
      >
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
          <Navbar />
          {children}
        </NavigationProgress>
        <Toaster position="bottom-right" toastOptions={{ style: { fontSize: '14px' } }} />
      </body>
    </html>
  );
}
