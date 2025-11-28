'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ContactForm } from '@/app/components/ContactForm';
import { Card, CardContent } from '@/app/components/ui/Card';
import { FadeIn, SlideUp } from '@/app/components/animations';

export default function ContactPage() {
  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      description: 'Send us an email anytime',
      value: 'support@onesign.com',
      link: 'mailto:support@onesign.com',
    },
    {
      icon: '📞',
      title: 'Phone',
      description: 'Mon-Fri from 9am to 6pm',
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Available 24/7',
      value: 'Start a conversation',
      link: '#',
    },
    {
      icon: '📍',
      title: 'Office',
      description: 'Visit our headquarters',
      value: '123 Business St, San Francisco, CA 94105',
      link: 'https://maps.google.com',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Have a question or need help? We're here for you. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <a href={method.link} target={method.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                  <Card hover className="h-full text-center cursor-pointer">
                    <CardContent className="pt-8">
                      <div className="text-5xl mb-4">{method.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {method.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {method.description}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {method.value}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Send Us a Message
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Fill out the form below and we'll respond within 24 hours
              </p>
            </div>
          </FadeIn>
          <SlideUp delay={0.2}>
            <ContactForm />
          </SlideUp>
        </div>
      </section>

      {/* Map or Additional Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Visit Our Office
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  We'd love to meet you in person! Our headquarters is located in the heart of San Francisco. Stop by for a coffee and a demo.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🕐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Business Hours</h3>
                      <p className="text-gray-600 dark:text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600 dark:text-gray-300">Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🚇</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Getting Here</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Easily accessible by BART, MUNI, and major bus lines. Street parking available.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            <SlideUp delay={0.3}>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-gray-600 dark:text-gray-300">Map placeholder</p>
                </div>
              </div>
            </SlideUp>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
