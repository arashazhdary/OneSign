import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ToastContainer } from '@/app/components/Toast';
import { CookieConsent } from '@/app/components/CookieConsent';
import { BackToTop } from '@/app/components/BackToTop';
import { ProgressBar } from '@/app/components/ProgressBar';
import { GoogleAnalytics } from '@/app/components/GoogleAnalytics';
import { WebVitals } from '@/app/components/WebVitals';
import { LiveChat } from '@/app/components/LiveChat';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <GoogleAnalytics />
            <WebVitals />
            <ProgressBar />
            {children}
            <BackToTop />
            <LiveChat />
            <ToastContainer />
            <CookieConsent />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
