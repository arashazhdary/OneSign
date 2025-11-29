'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const params = useParams();
  const currentLocale = params?.locale as string || 'en';
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: t('nav.features'), href: '/features' },
    { name: t('nav.solutions'), href: '/solutions' },
    { name: t('nav.pricing'), href: '/pricing' },
    { name: t('nav.docs'), href: '/docs' },
  ];

  const toggleLocale = () => {
    const newLocale = currentLocale === 'en' ? 'fa' : 'en';
    window.location.href = `/${newLocale}/landing`;
  };

  // Dynamic classes based on scroll state for proper contrast
  const headerTextClass = isScrolled
    ? 'text-gray-900 dark:text-white'
    : 'text-white';

  const navLinkClass = isScrolled
    ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
    : 'text-white/90 hover:text-white';

  const iconButtonClass = isScrolled
    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    : 'text-white hover:bg-white/20';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${currentLocale}/landing`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image
                src="/onesign-logo.png"
                alt="OneSign Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className={`text-2xl font-bold transition-colors duration-300 ${headerTextClass}`}>
              OneSign
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors font-medium ${navLinkClass}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLocale}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${iconButtonClass}`}
              aria-label={tCommon('aria.toggleLanguage')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="text-sm font-medium">{currentLocale === 'en' ? 'فارسی' : 'English'}</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle isScrolled={isScrolled} />

            {/* CTA Button */}
            <div className="hidden sm:block">
              <Button variant="primary" size="sm">
                {t('nav.getStarted')}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${iconButtonClass}`}
              aria-label={tCommon('aria.toggleMenu')}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Slide-in Menu */}
              <motion.div
                initial={{ x: currentLocale === 'fa' ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: currentLocale === 'fa' ? '100%' : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`fixed top-0 ${currentLocale === 'fa' ? 'right-0' : 'left-0'} h-full w-80 bg-white dark:bg-gray-900 shadow-2xl md:hidden z-50 overflow-y-auto border-r border-gray-200 dark:border-gray-700`}
              >
                <div className="p-6">
                  {/* Close Button */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <Image
                          src="/onesign-logo.png"
                          alt="OneSign Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        OneSign
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                      aria-label={tCommon('aria.close')}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* CTA Button */}
                  <div className="mt-6">
                    <Button variant="primary" className="w-full" size="lg">
                      {t('nav.getStarted')}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

                  {/* Language Switcher */}
                  <button
                    onClick={() => {
                      toggleLocale();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rtl:text-right text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                    <span className="font-medium">{currentLocale === 'en' ? 'فارسی' : 'English'}</span>
                  </button>

                  {/* Theme Toggle */}
                  <div className="mt-3 px-4 py-3 flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {tCommon('aria.toggleTheme')}
                      </span>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
