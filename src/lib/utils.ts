import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toKebabCase(input: string) {
  return (
    input
      .trim()
      // .replace(/([a-z])([A-Z])/g, '$1-$2') // Get all lowercase to uppercase transitions
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with dashes
      .replace(/^-+|-+$/g, '') // Trim dashes from start and end
      .toLowerCase()
  )
}
