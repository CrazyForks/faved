import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemType, LayoutType } from '@/lib/types.ts';
import { VisibilityState } from '@tanstack/react-table';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const colorMap = {
  gray: 'bg-gray-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600',
  aqua: 'bg-blue-600',
  'white ': 'bg-neutral-300',
  black: 'bg-neutral-950',
};

export const getSavedLayoutPreference = (): LayoutType => {
  try {
    const stored: LayoutType = localStorage.getItem('layout') as LayoutType;
    return stored || 'list';
  } catch {
    return 'list';
  }
};

export const saveLayoutPreference = (value: LayoutType): void => {
  try {
    localStorage.setItem('layout', value);
  } catch {
    // Ignore storage errors - failing silently is acceptable for preferences
  }
};

export const getSavedLayoutColumnVisibilityPreference = (
  layout: LayoutType
): Partial<Record<keyof ItemType, boolean>> => {
  const defaultPref = {
    updated_at: false,
  };
  try {
    const stored = localStorage.getItem(`column-visibility-${layout}`);
    return stored ? JSON.parse(stored) : defaultPref;
  } catch {
    return defaultPref;
  }
};

export const saveLayoutColumnVisibilityPreference = (layout: LayoutType, columnVisibility: VisibilityState): void => {
  try {
    localStorage.setItem(`column-visibility-${layout}`, JSON.stringify(columnVisibility));
  } catch {
    // Ignore storage errors - failing silently is acceptable for preferences
  }
};
