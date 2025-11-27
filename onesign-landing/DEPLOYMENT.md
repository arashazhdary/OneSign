# Deployment Guide - OneSign Landing Page

This guide covers various deployment options for the OneSign Landing Page.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Vercel Deployment](#vercel-deployment)
- [PM2 Deployment](#pm2-deployment)
- [Environment Variables](#environment-variables)

## Docker Deployment

### Development with Docker

```bash
# Build and run development container
docker-compose up landing-dev

# Access at http://localhost:3001
```

### Production with Docker

```bash
# Build production image
docker build -t onesign-landing:latest .

# Run production container
docker run -d \
  -p 3001:3001 \
  --name onesign-landing \
  -e NEXT_PUBLIC_APP_URL=https://yourdomain.com \
  onesign-landing:latest

# Or use docker-compose
docker-compose up -d landing
```

### Docker Commands

```bash
# View logs
docker logs -f onesign-landing

# Stop container
docker stop onesign-landing

# Remove container
docker rm onesign-landing

# Health check
curl http://localhost:3001/api/health
```

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration

The project includes `vercel.json` with optimized settings.

## PM2 Deployment

### Production with PM2

```bash
# Install PM2
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "onesign-landing" -- start

# Save PM2 configuration
pm2 save

# Setup auto-restart on system reboot
pm2 startup
```

### PM2 Commands

```bash
# View logs
pm2 logs onesign-landing

# Restart
pm2 restart onesign-landing

# Stop
pm2 stop onesign-landing

# Delete
pm2 delete onesign-landing

# Monitor
pm2 monit
```

## Environment Variables

### Required Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
PORT=3001
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=false
```

## Performance Optimization

### Build Optimization

The production build includes:
- Static page generation for all routes
- Optimized images and fonts
- Code splitting and tree shaking
- Compression and minification

### Caching Strategy

```nginx
# Nginx configuration example
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Health Checks

The application includes a health check endpoint:

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## SSL/TLS Configuration

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Application Monitoring

```bash
# View application logs
docker logs -f onesign-landing

# PM2 monitoring
pm2 monit

# Health check monitoring
watch -n 5 'curl -s http://localhost:3001/api/health | jq'
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find and kill process using port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **Build failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **Docker image issues**
   ```bash
   # Remove all containers and rebuild
   docker-compose down
   docker system prune -a
   docker-compose build --no-cache
   ```

## Scaling

### Horizontal Scaling with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml landing

# Scale service
docker service scale landing_landing=3
```

### Load Balancing

Use Nginx or HAProxy for load balancing multiple instances.

## Backup and Recovery

### Database-less Architecture

Since this is a static site, backups mainly involve:
- Source code (Git repository)
- Build artifacts (.next directory)
- Environment configuration

## Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Set secure headers in Next.js config
- [ ] Use environment variables for sensitive data
- [ ] Regular dependency updates
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Implement CSP headers

## Support

For issues or questions, please refer to:
- [README.md](./README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com)
