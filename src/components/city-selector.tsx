'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Command } from 'cmdk';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NEPAL_CITIES } from '@/lib/nepal-cities';

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CitySelector({ value, onChange, className }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? NEPAL_CITIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : NEPAL_CITIES;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={className ?? 'h-10 w-full px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white flex items-center justify-between gap-2 cursor-pointer'}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || 'All cities'}
          </span>
          <span className="flex items-center gap-0.5 flex-shrink-0">
            {value && (
              <span
                role="button"
                className="p-0.5 hover:bg-gray-100 rounded"
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
              >
                <X className="h-3 w-3 text-gray-400" />
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false} className="border-none">
          <div className="flex items-center border-b border-gray-100 px-3">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search city..."
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <Command.List className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <Command.Empty className="py-4 text-center text-sm text-gray-400">
                No city found
              </Command.Empty>
            )}
            <Command.Item
              value=""
              onSelect={() => { onChange(''); setOpen(false); setSearch(''); }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 rounded cursor-pointer hover:bg-gray-50 data-[selected=true]:bg-gray-50"
            >
              <Check className={`h-3.5 w-3.5 ${!value ? 'opacity-100' : 'opacity-0'}`} />
              All cities
            </Command.Item>
            {filtered.map((city) => (
              <Command.Item
                key={city.slug}
                value={city.name}
                onSelect={() => { onChange(city.name); setOpen(false); setSearch(''); }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-900 rounded cursor-pointer hover:bg-gray-50 data-[selected=true]:bg-gray-50"
              >
                <Check className={`h-3.5 w-3.5 ${value === city.name ? 'opacity-100' : 'opacity-0'}`} />
                {city.name}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
