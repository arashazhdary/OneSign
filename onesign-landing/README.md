# OneSign Landing Page

> 🚀 Standalone landing page for OneSign - an enterprise Identity & Access Management platform.

[![CI/CD](https://github.com/DevFrogPlatform/OneSign/workflows/CI/badge.svg)](https://github.com/DevFrogPlatform/OneSign/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## ✨ Features

### Core Features
- 🌐 **Internationalization**: Full support for English and Farsi (RTL)
- ⚡ **Performance**: Static generation, optimized images, Core Web Vitals monitoring
- 🎨 **Modern Design**: Built with Tailwind CSS v4 and Framer Motion animations
- 📱 **Responsive**: Mobile-first design, works perfectly on all devices
- 🔒 **Security**: Security headers, HTTPS ready, non-root containers
- 🌓 **Dark Mode**: Persistent theme switching with smooth transitions

### Advanced Features
- 📊 **Analytics & Monitoring**:
  - Google Analytics (GA4) integration
  - Google Tag Manager (GTM) support
  - Sentry error tracking and monitoring
  - Real-time Core Web Vitals dashboard
  - Performance metrics tracking

- 📝 **Content Management**:
  - Blog system with categories and tags
  - Dynamic blog post pages with SEO optimization
  - Related articles suggestions
  - Reading time estimates
  - Social sharing

- 🔍 **Search & Discovery**:
  - Global search across pages, blog posts, and features
  - Keyboard shortcuts (Cmd/Ctrl + K)
  - Fuzzy search with Fuse.js
  - Search result categorization
  - Real-time search results

- 💬 **User Engagement**:
  - Live chat integration
  - Newsletter subscription
  - Testimonial submission system
  - Contact form with validation
  - Cookie consent management

- 💰 **Internationalization**:
  - Multi-currency support (8 currencies)
  - Real-time currency conversion
  - Locale-aware formatting
  - RTL support for Persian/Arabic

- 📱 **Progressive Web App**:
  - Offline support
  - App manifest
  - Service worker
  - Push notifications ready
  - Install prompts

### Developer Experience
- 🔧 **Development Tools**: TypeScript 5.x, ESLint, hot reload
- 🐳 **Docker Ready**: Multi-stage builds for production deployment
- 🚀 **CI/CD**: GitHub Actions workflow with automated testing
- 📖 **Documentation**: Comprehensive guides for deployment and contribution
- 🧪 **Testing**: Playwright E2E tests, Jest unit tests ready

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Clone the repository
git clone https://github.com/DevFrogPlatform/OneSign.git
cd OneSign/onesign-landing

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Available Routes

#### Main Pages
- **Landing**: `/en/landing`, `/fa/landing`
- **Features**: `/en/features`, `/fa/features`
- **Pricing**: `/en/pricing`, `/fa/pricing`
- **About**: `/en/about`, `/fa/about`
- **Contact**: `/en/contact`, `/fa/contact`

#### Content & Blog
- **Blog**: `/en/blog`, `/fa/blog`
- **Blog Post**: `/en/blog/[slug]`, `/fa/blog/[slug]`

#### Dashboard & Monitoring
- **Performance Dashboard**: `/en/dashboard/performance`, `/fa/dashboard/performance`

#### Legal Pages
- **Terms of Service**: `/en/terms`, `/fa/terms`
- **Privacy Policy**: `/en/privacy`, `/fa/privacy`

#### API Endpoints
- **Health Check**: `/api/health`
- **Contact Form**: `/api/contact`
- **Newsletter**: `/api/newsletter`
- **Web Vitals**: `/api/analytics/vitals`
- **Testimonials**: `/api/testimonials/submit`

## 📦 Scripts

### Development

```bash
npm run dev          # Start development server (port 3001)
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run clean        # Clean build artifacts
npm run test         # Run Jest unit tests
npm run test:e2e     # Run Playwright E2E tests
```

### Production

```bash
npm run build        # Build for production (static generation)
npm start            # Start production server
npm run health       # Check health endpoint
```

### Testing

```bash
npm run test               # Run unit tests with Jest
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:e2e           # Run E2E tests with Playwright
npm run test:e2e:ui        # Run E2E tests with UI
```

### Docker

```bash
npm run docker:build # Build Docker image
npm run docker:run   # Run production container
npm run docker:stop  # Stop and remove container
npm run docker:dev   # Development with Docker Compose
npm run docker:prod  # Production with Docker Compose
```

### PM2

```bash
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop PM2 process
npm run pm2:restart  # Restart PM2 process
npm run pm2:logs     # View PM2 logs
```

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Development
docker-compose up landing-dev

# Production
docker-compose up -d landing
```

### Manual Docker Commands

```bash
# Build image
docker build -t onesign-landing:latest .

# Run container
docker run -d \
  -p 3001:3001 \
  --name onesign-landing \
  -e NEXT_PUBLIC_APP_URL=https://yourdomain.com \
  onesign-landing:latest

# Check health
curl http://localhost:3001/api/health

# View logs
docker logs -f onesign-landing
```

## 🛠️ Using Makefile

```bash
make help           # Show available commands
make install        # Install dependencies
make dev           # Start development
make build         # Build for production
make docker-build  # Build Docker image
make docker-run    # Run Docker container
make health        # Check health endpoint
```

## 📁 Project Structure

```
onesign-landing/
├── app/
│   ├── [locale]/                     # Internationalized routes
│   │   ├── landing/                  # Main landing page
│   │   ├── features/                 # Features page
│   │   ├── pricing/                  # Pricing page
│   │   ├── about/                    # About page
│   │   ├── contact/                  # Contact page
│   │   ├── blog/                     # Blog listing
│   │   │   └── [slug]/              # Individual blog posts
│   │   ├── dashboard/
│   │   │   └── performance/         # Performance monitoring dashboard
│   │   ├── terms/                    # Terms of Service
│   │   ├── privacy/                  # Privacy Policy
│   │   ├── layout.tsx               # Locale-specific layout
│   │   └── page.tsx                 # Root redirect
│   ├── api/
│   │   ├── health/                  # Health check endpoint
│   │   ├── contact/                 # Contact form API
│   │   ├── newsletter/              # Newsletter subscription
│   │   ├── analytics/
│   │   │   └── vitals/             # Web Vitals tracking
│   │   └── testimonials/
│   │       └── submit/             # Testimonial submission
│   ├── components/                  # React components
│   │   ├── ThemeProvider.tsx       # Dark mode provider
│   │   ├── GoogleAnalytics.tsx     # GA4 integration
│   │   ├── WebVitals.tsx           # Performance monitoring
│   │   ├── LiveChat.tsx            # Live chat widget
│   │   ├── CookieConsent.tsx       # Cookie consent banner
│   │   ├── BackToTop.tsx           # Back to top button
│   │   ├── ProgressBar.tsx         # Page load progress
│   │   ├── Toast.tsx               # Toast notifications
│   │   ├── ErrorBoundary.tsx       # Error handling
│   │   ├── SearchModal.tsx         # Global search
│   │   ├── CurrencySelector.tsx    # Multi-currency selector
│   │   └── ...                     # Many more components
│   ├── lib/                        # Utility libraries
│   │   ├── analytics.ts           # Analytics utilities
│   │   ├── sentry.ts              # Sentry error tracking
│   │   ├── features.ts            # Feature flags
│   │   ├── logger.ts              # Logging utilities
│   │   ├── seo.ts                 # SEO utilities
│   │   ├── pwa.ts                 # PWA utilities
│   │   └── ...                    # More utilities
│   ├── hooks/                      # Custom React hooks
│   │   ├── useLocalStorage.ts     # Local storage hook
│   │   ├── useMediaQuery.ts       # Media query hook
│   │   ├── useLazyLoad.ts         # Lazy loading hook
│   │   └── ...                    # More hooks
│   ├── styles/                     # Styling
│   │   └── globals.css            # Global styles
│   ├── types/                      # TypeScript types
│   │   └── index.ts               # Type definitions
│   ├── layout.tsx                  # Root layout
│   ├── error.tsx                   # Error page
│   ├── not-found.tsx              # 404 page
│   ├── sitemap.ts                  # Dynamic sitemap
│   ├── robots.ts                   # Robots.txt
│   └── manifest.ts                 # PWA manifest
├── messages/                       # i18n translations
│   ├── en.json                    # English (450+ keys)
│   └── fa.json                    # Farsi/Persian (450+ keys)
├── public/                         # Static assets
│   ├── logo.svg
│   ├── onesign-logo.svg
│   └── ...
├── tests/                          # Test files
│   ├── e2e/                       # Playwright E2E tests
│   └── unit/                      # Jest unit tests
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD pipeline
├── Dockerfile                      # Production Docker image
├── Dockerfile.dev                  # Development Docker image
├── docker-compose.yml              # Docker Compose config
├── ecosystem.config.js             # PM2 configuration
├── Makefile                        # Build automation
├── i18n.ts                         # i18n configuration
├── proxy.ts                        # i18n middleware
├── next.config.js                  # Next.js config with next-intl plugin
├── tailwind.config.ts              # Tailwind CSS v4 config
├── playwright.config.ts            # Playwright configuration
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Jest setup
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── .env.example                    # Environment variables template
├── .env.production.example         # Production env template
├── vercel.json                     # Vercel deployment
├── README.md                       # This file
├── DEPLOYMENT.md                   # Deployment guide
├── CONTRIBUTING.md                 # Contribution guide
├── SECURITY.md                     # Security policy
├── CHANGELOG.md                    # Version history
└── LICENSE                         # MIT License
```

## 🌐 Internationalization (i18n)

### Supported Languages

- 🇺🇸 English (`en`)
- 🇮🇷 Farsi/Persian (`fa`) - with RTL support

### Adding Translations

1. Add keys to translation files:
   ```json
   // messages/en.json
   {
     "landing": {
       "newSection": {
         "title": "New Section",
         "description": "Description here"
       }
     }
   }
   ```

2. Use in components:
   ```tsx
   const t = useTranslations('landing');
   return <h1>{t('newSection.title')}</h1>;
   ```

### Adding New Locales

See [CONTRIBUTING.md](./CONTRIBUTING.md#adding-new-locales) for details.

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env.local` and configure as needed:

```bash
cp .env.example .env.local
```

**Key Configuration Categories:**

**Application Settings**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=OneSign Landing
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

**Analytics & Monitoring**
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_TRACKING_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxx
NEXT_PUBLIC_SENTRY_ENABLED=true
```

**Feature Flags**
```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_PWA=true
```

**External Services**
```bash
# Live Chat
NEXT_PUBLIC_LIVE_CHAT_APP_ID=your_chat_app_id

# Currency API
NEXT_PUBLIC_CURRENCY_API_KEY=your_currency_api_key

# PWA Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

See `.env.example` for the complete list of available configuration options.

### Feature Flags

Enable or disable features dynamically using environment variables:

```typescript
// Feature flags are configured in app/lib/features.ts
{
  enableAnalytics: boolean;      // Google Analytics & GTM
  enableDarkMode: boolean;        // Theme switching
  enableNewLanding: boolean;      // New landing page design
  enableContactForm: boolean;     // Contact form
  enableLiveChat: boolean;        // Live chat widget
  enableNewsletter: boolean;      // Newsletter subscription
  enableBlog: boolean;            // Blog functionality
  enablePWA: boolean;             // Progressive Web App features
}
```

Toggle features without code changes by setting environment variables:
```bash
NEXT_PUBLIC_ENABLE_BLOG=false npm run build
```

## 🧩 Key Components & Pages

### Pages

**Main Pages**
- **Landing** (`/[locale]/landing`): Hero section, features showcase, testimonials, CTAs
- **Features** (`/[locale]/features`): Detailed feature descriptions with icons and animations
- **Pricing** (`/[locale]/pricing`): Pricing tiers with currency conversion
- **About** (`/[locale]/about`): Company information, team, mission
- **Contact** (`/[locale]/contact`): Contact form with validation and API integration

**Content Pages**
- **Blog** (`/[locale]/blog`): Blog listing with categories, search, and filters
- **Blog Post** (`/[locale]/blog/[slug]`): Individual blog posts with related articles
- **Performance Dashboard** (`/[locale]/dashboard/performance`): Real-time Core Web Vitals monitoring

**Legal Pages**
- **Terms of Service** (`/[locale]/terms`): Terms and conditions
- **Privacy Policy** (`/[locale]/privacy`): Privacy policy and data handling

### Reusable Components

**Layout & Navigation**
- `ThemeProvider`: Dark/light mode management
- `ProgressBar`: Page load progress indicator
- `BackToTop`: Smooth scroll to top button
- `CookieConsent`: GDPR-compliant cookie consent banner

**Analytics & Monitoring**
- `GoogleAnalytics`: GA4 integration with page view tracking
- `WebVitals`: Performance monitoring and reporting
- `ErrorBoundary`: Error catching and logging

**User Interaction**
- `SearchModal`: Global search with keyboard shortcuts (Cmd/Ctrl + K)
- `LiveChat`: Live chat widget integration
- `CurrencySelector`: Multi-currency switcher with conversion
- `LanguageSwitcher`: Locale switching with RTL support
- `Toast`: Notification system

**Forms**
- Contact form with validation
- Newsletter subscription
- Testimonial submission

### Utility Libraries

**Analytics** (`app/lib/analytics.ts`)
- Event tracking
- Page view tracking
- Custom event handlers
- GTM integration

**Sentry** (`app/lib/sentry.ts`)
- Error tracking
- Exception capture
- User context management
- Breadcrumb tracking

**Features** (`app/lib/features.ts`)
- Feature flag management
- Dynamic feature toggling
- Environment-based configuration

**SEO** (`app/lib/seo.ts`)
- Metadata generation
- Structured data (JSON-LD)
- Open Graph tags
- Twitter Card tags

**PWA** (`app/lib/pwa.ts`)
- Service worker registration
- Push notification support
- Install prompts
- Offline functionality

### Custom Hooks

- `useLocalStorage`: Persistent local storage with TypeScript
- `useMediaQuery`: Responsive design breakpoint detection
- `useLazyLoad`: Lazy loading for images and components
- `useDebounce`: Debounced values for search and input
- `useIntersectionObserver`: Viewport intersection detection

## 🔒 Security

- ✅ Security headers configured (HSTS, CSP, X-Frame-Options)
- ✅ Non-root Docker user
- ✅ Environment variables for sensitive data
- ✅ Regular dependency updates
- ✅ HTTPS/SSL ready
- ✅ Input validation and sanitization
- ✅ Rate limiting ready (infrastructure level)
- ✅ CORS configuration

See [SECURITY.md](./SECURITY.md) for reporting vulnerabilities.

## 📊 Health Check

The application includes a health check endpoint:

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-27T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "service": "onesign-landing"
}
```

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

See [Docker Deployment](#-docker-deployment) section above.

### PM2

```bash
# Install PM2
npm install -g pm2

# Build and start
npm run build
npm run pm2:start

# Save configuration
pm2 save
pm2 startup
```

### Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides:
- Docker Swarm
- Kubernetes
- Nginx reverse proxy
- SSL/TLS configuration
- Load balancing

## 🛠️ Development

### Tech Stack

**Core**
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20.x

**Styling & UI**
- **CSS Framework**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: React Icons, Radix UI Icons

**Internationalization**
- **i18n**: next-intl 4.5
- **Locales**: English, Farsi (RTL support)

**Analytics & Monitoring**
- **Analytics**: Google Analytics 4, Google Tag Manager
- **Error Tracking**: Sentry (mock implementation)
- **Performance**: Web Vitals API, Custom metrics dashboard

**Search & Content**
- **Search**: Fuse.js (fuzzy search)
- **Blog**: MDX-ready structure
- **SEO**: next-seo, structured data

**Development & Testing**
- **Testing**: Playwright (E2E), Jest (Unit)
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript strict mode

**Deployment**
- **Containerization**: Docker, Docker Compose
- **Process Manager**: PM2
- **Platforms**: Vercel, Docker-compatible hosts

### Build Optimizations

**Static Generation**
- All 30 pages pre-rendered at build time
- 15 English + 15 Farsi localized routes
- Zero client-side runtime for static content

**Image Optimization**
- Automatic format conversion (AVIF, WebP)
- Responsive image sizes (8 breakpoints)
- Lazy loading with intersection observer
- Blur placeholder for smooth loading

**Performance**
- Code splitting and tree shaking
- Bundle size optimization
- CSS purging and minification
- Gzip/Brotli compression ready

**Advanced Optimizations**
- Turbopack for faster builds (Next.js 16)
- Package import optimization (react-icons, framer-motion)
- CSS optimization in production
- Standalone output for minimal Docker images

**Runtime Performance**
- Client-side caching with local storage
- Debounced search inputs
- Lazy loaded components
- Memoized expensive calculations

### Code Quality

```bash
# Linting
npm run lint

# Auto-fix
npm run lint:fix
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development workflow
- Code standards
- Pull request process
- Testing guidelines

## 📝 Documentation

- **[README.md](./README.md)** - This file
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[SECURITY.md](./SECURITY.md)** - Security policy
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[LICENSE](./LICENSE)** - MIT License

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Build Errors

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Docker Issues

```bash
# Remove containers and rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache
```

## 📊 Performance

- ⚡ Lighthouse Score: 95+
- 📦 Bundle Size: Optimized
- 🎯 Core Web Vitals: Excellent
- 🔄 Static Generation: All pages

## 🗺️ Roadmap

### ✅ Completed
- [x] Analytics integration (GA4, GTM)
- [x] Blog section with categories and tags
- [x] Contact form with validation
- [x] Newsletter subscription
- [x] Live chat integration
- [x] SEO enhancements and structured data
- [x] Dynamic sitemap generation
- [x] Performance monitoring dashboard
- [x] Multi-currency support
- [x] Global search functionality
- [x] Dark mode theme switching
- [x] PWA features (manifest, offline support)
- [x] Error tracking with Sentry
- [x] Testimonial submission system
- [x] Cookie consent management

### 🚧 In Progress
- [ ] Storybook component documentation
- [ ] Complete E2E test coverage
- [ ] Unit test coverage for all utilities

### 📋 Planned
- [ ] A/B testing support
- [ ] Admin dashboard for content management
- [ ] Real-time blog post editor
- [ ] User authentication system
- [ ] Advanced analytics dashboards
- [ ] Integration with external CMS (e.g., Strapi, Contentful)
- [ ] Advanced SEO features (schema markup expansion)
- [ ] Performance optimization automation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Internationalization by [next-intl](https://next-intl-docs.vercel.app/)

## 📞 Support

- 📧 Email: support@onesign.example.com
- 🐛 Issues: [GitHub Issues](https://github.com/DevFrogPlatform/OneSign/issues)
- 📖 Docs: This repository

---

**Made with ❤️ by the OneSign Team**
