import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const THOUSANDS_SEPARATOR = '.'
const DECIMAL_SEPARATOR = ','

/**
 * Formats a number using `.` as the thousands separator and `,` as the
 * decimal separator, e.g. `1000000` -> `"1.000.000"`.
 * Non-numeric values are returned unchanged (as a string).
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num)
}

/**
 * Parses a string produced by `formatNumber`/`formatNumberInput` (or any
 * partially typed input using the same convention) back into a plain number.
 */
export function parseFormattedNumber(value: string): number {
  if (!value) return 0
  const isNegative = value.trim().startsWith('-')
  const cleaned = value
    .split(THOUSANDS_SEPARATOR)
    .join('')
    .replace(DECIMAL_SEPARATOR, '.')
    .replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  if (Number.isNaN(num)) return 0
  return isNegative ? -Math.abs(num) : num
}

/**
 * Live-formats raw user input as they type: groups digits with `.` every
 * three places and preserves a single `,` decimal separator, without
 * rounding or losing in-progress input (e.g. a trailing decimal separator).
 */
export function formatNumberInput(raw: string): string {
  if (!raw) return ''
  const isNegative = raw.trim().startsWith('-')
  let cleaned = raw.replace(/[^\d,]/g, '')

  const firstComma = cleaned.indexOf(DECIMAL_SEPARATOR)
  if (firstComma !== -1) {
    cleaned =
      cleaned.slice(0, firstComma + 1) +
      cleaned.slice(firstComma + 1).replace(new RegExp(DECIMAL_SEPARATOR, 'g'), '')
  }

  const [intPart, decPart] = cleaned.split(DECIMAL_SEPARATOR)
  const groupedInt = intPart
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR)
    : ''
  const result =
    decPart !== undefined ? `${groupedInt}${DECIMAL_SEPARATOR}${decPart}` : groupedInt

  return isNegative && result ? `-${result}` : result
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}

/**
 * Initials from a display name: first character of the first word + first
 * character of the last word. One word only: first two characters. Empty: `?`.
 */
export function getDisplayNameInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  const first = parts[0][0] ?? ''
  const last = parts[parts.length - 1]?.[0] ?? ''
  return (first + last).toUpperCase()
}
