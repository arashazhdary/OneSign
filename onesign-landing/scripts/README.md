# Scripts Directory

Utility scripts for OneSign Landing Page deployment and operations.

## Available Scripts

### `deploy.sh`
Automated deployment script supporting multiple environments.

**Usage:**
```bash
# Development deployment
./scripts/deploy.sh dev

# Production deployment
./scripts/deploy.sh production latest

# Staging deployment
./scripts/deploy.sh staging v1.2.3
```

**Features:**
- Multi-environment support (dev, staging, production)
- Multiple deployment methods (Docker, Kubernetes, PM2)
- Health check verification
- Interactive confirmations for production

### `performance-check.sh`
Performance monitoring and health check script.

**Usage:**
```bash
# Run performance check
./scripts/performance-check.sh

# Schedule with cron (every 5 minutes)
*/5 * * * * /path/to/scripts/performance-check.sh
```

**Checks:**
- Response time monitoring
- Health endpoint status
- Memory usage (if using PM2)
- Logs last 5 performance metrics

### `backup.sh`
Creates backups of the application.

**Usage:**
```bash
# Create backup
./scripts/backup.sh

# Automated backups with cron (daily at 2 AM)
0 2 * * * /path/to/scripts/backup.sh
```

**Features:**
- Compressed tar.gz archive
- Excludes node_modules and build artifacts
- Keeps last 10 backups
- Timestamped backup files

## Making Scripts Executable

```bash
chmod +x scripts/*.sh
```

## Environment Variables

Scripts respect these environment variables:

- `NEXT_PUBLIC_APP_URL` - Application URL (default: http://localhost:3001)
- `DOCKER_REGISTRY` - Docker registry URL
- `NODE_ENV` - Environment (development/production)

## Logging

Scripts create logs in:
- `./logs/performance.log` - Performance metrics
- `./logs/deploy.log` - Deployment logs (future)

## Cron Examples

### Daily Backups
```bash
0 2 * * * cd /path/to/onesign-landing && ./scripts/backup.sh >> ./logs/backup.log 2>&1
```

### Hourly Performance Checks
```bash
0 * * * * cd /path/to/onesign-landing && ./scripts/performance-check.sh
```

### Weekly Health Reports
```bash
0 9 * * 1 cd /path/to/onesign-landing && ./scripts/performance-check.sh | mail -s "Weekly Performance Report" admin@example.com
```

## Customization

All scripts can be customized by editing the configuration section at the top of each file.

## Troubleshooting

### Permission Denied
```bash
chmod +x scripts/*.sh
```

### Command Not Found
Ensure required tools are installed:
- curl
- docker / docker-compose
- kubectl (for Kubernetes)
- pm2 (for PM2 deployment)

### Path Issues
Use absolute paths when running from cron:
```bash
/usr/bin/bash /full/path/to/script.sh
```
