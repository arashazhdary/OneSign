'use client';

import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

export default function TermsPage() {
  const t = useTranslations('termsPage');

  const serviceFeatures = t.raw('descriptionOfService.items') as string[];
  const userAccountRequirements = t.raw('userAccounts.items') as string[];
  const prohibitedUses = t.raw('acceptableUse.items') as string[];
  const paymentItems = t.raw('paymentTerms.items') as string[];
  const contactItems = t.raw('contactInformation.items') as string[];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      <article className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {t('title')}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>{t('lastUpdated')}</strong> {t('lastUpdatedDate')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('acceptanceOfTerms.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('acceptanceOfTerms.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('descriptionOfService.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('descriptionOfService.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {serviceFeatures.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('userAccounts.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('userAccounts.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {userAccountRequirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('acceptableUse.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('acceptableUse.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {prohibitedUses.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('electronicSignatures.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('electronicSignatures.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('intellectualProperty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('intellectualProperty.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('paymentTerms.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('paymentTerms.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              {paymentItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('termination.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('termination.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('disclaimerOfWarranties.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('disclaimerOfWarranties.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('limitationOfLiability.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('limitationOfLiability.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('governingLaw.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('governingLaw.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('changesToTerms.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('changesToTerms.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contactInformation.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('contactInformation.intro')}
            </p>
            <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
              {contactItems.map((item, index) => (
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
