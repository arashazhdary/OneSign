'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function IntegrationsPage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Seamless Integrations"
        subtitle="Connect OneSign with your favorite tools and platforms. 100+ integrations coming your way!"
        icon="🔌"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
