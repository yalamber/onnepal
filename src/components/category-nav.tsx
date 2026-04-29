import Link from 'next/link';

interface CategoryNavProps {
  categories: { name: string; slug: string }[];
  activeCategory: string;
  basePath: string;
  allLabel?: string;
}

export function CategorySidebar({ categories, activeCategory, basePath, allLabel = 'All' }: CategoryNavProps) {
  return (
    <nav className="hidden lg:block">
      <div className="flex flex-col gap-1">
        <Link
          href={basePath}
          className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            activeCategory === ''
              ? 'bg-gray-100 font-medium text-gray-950'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
          }`}
        >
          {allLabel}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`${basePath}/category/${cat.slug}`}
            className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              activeCategory === cat.slug
                ? 'bg-gray-100 font-medium text-gray-950'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function CategoryMobilePills({ categories, activeCategory, basePath, allLabel = 'All' }: CategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-none">
      <Link
        href={basePath}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
          activeCategory === ''
            ? 'bg-gray-950 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`${basePath}/category/${cat.slug}`}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
            activeCategory === cat.slug
              ? 'bg-gray-950 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
