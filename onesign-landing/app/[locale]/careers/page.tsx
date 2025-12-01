'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';

const departments = ['All', 'Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Operations'];

const jobs = [
  {
    id: 1,
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'San Francisco / Remote',
    type: 'Full-time',
    level: 'Senior',
  },
  {
    id: 2,
    title: 'Frontend Engineer (React)',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid-Senior',
  },
  {
    id: 3,
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco',
    type: 'Full-time',
    level: 'Senior',
  },
  {
    id: 4,
    title: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid',
  },
  {
    id: 5,
    title: 'Enterprise Sales Executive',
    department: 'Sales',
    location: 'New York / Remote',
    type: 'Full-time',
    level: 'Senior',
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    level: 'Senior',
  },
  {
    id: 7,
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid-Senior',
  },
  {
    id: 8,
    title: 'Security Engineer',
    department: 'Engineering',
    location: 'San Francisco / Remote',
    type: 'Full-time',
    level: 'Senior',
  },
];

const benefits = [
  { icon: '💰', title: 'Competitive Salary', description: 'Top-tier compensation packages' },
  { icon: '🏥', title: 'Health Benefits', description: '100% covered health, dental, vision' },
  { icon: '🏖️', title: 'Unlimited PTO', description: 'Take time when you need it' },
  { icon: '🏠', title: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: '📈', title: 'Equity', description: 'Share in our success with stock options' },
  { icon: '📚', title: 'Learning Budget', description: '$2,000 annual learning stipend' },
  { icon: '🏋️', title: 'Wellness', description: 'Gym membership & wellness programs' },
  { icon: '👶', title: 'Parental Leave', description: '16 weeks paid parental leave' },
];

const values = [
  { icon: '🚀', title: 'Move Fast', description: 'We ship quickly and iterate based on feedback' },
  { icon: '🤝', title: 'Customer First', description: 'Every decision starts with customer impact' },
  { icon: '🔒', title: 'Security Minded', description: 'Security is in our DNA, not an afterthought' },
  { icon: '🌍', title: 'Global Mindset', description: 'We build for users worldwide' },
];

export default function CareersPage() {
  const [activeDepartment, setActiveDepartment] = useState('All');

  const filteredJobs = activeDepartment === 'All'
    ? jobs
    : jobs.filter(j => j.department === activeDepartment);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">💼</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-rose-100 max-w-2xl mx-auto mb-10">
              Help us build the future of identity and access management
            </p>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <span className="text-3xl font-bold text-white">{jobs.length}</span>
                <span className="text-rose-100 block text-sm">Open Positions</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <span className="text-3xl font-bold text-white">4</span>
                <span className="text-rose-100 block text-sm">Countries</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <span className="text-3xl font-bold text-white">100%</span>
                <span className="text-rose-100 block text-sm">Remote Friendly</span>
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Values
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                What drives us every day
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <motion.div whileHover={{ y: -5 }}>
                  <Card hover className="h-full text-center">
                    <CardContent className="p-6">
                      <span className="text-4xl mb-4 block">{value.icon}</span>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Benefits & Perks
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                We take care of our team
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <SlideUp key={index} delay={index * 0.05}>
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
                  <span className="text-3xl">{benefit.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Open Positions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Find your next opportunity
              </p>
            </div>
          </FadeIn>

          {/* Department Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeDepartment === dept
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Jobs List */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredJobs.map((job, index) => (
              <SlideUp key={job.id} delay={index * 0.05}>
                <motion.div whileHover={{ x: 5 }}>
                  <Card hover className="cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded">
                              {job.department}
                            </span>
                            <span>{job.location}</span>
                            <span>{job.type}</span>
                            <span>{job.level}</span>
                          </div>
                        </div>
                        <Button variant="primary" size="sm">Apply Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No positions found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try a different department filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Life at OneSign */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Life at OneSign</h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Team Retreats', description: 'Annual all-hands meetings in exciting locations', emoji: '🌴' },
              { title: 'Hackathons', description: 'Quarterly innovation days to build new ideas', emoji: '💡' },
              { title: 'Learning Culture', description: 'Weekly tech talks and knowledge sharing', emoji: '📚' },
            ].map((item, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center">
                  <span className="text-5xl mb-4 block">{item.emoji}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-rose-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Don't See Your Role?</h2>
          <p className="text-rose-100 mb-8">Send us your resume and we'll keep you in mind for future opportunities</p>
          <Button variant="primary" size="lg" className="bg-white text-rose-600 hover:bg-gray-100">
            Send Open Application
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
