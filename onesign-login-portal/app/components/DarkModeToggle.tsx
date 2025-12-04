'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '@/hooks/useDarkMode';

export interface DarkModeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function DarkModeToggle({
  className = '',
  showLabel = false,
  size = 'md',
}: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Size configurations
  const sizeClasses = {
    sm: {
      button: 'w-10 h-10',
      icon: 'w-4 h-4',
      text: 'text-xs',
    },
    md: {
      button: 'w-12 h-12',
      icon: 'w-5 h-5',
      text: 'text-sm',
    },
    lg: {
      button: 'w-14 h-14',
      icon: 'w-6 h-6',
      text: 'text-base',
    },
  };

  const { button, icon, text } = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.button
        onClick={toggleDarkMode}
        className={`${button} relative rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group overflow-hidden`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon container with rotation animation */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Moon Icon */}
                <svg
                  className={`${icon} text-indigo-400`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Sun Icon */}
                <svg
                  className={`${icon} text-amber-500`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-white dark:bg-slate-700"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </motion.button>

      {showLabel && (
        <motion.span
          className={`${text} font-medium text-slate-700 dark:text-slate-300`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isDarkMode ? 'Dark' : 'Light'} Mode
        </motion.span>
      )}
    </div>
  );
}
