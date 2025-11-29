'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function SecurityPage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Security Center"
        subtitle="Comprehensive security documentation, certifications, and best practices. Your security is our priority."
        icon="🔒"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
