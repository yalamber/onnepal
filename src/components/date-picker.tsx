'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const today = new Date();
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [open, setOpen] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const days: (number | null)[] = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const select = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const displayValue = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className={`w-full h-10 px-3 rounded-md border border-gray-200 text-sm text-left flex items-center gap-2 cursor-pointer transition-colors hover:border-gray-300 focus:outline-none focus:border-gray-400 ${
            displayValue ? 'text-gray-950' : 'text-gray-300'
          }`}>
          <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          {displayValue || placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={prev} className="p-1 rounded hover:bg-gray-100 cursor-pointer"><ChevronLeft className="h-4 w-4 text-gray-500" /></button>
          <span className="text-sm font-medium text-gray-950">{MONTHS[viewMonth]} {viewYear}</span>
          <button type="button" onClick={next} className="p-1 rounded hover:bg-gray-100 cursor-pointer"><ChevronRight className="h-4 w-4 text-gray-500" /></button>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {DAYS.map(d => (
            <div key={d} className="h-8 flex items-center justify-center text-[11px] font-medium text-gray-400">{d}</div>
          ))}
          {days.map((day, i) => (
            <div key={i} className="h-8 flex items-center justify-center">
              {day && (
                <button type="button" onClick={() => select(day)}
                  className={`w-7 h-7 rounded-md text-sm cursor-pointer transition-colors ${
                    isSelected(day)
                      ? 'bg-gray-950 text-white'
                      : isToday(day)
                      ? 'bg-gray-100 text-gray-950 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
