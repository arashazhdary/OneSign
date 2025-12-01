'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { motion } from 'framer-motion';

const communityStats = [
  { value: '50K+', label: 'Community Members' },
  { value: '10K+', label: 'Forum Posts' },
  { value: '500+', label: 'Contributors' },
  { value: '24/7', label: 'Active Support' },
];

const channels = [
  {
    name: 'Discord',
    icon: '💬',
    description: 'Join real-time discussions with developers and the OneSign team',
    members: '15,000+',
    color: 'from-indigo-500 to-purple-600',
    link: '#',
  },
  {
    name: 'GitHub',
    icon: '🐙',
    description: 'Contribute to our open-source projects and report issues',
    members: '5,000+',
    color: 'from-gray-700 to-gray-900',
    link: '#',
  },
  {
    name: 'Forum',
    icon: '📋',
    description: 'Ask questions and share knowledge with the community',
    members: '20,000+',
    color: 'from-blue-500 to-cyan-600',
    link: '#',
  },
  {
    name: 'Stack Overflow',
    icon: '📚',
    description: 'Find answers to technical questions tagged with OneSign',
    members: '8,000+',
    color: 'from-orange-500 to-amber-600',
    link: '#',
  },
];

const upcomingEvents = [
  {
    title: 'OneSign Community Meetup',
    date: 'Dec 15, 2024',
    type: 'Virtual',
    attendees: 250,
  },
  {
    title: 'IAM Best Practices Workshop',
    date: 'Dec 20, 2024',
    type: 'Virtual',
    attendees: 180,
  },
  {
    title: 'Developer Conference 2025',
    date: 'Jan 15, 2025',
    type: 'San Francisco',
    attendees: 500,
  },
];

const contributors = [
  { name: 'Alex Chen', contributions: 156, avatar: 'AC' },
  { name: 'Maria Garcia', contributions: 142, avatar: 'MG' },
  { name: 'James Wilson', contributions: 128, avatar: 'JW' },
  { name: 'Sarah Kim', contributions: 115, avatar: 'SK' },
  { name: 'David Brown', contributions: 98, avatar: 'DB' },
  { name: 'Emma Davis', contributions: 87, avatar: 'ED' },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">👥</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Join Our Community
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-10">
              Connect with developers, share ideas, and grow together
            </p>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {communityStats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-purple-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Where to Find Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join the conversation on your favorite platform
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {channels.map((channel, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <motion.div whileHover={{ y: -5 }}>
                  <Card hover className="h-full cursor-pointer overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${channel.color}`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{channel.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{channel.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{channel.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 dark:text-purple-400">{channel.members} members</span>
                            <Button variant="outline" size="sm">Join</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
              <p className="text-gray-600 dark:text-gray-300">Join us at these upcoming community events</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                        {event.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{event.date}</span>
                      <span>{event.attendees} attending</span>
                    </div>
                    <Button variant="primary" size="sm" className="mt-4 w-full">Register</Button>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Top Contributors</h2>
              <p className="text-gray-600 dark:text-gray-300">Recognizing our amazing community members</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {contributors.map((contributor, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3">
                    {contributor.avatar}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{contributor.name}</h3>
                  <span className="text-sm text-gray-500">{contributor.contributions} contributions</span>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Community Resources</h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📖', title: 'Community Guidelines', description: 'Read our community rules and best practices' },
              { icon: '🏆', title: 'Ambassador Program', description: 'Become a OneSign community ambassador' },
              { icon: '💡', title: 'Feature Requests', description: 'Submit and vote on new feature ideas' },
            ].map((resource, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card hover className="text-center cursor-pointer">
                  <CardContent className="p-6">
                    <span className="text-4xl mb-4 block">{resource.icon}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join?</h2>
          <p className="text-purple-100 mb-8">Become part of our growing community today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Join Discord
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Browse Forum
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
