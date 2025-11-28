# Changelog

All notable changes to the OneSign Landing Page project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-27

### Added
- Initial independent landing page project
- Next.js 16 with App Router
- Internationalization (i18n) support for English and Farsi
- Tailwind CSS v4 for styling
- Comprehensive landing page with multiple sections:
  - Hero section with call-to-action
  - Features showcase
  - Statistics display
  - Why choose section
  - Pricing tiers
  - Testimonials
  - How it works
  - Integrations showcase
  - Certifications and compliance
- Docker support:
  - Production Dockerfile with multi-stage build
  - Development Dockerfile
  - docker-compose configuration
- CI/CD pipeline with GitHub Actions
- Health check API endpoint (`/api/health`)
- PM2 ecosystem configuration
- Comprehensive documentation:
  - README.md
  - DEPLOYMENT.md
  - CONTRIBUTING.md
  - SECURITY.md
- Development tools:
  - Makefile for common tasks
  - EditorConfig
  - ESLint configuration
  - Environment variable templates
- Build optimizations:
  - Standalone output for Docker
  - Image optimization (AVIF, WebP)
  - Security headers
  - Bundle optimization
- Deployment configurations:
  - Vercel configuration
  - PM2 ecosystem
  - Docker Compose
- RTL support for Farsi language
- Responsive design for all screen sizes
- Static page generation for optimal performance

### Security
- Security headers configured (HSTS, X-Frame-Options, CSP, etc.)
- Non-root user in Docker container
- Environment variable support for sensitive data
- HTTPS/SSL ready configuration

### Documentation
- Complete README with getting started guide
- Deployment guide for multiple platforms
- Contributing guidelines
- Security policy
- Changelog

### Developer Experience
- Hot reload in development
- TypeScript support
- ESLint integration
- Multiple npm scripts for common tasks
- Docker development environment
- Health check endpoint for monitoring

## [Unreleased]

### Planned
- Analytics integration (Google Analytics, GTM)
- Performance monitoring
- A/B testing support
- SEO enhancements
- Sitemap generation
- RSS feed
- Blog section
- Contact form
- Newsletter subscription
- Live chat integration

---

## Version History

- **1.0.0** - Initial independent release
  - Extracted from onesign-admin-portal
  - Production-ready standalone application
  - Full Docker and deployment support
