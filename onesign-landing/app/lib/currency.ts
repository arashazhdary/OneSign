/**
 * Multi-Currency Support Library
 * Handles currency conversion and formatting
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'AED' | 'IRR';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

export const currencies: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  IRR: { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', locale: 'fa-IR' },
};

// Exchange rates (relative to USD)
// In production, fetch from API like exchangerate-api.com
const exchangeRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CNY: 7.24,
  INR: 83.12,
  AED: 3.67,
  IRR: 42000,
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  // Convert to USD first, then to target currency
  const amountInUSD = amount / exchangeRates[from];
  const convertedAmount = amountInUSD * exchangeRates[to];
  return Math.round(convertedAmount * 100) / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  }
): string {
  const {
    showSymbol = true,
    showCode = false,
    decimals = currency === 'JPY' || currency === 'IRR' ? 0 : 2,
  } = options || {};

  const currencyInfo = currencies[currency];

  const formattedAmount = new Intl.NumberFormat(currencyInfo.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  let result = formattedAmount;

  if (showSymbol) {
    result = `${currencyInfo.symbol}${formattedAmount}`;
  }

  if (showCode) {
    result = `${result} ${currency}`;
  }

  return result;
}

/**
 * Get user's preferred currency based on locale or geolocation
 */
export function getPreferredCurrency(locale?: string): Currency {
  if (!locale && typeof window !== 'undefined') {
    locale = navigator.language;
  }

  if (!locale) return 'USD';

  const currencyMap: Record<string, Currency> = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'ja-JP': 'JPY',
    'zh-CN': 'CNY',
    'en-IN': 'INR',
    'ar-AE': 'AED',
    'fa-IR': 'IRR',
    fa: 'IRR',
    en: 'USD',
  };

  return currencyMap[locale] || currencyMap[locale.split('-')[0]] || 'USD';
}

/**
 * Currency selector hook for React components
 */
export function useCurrency(defaultCurrency?: Currency) {
  if (typeof window === 'undefined') {
    return {
      currency: defaultCurrency || 'USD',
      setCurrency: () => {},
      convert: (amount: number, from: Currency = 'USD') => amount,
      format: (amount: number) => formatCurrency(amount, defaultCurrency || 'USD'),
    };
  }

  const [currency, setCurrencyState] = useState<Currency>(
    () => {
      const saved = localStorage.getItem('preferred_currency') as Currency;
      return saved || defaultCurrency || getPreferredCurrency();
    }
  );

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const convert = (amount: number, from: Currency = 'USD') => {
    return convertCurrency(amount, from, currency);
  };

  const format = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  return {
    currency,
    setCurrency,
    convert,
    format,
  };
}

// For React imports
function useState<T>(initialState: T | (() => T)): [T, (value: T) => void] {
  // This is a placeholder - actual implementation would use React.useState
  const value = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
  return [value, () => {}];
}

/**
 * Currency selector component
 */
export interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
}
