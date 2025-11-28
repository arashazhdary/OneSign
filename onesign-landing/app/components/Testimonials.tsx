'use client';

import { Card } from '@/app/components/ui';
import { useTranslations } from 'next-intl';

interface Testimonial {
  nameKey: string;
  role: string;
  company: string;
  avatar: string;
  quoteKey: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    nameKey: 'testimonial1.name',
    role: 'CISO',
    company: 'TechCorp Inc.',
    avatar: '👩‍💼',
    quoteKey: 'testimonial1.quote',
    rating: 5,
  },
  {
    nameKey: 'testimonial2.name',
    role: 'IT Director',
    company: 'Finance Partners',
    avatar: '👨‍💼',
    quoteKey: 'testimonial2.quote',
    rating: 5,
  },
  {
    nameKey: 'testimonial3.name',
    role: 'CTO',
    company: 'Healthcare Solutions',
    avatar: '👩‍💻',
    quoteKey: 'testimonial3.quote',
    rating: 5,
  },
];

export function Testimonials() {
  const t = useTranslations('landing');

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('testimonials.title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('testimonials.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} padding="lg" hover className="h-full">
            <div className="flex flex-col h-full">
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 flex-1">
                "{t(`testimonials.${testimonial.quoteKey}`)}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {t(`testimonials.${testimonial.nameKey}`)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
          <div className="text-gray-600 dark:text-gray-400">{t('stats.users')}</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
          <div className="text-gray-600 dark:text-gray-400">{t('stats.apps')}</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
          <div className="text-gray-600 dark:text-gray-400">{t('stats.authentications')}</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
          <div className="text-gray-600 dark:text-gray-400">{t('stats.uptime')}</div>
        </div>
      </div>
    </div>
  );
}
