'use client';

import { PROVINCES } from '@/lib/nepal-districts';

interface DistrictSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DistrictSelector({ value, onChange, className }: DistrictSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        'h-10 w-full px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white'
      }
    >
      <option value="">All districts</option>
      {PROVINCES.map((province) => (
        <optgroup key={province.slug} label={province.name}>
          {province.districts.map((district) => (
            <option key={district.slug} value={district.slug}>
              {district.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
