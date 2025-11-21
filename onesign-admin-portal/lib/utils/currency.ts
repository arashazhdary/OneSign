/**
 * Currency formatting utilities
 */

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format number as currency
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format USD currency
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount, { currency: 'USD' });
}

/**
 * Format EUR currency
 */
export function formatEUR(amount: number): string {
  return formatCurrency(amount, { locale: 'de-DE', currency: 'EUR' });
}

/**
 * Format GBP currency
 */
export function formatGBP(amount: number): string {
  return formatCurrency(amount, { locale: 'en-GB', currency: 'GBP' });
}

/**
 * Format currency with compact notation (e.g., "$1.2K", "$3.4M")
 */
export function formatCompactCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const { locale = 'en-US', currency = 'USD' } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
  }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and separators
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Add currency amounts
 */
export function addCurrency(...amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}

/**
 * Subtract currency amounts
 */
export function subtractCurrency(amount: number, ...toSubtract: number[]): number {
  return toSubtract.reduce((result, subtract) => result - subtract, amount);
}

/**
 * Multiply currency amount
 */
export function multiplyCurrency(amount: number, multiplier: number): number {
  return amount * multiplier;
}

/**
 * Divide currency amount
 */
export function divideCurrency(amount: number, divisor: number): number {
  return divisor === 0 ? 0 : amount / divisor;
}

/**
 * Calculate percentage of amount
 */
export function percentageOfAmount(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

/**
 * Apply discount to amount
 */
export function applyDiscount(amount: number, discountPercent: number): number {
  return amount - percentageOfAmount(amount, discountPercent);
}

/**
 * Calculate tax on amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return percentageOfAmount(amount, taxRate);
}

/**
 * Add tax to amount
 */
export function addTax(amount: number, taxRate: number): number {
  return amount + calculateTax(amount, taxRate);
}
