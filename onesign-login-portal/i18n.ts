import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fa'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Locale validation is handled by middleware (proxy.ts)
  // Default to 'en' if locale is invalid to avoid notFound() in root layout
  const validLocale = locale && locales.includes(locale as Locale) 
    ? locale as string 
    : 'en';

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

