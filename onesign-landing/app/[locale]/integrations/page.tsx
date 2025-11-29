'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';

const categories = [
  { id: 'all', name: 'All', count: 120 },
  { id: 'productivity', name: 'Productivity', count: 25 },
  { id: 'cloud', name: 'Cloud Providers', count: 15 },
  { id: 'crm', name: 'CRM', count: 12 },
  { id: 'hr', name: 'HR & Workforce', count: 18 },
  { id: 'security', name: 'Security', count: 20 },
  { id: 'developer', name: 'Developer Tools', count: 30 },
];

const integrations = [
  { name: 'Microsoft 365', category: 'productivity', icon: '🪟', popular: true, description: 'Full SSO integration with Azure AD' },
  { name: 'Google Workspace', category: 'productivity', icon: '🔵', popular: true, description: 'Gmail, Drive, and all Google apps' },
  { name: 'Slack', category: 'productivity', icon: '💬', popular: true, description: 'Team messaging and collaboration' },
  { name: 'Salesforce', category: 'crm', icon: '☁️', popular: true, description: 'Complete CRM integration' },
  { name: 'AWS', category: 'cloud', icon: '🟠', popular: true, description: 'IAM federation with AWS services' },
  { name: 'Azure', category: 'cloud', icon: '🔷', popular: true, description: 'Azure AD B2B & B2C integration' },
  { name: 'GitHub', category: 'developer', icon: '🐙', popular: true, description: 'Repository and org access control' },
  { name: 'Jira', category: 'developer', icon: '🔵', popular: false, description: 'Project management SSO' },
  { name: 'Workday', category: 'hr', icon: '🧑‍💼', popular: true, description: 'HR system provisioning' },
  { name: 'ServiceNow', category: 'productivity', icon: '🟢', popular: false, description: 'ITSM and workflow automation' },
  { name: 'Okta', category: 'security', icon: '🔐', popular: false, description: 'Federation and identity bridge' },
  { name: 'Zoom', category: 'productivity', icon: '📹', popular: true, description: 'Video conferencing SSO' },
  { name: 'Dropbox', category: 'productivity', icon: '📦', popular: false, description: 'File storage and sharing' },
  { name: 'HubSpot', category: 'crm', icon: '🟧', popular: false, description: 'Marketing and sales platform' },
  { name: 'Notion', category: 'productivity', icon: '📝', popular: false, description: 'Team workspace access' },
  { name: 'GitLab', category: 'developer', icon: '🦊', popular: false, description: 'DevOps platform integration' },
  { name: 'BambooHR', category: 'hr', icon: '🎋', popular: false, description: 'HR data synchronization' },
  { name: 'GCP', category: 'cloud', icon: '🌈', popular: true, description: 'Google Cloud IAM integration' },
  { name: 'Splunk', category: 'security', icon: '📊', popular: false, description: 'SIEM log forwarding' },
  { name: 'PagerDuty', category: 'developer', icon: '🚨', popular: false, description: 'Incident management SSO' },
];

const stats = [
  { value: '500+', label: 'Integrations' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<5min', label: 'Setup Time' },
  { value: '24/7', label: 'Support' },
];

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIntegrations = integrations.filter(int => {
    const matchesCategory = activeCategory === 'all' || int.category === activeCategory;
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0">
          {['🔌', '☁️', '🔐', '📊', '💬', '🛠️'].map((icon, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-10"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity }}
            >
              {icon}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">🔌</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Integrations Marketplace
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Connect OneSign with 500+ applications and services
            </p>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </SlideUp>

          <SlideUp delay={0.3}>
            <div className="max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Featured Integrations */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Featured Integrations</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {integrations.filter(i => i.popular).map((integration, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow w-48"
                whileHover={{ y: -3 }}
              >
                <div className="text-3xl mb-2">{integration.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400">Popular</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & Grid */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIntegrations.map((integration, index) => (
              <SlideUp key={index} delay={index * 0.05}>
                <motion.div whileHover={{ y: -5 }}>
                  <Card hover className="h-full cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-4xl">{integration.icon}</span>
                        {integration.popular && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">Popular</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{integration.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{integration.description}</p>
                      <Button variant="outline" size="sm" className="w-full">View Details</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No integrations found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try a different search term or category</p>
            </div>
          )}
        </div>
      </section>

      {/* Request Integration */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <span className="text-5xl mb-6 block">💡</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Don't see your app?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Request an integration and we'll work on adding it</p>
            <Button variant="primary" size="lg">Request Integration</Button>
          </FadeIn>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Build Your Own Integration</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Use our comprehensive APIs and SDKs to build custom integrations.</p>
              <ul className="space-y-3 mb-8">
                {['RESTful API', 'GraphQL Support', 'Webhooks', 'SDKs for 10+ languages'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="primary">View API Docs</Button>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <pre className="text-green-400 overflow-x-auto whitespace-pre-wrap">
{`curl -X POST https://api.onesign.io/v1/auth \\
  -H "Authorization: Bearer API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id": "user@example.com"}'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Connect?</h2>
          <p className="text-blue-100 mb-8">Set up your first integration in minutes</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">Get Started Free</Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Talk to Sales</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
