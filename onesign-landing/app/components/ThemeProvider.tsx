'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/app/stores';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force dark theme - ignore user's theme preference
  const theme = 'dark';

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    // Always use dark theme
    root.classList.add(theme);
  }, []);

  return <>{children}</>;
}
