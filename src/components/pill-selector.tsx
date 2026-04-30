'use client';

interface PillSelectorProps {
  options: { name: string; slug: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function PillSelector({ options, value, onChange }: PillSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.slug}
          type="button"
          onClick={() => onChange(option.slug)}
          className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
            value === option.slug
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}
