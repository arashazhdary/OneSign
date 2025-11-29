'use client';

import { useTranslations } from 'next-intl';
import { Button } from './ui';
import { FadeIn, SlideUp, ScaleIn } from './animations';
import { useEffect, useState } from 'react';

export function Hero() {
  const t = useTranslations('landing');
  const [stats, setStats] = useState({
    users: 0,
    documents: 0,
    countries: 0,
  });

  // Animated counters
  useEffect(() => {
    const targets = {
      users: 50000,
      documents: 1000000,
      countries: 120,
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setStats({
        users: Math.floor(targets.users * progress),
        documents: Math.floor(targets.documents * progress),
        countries: Math.floor(targets.countries * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left rtl:lg:text-right">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">
                  {t('hero.trustedBy')}
                </span>
              </div>
            </FadeIn>

            <SlideUp delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                {t('hero.title')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
            </SlideUp>

            <SlideUp delay={0.2}>
              <p className="text-lg md:text-xl text-white mb-8 max-w-2xl">
                {t('hero.subtitle')}
              </p>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button variant="primary" size="lg" className="group">
                  {t('hero.cta')}
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Button>
                <Button variant="outline" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t('hero.secondaryCta')}
                </Button>
              </div>
            </SlideUp>

            {/* Live Stats */}
            <ScaleIn delay={0.4}>
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left rtl:lg:text-right">
                  <div className="text-3xl font-bold text-white">
                    {formatNumber(stats.users)}+
                  </div>
                  <div className="text-sm text-white mt-1">
                    {t('stats.users')}
                  </div>
                </div>
                <div className="text-center lg:text-left rtl:lg:text-right">
                  <div className="text-3xl font-bold text-white">
                    {formatNumber(stats.documents)}+
                  </div>
                  <div className="text-sm text-white mt-1">
                    {t('stats.apps')}
                  </div>
                </div>
                <div className="text-center lg:text-left rtl:lg:text-right">
                  <div className="text-3xl font-bold text-white">
                    {stats.countries}+
                  </div>
                  <div className="text-sm text-white mt-1">
                    {t('stats.authentications')}
                  </div>
                </div>
              </div>
            </ScaleIn>
          </div>

          {/* Right Column - Visual */}
          <ScaleIn delay={0.5}>
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-3xl rotate-6 opacity-20"></div>

              {/* Main Visual Container */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                {/* Mock Document Interface */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        📄
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t('hero.signatureCard.documentName')}
                        </div>
                        <div className="text-xs text-gray-500">{t('hero.signatureCard.readyToSign')}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>

                    {/* Signature Area */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        <span className="font-medium">{t('hero.signatureCard.signHere')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                    {t('hero.signatureCard.signDocument')}
                  </button>
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold">
                  {t('hero.badges.verified')}
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold">
                  {t('hero.badges.secure')}
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
