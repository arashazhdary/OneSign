'use client';

import { currencies, Currency } from '@/app/lib/currency';

/**
 * Currency Selector Component
 * Allows users to switch between different currencies
 */

export interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({
  value,
  onChange,
  className = '',
}: CurrencySelectorProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
        className="appearance-none px-4 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer"
      >
        {Object.entries(currencies).map(([code, info]) => (
          <option key={code} value={code}>
            {info.symbol} {info.name} ({code})
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
