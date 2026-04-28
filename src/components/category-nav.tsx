'use client';

interface CategoryNavProps {
  categories: { name: string; slug: string }[];
  activeCategory: string;
  onSelect: (category: string) => void;
  allLabel?: string;
}

export function CategorySidebar({ categories, activeCategory, onSelect, allLabel = 'All' }: CategoryNavProps) {
  return (
    <nav className="hidden lg:block">
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSelect('')}
          className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            activeCategory === ''
              ? 'bg-gray-100 font-medium text-gray-950'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
          }`}
        >
          {allLabel}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              activeCategory === cat.slug
                ? 'bg-gray-100 font-medium text-gray-950'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function CategoryMobilePills({ categories, activeCategory, onSelect, allLabel = 'All' }: CategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
      <button
        onClick={() => onSelect('')}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
          activeCategory === ''
            ? 'bg-gray-950 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
            activeCategory === cat.slug
              ? 'bg-gray-950 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
