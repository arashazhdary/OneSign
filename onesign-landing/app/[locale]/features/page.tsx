'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { FadeIn, SlideUp } from '@/app/components/animations';

export default function FeaturesPage() {
  const features = [
    {
      category: 'Security & Compliance',
      icon: '🔒',
      items: [
        {
          title: 'Bank-Level Encryption',
          description: 'AES-256 encryption ensures your documents are always protected in transit and at rest.',
        },
        {
          title: 'Legal Compliance',
          description: 'Compliant with eIDAS, ESIGN, UETA, and GDPR. Legally binding in 180+ countries.',
        },
        {
          title: 'Audit Trail',
          description: 'Complete document history with timestamp, IP address, and authentication details.',
        },
        {
          title: 'SOC 2 Type II Certified',
          description: 'Independently audited and certified for security, availability, and confidentiality.',
        },
      ],
    },
    {
      category: 'Signing & Workflow',
      icon: '✍️',
      items: [
        {
          title: 'Multi-Signature Support',
          description: 'Collect signatures from multiple parties in any order or simultaneously.',
        },
        {
          title: 'Custom Workflows',
          description: 'Create automated workflows with conditional routing and approval chains.',
        },
        {
          title: 'In-Person Signing',
          description: 'Use your device to collect signatures in person with full authentication.',
        },
        {
          title: 'Bulk Send',
          description: 'Send the same document to multiple recipients at once with personalized fields.',
        },
      ],
    },
    {
      category: 'Document Management',
      icon: '📄',
      items: [
        {
          title: 'Templates Library',
          description: 'Create reusable templates with pre-defined fields for faster document preparation.',
        },
        {
          title: 'Document Storage',
          description: 'Unlimited secure cloud storage with advanced search and organization capabilities.',
        },
        {
          title: 'Version Control',
          description: 'Track all document versions with the ability to revert to previous versions.',
        },
        {
          title: 'Smart Fields',
          description: 'Auto-fill recipient information and create conditional fields based on responses.',
        },
      ],
    },
    {
      category: 'Integration & API',
      icon: '🔄',
      items: [
        {
          title: 'REST API',
          description: 'Full-featured API with comprehensive documentation for custom integrations.',
        },
        {
          title: 'Pre-Built Connectors',
          description: 'Connect with Salesforce, Google Drive, Dropbox, Microsoft 365, and more.',
        },
        {
          title: 'Webhooks',
          description: 'Real-time notifications for document events to keep your systems in sync.',
        },
        {
          title: 'Zapier Integration',
          description: 'Connect with 3,000+ apps without writing any code.',
        },
      ],
    },
    {
      category: 'Mobile & Accessibility',
      icon: '📱',
      items: [
        {
          title: 'Native Mobile Apps',
          description: 'Full-featured iOS and Android apps for signing on the go.',
        },
        {
          title: 'Offline Mode',
          description: 'Download documents and sign offline, then sync when connected.',
        },
        {
          title: 'Biometric Authentication',
          description: 'Use Face ID, Touch ID, or fingerprint for secure mobile access.',
        },
        {
          title: 'Responsive Design',
          description: 'Optimized experience across all devices and screen sizes.',
        },
      ],
    },
    {
      category: 'Team & Collaboration',
      icon: '👥',
      items: [
        {
          title: 'Team Management',
          description: 'Organize users into teams with role-based access control.',
        },
        {
          title: 'Shared Templates',
          description: 'Share templates and documents across your organization.',
        },
        {
          title: 'Activity Dashboard',
          description: 'Monitor team activity and document status in real-time.',
        },
        {
          title: 'Custom Branding',
          description: 'Add your logo and brand colors to emails and signing pages.',
        },
      ],
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
              Powerful Features for Modern Teams
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to sign, send, and manage documents securely. Built for businesses of all sizes.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features Sections */}
      {features.map((category, categoryIndex) => (
        <section
          key={category.category}
          className={`py-20 ${
            categoryIndex % 2 === 0
              ? 'bg-white dark:bg-gray-900'
              : 'bg-gray-50 dark:bg-gray-800'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {category.category}
                </h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.items.map((feature, index) => (
                <SlideUp key={index} delay={index * 0.1}>
                  <Card hover className="h-full">
                    <CardHeader>
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
      ))}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your free 14-day trial today. No credit card required.
            </p>
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
              Start Free Trial
            </button>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
