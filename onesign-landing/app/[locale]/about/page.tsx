'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Card, CardContent } from '@/app/components/ui/Card';
import { FadeIn, SlideUp } from '@/app/components/animations';

export default function AboutPage() {
  const t = useTranslations('aboutPage');
  const team = [
    {
      key: 'arash',
      avatar: '👨‍💼',
    },
    {
      key: 'hassan',
      avatar: '👨‍💻',
    },
    {
      key: 'fereshte',
      avatar: '👩‍💼',
    },
  ];

  const values = [
    {
      key: 'customerFirst',
      icon: '🎯',
    },
    {
      key: 'securityAlways',
      icon: '🔒',
    },
    {
      key: 'innovation',
      icon: '💡',
    },
    {
      key: 'integrity',
      icon: '🤝',
    },
  ];

  const milestones = [
    { key: 'milestone2018' },
    { key: 'milestone2019' },
    { key: 'milestone2020' },
    { key: 'milestone2021' },
    { key: 'milestone2022' },
    { key: 'milestone2023' },
    { key: 'milestone2024' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-white max-w-3xl mx-auto">
                {t('hero.subtitle')}
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
                {t('story.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('story.paragraph1')}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('story.paragraph2')}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {t('story.paragraph3')}
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
                {t('values.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('values.subtitle')}
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
                      {t(`values.items.${value.key}.title`)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t(`values.items.${value.key}.description`)}
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
                {t('team.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('team.subtitle')}
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto justify-items-center">
            {team.map((member, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <Card hover className="text-center h-full flex flex-col">
                  <CardContent className="pt-8 flex flex-col flex-1">
                    <div className="text-6xl mb-4">{member.avatar}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {t(`team.members.${member.key}.name`)}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {t(`team.members.${member.key}.role`)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                      {t(`team.members.${member.key}.bio`)}
                    </p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones - Hidden for now */}
      {/* <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('journey.title')}
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <SlideUp key={index} delay={index * 0.05}>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {t(`journey.milestones.${milestone.key}.year`)}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {t(`journey.milestones.${milestone.key}.event`)}
                      </p>
                    </div>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section> */}

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
