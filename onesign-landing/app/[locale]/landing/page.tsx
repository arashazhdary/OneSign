'use client';

import { Header } from '@/app/components/Header';
import { Hero } from '@/app/components/Hero';
import { Testimonials } from '@/app/components/Testimonials';
import { FAQ } from '@/app/components/FAQ';
import { Newsletter } from '@/app/components/Newsletter';
import { Footer } from '@/app/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { SlideUp, FadeIn } from '@/app/components/animations';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('Landing');

  const features = [
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      description: 'AES-256 encryption and SOC 2 Type II compliance ensure your documents are always protected.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Sign and send documents in seconds. No more printing, scanning, or mailing.',
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Sign documents from anywhere, on any device. iOS and Android apps available.',
    },
    {
      icon: '🌍',
      title: 'Legally Binding',
      description: 'Compliant with eIDAS, ESIGN, and UETA. Valid in 180+ countries.',
    },
    {
      icon: '🔄',
      title: 'Easy Integration',
      description: 'Integrate with your favorite tools via API or pre-built connectors.',
    },
    {
      icon: '📊',
      title: 'Real-Time Tracking',
      description: 'Track document status in real-time. Get notified when documents are viewed or signed.',
    },
  ];

  const useCases = [
    {
      icon: '💼',
      title: 'Sales Contracts',
      description: 'Close deals faster with instant contract signing.',
    },
    {
      icon: '👥',
      title: 'HR Documents',
      description: 'Streamline employee onboarding and offboarding.',
    },
    {
      icon: '🏢',
      title: 'Real Estate',
      description: 'Sign leases and purchase agreements remotely.',
    },
    {
      icon: '⚖️',
      title: 'Legal Agreements',
      description: 'Secure signatures on legal documents and NDAs.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose OneSign?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to sign, send, and manage documents securely
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card hover className="h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Perfect for Every Industry
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Trusted by businesses across all sectors
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card hover className="text-center h-full">
                  <CardContent className="pt-8">
                    <div className="text-5xl mb-4">{useCase.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQ />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Newsletter />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 50,000+ businesses that trust OneSign for their digital signature needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                Start Free Trial
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Contact Sales
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
