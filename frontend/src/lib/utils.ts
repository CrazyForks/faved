import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const colorMap = {
  'gray':  'bg-gray-600',
  'green':  'bg-green-600',
  'red':  'bg-red-600',
  'yellow':  'bg-yellow-600',
  'aqua':  'bg-blue-600',
  'white ':  'bg-neutral-300',
  'black':  'bg-neutral-950',
}
