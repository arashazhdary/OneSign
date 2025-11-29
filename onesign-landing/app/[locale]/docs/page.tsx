'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';

const docCategories = [
  {
    id: 'getting-started',
    icon: '🚀',
    title: 'Getting Started',
    description: 'Quick start guides to get up and running with OneSign',
    color: 'from-green-500 to-emerald-600',
    articles: [
      { title: 'Quick Start Guide', time: '5 min', level: 'Beginner' },
      { title: 'Installation & Setup', time: '10 min', level: 'Beginner' },
      { title: 'Your First Integration', time: '15 min', level: 'Beginner' },
      { title: 'Basic Configuration', time: '8 min', level: 'Beginner' },
    ]
  },
  {
    id: 'authentication',
    icon: '🔐',
    title: 'Authentication',
    description: 'SSO, MFA, and authentication protocols',
    color: 'from-blue-500 to-indigo-600',
    articles: [
      { title: 'SSO Implementation', time: '20 min', level: 'Intermediate' },
      { title: 'SAML 2.0 Setup', time: '25 min', level: 'Advanced' },
      { title: 'OAuth 2.0 & OIDC', time: '30 min', level: 'Advanced' },
      { title: 'Multi-Factor Auth', time: '15 min', level: 'Intermediate' },
    ]
  },
  {
    id: 'api-reference',
    icon: '📡',
    title: 'API Reference',
    description: 'Complete API documentation and examples',
    color: 'from-purple-500 to-violet-600',
    articles: [
      { title: 'REST API Overview', time: '10 min', level: 'Intermediate' },
      { title: 'Authentication API', time: '15 min', level: 'Intermediate' },
      { title: 'User Management API', time: '20 min', level: 'Intermediate' },
      { title: 'Webhooks & Events', time: '12 min', level: 'Advanced' },
    ]
  },
  {
    id: 'sdks',
    icon: '🛠️',
    title: 'SDKs & Libraries',
    description: 'Official SDKs for popular languages and frameworks',
    color: 'from-orange-500 to-amber-600',
    articles: [
      { title: 'JavaScript SDK', time: '15 min', level: 'Intermediate' },
      { title: 'React Components', time: '20 min', level: 'Intermediate' },
      { title: '.NET SDK', time: '15 min', level: 'Intermediate' },
      { title: 'Python SDK', time: '15 min', level: 'Intermediate' },
    ]
  },
  {
    id: 'administration',
    icon: '⚙️',
    title: 'Administration',
    description: 'Configure and manage your OneSign deployment',
    color: 'from-slate-500 to-gray-600',
    articles: [
      { title: 'Admin Console Guide', time: '25 min', level: 'Intermediate' },
      { title: 'User Provisioning', time: '20 min', level: 'Intermediate' },
      { title: 'Role-Based Access', time: '15 min', level: 'Intermediate' },
      { title: 'Audit & Logging', time: '18 min', level: 'Advanced' },
    ]
  },
  {
    id: 'security',
    icon: '🛡️',
    title: 'Security',
    description: 'Security best practices and compliance guides',
    color: 'from-red-500 to-rose-600',
    articles: [
      { title: 'Security Overview', time: '10 min', level: 'Beginner' },
      { title: 'Encryption Standards', time: '15 min', level: 'Intermediate' },
      { title: 'Zero Trust Setup', time: '25 min', level: 'Advanced' },
      { title: 'Compliance Guide', time: '20 min', level: 'Intermediate' },
    ]
  },
];

const popularArticles = [
  { title: 'Quick Start Guide', category: 'Getting Started', views: '12.5K' },
  { title: 'SSO Implementation', category: 'Authentication', views: '8.3K' },
  { title: 'REST API Overview', category: 'API Reference', views: '7.1K' },
  { title: 'React Components', category: 'SDKs', views: '5.9K' },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">📚</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Everything you need to integrate, configure, and master OneSign
            </p>
          </FadeIn>

          {/* Search Bar */}
          <SlideUp delay={0.2}>
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </SlideUp>

          {/* Quick Links */}
          <SlideUp delay={0.3}>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['Quick Start', 'API Reference', 'SDKs', 'Examples'].map((link) => (
                <span key={link} className="px-4 py-2 bg-white/10 rounded-full text-sm text-white hover:bg-white/20 cursor-pointer transition-colors">
                  {link}
                </span>
              ))}
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Articles</h2>
            <span className="text-sm text-gray-500">Most viewed this week</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularArticles.map((article, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-900 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ y: -2 }}
              >
                <span className="text-xs text-purple-600 dark:text-purple-400">{article.category}</span>
                <h3 className="font-medium text-gray-900 dark:text-white mt-1">{article.title}</h3>
                <span className="text-xs text-gray-500 mt-2 block">{article.views} views</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Find the documentation you need
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docCategories.map((category, index) => (
              <SlideUp key={category.id} delay={index * 0.1}>
                <motion.div whileHover={{ y: -5 }} onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}>
                  <Card hover className="h-full cursor-pointer">
                    <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                    <CardContent className="p-6">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {category.description}
                      </p>

                      {activeCategory === category.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3"
                        >
                          {category.articles.map((article, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg">
                              <span className="text-gray-700 dark:text-gray-300">{article.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{article.time}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  article.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  article.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>{article.level}</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium mt-4">
                        <span>{category.articles.length} articles</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* API Quick Reference */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">API Quick Reference</h2>
              <p className="text-gray-600 dark:text-gray-300">Common API endpoints at a glance</p>
            </div>
          </FadeIn>

          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="pb-4">Method</th>
                  <th className="pb-4">Endpoint</th>
                  <th className="pb-4">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                {[
                  { method: 'POST', endpoint: '/api/v1/auth/login', desc: 'Authenticate user' },
                  { method: 'GET', endpoint: '/api/v1/users', desc: 'List all users' },
                  { method: 'POST', endpoint: '/api/v1/users', desc: 'Create new user' },
                  { method: 'GET', endpoint: '/api/v1/sessions', desc: 'List active sessions' },
                  { method: 'POST', endpoint: '/api/v1/mfa/verify', desc: 'Verify MFA token' },
                ].map((api, index) => (
                  <tr key={index} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        api.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                        api.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>{api.method}</span>
                    </td>
                    <td className="py-3 text-purple-400">{api.endpoint}</td>
                    <td className="py-3 text-gray-400">{api.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-purple-100 mb-8">Can't find what you're looking for? Our support team is here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Contact Support
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Join Community
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
