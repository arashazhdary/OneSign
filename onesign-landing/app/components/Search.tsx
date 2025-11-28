'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

/**
 * Global Search Component
 * Provides full-text search across pages and content
 */

interface SearchResult {
  id: string;
  titleKey: string;
  descriptionKey: string;
  url: string;
  category: 'page' | 'blog' | 'feature' | 'doc';
  icon: string;
}

// Search data with translation keys
const searchIndex: SearchResult[] = [
  {
    id: '1',
    titleKey: 'index.home.title',
    descriptionKey: 'index.home.description',
    url: '/en/landing',
    category: 'page',
    icon: '🏠',
  },
  {
    id: '2',
    titleKey: 'index.pricing.title',
    descriptionKey: 'index.pricing.description',
    url: '/en/pricing',
    category: 'page',
    icon: '💰',
  },
  {
    id: '3',
    titleKey: 'index.contact.title',
    descriptionKey: 'index.contact.description',
    url: '/en/contact',
    category: 'page',
    icon: '📧',
  },
  {
    id: '4',
    titleKey: 'index.about.title',
    descriptionKey: 'index.about.description',
    url: '/en/about',
    category: 'page',
    icon: '👥',
  },
  {
    id: '5',
    titleKey: 'index.mfa.title',
    descriptionKey: 'index.mfa.description',
    url: '/en/features#mfa',
    category: 'feature',
    icon: '🔐',
  },
  {
    id: '6',
    titleKey: 'index.sso.title',
    descriptionKey: 'index.sso.description',
    url: '/en/features#sso',
    category: 'feature',
    icon: '🔑',
  },
  {
    id: '7',
    titleKey: 'index.documentSigning.title',
    descriptionKey: 'index.documentSigning.description',
    url: '/en/features#signing',
    category: 'feature',
    icon: '✍️',
  },
  {
    id: '8',
    titleKey: 'index.security.title',
    descriptionKey: 'index.security.description',
    url: '/en/features#security',
    category: 'feature',
    icon: '🔒',
  },
  {
    id: '9',
    titleKey: 'index.api.title',
    descriptionKey: 'index.api.description',
    url: '/docs/api',
    category: 'doc',
    icon: '📖',
  },
  {
    id: '10',
    titleKey: 'index.enterprise.title',
    descriptionKey: 'index.enterprise.description',
    url: '/en/pricing#enterprise',
    category: 'page',
    icon: '🏢',
  },
];

interface SearchProps {
  onClose?: () => void;
}

export function Search({ onClose }: SearchProps) {
  const t = useTranslations('search');
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search functionality
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = searchIndex.filter(
      (item) =>
        t(item.titleKey).toLowerCase().includes(searchQuery) ||
        t(item.descriptionKey).toLowerCase().includes(searchQuery)
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [query, t]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.url);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    onClose?.();
  };

  const getCategoryColor = (category: SearchResult['category']) => {
    switch (category) {
      case 'page':
        return 'text-blue-600 dark:text-blue-400';
      case 'blog':
        return 'text-purple-600 dark:text-purple-400';
      case 'feature':
        return 'text-green-600 dark:text-green-400';
      case 'doc':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span>🔍</span>
        <span className="hidden sm:inline">{t('search')}</span>
        <kbd className="hidden md:inline-block px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Search Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-2xl">🔍</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('placeholder')}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none text-lg"
                  />
                  <button
                    onClick={handleClose}
                    className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded">
                      ESC
                    </kbd>
                  </button>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {results.length === 0 && query.trim().length > 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-500">
                      {t('noResults')} "{query}"
                    </div>
                  )}

                  {results.length === 0 && query.trim().length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-500">
                      {t('startTyping')}
                    </div>
                  )}

                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={`w-full flex items-start gap-4 p-4 text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="text-3xl">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {t(result.titleKey)}
                          </h3>
                          <span
                            className={`text-xs font-medium ${getCategoryColor(
                              result.category
                            )}`}
                          >
                            {result.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {t(result.descriptionKey)}
                        </p>
                      </div>
                      {index === selectedIndex && (
                        <span className="text-gray-400 dark:text-gray-600">↵</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                          ↑↓
                        </kbd>{' '}
                        {t('shortcuts.navigate')}
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                          ↵
                        </kbd>{' '}
                        {t('shortcuts.select')}
                      </span>
                    </div>
                    <span>{results.length} {t('results')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
