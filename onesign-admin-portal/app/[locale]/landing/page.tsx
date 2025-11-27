'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Icons as SVG components
const Icons = {
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Key: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Fingerprint: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  ),
  UserCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 11l2 2 4-4" />
    </svg>
  ),
  ChartBar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  ClipboardCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Cog: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Code: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Server: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Cloud: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  DocumentCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Puzzle: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Play: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

// Logo component that matches the provided image
const Logo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="5" y="35" fontFamily="Inter, system-ui, sans-serif" fontSize="36" fontWeight="700" fill="#1e293b">1</text>
    <circle cx="55" cy="22" r="16" stroke="#1e293b" strokeWidth="4" fill="none"/>
    <path d="M45 22L52 29L65 14" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <text x="80" y="35" fontFamily="Inter, system-ui, sans-serif" fontSize="18" fontWeight="600" letterSpacing="0.05em" fill="#1e293b">ONESIGN</text>
  </svg>
);

export default function LandingPage() {
  const t = useTranslations('landing');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === 'fa';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'fa' : 'en';
    router.push(`/${newLocale}/landing`);
  };

  const features = [
    { key: 'identity', icon: Icons.Users },
    { key: 'sso', icon: Icons.Key },
    { key: 'mfa', icon: Icons.Fingerprint },
    { key: 'rbac', icon: Icons.Lock },
    { key: 'pam', icon: Icons.Shield },
    { key: 'governance', icon: Icons.UserCheck },
    { key: 'adaptive', icon: Icons.ChartBar },
    { key: 'audit', icon: Icons.ClipboardCheck },
    { key: 'federation', icon: Icons.Globe },
    { key: 'automation', icon: Icons.Cog },
    { key: 'api', icon: Icons.Code },
    { key: 'copilot', icon: Icons.Sparkles },
  ];

  const whyFeatures = [
    { key: 'multiTenant', icon: Icons.Building },
    { key: 'multiRegion', icon: Icons.Server },
    { key: 'zeroTrust', icon: Icons.ShieldCheck },
    { key: 'cloudNative', icon: Icons.Cloud },
    { key: 'compliance', icon: Icons.DocumentCheck },
    { key: 'integration', icon: Icons.Puzzle },
  ];

  const stats = [
    { value: '500K+', key: 'users' },
    { value: '1,000+', key: 'apps' },
    { value: '10M+', key: 'authentications' },
    { value: '99.99%', key: 'uptime' },
  ];

  const testimonials = [
    { key: 'testimonial1', company: 'TechCorp', role: 'CISO' },
    { key: 'testimonial2', company: 'FinanceHub', role: 'IT Director' },
    { key: 'testimonial3', company: 'HealthPlus', role: 'Security Lead' },
  ];

  const trustedCompanies = [
    'Microsoft', 'Google', 'Amazon', 'IBM', 'Oracle', 'SAP'
  ];

  const faqs = [
    { key: 'faq1' },
    { key: 'faq2' },
    { key: 'faq3' },
    { key: 'faq4' },
    { key: 'faq5' },
  ];

  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const howItWorksSteps = [
    { key: 'step1', number: '01' },
    { key: 'step2', number: '02' },
    { key: 'step3', number: '03' },
    { key: 'step4', number: '04' },
  ];

  const integrations = [
    { name: 'Microsoft 365', category: 'productivity' },
    { name: 'Google Workspace', category: 'productivity' },
    { name: 'Salesforce', category: 'crm' },
    { name: 'AWS', category: 'cloud' },
    { name: 'Azure', category: 'cloud' },
    { name: 'Slack', category: 'collaboration' },
    { name: 'Jira', category: 'devops' },
    { name: 'GitHub', category: 'devops' },
  ];

  const certifications = [
    { key: 'soc2', name: 'SOC 2 Type II' },
    { key: 'iso27001', name: 'ISO 27001' },
    { key: 'gdpr', name: 'GDPR' },
    { key: 'hipaa', name: 'HIPAA' },
  ];

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href={`/${locale}/landing`} className="flex items-center">
              <Logo className="h-8 lg:h-10 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a
                href="#features"
                onClick={(e) => handleSmoothScroll(e, 'features')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium cursor-pointer"
              >
                {t('nav.features')}
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium cursor-pointer"
              >
                {t('nav.howItWorks')}
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium cursor-pointer"
              >
                {t('nav.pricing')}
              </a>
              <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                {t('nav.docs')}
              </Link>
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={toggleLocale}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors border border-gray-200 rounded-lg hover:border-blue-200"
              >
                {locale === 'en' ? 'فارسی' : 'English'}
              </button>
              <Link
                href={`/${locale}/login`}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {t('nav.login')}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                {t('nav.getStarted')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                onClick={(e) => handleSmoothScroll(e, 'features')}
                className="block text-gray-600 hover:text-blue-600 font-medium py-2 cursor-pointer"
              >
                {t('nav.features')}
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="block text-gray-600 hover:text-blue-600 font-medium py-2 cursor-pointer"
              >
                {t('nav.howItWorks')}
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="block text-gray-600 hover:text-blue-600 font-medium py-2 cursor-pointer"
              >
                {t('nav.pricing')}
              </a>
              <Link href="#" className="block text-gray-600 hover:text-blue-600 font-medium py-2">
                {t('nav.docs')}
              </Link>
              <hr className="border-gray-100" />
              <button
                onClick={toggleLocale}
                className="w-full text-left text-gray-600 hover:text-blue-600 font-medium py-2"
              >
                {locale === 'en' ? 'فارسی' : 'English'}
              </button>
              <Link
                href={`/${locale}/login`}
                className="block text-gray-600 hover:text-blue-600 font-medium py-2"
              >
                {t('nav.login')}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="block w-full text-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl"
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-100/50 to-transparent rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 animate-fadeIn">
              <Icons.Shield />
              {t('hero.badge')}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href={`/${locale}/login`}
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {t('hero.cta')}
                <Icons.ArrowRight />
              </Link>
              <button
                onClick={() => setShowVideoModal(true)}
                className="group w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icons.Play />
                </div>
                {t('hero.secondaryCta')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-8 border-t border-gray-200">
              {stats.map((stat) => (
                <div key={stat.key} className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t(`stats.${stat.key}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8">
            {t('trustedBy.title')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {trustedCompanies.map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('preview.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('preview.subtitle')}
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl transform rotate-1 scale-[1.02] opacity-20 blur-xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 border border-gray-200">
                    app.onesign.io/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard Content */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: t('preview.metrics.users'), value: '12,543', change: '+12%', color: 'blue' },
                    { label: t('preview.metrics.logins'), value: '45,231', change: '+8%', color: 'green' },
                    { label: t('preview.metrics.threats'), value: '3', change: '-25%', color: 'red' },
                    { label: t('preview.metrics.uptime'), value: '99.99%', change: '', color: 'indigo' },
                  ].map((metric, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      {metric.change && (
                        <div className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-48">
                    <div className="text-sm font-medium text-gray-700 mb-4">{t('preview.chart.title')}</div>
                    <div className="flex items-end gap-2 h-32">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 70, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-4">{t('preview.activity.title')}</div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200" />
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded w-3/4" />
                            <div className="h-2 bg-gray-100 rounded w-1/2 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('features.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.key}
                  className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={step.key} className="relative">
                {/* Connector Line */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300" />
                )}
                <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(`howItWorks.${step.key}.title`)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t(`howItWorks.${step.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t('why.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('why.subtitle')}
              </p>

              <div className="grid gap-6">
                {whyFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.key} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Icon />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {t(`why.${feature.key}.title`)}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {t(`why.${feature.key}.description`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center">
                  <Logo className="h-16 w-auto mb-4" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">99.99%</div>
                    <div className="text-gray-500">{t('stats.uptime')}</div>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                <Icons.ShieldCheck />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.Lock />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.key} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                {/* Quote Icon */}
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                {/* Quote */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{t(`testimonials.${testimonial.key}.quote`)}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {t(`testimonials.${testimonial.key}.name`).charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {t(`testimonials.${testimonial.key}.name`)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('integrations.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('integrations.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="group bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all border border-transparent hover:border-blue-200"
              >
                <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                    {integration.name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-gray-700 text-center">{integration.name}</span>
                <span className="text-xs text-gray-400 mt-1 capitalize">{integration.category}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">{t('integrations.more')}</p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('integrations.viewAll')}
              <Icons.ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.key} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === faq.key ? null : faq.key)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {t(`faq.${faq.key}.question`)}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === faq.key ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === faq.key && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {t(`faq.${faq.key}.answer`)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              {t('faq.moreQuestions')}
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('faq.contactSupport')}
              <Icons.ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('pricing.subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('pricing.yearly')}
                <span className="ml-2 text-xs text-green-600 font-semibold">
                  {t('pricing.save')}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('pricing.free.name')}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('pricing.free.description')}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500">/{t('pricing.perUser')}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {(t.raw('pricing.free.features') as string[]).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Icons.Check />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/login`}
                className="block w-full text-center py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-200 hover:text-blue-600 transition-colors"
              >
                {t('pricing.cta')}
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative shadow-xl shadow-blue-500/25 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">
                  {t('pricing.pro.name')}
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  {t('pricing.pro.description')}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    ${billingPeriod === 'yearly' ? '6' : '8'}
                  </span>
                  <span className="text-blue-200">/{t('pricing.perUser')}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {(t.raw('pricing.pro.features') as string[]).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-blue-100">
                    <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
                      <Icons.Check />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/login`}
                className="block w-full text-center py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                {t('pricing.cta')}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('pricing.enterprise.name')}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('pricing.enterprise.description')}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{t('pricing.enterprise.price')}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {(t.raw('pricing.enterprise.features') as string[]).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Icons.Check />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="block w-full text-center py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-200 hover:text-blue-600 transition-colors">
                {t('pricing.contact')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Certifications Section */}
      <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t('certifications.title')}
            </h2>
            <p className="text-gray-600">
              {t('certifications.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {certifications.map((cert) => (
              <div key={cert.key} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center mb-3 hover:shadow-lg transition-shadow">
                  <Icons.ShieldCheck />
                </div>
                <span className="font-semibold text-gray-900">{cert.name}</span>
                <span className="text-xs text-gray-500">{t(`certifications.${cert.key}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/login`}
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {t('cta.button')}
              <Icons.ArrowRight />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              {t('cta.demo')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 lg:col-span-1">
              <div className="mb-4">
                <Logo className="h-8 w-auto brightness-0 invert" />
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {t('footer.description')}
              </p>

              {/* Newsletter Form */}
              <div className="mb-6">
                <p className="text-white text-sm font-medium mb-3">
                  {t('footer.newsletter')}
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.emailPlaceholder')}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('footer.subscribe')}
                  </button>
                </form>
                {subscribed && (
                  <p className="mt-2 text-sm text-green-400">
                    {t('footer.subscribed')}
                  </p>
                )}
              </div>

              <button
                onClick={toggleLocale}
                className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                {locale === 'en' ? 'فارسی' : 'English'}
              </button>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.product')}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">{t('footer.features')}</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">{t('footer.pricing')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.integrations')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.changelog')}</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.blog')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.careers')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.resources')}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.documentation')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.apiReference')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.guides')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.community')}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.security')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('footer.compliance')}</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} OneSign. {t('footer.copyright')}</p>
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Video Demo Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {t('videoModal.title')}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              >
                <Icons.X />
              </button>
            </div>

            {/* Video Container */}
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                    <Icons.Play />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  {t('videoModal.placeholder')}
                </h4>
                <p className="text-gray-400">
                  {t('videoModal.description')}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {t('videoModal.close')}
              </button>
              <Link
                href={`/${locale}/login`}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('videoModal.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations Style */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
