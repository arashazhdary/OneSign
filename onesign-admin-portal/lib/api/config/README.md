# API Configuration Guide | راهنمای تنظیمات API

این فایل راهنمای استفاده از سیستم کانفیگ مرکزی API است.

## تنظیمات محیط (Environment Variables)

برای تنظیم آدرس‌های API، می‌توانید از متغیرهای محیطی زیر استفاده کنید:

### برای سرویس‌ها (Services)
```env
# آدرس پایه برای تمام سرویس‌ها (users, applications, etc.)
API_SERVICES_BASE_URL=http://localhost:9091

# یا برای استفاده در مرورگر (public)
NEXT_PUBLIC_API_SERVICES_BASE_URL=/api-proxy
```

### برای احراز هویت (Authentication)
```env
# آدرس پایه برای endpoint های احراز هویت
API_AUTH_BASE_URL=http://localhost:9091

# یا برای استفاده در مرورگر (public)
NEXT_PUBLIC_API_AUTH_BASE_URL=/api-proxy
```

### تنظیمات عمومی (Fallback)
```env
# اگر API_SERVICES_BASE_URL یا API_AUTH_BASE_URL تنظیم نشده باشد، از این استفاده می‌شود
API_BASE_URL=http://localhost:9091
NEXT_PUBLIC_API_BASE_URL=/api-proxy
```

## استفاده در کد

### استفاده از کلاینت‌های پیش‌فرض

```typescript
import { apiClient, authClient } from '@/lib/api';

// استفاده از apiClient برای سرویس‌ها
const response = await apiClient.get('/api/tenant/users', { tenantId });

// استفاده از authClient برای احراز هویت
const response = await authClient.post('/api/auth/login', credentials);
```

### استفاده از سرویس‌ها

```typescript
import { services } from '@/lib/api';

// سرویس احراز هویت از authClient استفاده می‌کند
await services.auth.signIn(credentials);

// سایر سرویس‌ها از apiClient استفاده می‌کنند
await services.users.getUsers({ tenantId });
await services.applications.getApplications({ tenantId });
```

### دسترسی مستقیم به کانفیگ

```typescript
import { apiConfig, getServicesApiUrl, getAuthApiUrl } from '@/lib/api';

// مشاهده تنظیمات
console.log(apiConfig.servicesBaseUrl);
console.log(apiConfig.authBaseUrl);

// ساخت URL کامل
const servicesUrl = getServicesApiUrl('/api/tenant/users');
const authUrl = getAuthApiUrl('/api/auth/login');
```

## ساختار فایل کانفیگ

فایل `api-config.ts` شامل:

- **apiConfig**: آبجکت اصلی کانفیگ
  - `servicesBaseUrl`: آدرس پایه برای سرویس‌ها
  - `authBaseUrl`: آدرس پایه برای احراز هویت
  - `timeout`: زمان انتظار پیش‌فرض
  - `defaultHeaders`: هدرهای پیش‌فرض

- **getServicesApiUrl(path)**: ساخت URL کامل برای سرویس‌ها
- **getAuthApiUrl(path)**: ساخت URL کامل برای احراز هویت
- **API_BASE**: برای سازگاری با کدهای قدیمی

## نکات مهم

1. در مرورگر، به صورت خودکار از proxy استفاده می‌شود (`/api-proxy`)
2. در سرور (SSR)، از URL کامل استفاده می‌شود
3. سرویس `AuthService` به صورت خودکار از `authClient` استفاده می‌کند
4. سایر سرویس‌ها از `apiClient` استفاده می‌کنند

## مثال فایل .env.local

```env
# Development
API_SERVICES_BASE_URL=http://localhost:9091
API_AUTH_BASE_URL=http://localhost:9091

# یا برای استفاده از proxy در مرورگر
NEXT_PUBLIC_API_SERVICES_BASE_URL=/api-proxy
NEXT_PUBLIC_API_AUTH_BASE_URL=/api-proxy
```

