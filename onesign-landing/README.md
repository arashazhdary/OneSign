# OneSign Landing Page

> 🚀 Standalone landing page for OneSign - an enterprise Identity & Access Management platform.

[![CI/CD](https://github.com/DevFrogPlatform/OneSign/workflows/CI/badge.svg)](https://github.com/DevFrogPlatform/OneSign/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## ✨ Features

- 🌐 **Internationalization**: Full support for English and Farsi (RTL)
- ⚡ **Performance**: Static generation, optimized images, and fast loading
- 🎨 **Modern Design**: Built with Tailwind CSS v4
- 🐳 **Docker Ready**: Multi-stage builds for production deployment
- 🔒 **Security**: Security headers, HTTPS ready, non-root containers
- 📱 **Responsive**: Mobile-first design, works on all devices
- 🔧 **Developer Experience**: TypeScript, ESLint, hot reload
- 📊 **Monitoring**: Health check endpoint, PM2 support
- 🚀 **CI/CD**: GitHub Actions workflow included
- 📖 **Documentation**: Comprehensive guides for deployment and contribution

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

- **English**: [http://localhost:3001/en/landing](http://localhost:3001/en/landing)
- **Farsi**: [http://localhost:3001/fa/landing](http://localhost:3001/fa/landing)

## 📦 Scripts

### Development

```bash
npm run dev          # Start development server (port 3001)
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run clean        # Clean build artifacts
```

### Production

```bash
npm run build        # Build for production
npm start            # Start production server
npm run health       # Check health endpoint
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
│   ├── [locale]/              # Internationalized routes
│   │   ├── landing/           # Main landing page
│   │   │   └── page.tsx
│   │   ├── layout.tsx         # Locale-specific layout
│   │   └── page.tsx           # Root redirect
│   ├── api/
│   │   └── health/            # Health check endpoint
│   │       └── route.ts
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── favicon.ico            # Favicon
├── messages/                   # i18n translations
│   ├── en.json                # English
│   └── fa.json                # Farsi/Persian
├── public/                     # Static assets
│   ├── logo.svg
│   ├── onesign-logo.svg
│   └── ...
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CD pipeline
├── Dockerfile                  # Production Docker image
├── Dockerfile.dev              # Development Docker image
├── docker-compose.yml          # Docker Compose config
├── ecosystem.config.js         # PM2 configuration
├── Makefile                    # Build automation
├── i18n.ts                     # i18n configuration
├── proxy.ts                    # i18n middleware
├── next.config.ts              # Next.js config
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vercel.json                 # Vercel deployment
├── README.md                   # This file
├── DEPLOYMENT.md               # Deployment guide
├── CONTRIBUTING.md             # Contribution guide
├── SECURITY.md                 # Security policy
├── CHANGELOG.md                # Version history
└── LICENSE                     # MIT License
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

## 🔒 Security

- ✅ Security headers configured (HSTS, CSP, X-Frame-Options)
- ✅ Non-root Docker user
- ✅ Environment variables for sensitive data
- ✅ Regular dependency updates
- ✅ HTTPS/SSL ready

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

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl 4.5
- **Runtime**: Node.js 20.x

### Build Optimizations

- Static page generation
- Image optimization (AVIF, WebP)
- Code splitting and tree shaking
- Compression and minification
- Standalone output for Docker

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

- [ ] Analytics integration (GA, GTM)
- [ ] A/B testing support
- [ ] Blog section
- [ ] Contact form
- [ ] Newsletter subscription
- [ ] Live chat integration
- [ ] SEO enhancements
- [ ] Sitemap generation

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
