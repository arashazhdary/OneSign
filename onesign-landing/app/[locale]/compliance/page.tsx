'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';

const complianceStandards = [
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    icon: '🇪🇺',
    region: 'Europe',
    color: 'from-blue-500 to-blue-600',
    features: [
      'Data subject rights management',
      'Consent management',
      'Data portability',
      'Right to erasure',
      'Privacy by design',
      'DPO support tools',
    ]
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    icon: '🏥',
    region: 'Healthcare',
    color: 'from-green-500 to-emerald-600',
    features: [
      'PHI protection',
      'Access controls',
      'Audit logging',
      'BAA available',
      'Encryption standards',
      'Breach notification',
    ]
  },
  {
    id: 'soc2',
    name: 'SOC 2',
    fullName: 'Service Organization Control 2',
    icon: '🛡️',
    region: 'Global',
    color: 'from-purple-500 to-violet-600',
    features: [
      'Security controls',
      'Availability',
      'Processing integrity',
      'Confidentiality',
      'Privacy',
      'Annual audits',
    ]
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    fullName: 'Information Security Management',
    icon: '📋',
    region: 'Global',
    color: 'from-orange-500 to-amber-600',
    features: [
      'ISMS framework',
      'Risk management',
      'Security policies',
      'Asset management',
      'Access control',
      'Continuous improvement',
    ]
  },
  {
    id: 'pci',
    name: 'PCI DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    icon: '💳',
    region: 'Financial',
    color: 'from-red-500 to-rose-600',
    features: [
      'Cardholder data protection',
      'Network security',
      'Vulnerability management',
      'Access control',
      'Monitoring & testing',
      'Security policies',
    ]
  },
  {
    id: 'ccpa',
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act',
    icon: '🌴',
    region: 'California',
    color: 'from-yellow-500 to-orange-600',
    features: [
      'Consumer rights',
      'Data disclosure',
      'Opt-out mechanisms',
      'Data deletion',
      'Non-discrimination',
      'Privacy notices',
    ]
  },
];

const complianceTools = [
  { icon: '📊', title: 'Compliance Dashboard', description: 'Real-time compliance status monitoring' },
  { icon: '📝', title: 'Audit Reports', description: 'Automated compliance report generation' },
  { icon: '🔔', title: 'Alert System', description: 'Proactive compliance notifications' },
  { icon: '📋', title: 'Policy Templates', description: 'Pre-built compliance policy templates' },
];

export default function CompliancePage() {
  const [activeStandard, setActiveStandard] = useState('gdpr');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">✅</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Compliance Hub
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
              Meet regulatory requirements effortlessly with OneSign's built-in compliance features
            </p>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div className="flex flex-wrap justify-center gap-3">
              {['GDPR', 'HIPAA', 'SOC 2', 'ISO 27001', 'PCI DSS'].map((badge) => (
                <span key={badge} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                  {badge} Ready
                </span>
              ))}
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Supported Compliance Standards
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Choose your industry and see how OneSign helps
              </p>
            </div>
          </FadeIn>

          {/* Standard Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {complianceStandards.map((standard) => (
              <motion.button
                key={standard.id}
                onClick={() => setActiveStandard(standard.id)}
                className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeStandard === standard.id
                    ? `bg-gradient-to-r ${standard.color} text-white shadow-lg`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{standard.icon}</span>
                <span>{standard.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Active Standard Details */}
          {complianceStandards.map((standard) => (
            activeStandard === standard.id && (
              <motion.div
                key={standard.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${standard.color}`}></div>
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl">{standard.icon}</span>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{standard.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{standard.fullName}</p>
                          </div>
                        </div>
                        <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {standard.region}
                        </span>
                        <p className="text-gray-600 dark:text-gray-300">
                          OneSign provides comprehensive tools and features to help you achieve and maintain {standard.name} compliance.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Key Features</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {standard.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </div>
      </section>

      {/* Compliance Tools */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Built-in Compliance Tools
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Everything you need to stay compliant
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceTools.map((tool, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <motion.div whileHover={{ y: -5 }}>
                  <Card hover className="h-full text-center">
                    <CardContent className="p-6">
                      <span className="text-4xl mb-4 block">{tool.icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Data Residency */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Global Data Residency
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Choose where your data is stored to meet local compliance requirements.
              </p>
              <div className="space-y-4">
                {[
                  { region: 'North America', locations: 'US East, US West, Canada' },
                  { region: 'Europe', locations: 'Germany, Ireland, UK' },
                  { region: 'Asia Pacific', locations: 'Singapore, Australia, Japan' },
                  { region: 'Middle East', locations: 'UAE, Saudi Arabia' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">{item.region}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.locations}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Request Compliance Package</h3>
              <p className="text-emerald-100 mb-6">
                Get detailed documentation for your compliance audits
              </p>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SOC 2 Type II Report
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Penetration Test Results
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Data Processing Agreement
                </li>
              </ul>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Request Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Simplify Compliance?</h2>
          <p className="text-emerald-100 mb-8">Start your compliance journey with OneSign</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Talk to Compliance Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
