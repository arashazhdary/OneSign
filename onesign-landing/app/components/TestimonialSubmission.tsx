'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card } from './ui';

/**
 * Testimonial Submission Form Component
 * Allows users to submit testimonials for review
 */

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  rating: number;
  testimonial: string;
  allowPublic: boolean;
  consent: boolean;
}

export function TestimonialSubmission() {
  const t = useTranslations('testimonialSubmission');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    rating: 5,
    testimonial: '',
    allowPublic: true,
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseInt(value)
          : value,
    }));
  };

  const stars = [1, 2, 3, 4, 5];

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('success.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('success.message')}
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          {t('success.submitAnother')}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('title')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            {t('form.name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            {t('form.email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Company & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              {t('form.company')}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              {t('form.role')}
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder={t('form.rolePlaceholder')}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('form.rating')}
          </label>
          <div className="flex gap-2">
            {stars.map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                className="text-3xl transition-transform hover:scale-110"
              >
                {star <= formData.rating ? '⭐' : '☆'}
              </button>
            ))}
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {t('form.ratingDisplay', { rating: formData.rating })}
            </span>
          </div>
        </div>

        {/* Testimonial */}
        <div>
          <label
            htmlFor="testimonial"
            className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            {t('form.testimonial')}
          </label>
          <textarea
            id="testimonial"
            name="testimonial"
            value={formData.testimonial}
            onChange={handleChange}
            required
            rows={5}
            placeholder={t('form.testimonialPlaceholder')}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          />
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {t('form.characterCount', { count: formData.testimonial.length })}
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="allowPublic"
              checked={formData.allowPublic}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('form.allowPublic')}
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('form.consentText')}{' '}
              <a href="/en/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                {t('form.terms')}
              </a>{' '}
              {t('form.and')}{' '}
              <a href="/en/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                {t('form.privacy')}
              </a>{' '}
              {t('form.required')}
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !formData.consent}
          className="w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('form.submitting')}
            </span>
          ) : (
            t('form.submit')
          )}
        </Button>
      </form>
    </Card>
  );
}
