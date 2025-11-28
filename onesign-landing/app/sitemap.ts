import { MetadataRoute } from 'next';
import { locales } from '@/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const routes: MetadataRoute.Sitemap = [];

  const pages = [
    { path: 'landing', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: 'pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: 'features', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: 'about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: 'terms', priority: 0.5, changeFrequency: 'yearly' as const },
  ];

  locales.forEach((locale) => {
    pages.forEach((page) => {
      routes.push({
        url: `${baseUrl}/${locale}/${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/${page.path}`])
          ),
        },
      });
    });
  });

  return routes;
}
