import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function RootPage() {
  // Get locale from middleware (defaults to 'en')
  const locale = await getLocale();
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  redirect(`${localePrefix}/tenant/dashboard`);
}

