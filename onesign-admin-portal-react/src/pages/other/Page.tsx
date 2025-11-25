import { redirect } from 'next/navigation';
import { locales } from '../../i18n';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // With localePrefix: 'always', all locales need prefix
  redirect(`/${locale}/tenant/dashboard`);
}

