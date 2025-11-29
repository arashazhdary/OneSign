'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function CompliancePage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Compliance Hub"
        subtitle="GDPR, SOC2, HIPAA, and more. Discover how OneSign helps you meet regulatory requirements effortlessly."
        icon="✅"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
