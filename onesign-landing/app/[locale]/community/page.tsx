'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function CommunityPage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Join the Community"
        subtitle="Connect with developers, share ideas, and get help from our vibrant community. Forums, events, and more!"
        icon="👥"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
