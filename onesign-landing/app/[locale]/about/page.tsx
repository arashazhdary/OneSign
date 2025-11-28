'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card, CardContent } from '@/app/components/ui/Card';
import { FadeIn, SlideUp } from '@/app/components/animations';

export default function AboutPage() {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      avatar: '👩‍💼',
      bio: 'Former VP at DocuSign with 15+ years in digital transformation.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      avatar: '👨‍💻',
      bio: 'Ex-Google engineer specializing in security and scalability.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      avatar: '👩‍🎨',
      bio: 'Product leader from Dropbox focused on user experience.',
    },
    {
      name: 'David Kumar',
      role: 'Head of Security',
      avatar: '👨‍🔬',
      bio: 'Cybersecurity expert with background in financial services.',
    },
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Customer First',
      description: 'Every decision we make starts with how it benefits our customers.',
    },
    {
      icon: '🔒',
      title: 'Security Always',
      description: 'We never compromise on security. Your trust is our top priority.',
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'We constantly push boundaries to deliver cutting-edge solutions.',
    },
    {
      icon: '🤝',
      title: 'Integrity',
      description: "We do what's right, even when no one is watching.",
    },
  ];

  const milestones = [
    { year: '2018', event: 'OneSign founded in San Francisco' },
    { year: '2019', event: 'Reached 1,000 customers' },
    { year: '2020', event: 'Series A funding - $10M' },
    { year: '2021', event: 'Expanded to Europe and Asia' },
    { year: '2022', event: '10,000+ businesses using OneSign' },
    { year: '2023', event: 'SOC 2 Type II certification' },
    { year: '2024', event: '50,000+ active users worldwide' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                About OneSign
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We're on a mission to make digital signatures simple, secure, and accessible for everyone.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                OneSign was born out of frustration with complicated, expensive e-signature solutions. In 2018, our founders Sarah and Michael were working on a project that required hundreds of signatures. The existing tools were either too complex, too expensive, or lacking in security features.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                They decided to build something better. A platform that combined enterprise-grade security with consumer-grade simplicity. Something that small businesses could afford but that enterprises would trust.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Today, OneSign is used by over 50,000 businesses worldwide, from solo entrepreneurs to Fortune 500 companies. We've processed millions of signatures and saved countless hours of manual work. But we're just getting started.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Values
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                The principles that guide everything we do
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card className="text-center h-full">
                  <CardContent className="pt-8">
                    <div className="text-5xl mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Meet Our Leadership
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                The team behind OneSign
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card hover className="text-center">
                  <CardContent className="pt-8">
                    <div className="text-6xl mb-4">{member.avatar}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Journey
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <SlideUp key={index} delay={index * 0.05}>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {milestone.year}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {milestone.event}
                      </p>
                    </div>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              We're always looking for talented people to join our team
            </p>
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
              View Open Positions
            </button>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
