'use client';

import { use } from 'react';
import { useLocale } from 'next-intl';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn } from '@/app/components/animations';
import Link from 'next/link';

/**
 * Individual Blog Post Page
 */

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const locale = useLocale();

  // Mock blog post data
  const post = {
    slug,
    title: 'Introducing OneSign: Next Generation Identity & Access Management',
    excerpt: 'Discover how OneSign revolutionizes digital identity management with cutting-edge technology and unparalleled security.',
    author: {
      name: 'Sarah Johnson',
      avatar: '👩‍💼',
      role: 'Product Manager',
      bio: 'Product leader with 10+ years of experience in enterprise software and security solutions.',
    },
    publishedAt: '2024-11-15',
    readTime: 5,
    category: 'Product',
    tags: ['IAM', 'Security', 'Product Launch'],
    coverImage: '🚀',
    content: `
# Introduction

Welcome to OneSign, the next generation of Identity & Access Management solutions. In this article, we'll explore how our platform is revolutionizing the way organizations handle digital identities.

## The Challenge

Modern organizations face unprecedented challenges in managing user identities:

- **Scale**: Managing thousands or millions of users across multiple platforms
- **Security**: Protecting against increasingly sophisticated cyber threats
- **Compliance**: Meeting strict regulatory requirements (GDPR, HIPAA, SOC 2)
- **User Experience**: Providing seamless access without compromising security

## Our Solution

OneSign addresses these challenges through:

### 1. Advanced Authentication

Multi-factor authentication with support for:
- TOTP (Time-based One-Time Password)
- SMS and Email verification
- Biometric authentication
- Hardware security keys

### 2. Zero Trust Architecture

We implement zero trust principles:
- Never trust, always verify
- Least privilege access
- Continuous authentication
- Microsegmentation

### 3. Enterprise-Grade Security

- End-to-end encryption
- SOC 2 Type II certified
- GDPR and HIPAA compliant
- 99.99% uptime SLA

### 4. Seamless Integration

Easy integration with your existing tools:
- Single Sign-On (SSO)
- SAML 2.0 and OAuth 2.0
- RESTful APIs
- SDK for major languages

## Key Features

**For Developers:**
- Comprehensive API documentation
- SDKs for Node.js, Python, Java, and more
- Webhook support for real-time events
- Sandbox environment for testing

**For Security Teams:**
- Advanced threat detection
- Real-time monitoring and alerts
- Detailed audit logs
- Automated compliance reporting

**For End Users:**
- Single Sign-On across all applications
- Self-service password reset
- Multi-device management
- Privacy-first approach

## Getting Started

Ready to transform your IAM infrastructure? Here's how to get started:

1. **Sign up for a free trial** - No credit card required
2. **Integrate our SDK** - Get up and running in minutes
3. **Configure your security policies** - Customize to your needs
4. **Go live** - Scale from 100 to millions of users

## Conclusion

OneSign represents a new era in identity management - one that doesn't compromise between security and user experience. Join thousands of organizations already using OneSign to secure their digital future.

[Get Started Today](/en/contact) | [View Documentation](/docs) | [Schedule a Demo](/en/contact)
    `,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              {/* Breadcrumb */}
              <div className="mb-6">
                <Link
                  href="/en/blog"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← Back to Blog
                </Link>
              </div>

              {/* Category */}
              <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
                {post.category}
              </span>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{post.author.avatar}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.author.name}
                    </p>
                    <p className="text-sm">{post.author.role}</p>
                  </div>
                </div>
                <span>•</span>
                <span>{new Date(post.publishedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
                <span>•</span>
                <span>{post.readTime} min read</span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Cover Image */}
        <section className="px-4 -mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl shadow-2xl flex items-center justify-center text-9xl">
              {post.coverImage}
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                className="whitespace-pre-wrap"
              />
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Tags:
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{post.author.avatar}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    About {post.author.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {post.author.bio}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {post.author.role} at OneSign
                  </p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share this article
              </h3>
              <div className="flex justify-center gap-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Twitter
                </button>
                <button className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
                  LinkedIn
                </button>
                <button className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
