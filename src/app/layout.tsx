import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { NavigationProgress } from "@/components/progress-bar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
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
    default: "OnNepal — Nepal's Business Directory & Classifieds",
    template: '%s | OnNepal',
  },
  description: "Find local businesses, post classifieds, jobs, events, and lost & found. Create your own business page at yourname.onnepal.com.",
  keywords: ['Nepal', 'business directory', 'classifieds', 'yellow pages', 'jobs Nepal', 'events Nepal', 'lost and found Nepal'],
  authors: [{ name: 'OnNepal' }],
  creator: 'OnNepal',
  icons: { icon: '/icon.svg' },
  metadataBase: new URL('https://onnepal.com'),
  openGraph: {
    title: "OnNepal — Nepal's Business Directory & Classifieds",
    description: "Find local businesses, post classifieds, jobs, events, and create your own business page.",
    siteName: 'OnNepal',
    type: 'website',
    locale: 'en_US',
    url: 'https://onnepal.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: "OnNepal — Nepal's Business Directory & Classifieds",
    description: "Find local businesses, post classifieds, jobs, events, and create your own business page.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://onnepal.com',
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
        className={`${geistSans.variable} antialiased bg-white`}
        style={{ fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif' }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'OnNepal',
              url: 'https://onnepal.com',
              description: "Nepal's Business Directory & Classifieds Platform",
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://onnepal.com/classifieds?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <NavigationProgress>
          <Navbar />
          {children}
        </NavigationProgress>
      </body>
    </html>
  );
}
