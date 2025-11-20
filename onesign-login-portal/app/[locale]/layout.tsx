import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '../../i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Locale validation is handled by middleware (proxy.ts)
  // We don't use notFound() here to avoid issues with root layout

  // Pass locale explicitly to getMessages
  const messages = await getMessages({ locale });

  // Nested layouts should not have html/body tags
  // Root layout already has them
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
