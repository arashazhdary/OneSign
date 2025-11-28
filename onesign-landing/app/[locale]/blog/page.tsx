'use client';

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
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  coverImage: string;
}

// Mock blog posts data
const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'introducing-onesign-next-generation-iam',
    title: 'Introducing OneSign: Next Generation Identity & Access Management',
    excerpt: 'Discover how OneSign revolutionizes digital identity management with cutting-edge technology and unparalleled security.',
    content: '',
    author: {
      name: 'Sarah Johnson',
      avatar: '👩‍💼',
      role: 'Product Manager',
    },
    publishedAt: '2024-11-15',
    readTime: 5,
    category: 'Product',
    tags: ['IAM', 'Security', 'Product Launch'],
    coverImage: '🚀',
  },
  {
    id: '2',
    slug: 'security-best-practices-2024',
    title: 'Security Best Practices for 2024: A Comprehensive Guide',
    excerpt: 'Learn the latest security best practices to protect your organization from modern cyber threats.',
    content: '',
    author: {
      name: 'Michael Chen',
      avatar: '👨‍💻',
      role: 'Security Architect',
    },
    publishedAt: '2024-11-10',
    readTime: 8,
    category: 'Security',
    tags: ['Security', 'Best Practices', 'Guide'],
    coverImage: '🔒',
  },
  {
    id: '3',
    slug: 'zero-trust-architecture-explained',
    title: 'Zero Trust Architecture Explained: Why It Matters',
    excerpt: 'Understanding zero trust security model and how it can transform your organization\'s security posture.',
    content: '',
    author: {
      name: 'David Kim',
      avatar: '👨‍🔬',
      role: 'Lead Engineer',
    },
    publishedAt: '2024-11-05',
    readTime: 6,
    category: 'Technology',
    tags: ['Zero Trust', 'Architecture', 'Security'],
    coverImage: '🛡️',
  },
  {
    id: '4',
    slug: 'compliance-made-easy-gdpr-hipaa',
    title: 'Compliance Made Easy: GDPR, HIPAA, and Beyond',
    excerpt: 'Navigate the complex world of compliance regulations with confidence using OneSign.',
    content: '',
    author: {
      name: 'Emma Williams',
      avatar: '👩‍⚖️',
      role: 'Compliance Officer',
    },
    publishedAt: '2024-10-28',
    readTime: 7,
    category: 'Compliance',
    tags: ['GDPR', 'HIPAA', 'Compliance'],
    coverImage: '📋',
  },
  {
    id: '5',
    slug: 'api-security-authentication-tips',
    title: 'API Security: Authentication and Authorization Tips',
    excerpt: 'Secure your APIs with proven authentication and authorization strategies.',
    content: '',
    author: {
      name: 'Alex Rodriguez',
      avatar: '👨‍🚀',
      role: 'API Architect',
    },
    publishedAt: '2024-10-20',
    readTime: 10,
    category: 'Development',
    tags: ['API', 'Security', 'Authentication'],
    coverImage: '🔐',
  },
  {
    id: '6',
    slug: 'customer-success-story-enterprise',
    title: 'Customer Success Story: How Enterprise X Scaled Securely',
    excerpt: 'Learn how a Fortune 500 company transformed their IAM infrastructure with OneSign.',
    content: '',
    author: {
      name: 'Jessica Lee',
      avatar: '👩‍💼',
      role: 'Customer Success',
    },
    publishedAt: '2024-10-15',
    readTime: 5,
    category: 'Case Study',
    tags: ['Customer Story', 'Enterprise', 'Success'],
    coverImage: '🏢',
  },
];

const categories = ['All', 'Product', 'Security', 'Technology', 'Compliance', 'Development', 'Case Study'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Blog & News
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Insights, updates, and best practices from the OneSign team
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
                    category === 'All'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
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
                          {post.category}
                        </span>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{post.author.avatar}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {post.author.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {post.author.role}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {post.readTime} min read
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
                Load More Articles
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="px-4 py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the latest articles and insights delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
