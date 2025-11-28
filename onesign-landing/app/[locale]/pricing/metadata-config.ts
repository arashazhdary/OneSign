import { Metadata } from 'next';

export function generatePricingMetadata(locale: string): Metadata {
  const isEnglish = locale === 'en';

  return {
    title: isEnglish
      ? 'Pricing - OneSign | Simple, Transparent Plans'
      : 'قیمت‌گذاری - OneSign | پلن‌های ساده و شفاف',
    description: isEnglish
      ? 'Choose the perfect plan for your needs. From free to enterprise, OneSign offers flexible pricing for businesses of all sizes. 14-day free trial included.'
      : 'پلن مناسب برای نیازهای خود را انتخاب کنید. از رایگان تا سازمانی، OneSign قیمت‌گذاری انعطاف‌پذیر برای کسب‌وکارهای هر اندازه ارائه می‌دهد.',
    keywords: ['pricing', 'plans', 'e-signature pricing', 'digital signature cost', 'OneSign pricing'],
    openGraph: {
      title: isEnglish ? 'OneSign Pricing - Simple & Transparent' : 'قیمت‌گذاری OneSign',
      description: isEnglish
        ? 'Flexible pricing plans starting from free. 14-day trial, no credit card required.'
        : 'پلن‌های قیمت‌گذاری انعطاف‌پذیر از رایگان. 14 روز آزمایش، بدون نیاز به کارت اعتباری.',
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'fa_IR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'OneSign Pricing',
      description: 'Simple, transparent pricing for everyone',
    },
  };
}
