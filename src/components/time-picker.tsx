'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIMES.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TimePicker({ value, onChange, placeholder = 'Select time' }: TimePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className={`w-full h-10 px-3 rounded-md border border-gray-200 text-sm text-left flex items-center gap-2 cursor-pointer transition-colors hover:border-gray-300 focus:outline-none focus:border-gray-400 ${
            value ? 'text-gray-950' : 'text-gray-300'
          }`}>
          <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          {value ? formatTime(value) : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1 max-h-60 overflow-y-auto">
        {TIMES.map((t) => (
          <button key={t} type="button" onClick={() => { onChange(t); setOpen(false); }}
            className={`w-full px-3 py-1.5 text-sm text-left rounded cursor-pointer transition-colors ${
              value === t ? 'bg-gray-950 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            {formatTime(t)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
