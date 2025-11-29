'use client';

import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ComingSoon } from '@/app/components/ComingSoon';

export default function SolutionsPage() {
  return (
    <>
      <Header />
      <ComingSoon
        title="Enterprise Solutions"
        subtitle="Discover tailored solutions for your industry. We're crafting comprehensive solutions to meet your business needs."
        icon="💡"
        estimatedDate="March 2026"
      />
      <Footer />
    </>
  );
}
