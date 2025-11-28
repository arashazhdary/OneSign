'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

export default function PrivacyPage() {
  const t = useTranslations('privacyPage');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      <article className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {t('title')}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>{t('lastUpdatedLabel')}</strong> {t('lastUpdatedDate')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section1.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('section1.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {(t.raw('section1.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section2.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('section2.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {(t.raw('section2.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section3.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('section3.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {(t.raw('section3.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section4.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('section4.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section5.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('section5.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {(t.raw('section5.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section6.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('section6.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section7.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('section7.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section8.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('section8.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section9.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('section9.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('section10.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('section10.content')}
            </p>
            <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
              {(t.raw('section10.contact') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      <Footer />
    </div>
  );
}
