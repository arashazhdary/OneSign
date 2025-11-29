/**
 * SEO utilities and metadata helpers
 */

import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  locale?: string;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    ogImage,
    canonical,
    noindex,
    locale = 'en',
  } = config;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const fullTitle = `${title} | OneSign`;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonical || baseUrl,
      languages: {
        en: `${baseUrl}/en`,
        fa: `${baseUrl}/fa`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || baseUrl,
      siteName: 'OneSign',
      locale,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export const defaultSEO: SEOConfig = {
  title: 'Enterprise Identity & Access Management',
  description: 'Comprehensive enterprise IAM platform with advanced authentication, access control, and security governance.',
  keywords: [
    'IAM',
    'Identity Management',
    'Access Control',
    'SSO',
    'Single Sign-On',
    'MFA',
    'Multi-Factor Authentication',
    'Enterprise Security',
  ],
};

// JSON-LD structured data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OneSign',
    description: 'Enterprise Identity & Access Management Platform',
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/onesign-logo.png`,
    sameAs: [
      // Add social media URLs
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OneSign',
    url: process.env.NEXT_PUBLIC_APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
