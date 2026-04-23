import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OnNepal — Nepal's Business Directory & Classifieds",
  description: "Find local businesses, post classifieds, and create your own business page at yourname.onnepal.com. Nepal's Yellow Pages.",
  icons: {
    icon: '/icon.svg',
  },
  metadataBase: new URL('https://onnepal.com'),
  openGraph: {
    title: "OnNepal — Nepal's Business Directory & Classifieds",
    description: "Find local businesses, post classifieds, and create your own business page.",
    siteName: 'OnNepal',
    type: 'website',
  },
  other: {
    'theme-color': '#ffffff',
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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
