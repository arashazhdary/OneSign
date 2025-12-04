'use client';

import { useState, useEffect, useCallback } from 'react';

export type DarkModePreference = 'light' | 'dark' | 'system';

interface UseDarkModeReturn {
  isDarkMode: boolean;
  preference: DarkModePreference;
  setPreference: (preference: DarkModePreference) => void;
  toggleDarkMode: () => void;
}

const STORAGE_KEY = 'onesign-theme-preference';

/**
 * Custom hook for dark mode management
 * Features:
 * - System preference detection (prefers-color-scheme)
 * - LocalStorage persistence
 * - Manual override capability
 * - Smooth transitions
 * - SSR-safe implementation
 */
export const useDarkMode = (): UseDarkModeReturn => {
  // Initialize state with default values (will be hydrated on client)
  const [preference, setPreferenceState] = useState<DarkModePreference>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get system preference
  const getSystemPreference = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Get stored preference from localStorage
  const getStoredPreference = useCallback((): DarkModePreference => {
    if (typeof window === 'undefined') return 'system';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as DarkModePreference;
      }
    } catch (error) {
      console.error('Failed to read theme preference from localStorage:', error);
    }
    return 'system';
  }, []);

  // Calculate if dark mode should be active based on preference
  const calculateDarkMode = useCallback((pref: DarkModePreference): boolean => {
    if (pref === 'system') {
      return getSystemPreference();
    }
    return pref === 'dark';
  }, [getSystemPreference]);

  // Apply dark mode to document
  const applyDarkMode = useCallback((dark: boolean) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Set preference and persist to localStorage
  const setPreference = useCallback((newPreference: DarkModePreference) => {
    setPreferenceState(newPreference);

    try {
      localStorage.setItem(STORAGE_KEY, newPreference);
    } catch (error) {
      console.error('Failed to save theme preference to localStorage:', error);
    }

    const newDarkMode = calculateDarkMode(newPreference);
    setIsDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
  }, [calculateDarkMode, applyDarkMode]);

  // Toggle between light and dark (not system)
  const toggleDarkMode = useCallback(() => {
    const newPreference: DarkModePreference = isDarkMode ? 'light' : 'dark';
    setPreference(newPreference);
  }, [isDarkMode, setPreference]);

  // Initialize on mount (client-side only)
  useEffect(() => {
    if (isInitialized) return;

    const storedPreference = getStoredPreference();
    const darkMode = calculateDarkMode(storedPreference);

    setPreferenceState(storedPreference);
    setIsDarkMode(darkMode);
    applyDarkMode(darkMode);
    setIsInitialized(true);
  }, [isInitialized, getStoredPreference, calculateDarkMode, applyDarkMode]);

  // Listen for system preference changes (only when preference is 'system')
  useEffect(() => {
    if (!isInitialized || preference !== 'system' || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newDarkMode = e.matches;
      setIsDarkMode(newDarkMode);
      applyDarkMode(newDarkMode);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [isInitialized, preference, applyDarkMode]);

  // Prevent hydration mismatch by not rendering until initialized
  useEffect(() => {
    // Add transition class after a brief delay to prevent flash on initial load
    if (isInitialized) {
      const timer = setTimeout(() => {
        document.documentElement.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  return {
    isDarkMode,
    preference,
    setPreference,
    toggleDarkMode,
  };
};
