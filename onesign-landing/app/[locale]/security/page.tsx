'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { motion } from 'framer-motion';

const certifications = [
  { name: 'SOC 2 Type II', icon: '🛡️', status: 'Certified', description: 'Annual audit for security, availability, and confidentiality' },
  { name: 'ISO 27001', icon: '📋', status: 'Certified', description: 'Information security management system certification' },
  { name: 'GDPR', icon: '🇪🇺', status: 'Compliant', description: 'European data protection regulation compliance' },
  { name: 'HIPAA', icon: '🏥', status: 'Compliant', description: 'Healthcare data protection standards' },
  { name: 'PCI DSS', icon: '💳', status: 'Certified', description: 'Payment card industry data security' },
  { name: 'FedRAMP', icon: '🏛️', status: 'In Progress', description: 'US federal security authorization' },
];

const securityFeatures = [
  {
    title: 'Encryption at Rest',
    description: 'AES-256 encryption for all stored data',
    icon: '🔐',
    details: ['Database encryption', 'File storage encryption', 'Key management'],
  },
  {
    title: 'Encryption in Transit',
    description: 'TLS 1.3 for all network communications',
    icon: '🔒',
    details: ['HTTPS everywhere', 'Certificate pinning', 'Perfect forward secrecy'],
  },
  {
    title: 'Access Control',
    description: 'Role-based and attribute-based access control',
    icon: '👥',
    details: ['RBAC/ABAC', 'Least privilege', 'Just-in-time access'],
  },
  {
    title: 'Audit Logging',
    description: 'Comprehensive logging of all security events',
    icon: '📊',
    details: ['Immutable logs', 'Real-time alerts', 'SIEM integration'],
  },
  {
    title: 'Vulnerability Management',
    description: 'Continuous security testing and patching',
    icon: '🔍',
    details: ['Penetration testing', 'Bug bounty program', 'Automated scanning'],
  },
  {
    title: 'Incident Response',
    description: '24/7 security operations center',
    icon: '🚨',
    details: ['SOC monitoring', 'Incident playbooks', 'Breach notification'],
  },
];

const securityPractices = [
  { title: 'Zero Trust Architecture', description: 'Never trust, always verify' },
  { title: 'Defense in Depth', description: 'Multiple layers of security controls' },
  { title: 'Secure Development', description: 'Security integrated into SDLC' },
  { title: 'Employee Training', description: 'Regular security awareness training' },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Shield Animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <motion.div
            className="w-96 h-96 border-4 border-blue-500 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">🛡️</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Security Center
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Enterprise-grade security built into every layer of OneSign
            </p>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                SOC 2 Type II Certified
              </div>
              <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
                ISO 27001 Certified
              </div>
              <div className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium">
                99.99% Uptime SLA
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Certifications & Compliance
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Meeting the highest industry standards
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{cert.icon}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        cert.status === 'Certified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        cert.status === 'Compliant' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {cert.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cert.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{cert.description}</p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Security Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Comprehensive protection for your data
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <motion.div whileHover={{ y: -5 }}>
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <span className="text-4xl mb-4 block">{feature.icon}</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Security Philosophy
              </h2>
              <div className="space-y-6">
                {securityPractices.map((practice, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{practice.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{practice.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Bug Bounty Program</h3>
              <p className="text-blue-100 mb-6">
                Help us find vulnerabilities and earn rewards. We value the security research community.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">$</span> Up to $10,000 per vulnerability
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Responsible disclosure policy
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Safe harbor for researchers
                </li>
              </ul>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Center */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <span className="text-5xl mb-6 block">📄</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Security Documentation
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Access our security whitepapers, penetration test reports, and compliance documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">Download Security Whitepaper</Button>
              <Button variant="outline" size="lg">Request Compliance Docs</Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Questions About Security?</h2>
          <p className="text-gray-300 mb-8">Our security team is here to help</p>
          <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700">
            Contact Security Team
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
