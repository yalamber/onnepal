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
              description: "Nepal's local platform — businesses, classifieds, jobs, events, and more.",
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
