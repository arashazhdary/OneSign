'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function CareersPage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Join Our Team"
        subtitle="We're building something amazing and we'd love to have you on board. Our careers page is launching soon!"
        icon="💼"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
