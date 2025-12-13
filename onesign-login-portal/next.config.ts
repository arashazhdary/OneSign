import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Webpack instead of Turbopack to avoid build issues
  webpack: (config: any) => {
    return config;
  },
  // Image optimization configuration
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'] as const,
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      // Add your custom CDN domain here if needed
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn-domain.com',
      // },
    ],
    // Minimum cache time for optimized images (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    // Dangerously allow SVG images (be careful with untrusted sources)
    dangerouslyAllowSVG: false,
    // Content security policy for SVG images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
