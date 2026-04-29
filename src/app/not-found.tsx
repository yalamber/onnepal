import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-950">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-950">Page not found</h1>
        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-gray-950 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Go home
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <Link href="/directory" className="hover:text-gray-950 transition-colors">
            Directory
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/classifieds" className="hover:text-gray-950 transition-colors">
            Classifieds
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs" className="hover:text-gray-950 transition-colors">
            Jobs
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/events" className="hover:text-gray-950 transition-colors">
            Events
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/places" className="hover:text-gray-950 transition-colors">
            Places
          </Link>
        </div>
      </div>
    </main>
  );
}
