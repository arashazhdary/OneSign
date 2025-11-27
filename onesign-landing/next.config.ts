import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    return config;
  },
};

export default withNextIntl(nextConfig);
