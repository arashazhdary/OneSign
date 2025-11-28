'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PricingPage() {
  const t = useTranslations('landing');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Get features arrays from translations using raw()
  const freeFeatures = t.raw('pricing.free.features') as string[];
  const proFeatures = t.raw('pricing.pro.features') as string[];
  const enterpriseFeatures = t.raw('pricing.enterprise.features') as string[];

  const plans = [
    {
      id: 'free',
      name: t('pricing.free.name'),
      price: { monthly: t('pricing.free.price'), yearly: t('pricing.free.price') },
      description: t('pricing.free.description'),
      features: freeFeatures,
      popular: false,
      cta: t('pricing.cta'),
    },
    {
      id: 'pro',
      name: t('pricing.pro.name'),
      price: { monthly: t('pricing.pro.price'), yearly: t('pricing.pro.price') },
      description: t('pricing.pro.description'),
      features: proFeatures,
      popular: true,
      cta: t('pricing.cta'),
    },
    {
      id: 'enterprise',
      name: t('pricing.enterprise.name'),
      price: { monthly: t('pricing.enterprise.price'), yearly: t('pricing.enterprise.price') },
      description: t('pricing.enterprise.description'),
      features: enterpriseFeatures,
      popular: false,
      cta: t('pricing.contact'),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </FadeIn>

          {/* Billing Toggle */}
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('pricing.yearly')}
              </button>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="mt-4 text-green-600 dark:text-green-400 font-semibold">
                {t('pricing.save')}
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <SlideUp key={plan.id} delay={index * 0.1}>
                <Card
                  className={`h-full relative ${
                    plan.popular
                      ? 'border-2 border-blue-600 shadow-xl'
                      : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {t('pricing.mostPopular')}
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {plan.description}
                    </p>
                    <div className="mt-6">
                      <div className="flex items-baseline gap-2">
                        {plan.id === 'enterprise' ? (
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            {plan.price[billingPeriod]}
                          </span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                              ${plan.price[billingPeriod]}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('pricing.perUser')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      className="w-full mb-6"
                    >
                      {plan.cta}
                    </Button>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              {t('faq.title')}
            </h2>
          </FadeIn>
          <div className="space-y-6">
            {[
              {
                q: t('faq.faq1.question'),
                a: t('faq.faq1.answer'),
              },
              {
                q: t('faq.faq2.question'),
                a: t('faq.faq2.answer'),
              },
              {
                q: t('faq.faq3.question'),
                a: t('faq.faq3.answer'),
              },
              {
                q: t('faq.faq4.question'),
                a: t('faq.faq4.answer'),
              },
              {
                q: t('faq.faq5.question'),
                a: t('faq.faq5.answer'),
              },
            ].map((faq, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
