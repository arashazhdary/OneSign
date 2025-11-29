'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { FadeIn, SlideUp } from '@/app/components/animations';

export default function FeaturesPage() {
  const t = useTranslations('featuresPage');

  const features = [
    {
      categoryKey: 'securityCompliance',
      icon: '🔒',
      items: [
        { titleKey: 'bankLevelEncryption', descriptionKey: 'bankLevelEncryptionDesc' },
        { titleKey: 'legalCompliance', descriptionKey: 'legalComplianceDesc' },
        { titleKey: 'auditTrail', descriptionKey: 'auditTrailDesc' },
        { titleKey: 'soc2Certified', descriptionKey: 'soc2CertifiedDesc' },
      ],
    },
    {
      categoryKey: 'signingWorkflow',
      icon: '✍️',
      items: [
        { titleKey: 'multiSignature', descriptionKey: 'multiSignatureDesc' },
        { titleKey: 'customWorkflows', descriptionKey: 'customWorkflowsDesc' },
        { titleKey: 'inPersonSigning', descriptionKey: 'inPersonSigningDesc' },
        { titleKey: 'bulkSend', descriptionKey: 'bulkSendDesc' },
      ],
    },
    {
      categoryKey: 'documentManagement',
      icon: '📄',
      items: [
        { titleKey: 'templatesLibrary', descriptionKey: 'templatesLibraryDesc' },
        { titleKey: 'documentStorage', descriptionKey: 'documentStorageDesc' },
        { titleKey: 'versionControl', descriptionKey: 'versionControlDesc' },
        { titleKey: 'smartFields', descriptionKey: 'smartFieldsDesc' },
      ],
    },
    {
      categoryKey: 'integrationAPI',
      icon: '🔄',
      items: [
        { titleKey: 'restAPI', descriptionKey: 'restAPIDesc' },
        { titleKey: 'preBuiltConnectors', descriptionKey: 'preBuiltConnectorsDesc' },
        { titleKey: 'webhooks', descriptionKey: 'webhooksDesc' },
        { titleKey: 'zapierIntegration', descriptionKey: 'zapierIntegrationDesc' },
      ],
    },
    {
      categoryKey: 'mobileAccessibility',
      icon: '📱',
      items: [
        { titleKey: 'nativeMobileApps', descriptionKey: 'nativeMobileAppsDesc' },
        { titleKey: 'offlineMode', descriptionKey: 'offlineModeDesc' },
        { titleKey: 'biometricAuth', descriptionKey: 'biometricAuthDesc' },
        { titleKey: 'responsiveDesign', descriptionKey: 'responsiveDesignDesc' },
      ],
    },
    {
      categoryKey: 'teamCollaboration',
      icon: '👥',
      items: [
        { titleKey: 'teamManagement', descriptionKey: 'teamManagementDesc' },
        { titleKey: 'sharedTemplates', descriptionKey: 'sharedTemplatesDesc' },
        { titleKey: 'activityDashboard', descriptionKey: 'activityDashboardDesc' },
        { titleKey: 'customBranding', descriptionKey: 'customBrandingDesc' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features Sections */}
      {features.map((category, categoryIndex) => (
        <section
          key={category.categoryKey}
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
                  {t(`categories.${category.categoryKey}`)}
                </h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.items.map((feature, index) => (
                <SlideUp key={index} delay={index * 0.1}>
                  <Card hover className="h-full">
                    <CardHeader>
                      <CardTitle>{t(`features.${feature.titleKey}`)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t(`features.${feature.descriptionKey}`)}
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
              {t('cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('cta.subtitle')}
            </p>
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
              {t('cta.button')}
            </button>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
