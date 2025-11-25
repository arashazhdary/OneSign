# Deployment Guide

This guide covers deploying the OneSign Admin Portal to various hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Production API endpoints set
- [ ] Build passes locally (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Assets optimized (images compressed, etc.)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (if needed)

## 🏗️ Build Configuration

### Environment Variables

Create `.env.production` for production-specific variables:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=OneSign Admin Portal
VITE_APP_VERSION=2.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Build Command

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Test the production build locally before deploying.

## 🚀 Deployment Options

### 1. Netlify (Recommended for Quick Deployment)

#### Via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

#### Via Netlify Dashboard

1. **Connect Repository**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 or higher

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add all `VITE_` prefixed variables

4. **SPA Configuration**

   Create `public/_redirects` file:
   ```
   /*    /index.html   200
   ```

5. **Deploy**
   - Push to your repository
   - Netlify auto-deploys

#### Custom Domain on Netlify

1. Go to Domain settings
2. Add custom domain
3. Configure DNS records as instructed

### 2. Vercel (Recommended for Vercel Users)

#### Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel
   ```

#### Via Vercel Dashboard

1. **Import Project**
   - Go to [Vercel](https://vercel.com/)
   - Click "Add New" → "Project"
   - Import your repository

2. **Configure Build**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**
   - Add all `VITE_` prefixed variables

4. **SPA Configuration**

   Create `vercel.json` in project root:
   ```json
   {
     "routes": [
       {
         "src": "/[^.]+",
         "dest": "/index.html"
       }
     ]
   }
   ```

5. **Deploy**
   - Push to repository or deploy via CLI

### 3. AWS S3 + CloudFront

#### Prerequisites
- AWS account
- AWS CLI configured
- S3 bucket created
- CloudFront distribution set up

#### Deployment Steps

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Sync to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure S3 for SPA**
   - Enable Static Website Hosting
   - Set index document: `index.html`
   - Set error document: `index.html`

4. **CloudFront Configuration**
   - Origin: Your S3 bucket
   - Default Root Object: `index.html`
   - Custom Error Response:
     - HTTP Error Code: 403, 404
     - Response Page Path: `/index.html`
     - HTTP Response Code: 200

5. **Invalidate CloudFront Cache** (after each deployment)
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

#### Automation Script

Create `deploy-aws.sh`:
```bash
#!/bin/bash

# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"

echo "Deployment complete!"
```

### 4. GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install -D gh-pages
   ```

2. **Add Deploy Script** to `package.json`
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Configure Base Path** in `vite.config.ts`
   ```ts
   export default defineConfig({
     base: '/repository-name/',
     // ... other config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository Settings
   - Pages section
   - Source: `gh-pages` branch

### 5. Docker

#### Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t onesign-admin-portal .

# Run container
docker run -p 8080:80 onesign-admin-portal
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### 6. DigitalOcean App Platform

1. **Connect Repository**
   - Go to DigitalOcean
   - Create new App
   - Connect your repository

2. **Configure App**
   - **Type**: Static Site
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**
   - Add all `VITE_` prefixed variables

4. **Deploy**
   - Click "Create Resources"

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env` files
- Use platform-specific env var management
- Rotate sensitive keys regularly

### 2. HTTPS

- Always use HTTPS in production
- Most platforms provide free SSL certificates
- Configure HSTS headers

### 3. Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

### 4. API Security

- Use CORS properly
- Implement rate limiting
- Use JWT with proper expiration
- Validate all inputs server-side

## 📊 Monitoring & Analytics

### Error Tracking (Sentry)

1. **Install Sentry**
   ```bash
   npm install @sentry/react
   ```

2. **Configure** in `main.tsx`
   ```tsx
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     tracesSampleRate: 1.0,
   });
   ```

### Performance Monitoring

Use Lighthouse or Web Vitals:

```bash
npm install web-vitals
```

```tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📈 Performance Optimization

### 1. Analyze Bundle

```bash
npm run build -- --mode analyze
```

### 2. Code Splitting

Already configured in `vite.config.ts` with manual chunks.

### 3. Lazy Loading

Routes are already lazy-loaded with `React.lazy()`.

### 4. Asset Optimization

- Compress images before adding to project
- Use WebP format for images
- Enable Brotli compression on server

### 5. CDN Configuration

Use a CDN for static assets:

```ts
// vite.config.ts
export default defineConfig({
  build: {
    // Set CDN URL
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
```

## 🧪 Post-Deployment Testing

1. **Functionality Tests**
   - Test all main user flows
   - Verify authentication
   - Check API connectivity

2. **Performance Tests**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Test on slow 3G connection

3. **Browser Compatibility**
   - Test on Chrome, Firefox, Safari, Edge
   - Test on mobile browsers
   - Check responsive design

4. **Accessibility**
   - Run WAVE or axe DevTools
   - Test keyboard navigation
   - Test with screen reader

## 📱 Mobile Deployment (PWA)

To make it a PWA, add:

1. **Install vite-plugin-pwa**
   ```bash
   npm install -D vite-plugin-pwa
   ```

2. **Configure** in `vite.config.ts`
   ```ts
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           name: 'OneSign Admin Portal',
           short_name: 'OneSign',
           theme_color: '#3b82f6',
           icons: [
             {
               src: 'icon-192.png',
               sizes: '192x192',
               type: 'image/png',
             },
             {
               src: 'icon-512.png',
               sizes: '512x512',
               type: 'image/png',
             },
           ],
         },
       }),
     ],
   })
   ```

## 🆘 Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors

### Routes Don't Work After Deployment

- Verify SPA redirect configuration
- Check server configuration for fallback to index.html

### Environment Variables Not Working

- Verify `VITE_` prefix
- Check if variables are set in hosting platform
- Rebuild after changing variables

### Slow Load Times

- Enable compression (gzip/brotli)
- Use CDN
- Optimize images
- Check for large dependencies

## 📚 Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

**Happy Deploying! 🚀**
