'use client';

import { useThemeStore } from '@/app/stores';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ThemeToggleProps {
  isScrolled?: boolean;
}

export function ThemeToggle({ isScrolled = true }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Dynamic styling based on scroll state for proper visibility
  const buttonClass = isScrolled
    ? 'p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors'
    : 'p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors';

  return (
    <button
      onClick={() => setTheme('dark')}
      className={buttonClass}
      aria-label={t('aria.toggleTheme')}
    >
      {/* Always show dark theme icon since we're forcing dark theme */}
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
}
