'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { useState } from 'react';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for individuals getting started',
      features: [
        '5 documents per month',
        '1 user',
        'Basic e-signature',
        'Email support',
        'Mobile app access',
        '30-day document storage',
      ],
      popular: false,
      cta: 'Start Free',
    },
    {
      name: 'Professional',
      price: { monthly: 29, yearly: 290 },
      description: 'For professionals and small teams',
      features: [
        'Unlimited documents',
        'Up to 5 users',
        'Advanced e-signature',
        'Priority email support',
        'Mobile app access',
        'Unlimited document storage',
        'Custom branding',
        'Templates library',
        'Bulk send',
        'Audit trail',
      ],
      popular: true,
      cta: 'Start 14-day Trial',
    },
    {
      name: 'Business',
      price: { monthly: 79, yearly: 790 },
      description: 'For growing businesses',
      features: [
        'Everything in Professional',
        'Up to 20 users',
        'Phone & chat support',
        'API access',
        'Advanced analytics',
        'Custom workflows',
        'Integrations',
        'SSO (Single Sign-On)',
        'Team management',
        'Advanced security',
      ],
      popular: false,
      cta: 'Start 14-day Trial',
    },
    {
      name: 'Enterprise',
      price: { monthly: 'Custom', yearly: 'Custom' },
      description: 'For large organizations',
      features: [
        'Everything in Business',
        'Unlimited users',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced compliance',
        'On-premise deployment',
        'SLA guarantee',
        'Custom training',
        'Priority support 24/7',
        'Custom contracts',
      ],
      popular: false,
      cta: 'Contact Sales',
    },
  ];

  const savings = billingPeriod === 'yearly' ? '~17%' : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
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
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Yearly
              </button>
            </div>
            {savings && (
              <p className="mt-4 text-green-600 dark:text-green-400 font-semibold">
                💰 Save {savings} with yearly billing
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <SlideUp key={plan.name} delay={index * 0.1}>
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
                        Most Popular
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
                        {typeof plan.price[billingPeriod] === 'number' ? (
                          <>
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                              ${plan.price[billingPeriod]}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              /{billingPeriod === 'monthly' ? 'month' : 'year'}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            {plan.price[billingPeriod]}
                          </span>
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
              Frequently Asked Questions
            </h2>
          </FadeIn>
          <div className="space-y-6">
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, MasterCard, American Express) and bank transfers for enterprise plans.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No, all plans are month-to-month or year-to-year. You can cancel anytime without penalty.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.',
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
