'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ContactForm } from '@/app/components/ContactForm';
import { Card, CardContent } from '@/app/components/ui/Card';
import { FadeIn, SlideUp } from '@/app/components/animations';

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const contactMethods = [
    {
      icon: '📧',
      title: t('methods.email.title'),
      description: t('methods.email.description'),
      value: 'support@onesign.com',
      link: 'mailto:support@onesign.com',
    },
    {
      icon: '📞',
      title: t('methods.phone.title'),
      description: t('methods.phone.description'),
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: '💬',
      title: t('methods.liveChat.title'),
      description: t('methods.liveChat.description'),
      value: t('methods.liveChat.value'),
      link: '#',
    },
    {
      icon: '📍',
      title: t('methods.office.title'),
      description: t('methods.office.description'),
      value: '123 Business St, San Francisco, CA 94105',
      link: 'https://maps.google.com',
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
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <a href={method.link} target={method.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                  <Card hover className="h-full text-center cursor-pointer">
                    <CardContent className="pt-8">
                      <div className="text-5xl mb-4">{method.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {method.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {method.description}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {method.value}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('form.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('form.subtitle')}
              </p>
            </div>
          </FadeIn>
          <SlideUp delay={0.2}>
            <ContactForm />
          </SlideUp>
        </div>
      </section>

      {/* Map or Additional Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('office.title')}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  {t('office.description')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🕐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('office.hours.title')}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{t('office.hours.weekdays')}</p>
                      <p className="text-gray-600 dark:text-gray-300">{t('office.hours.weekends')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🚇</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('office.transit.title')}</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t('office.transit.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            <SlideUp delay={0.3}>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96 overflow-hidden">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-122.4194%2C37.7749%2C-122.3894%2C37.7949&amp;layer=mapnik&amp;marker=37.7849%2C-122.4044"
                  className="w-full h-full border-0"
                  loading="lazy"
                  title={t('office.map.title')}
                  aria-label={t('office.map.ariaLabel')}
                />
              </div>
            </SlideUp>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
