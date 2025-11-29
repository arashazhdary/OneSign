'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function DocsPage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Documentation Hub"
        subtitle="Comprehensive guides, API references, and tutorials are on their way. Learn everything about OneSign."
        icon="📚"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
