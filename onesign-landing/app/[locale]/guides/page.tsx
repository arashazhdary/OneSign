'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function GuidesPage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Step-by-Step Guides"
        subtitle="Easy-to-follow tutorials and best practices to help you master OneSign. Perfect for beginners and experts alike."
        icon="🎓"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
