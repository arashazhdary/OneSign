import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OneSign - Enterprise IAM',
    short_name: 'OneSign',
    description: 'Comprehensive enterprise IAM platform with advanced authentication, access control, and security governance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/onesign-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
