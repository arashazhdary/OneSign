'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card } from '@/app/components/ui';
import Link from 'next/link';
import { FadeIn } from '@/app/components/animations';

/**
 * Blog/News Listing Page
 */

interface BlogPost {
  id: string;
  slug: string;
  titleKey: string;
  excerptKey: string;
  content: string;
  author: {
    nameKey: string;
    avatar: string;
    roleKey: string;
  };
  publishedAt: string;
  readTime: number;
  categoryKey: string;
  tagKeys: string[];
  coverImage: string;
}

// Mock blog posts data
const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'introducing-onesign-next-generation-iam',
    titleKey: 'post1.title',
    excerptKey: 'post1.excerpt',
    content: '',
    author: {
      nameKey: 'post1.author.name',
      avatar: '👩‍💼',
      roleKey: 'post1.author.role',
    },
    publishedAt: '2024-11-15',
    readTime: 5,
    categoryKey: 'categories.product',
    tagKeys: ['iam', 'security', 'productLaunch'],
    coverImage: '🚀',
  },
  {
    id: '2',
    slug: 'security-best-practices-2024',
    titleKey: 'post2.title',
    excerptKey: 'post2.excerpt',
    content: '',
    author: {
      nameKey: 'post2.author.name',
      avatar: '👨‍💻',
      roleKey: 'post2.author.role',
    },
    publishedAt: '2024-11-10',
    readTime: 8,
    categoryKey: 'categories.security',
    tagKeys: ['security', 'bestPractices', 'guide'],
    coverImage: '🔒',
  },
  {
    id: '3',
    slug: 'zero-trust-architecture-explained',
    titleKey: 'post3.title',
    excerptKey: 'post3.excerpt',
    content: '',
    author: {
      nameKey: 'post3.author.name',
      avatar: '👨‍🔬',
      roleKey: 'post3.author.role',
    },
    publishedAt: '2024-11-05',
    readTime: 6,
    categoryKey: 'categories.technology',
    tagKeys: ['zeroTrust', 'architecture', 'security'],
    coverImage: '🛡️',
  },
  {
    id: '4',
    slug: 'compliance-made-easy-gdpr-hipaa',
    titleKey: 'post4.title',
    excerptKey: 'post4.excerpt',
    content: '',
    author: {
      nameKey: 'post4.author.name',
      avatar: '👩‍⚖️',
      roleKey: 'post4.author.role',
    },
    publishedAt: '2024-10-28',
    readTime: 7,
    categoryKey: 'categories.compliance',
    tagKeys: ['gdpr', 'hipaa', 'compliance'],
    coverImage: '📋',
  },
  {
    id: '5',
    slug: 'api-security-authentication-tips',
    titleKey: 'post5.title',
    excerptKey: 'post5.excerpt',
    content: '',
    author: {
      nameKey: 'post5.author.name',
      avatar: '👨‍🚀',
      roleKey: 'post5.author.role',
    },
    publishedAt: '2024-10-20',
    readTime: 10,
    categoryKey: 'categories.development',
    tagKeys: ['api', 'security', 'authentication'],
    coverImage: '🔐',
  },
  {
    id: '6',
    slug: 'customer-success-story-enterprise',
    titleKey: 'post6.title',
    excerptKey: 'post6.excerpt',
    content: '',
    author: {
      nameKey: 'post6.author.name',
      avatar: '👩‍💼',
      roleKey: 'post6.author.role',
    },
    publishedAt: '2024-10-15',
    readTime: 5,
    categoryKey: 'categories.caseStudy',
    tagKeys: ['customerStory', 'enterprise', 'success'],
    coverImage: '🏢',
  },
];

const categories = ['all', 'product', 'security', 'technology', 'compliance', 'development', 'caseStudy'];

export default function BlogPage() {
  const t = useTranslations('blogPage');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 py-16 bg-gradient-to-b from-blue-600 to-purple-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {t('title')}
              </h1>
              <p className="text-xl text-white">
                {t('subtitle')}
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 py-8 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t(`categories.${category}`)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <FadeIn key={post.id} delay={index * 0.1}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      {/* Cover Image */}
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-6xl rounded-t-lg">
                        {post.coverImage}
                      </div>

                      <div className="p-6">
                        {/* Category Badge */}
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3">
                          {t(post.categoryKey)}
                        </span>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {t(post.titleKey)}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {t(post.excerptKey)}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{post.author.avatar}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {t(post.author.nameKey)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {t(post.author.roleKey)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(post.publishedAt).toLocaleDateString(locale, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {post.readTime} {t('readTime')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </FadeIn>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {t('loadMore')}
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="px-4 py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('newsletter.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {t('newsletter.button')}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
