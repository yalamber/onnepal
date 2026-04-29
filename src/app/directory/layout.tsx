import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Directory — Find Local Businesses in Nepal',
  description: 'Browse Nepal\'s business directory. Find restaurants, shops, hotels, services, and more by category and location.',
  openGraph: {
    title: 'Business Directory — Find Local Businesses in Nepal',
    description: 'Browse Nepal\'s business directory. Find restaurants, shops, hotels, services, and more.',
  },
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
