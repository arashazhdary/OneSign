import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: 'export' as const,
  images: {
    unoptimized: true,
  },

  // Disable features incompatible with static export
  trailingSlash: true,

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Turbopack configuration
  turbopack: {},

  webpack: (config: any) => {
    // Optimize bundle
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    return config;
  },
};

export default withNextIntl(nextConfig);
