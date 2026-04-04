export interface ThemePalette {
  id: string;
  name: string;
  primary: string;
  accent: string;
  preview: [string, string, string]; // 3 colors for preview swatch
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#2563eb',
    accent: '#1d4ed8',
    preview: ['#2563eb', '#3b82f6', '#93c5fd'],
  },
  {
    id: 'forest',
    name: 'Forest',
    primary: '#059669',
    accent: '#047857',
    preview: ['#059669', '#34d399', '#a7f3d0'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: '#ea580c',
    accent: '#dc2626',
    preview: ['#ea580c', '#f97316', '#fdba74'],
  },
  {
    id: 'berry',
    name: 'Berry',
    primary: '#9333ea',
    accent: '#7c3aed',
    preview: ['#9333ea', '#a855f7', '#d8b4fe'],
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#e11d48',
    accent: '#be123c',
    preview: ['#e11d48', '#f43f5e', '#fda4af'],
  },
  {
    id: 'slate',
    name: 'Slate',
    primary: '#334155',
    accent: '#1e293b',
    preview: ['#334155', '#64748b', '#cbd5e1'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: '#1e1b4b',
    accent: '#312e81',
    preview: ['#1e1b4b', '#4338ca', '#a5b4fc'],
  },
  {
    id: 'coffee',
    name: 'Coffee',
    primary: '#78350f',
    accent: '#92400e',
    preview: ['#78350f', '#b45309', '#fcd34d'],
  },
  {
    id: 'teal',
    name: 'Teal',
    primary: '#0d9488',
    accent: '#0f766e',
    preview: ['#0d9488', '#14b8a6', '#99f6e4'],
  },
  {
    id: 'coral',
    name: 'Coral',
    primary: '#f472b6',
    accent: '#ec4899',
    preview: ['#ec4899', '#f472b6', '#fbcfe8'],
  },
];

export function findPalette(primary: string, accent: string): ThemePalette | null {
  return THEME_PALETTES.find(p => p.primary === primary && p.accent === accent) || null;
}

export const DEFAULT_PALETTE = THEME_PALETTES[0]; // Ocean
