'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { FadeIn, SlideUp } from '@/app/components/animations';

export default function ChangelogPage() {
  const versions = [
    {
      version: '2.1.0',
      date: 'November 29, 2024',
      changes: [
        'Added support for FIDO2 security keys',
        'Improved dashboard performance by 40%',
        'New dark mode theme',
        'Enhanced multi-language support',
        'Bug fixes and stability improvements'
      ]
    },
    {
      version: '2.0.0',
      date: 'October 15, 2024',
      changes: [
        'Major UI/UX redesign',
        'Introduced new pricing plans',
        'Added advanced MFA options',
        'Implemented SAML 2.0 support',
        'Performance optimizations'
      ]
    },
    {
      version: '1.5.2',
      date: 'September 1, 2024',
      changes: [
        'Fixed login timeout issues',
        'Improved SSO integration',
        'Updated security protocols',
        'Minor UI improvements'
      ]
    },
    {
      version: '1.5.0',
      date: 'August 10, 2024',
      changes: [
        'Added OIDC protocol support',
        'New user management dashboard',
        'Enhanced audit logging',
        'Improved API documentation'
      ]
    },
    {
      version: '1.0.0',
      date: 'June 1, 2024',
      changes: [
        'Initial public release',
        'Core IAM features',
        'Basic SSO functionality',
        'User authentication system'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Changelog
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Track all updates, improvements, and new features in OneSign
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Changelog List */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {versions.map((release, index) => (
              <SlideUp key={release.version} delay={index * 0.1}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">
                        Version {release.version}
                      </CardTitle>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {release.date}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {release.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            {change}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
