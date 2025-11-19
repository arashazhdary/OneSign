import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Webpack instead of Turbopack to avoid build issues
  webpack: (config) => {
    return config;
  },
};

export default withNextIntl(nextConfig);
