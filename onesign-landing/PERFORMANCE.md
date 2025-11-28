# Performance Guide

This document outlines performance optimization strategies and monitoring for OneSign Landing Page.

## Performance Budgets

We maintain strict performance budgets to ensure fast loading times:

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Lighthouse Scores (Minimum)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Resource Budgets

- Total Page Size: < 500KB
- JavaScript: < 150KB
- CSS: < 50KB
- Images: < 200KB
- Fonts: < 100KB

## Optimization Strategies

### 1. Static Generation

All pages are statically generated at build time:

```bash
npm run build
# Generates optimized static HTML
```

Benefits:
- Instant page loads
- No server-side processing
- Better SEO
- Lower hosting costs

### 2. Image Optimization

Using Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="OneSign Logo"
  width={200}
  height={50}
  priority // For above-fold images
/>
```

Features:
- Automatic WebP/AVIF conversion
- Lazy loading
- Responsive images
- Blur placeholder

### 3. Code Splitting

Automatic code splitting by route:
- Each page loads only necessary JavaScript
- Shared code extracted to common chunks
- Dynamic imports for heavy components

### 4. Font Optimization

Using Next.js Font optimization:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

Benefits:
- Self-hosted fonts
- Preloading
- Font display swap
- Reduced layout shift

### 5. Compression

Enabled in next.config.ts:

```typescript
{
  compress: true, // Gzip compression
}
```

### 6. Caching Strategy

#### Static Assets

```nginx
# Immutable assets (hashed filenames)
location /_next/static/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

#### HTML Pages

```nginx
# HTML pages
location / {
  expires 1h;
  add_header Cache-Control "public, must-revalidate";
}
```

## Monitoring

### Lighthouse CI

Automated performance testing:

```bash
npm run lighthouse
```

Run on every PR to catch regressions.

### Performance Monitoring Script

```bash
npm run perf
```

Tracks:
- Response times
- Health check status
- Memory usage

### Real User Monitoring (RUM)

Use tools like:
- Google Analytics (Core Web Vitals)
- Vercel Analytics
- Sentry Performance Monitoring

## Performance Checklist

### Build Time

- [ ] Static generation enabled
- [ ] Image optimization configured
- [ ] Code splitting working
- [ ] Tree shaking enabled
- [ ] Bundle size under budget

### Runtime

- [ ] Lazy load images
- [ ] Defer non-critical JavaScript
- [ ] Minimize layout shifts
- [ ] Optimize fonts
- [ ] Reduce third-party scripts

### Caching

- [ ] Static assets cached
- [ ] CDN configured
- [ ] Service worker (optional)
- [ ] API responses cached

### Monitoring

- [ ] Lighthouse CI setup
- [ ] RUM configured
- [ ] Error tracking
- [ ] Performance budgets enforced

## Common Issues

### Large Bundle Size

**Problem**: JavaScript bundle too large

**Solutions**:
1. Analyze bundle:
   ```bash
   npm run analyze
   ```

2. Dynamic imports:
   ```tsx
   const HeavyComponent = dynamic(() => import('./Heavy'));
   ```

3. Remove unused dependencies

### Slow Image Loading

**Problem**: Images loading slowly

**Solutions**:
1. Use Next.js Image component
2. Optimize image sizes
3. Use modern formats (WebP, AVIF)
4. Implement lazy loading

### Poor LCP Score

**Problem**: Largest Contentful Paint > 2.5s

**Solutions**:
1. Optimize hero images
2. Preload critical resources
3. Reduce server response time
4. Use CDN

### High CLS

**Problem**: Layout shifts during load

**Solutions**:
1. Set image dimensions
2. Reserve space for dynamic content
3. Use font-display: swap
4. Avoid inserting content above existing content

## Testing Performance

### Local Testing

```bash
# Build production version
npm run build

# Start production server
npm start

# Run Lighthouse
npm run lighthouse
```

### CI/CD Testing

Lighthouse runs automatically on every PR:
- Check GitHub Actions results
- Review performance scores
- Address any regressions

### Load Testing

For stress testing:

```bash
# Using Apache Bench
ab -n 1000 -c 100 http://localhost:3001/en/landing

# Using Artillery
artillery quick --count 100 --num 10 http://localhost:3001/en/landing
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)

## Continuous Improvement

1. Monitor metrics weekly
2. Set performance goals
3. Test on real devices
4. Optimize iteratively
5. Document improvements
