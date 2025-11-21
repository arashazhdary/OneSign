# 🚀 OneSign Deployment Guide

راهنمای کامل استقرار پروژه OneSign در محیط‌های مختلف.

## 📋 فهرست مطالب

1. [پیش‌نیازها](#پیش‌نیازها)
2. [محیط توسعه (Development)](#محیط-توسعه)
3. [محیط تست (Staging)](#محیط-تست)
4. [محیط تولید (Production)](#محیط-تولید)
5. [Docker Deployment](#docker-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [مانیتورینگ و لاگ‌ها](#مانیتورینگ)
8. [Troubleshooting](#troubleshooting)

---

## پیش‌نیازها

### نرم‌افزارهای مورد نیاز:

- **Node.js**: 18.x یا بالاتر
- **npm**: 9.x یا بالاتر (یا yarn، pnpm)
- **.NET SDK**: 8.0 برای بک‌اند
- **Database**: SQL Server 2019+ یا PostgreSQL 14+
- **Redis**: برای caching (اختیاری)
- **Docker**: برای containerization (اختیاری)

### سرویس‌های Cloud (اختیاری):

- **Azure** / **AWS** / **Google Cloud** برای hosting
- **Vercel** / **Netlify** برای فرانت‌اند
- **Azure SQL** / **RDS** برای دیتابیس

---

## محیط توسعه

### 1. Clone Repository

```bash
git clone https://github.com/DevFrogPlatform/OneSign.git
cd OneSign
```

### 2. نصب Dependencies

#### Backend:

```bash
cd src/Onesign.Api
dotnet restore
dotnet build
```

#### Frontend - Admin Portal:

```bash
cd onesign-admin-portal
npm install
```

#### Frontend - Login Portal:

```bash
cd onesign-login-portal
npm install
```

### 3. پیکربندی Environment Variables

#### Backend (`appsettings.Development.json`):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=OneSign;User Id=sa;Password=YourPassword;"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-change-in-production",
    "Issuer": "https://localhost:7000",
    "Audience": "https://localhost:3000"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"]
  }
}
```

#### Frontend Admin Portal (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:7000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Frontend Login Portal (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:7000
NEXT_PUBLIC_CLIENT_ID=onesign-login-portal
```

### 4. اجرای Migrations

```bash
cd src/Onesign.Api
dotnet ef database update
```

### 5. اجرای پروژه

#### Terminal 1 - Backend:
```bash
cd src/Onesign.Api
dotnet run
```

#### Terminal 2 - Admin Portal:
```bash
cd onesign-admin-portal
npm run dev
```

#### Terminal 3 - Login Portal:
```bash
cd onesign-login-portal
npm run dev
```

### 6. دسترسی به Application

- **Backend API**: http://localhost:7000
- **Admin Portal**: http://localhost:3000
- **Login Portal**: http://localhost:3001
- **Swagger**: http://localhost:7000/swagger

---

## محیط تست

### Azure App Service

#### 1. ایجاد Resource Group

```bash
az group create --name onesign-staging-rg --location eastus
```

#### 2. ایجاد SQL Database

```bash
az sql server create \
  --name onesign-staging-sql \
  --resource-group onesign-staging-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourStrongPassword123!

az sql db create \
  --resource-group onesign-staging-rg \
  --server onesign-staging-sql \
  --name OneSignDB \
  --service-objective S0
```

#### 3. Deploy Backend

```bash
# Build و Publish
cd src/Onesign.Api
dotnet publish -c Release -o ./publish

# Deploy به Azure
az webapp up \
  --name onesign-staging-api \
  --resource-group onesign-staging-rg \
  --runtime "DOTNET|8.0" \
  --sku B1
```

#### 4. Deploy Frontend با Vercel

```bash
cd onesign-admin-portal

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## محیط تولید

### مراحل آماده‌سازی:

#### 1. بهینه‌سازی Frontend

```bash
# Build Production
npm run build

# Test Production Build
npm run start
```

#### 2. بهینه‌سازی Backend

```bash
# Publish Release
dotnet publish -c Release -o ./publish

# Optimization
dotnet publish -c Release -r linux-x64 --self-contained false
```

#### 3. پیکربندی Production Environment Variables

**Backend (`appsettings.Production.json`):**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-sql.database.windows.net;Database=OneSign;..."
  },
  "Jwt": {
    "SecretKey": "production-secret-from-key-vault",
    "Issuer": "https://api.onesign.com",
    "Audience": "https://admin.onesign.com"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**Frontend (`.env.production`):**

```env
NEXT_PUBLIC_API_URL=https://api.onesign.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### 4. SSL/TLS Configuration

```bash
# Generate SSL Certificate (Let's Encrypt)
certbot certonly --webroot \
  -w /var/www/html \
  -d api.onesign.com \
  -d admin.onesign.com
```

---

## Docker Deployment

### Docker Compose Setup

**`docker-compose.yml`:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./src/Onesign.Api
      dockerfile: Dockerfile
    ports:
      - "7000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=OneSign;User=sa;Password=YourPassword123!
    depends_on:
      - db
      - redis

  admin-portal:
    build:
      context: ./onesign-admin-portal
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:80

  login-portal:
    build:
      context: ./onesign-login-portal
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:80

  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  sqldata:
```

**Backend Dockerfile:**

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Onesign.Api.csproj", "./"]
RUN dotnet restore "Onesign.Api.csproj"
COPY . .
RUN dotnet build "Onesign.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Onesign.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Onesign.Api.dll"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### اجرا با Docker Compose

```bash
# Build و Start
docker-compose up -d

# مشاهده Logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## CI/CD Pipeline

### GitHub Actions

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'

      - name: Restore dependencies
        run: dotnet restore
        working-directory: ./src/Onesign.Api

      - name: Build
        run: dotnet build --no-restore -c Release
        working-directory: ./src/Onesign.Api

      - name: Test
        run: dotnet test --no-build --verbosity normal
        working-directory: ./src/Onesign.Api

      - name: Publish
        run: dotnet publish -c Release -o ./publish
        working-directory: ./src/Onesign.Api

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: onesign-prod-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./src/Onesign.Api/publish

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci
        working-directory: ./onesign-admin-portal

      - name: Build
        run: npm run build
        working-directory: ./onesign-admin-portal
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./onesign-admin-portal
```

---

## مانیتورینگ

### Application Insights (Azure)

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

### Sentry (Error Tracking)

```typescript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {/* config */},
  {/* sentry options */}
);
```

### Health Checks

```bash
# Backend Health
curl https://api.onesign.com/health

# Frontend Health
curl https://admin.onesign.com/api/health
```

---

## Troubleshooting

### مشکلات رایج:

#### 1. Connection Timeout

```bash
# بررسی Network
ping api.onesign.com
telnet api.onesign.com 443
```

#### 2. Database Connection Failed

```bash
# بررسی Connection String
dotnet ef database update --verbose
```

#### 3. Build Errors

```bash
# پاک کردن Cache
rm -rf node_modules .next
npm install
npm run build
```

#### 4. SSL Certificate Issues

```bash
# Renew Certificate
certbot renew
systemctl restart nginx
```

---

## پشتیبانی

برای کمک بیشتر:
- 📧 Email: support@onesign.com
- 💬 Slack: onesign-community
- 📚 Docs: https://docs.onesign.com

---

**آخرین به‌روزرسانی**: 2025-01-21
