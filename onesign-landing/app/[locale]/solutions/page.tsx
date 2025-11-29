'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FadeIn, SlideUp, ScaleIn } from '@/app/components/animations';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';

const industries = [
  { key: 'healthcare', icon: '🏥', color: 'from-emerald-500 to-teal-600' },
  { key: 'finance', icon: '🏦', color: 'from-blue-500 to-indigo-600' },
  { key: 'government', icon: '🏛️', color: 'from-purple-500 to-violet-600' },
  { key: 'education', icon: '🎓', color: 'from-orange-500 to-amber-600' },
  { key: 'retail', icon: '🛒', color: 'from-pink-500 to-rose-600' },
  { key: 'manufacturing', icon: '🏭', color: 'from-slate-500 to-gray-600' },
];

const integrations = [
  { key: 'enterprise', icon: '🏢' },
  { key: 'saas', icon: '☁️' },
  { key: 'mobile', icon: '📱' },
  { key: 'api', icon: '🔌' },
  { key: 'legacy', icon: '🔄' },
  { key: 'iot', icon: '🌐' },
];

const useCases = [
  { key: 'ciam', icon: '👤', color: 'blue' },
  { key: 'workforce', icon: '👥', color: 'green' },
  { key: 'b2b', icon: '🤝', color: 'purple' },
  { key: 'devops', icon: '⚙️', color: 'orange' },
  { key: 'ztna', icon: '🛡️', color: 'red' },
];

export default function SolutionsPage() {
  const t = useTranslations('solutionsPage');
  const [activeIndustry, setActiveIndustry] = useState('healthcare');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <span className="text-2xl">🔗</span>
              <span className="text-sm font-medium text-white">Enterprise Integration Platform</span>
            </div>
          </FadeIn>

          <SlideUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              {t('hero.title')}
            </h1>
          </SlideUp>

          <SlideUp delay={0.2}>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10">
              {t('hero.subtitle')}
            </p>
          </SlideUp>

          {/* Stats */}
          <SlideUp delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: '500+', label: t('stats.integrations') },
                { value: '15+', label: t('stats.industries') },
                { value: '99.99%', label: t('stats.uptime') },
                { value: '<15min', label: t('stats.support') },
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </SlideUp>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-white dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Solutions by Industry */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('byIndustry.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('byIndustry.subtitle')}
              </p>
            </div>
          </FadeIn>

          {/* Industry Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {industries.map((industry) => (
              <motion.button
                key={industry.key}
                onClick={() => setActiveIndustry(industry.key)}
                className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeIndustry === industry.key
                    ? 'bg-gradient-to-r ' + industry.color + ' text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: activeIndustry === industry.key ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{industry.icon}</span>
                <span>{t(`byIndustry.${industry.key}.title`)}</span>
              </motion.button>
            ))}
          </div>

          {/* Active Industry Card */}
          {industries.map((industry) => (
            activeIndustry === industry.key && (
              <motion.div
                key={industry.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${industry.color}`}></div>
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="text-5xl mb-4">{industry.icon}</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          {t(`byIndustry.${industry.key}.title`)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          {t(`byIndustry.${industry.key}.description`)}
                        </p>
                        <Button variant="primary">
                          Learn More
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {(t.raw(`byIndustry.${industry.key}.features`) as string[]).map((feature: string, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3"
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${industry.color}`}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </div>
      </section>

      {/* Integration Methods */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('byIntegration.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('byIntegration.subtitle')}
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <SlideUp key={integration.key} delay={index * 0.1}>
                <motion.div
                  className="group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card hover className="h-full relative overflow-hidden">
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300"></div>
                    <CardContent className="p-6 relative">
                      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        {integration.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t(`byIntegration.${integration.key}.title`)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t(`byIntegration.${integration.key}.description`)}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Explore</span>
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('byUseCase.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('byUseCase.subtitle')}
              </p>
            </div>
          </FadeIn>

          <div className="space-y-6">
            {useCases.map((useCase, index) => (
              <SlideUp key={useCase.key} delay={index * 0.1}>
                <motion.div
                  className="group"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card hover className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Icon Section */}
                        <div className={`w-full md:w-48 p-8 flex items-center justify-center bg-gradient-to-br ${
                          useCase.color === 'blue' ? 'from-blue-500 to-blue-600' :
                          useCase.color === 'green' ? 'from-green-500 to-green-600' :
                          useCase.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          useCase.color === 'orange' ? 'from-orange-500 to-orange-600' :
                          'from-red-500 to-red-600'
                        }`}>
                          <span className="text-6xl">{useCase.icon}</span>
                        </div>
                        {/* Content Section */}
                        <div className="flex-1 p-6 md:p-8">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t(`byUseCase.${useCase.key}.title`)}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {t(`byUseCase.${useCase.key}.description`)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(t.raw(`byUseCase.${useCase.key}.benefits`) as string[]).map((benefit: string, idx: number) => (
                              <span
                                key={idx}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  useCase.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  useCase.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  useCase.color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  useCase.color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                              >
                                {benefit}
                              </span>
                            ))}
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

      {/* Architecture Diagram Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                OneSign acts as the central hub for all your identity and access management needs
              </p>
            </div>
          </FadeIn>

          <ScaleIn>
            <div className="relative">
              {/* Central Hub */}
              <div className="flex justify-center mb-16">
                <motion.div
                  className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-center text-white">
                    <div className="text-3xl font-bold">OneSign</div>
                    <div className="text-sm opacity-80">IAM Hub</div>
                  </div>
                </motion.div>
              </div>

              {/* Connection Lines & Nodes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: '🏢', label: 'Enterprise Apps', sublabel: 'SAP, Oracle, MS365' },
                  { icon: '☁️', label: 'Cloud Services', sublabel: 'AWS, Azure, GCP' },
                  { icon: '📱', label: 'Mobile Apps', sublabel: 'iOS, Android' },
                  { icon: '🌐', label: 'Web Apps', sublabel: 'SPA, PWA' },
                  { icon: '🔒', label: 'Identity Providers', sublabel: 'AD, LDAP, Social' },
                  { icon: '🛡️', label: 'Security Tools', sublabel: 'SIEM, SOC' },
                  { icon: '⚙️', label: 'DevOps', sublabel: 'CI/CD, Secrets' },
                  { icon: '🤖', label: 'IoT Devices', sublabel: 'Sensors, Edge' },
                ].map((node, index) => (
                  <motion.div
                    key={index}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg text-center relative"
                    whileHover={{ y: -5, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Connection dot */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="text-4xl mb-3">{node.icon}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{node.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{node.sublabel}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {t('cta.button')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                {t('cta.demo')}
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
