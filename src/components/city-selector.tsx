'use client';

import { NEPAL_CITIES } from '@/lib/nepal-cities';

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CitySelector({ value, onChange, className }: CitySelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        'h-10 w-full px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white'
      }
    >
      <option value="">All cities</option>
      {NEPAL_CITIES.map((city) => (
        <option key={city.slug} value={city.name}>
          {city.name}
        </option>
      ))}
    </select>
  );
}
