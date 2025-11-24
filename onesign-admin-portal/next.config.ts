import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Webpack instead of Turbopack to avoid build issues
  webpack: (config) => {
    return config;
  },
  // Proxy API requests to backend
  async rewrites() {
    const apiUrl = process.env.API_BASE_URL || 'http://localhost:9091';
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
