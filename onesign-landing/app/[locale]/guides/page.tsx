'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';

const guides = [
  {
    id: 1,
    title: 'Getting Started with OneSign',
    description: 'Learn the basics of setting up your OneSign account and configuring your first application.',
    category: 'Getting Started',
    difficulty: 'Beginner',
    duration: '15 min',
    icon: '🚀',
    steps: 5,
  },
  {
    id: 2,
    title: 'Implementing SSO with SAML',
    description: 'Step-by-step guide to implementing Single Sign-On using SAML 2.0 protocol.',
    category: 'Authentication',
    difficulty: 'Intermediate',
    duration: '30 min',
    icon: '🔐',
    steps: 8,
  },
  {
    id: 3,
    title: 'Setting Up Multi-Factor Authentication',
    description: 'Configure MFA for your organization with TOTP, SMS, or hardware keys.',
    category: 'Security',
    difficulty: 'Beginner',
    duration: '20 min',
    icon: '📱',
    steps: 6,
  },
  {
    id: 4,
    title: 'User Provisioning with SCIM',
    description: 'Automate user lifecycle management with SCIM provisioning.',
    category: 'Administration',
    difficulty: 'Advanced',
    duration: '45 min',
    icon: '👥',
    steps: 10,
  },
  {
    id: 5,
    title: 'Building Custom Integrations',
    description: 'Use our APIs to build custom integrations with your applications.',
    category: 'Developer',
    difficulty: 'Advanced',
    duration: '60 min',
    icon: '🛠️',
    steps: 12,
  },
  {
    id: 6,
    title: 'Role-Based Access Control Setup',
    description: 'Configure RBAC policies to control access across your organization.',
    category: 'Administration',
    difficulty: 'Intermediate',
    duration: '25 min',
    icon: '🎭',
    steps: 7,
  },
];

const categories = ['All', 'Getting Started', 'Authentication', 'Security', 'Administration', 'Developer'];

const videoTutorials = [
  { title: 'OneSign Overview', duration: '5:30', views: '12K' },
  { title: 'SSO Configuration', duration: '8:45', views: '8.5K' },
  { title: 'API Authentication', duration: '12:20', views: '6.2K' },
  { title: 'Admin Dashboard Tour', duration: '7:15', views: '4.8K' },
];

export default function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGuides = activeCategory === 'All'
    ? guides
    : guides.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">🎓</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Step-by-Step Guides
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-10">
              Learn everything about OneSign with our comprehensive tutorials
            </p>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <span className="text-3xl font-bold text-white">{guides.length}+</span>
                <span className="text-orange-100 block text-sm">Guides</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <span className="text-3xl font-bold text-white">4</span>
                <span className="text-orange-100 block text-sm">Video Tutorials</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <span className="text-3xl font-bold text-white">3</span>
                <span className="text-orange-100 block text-sm">Difficulty Levels</span>
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide, index) => (
              <SlideUp key={guide.id} delay={index * 0.1}>
                <motion.div whileHover={{ y: -5 }}>
                  <Card hover className="h-full cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-4xl">{guide.icon}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {guide.difficulty}
                        </span>
                      </div>
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">{guide.category}</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2">{guide.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{guide.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{guide.duration}</span>
                        <span>{guide.steps} steps</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Video Tutorials</h2>
              <p className="text-gray-600 dark:text-gray-300">Watch and learn at your own pace</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((video, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer">
                  <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{video.duration}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mt-3">{video.title}</h3>
                  <span className="text-sm text-gray-500">{video.views} views</span>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Recommended Learning Path</h2>
              <p className="text-gray-600 dark:text-gray-300">Follow this path to master OneSign</p>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {[
              { step: 1, title: 'Account Setup', time: '15 min' },
              { step: 2, title: 'Basic Configuration', time: '20 min' },
              { step: 3, title: 'First SSO Integration', time: '30 min' },
              { step: 4, title: 'MFA Setup', time: '15 min' },
              { step: 5, title: 'User Management', time: '25 min' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                </div>
                <span className="text-sm text-gray-500">{item.time}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Learn?</h2>
          <p className="text-orange-100 mb-8">Start your learning journey today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
              Start Learning
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Browse All Guides
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
