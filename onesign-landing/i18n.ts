import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fa'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && locales.includes(locale as Locale)
    ? locale as string
    : 'en';

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});
