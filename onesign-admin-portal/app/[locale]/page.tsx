import { redirect } from 'next/navigation';
import { locales } from '../../i18n';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to landing page for unauthenticated users
  redirect(`/${locale}/landing`);
}

