/**
 * Number formatting utilities
 */

/**
 * Format number with locale
 */
export function formatNumber(
  value: number,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format number with thousand separators
 */
export function formatWithSeparators(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format number to decimal places
 */
export function formatDecimal(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with compact notation (e.g., "1.2K", "3.4M")
 */
export function formatCompact(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format file size (alias for formatBytes)
 */
export const formatFileSize = formatBytes;

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(value: number): string {
  const j = value % 10;
  const k = value % 100;

  if (j === 1 && k !== 11) {
    return `${value}st`;
  }
  if (j === 2 && k !== 12) {
    return `${value}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${value}rd`;
  }
  return `${value}th`;
}

/**
 * Round to nearest multiple
 */
export function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if number is between range (inclusive)
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if number is even
 */
export function isEven(value: number): boolean {
  return value % 2 === 0;
}

/**
 * Check if number is odd
 */
export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

/**
 * Generate random number between min and max
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Calculate average of numbers
 */
export function average(...numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Calculate sum of numbers
 */
export function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

/**
 * Find minimum value
 */
export function min(...numbers: number[]): number {
  return Math.min(...numbers);
}

/**
 * Find maximum value
 */
export function max(...numbers: number[]): number {
  return Math.max(...numbers);
}

/**
 * Round number to decimal places
 */
export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Parse string to number safely
 */
export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse string to integer safely
 */
export function parseInteger(value: string | number): number {
  if (typeof value === 'number') return Math.floor(value);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}
