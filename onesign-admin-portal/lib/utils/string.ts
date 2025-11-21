/**
 * String helper utilities
 */

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 */
export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert to uppercase
 */
export function uppercase(str: string): string {
  return str.toUpperCase();
}

/**
 * Convert to lowercase
 */
export function lowercase(str: string): string {
  return str.toLowerCase();
}

/**
 * Convert string to camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Convert string to PascalCase
 */
export function pascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Convert string to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Truncate string to word boundary
 */
export function truncateWords(str: string, maxWords: number, suffix = '...'): string {
  const words = str.split(' ');
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Trim whitespace from both ends
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * Remove extra whitespace
 */
export function removeExtraWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Slugify string (URL-friendly)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Reverse string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Check if string contains substring (case-insensitive)
 */
export function containsIgnoreCase(str: string, substring: string): boolean {
  return str.toLowerCase().includes(substring.toLowerCase());
}

/**
 * Replace all occurrences
 */
export function replaceAll(str: string, search: string, replace: string): string {
  return str.split(search).join(replace);
}

/**
 * Count occurrences of substring
 */
export function countOccurrences(str: string, substring: string): number {
  return str.split(substring).length - 1;
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Pad start of string
 */
export function padStart(str: string, length: number, char = ' '): string {
  return str.padStart(length, char);
}

/**
 * Pad end of string
 */
export function padEnd(str: string, length: number, char = ' '): string {
  return str.padEnd(length, char);
}

/**
 * Extract initials from name
 */
export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

/**
 * Mask string (e.g., for credit cards)
 */
export function mask(str: string, visibleStart = 0, visibleEnd = 4, maskChar = '*'): string {
  if (str.length <= visibleStart + visibleEnd) return str;

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);

  return start + masked + end;
}

/**
 * Remove HTML tags
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Generate random string
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if string matches pattern
 */
export function matches(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

/**
 * Extract numbers from string
 */
export function extractNumbers(str: string): string {
  return str.replace(/\D/g, '');
}

/**
 * Extract letters from string
 */
export function extractLetters(str: string): string {
  return str.replace(/[^a-zA-Z]/g, '');
}
