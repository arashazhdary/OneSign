'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === `/${locale}/tenant${path}`;
  };

  const navItems = [
    { path: '/dashboard', label: t('common.dashboard') },
    { path: '/users', label: t('common.users') },
    { path: '/apps', label: t('common.applications') },
    { path: '/org-units', label: t('tenant.orgUnits.title') },
    { path: '/delegated-admins', label: t('tenant.delegatedAdmins.title') },
    { path: '/audit', label: t('common.audit') },
    { path: '/settings', label: t('common.settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600 mb-8">OneSign</h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={`/${locale}/tenant${item.path}`}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {children}
      </main>
    </div>
  );
}

