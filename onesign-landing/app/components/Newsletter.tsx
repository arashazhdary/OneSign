'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/app/components/ui';
import { useTranslations } from 'next-intl';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function Newsletter() {
  const t = useTranslations('landing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to subscribe');
      }

      setIsSuccess(true);
      reset();

      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('blog.newsletter.title')}
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          {t('blog.newsletter.subtitle')}
        </p>

        {isSuccess ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <p className="text-white font-medium">
              {t('footer.subscribed')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-white focus:outline-none text-gray-900"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-200 text-left">{errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={isSubmitting}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {t('footer.subscribe')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
