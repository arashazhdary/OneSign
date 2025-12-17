# راهنمای یکپارچه‌سازی OneSign با سیستم‌های خارجی

این سند راهنمای کامل راه‌اندازی OneSign و اتصال سیستم‌های خارجی برای احراز هویت SSO را ارائه می‌دهد.

---

## فهرست مطالب

- [مرحله ۱: راه‌اندازی OneSign](#مرحله-۱-راه‌اندازی-onesign)
- [مرحله ۲: ثبت اپلیکیشن (Client)](#مرحله-۲-ثبت-اپلیکیشن-client-در-onesign)
- [مرحله ۳: پیاده‌سازی SSO در سیستم شما](#مرحله-۳-پیاده‌سازی-sso-در-سیستم-شما)
- [مرحله ۴: استفاده از Token برای کنترل دسترسی](#مرحله-۴-استفاده-از-token-برای-کنترل-دسترسی)
- [مرحله ۵: Endpoint های مهم](#مرحله-۵-endpoint-های-مهم-onesign)
- [خلاصه فلو](#خلاصه-فلو)

---

## مرحله ۱: راه‌اندازی OneSign

### الف) پیش‌نیازها

- .NET 10 SDK
- Node.js 18+
- SQL Server
- Redis (اختیاری)

### ب) تنظیم دیتابیس

```bash
cd /path/to/OneSign/src/Onesign.Api

# ویرایش appsettings.json و تنظیم connection string
# سپس اجرای migrations
dotnet ef database update
```

### ج) تنظیمات اصلی (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=OnesignDbV2;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "SigningKey": "your-secret-signing-key-minimum-32-characters"
  },
  "Google": {
    "ClientId": "your-google-client-id"
  },
  "Microsoft": {
    "ClientId": "your-microsoft-client-id"
  },
  "Email": {
    "Smtp": {
      "Host": "smtp.gmail.com",
      "Port": "587",
      "Username": "your-email@gmail.com",
      "Password": "your-app-password"
    },
    "From": {
      "Address": "noreply@onesign.local"
    }
  },
  "RateLimit": {
    "MaxRequestsPerMinute": 5,
    "Lockout": {
      "MaxFailedAttempts": 10,
      "LockoutDurationMinutes": 30
    }
  }
}
```

### د) اجرای سرویس‌ها

برای اجرای کامل سیستم، ۳ ترمینال جداگانه نیاز دارید:

**ترمینال ۱: Backend API**
```bash
cd /path/to/OneSign/src/Onesign.Api
dotnet run
# سرویس روی https://localhost:7001 اجرا می‌شود
# Swagger: https://localhost:7001/swagger
```

**ترمینال ۲: Login Portal**
```bash
cd /path/to/OneSign/onesign-login-portal
npm install
npm run dev
# پورتال روی http://localhost:3000 اجرا می‌شود
```

**ترمینال ۳: Admin Portal**
```bash
cd /path/to/OneSign/onesign-admin-portal-react
npm install
npm run dev
# پنل مدیریت روی http://localhost:3001 اجرا می‌شود
```

### هـ) اجرا با Docker (اختیاری)

```bash
# Build و اجرا با Docker Compose
docker-compose up -d

# دسترسی به سرویس‌ها:
# - API: https://localhost:7001
# - Login: http://localhost:3000
# - Admin: http://localhost:3001
```

---

## مرحله ۲: ثبت اپلیکیشن (Client) در OneSign

قبل از اتصال سیستم خود به OneSign، باید آن را به عنوان یک Application ثبت کنید.

### از طریق Admin Portal:

1. به آدرس `http://localhost:3001` بروید
2. با حساب ادمین وارد شوید
3. از منوی سمت چپ، بخش **Applications** را انتخاب کنید
4. روی دکمه **Create Application** کلیک کنید
5. فیلدهای زیر را پر کنید:

| فیلد | توضیح | مثال |
|------|-------|------|
| **Name** | نام سیستم شما | `My CRM System` |
| **Application Type** | نوع اپلیکیشن | `Web Application` |
| **Redirect URIs** | آدرس‌های callback مجاز | `https://your-app.com/auth/callback` |

6. پس از ثبت، اطلاعات زیر را دریافت و ذخیره کنید:
   - **Client ID**: شناسه یکتای اپلیکیشن
   - **Client Secret**: کلید محرمانه (فقط یکبار نمایش داده می‌شود)

### از طریق API:

```bash
curl -X POST https://localhost:7001/api/tenant/applications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My CRM System",
    "applicationType": "web",
    "redirectUris": [
      "https://your-app.com/auth/callback",
      "http://localhost:3000/callback"
    ]
  }'
```

---

## مرحله ۳: پیاده‌سازی SSO در سیستم شما

### فلوی کامل احراز هویت (OAuth 2.0 + OIDC + PKCE)

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   سیستم شما     │      │    OneSign      │      │   کاربر         │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │  1. کلیک روی Login     │                        │
         │◄───────────────────────┼────────────────────────┤
         │                        │                        │
         │  2. Redirect به /connect/authorize              │
         │───────────────────────►│                        │
         │                        │                        │
         │                        │  3. نمایش صفحه لاگین   │
         │                        │───────────────────────►│
         │                        │                        │
         │                        │  4. ورود اطلاعات       │
         │                        │◄───────────────────────┤
         │                        │                        │
         │  5. Redirect با Authorization Code              │
         │◄───────────────────────┤                        │
         │                        │                        │
         │  6. Exchange Code → Token                       │
         │───────────────────────►│                        │
         │                        │                        │
         │  7. دریافت Access Token + ID Token              │
         │◄───────────────────────┤                        │
         │                        │                        │
         │  8. استفاده از Token برای کنترل دسترسی          │
         │────────────────────────────────────────────────►│
```

### توضیح مراحل:

1. **کاربر روی "ورود" کلیک می‌کند** - در سیستم شما
2. **Redirect به OneSign** - با پارامترهای OAuth
3. **نمایش صفحه لاگین** - OneSign صفحه لاگین را نشان می‌دهد
4. **کاربر اطلاعات را وارد می‌کند** - ایمیل و رمز عبور
5. **بازگشت با Authorization Code** - OneSign کاربر را به redirect_uri برمی‌گرداند
6. **تبدیل Code به Token** - سیستم شما code را به token تبدیل می‌کند
7. **دریافت Token‌ها** - access_token و id_token
8. **کنترل دسترسی** - بر اساس اطلاعات token

---

### نمونه کد برای .NET

#### استفاده از SDK

```bash
# نصب SDK
dotnet add package Onesign.Sdk.DotNet
```

#### Program.cs - تنظیمات

```csharp
using Onesign.Sdk;

var builder = WebApplication.CreateBuilder(args);

// تنظیمات OneSign
builder.Services.AddOnesign(options =>
{
    options.BaseUrl = "https://localhost:7001";
    options.ClientId = "your-client-id";
    options.ClientSecret = "your-client-secret";
    options.RedirectUri = "https://your-app.com/auth/callback";
    options.TenantId = "your-tenant-id";
});

builder.Services.AddSession();
var app = builder.Build();
```

#### AuthController.cs - کنترلر احراز هویت

```csharp
using Microsoft.AspNetCore.Mvc;
using Onesign.Sdk;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IOnesignClient _onesignClient;

    public AuthController(IOnesignClient onesignClient)
    {
        _onesignClient = onesignClient;
    }

    /// <summary>
    /// شروع فرآیند لاگین - ریدایرکت به OneSign
    /// </summary>
    [HttpGet("login")]
    public IActionResult Login()
    {
        // ایجاد state برای جلوگیری از CSRF
        var state = Guid.NewGuid().ToString();

        // ایجاد URL لاگین با PKCE
        var (authorizeUrl, codeVerifier) = _onesignClient.BuildAuthorizeUrl(state);

        // ذخیره code_verifier و state در session
        HttpContext.Session.SetString("code_verifier", codeVerifier);
        HttpContext.Session.SetString("oauth_state", state);

        // ریدایرکت به OneSign
        return Redirect(authorizeUrl);
    }

    /// <summary>
    /// Callback از OneSign - دریافت token
    /// </summary>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string code,
        [FromQuery] string state)
    {
        // اعتبارسنجی state
        var savedState = HttpContext.Session.GetString("oauth_state");
        if (state != savedState)
        {
            return BadRequest("Invalid state parameter");
        }

        // دریافت code_verifier
        var codeVerifier = HttpContext.Session.GetString("code_verifier");
        if (string.IsNullOrEmpty(codeVerifier))
        {
            return BadRequest("Code verifier not found");
        }

        try
        {
            // تبدیل authorization code به token
            var tokenResponse = await _onesignClient.ExchangeCodeForTokenAsync(code, codeVerifier);

            // ذخیره token‌ها در session یا cookie
            HttpContext.Session.SetString("access_token", tokenResponse.AccessToken);
            HttpContext.Session.SetString("id_token", tokenResponse.IdToken);

            // پاک کردن داده‌های موقت
            HttpContext.Session.Remove("code_verifier");
            HttpContext.Session.Remove("oauth_state");

            // ریدایرکت به داشبورد
            return Redirect("/dashboard");
        }
        catch (Exception ex)
        {
            return BadRequest($"Token exchange failed: {ex.Message}");
        }
    }

    /// <summary>
    /// خروج از سیستم
    /// </summary>
    [HttpGet("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return Redirect("/");
    }

    /// <summary>
    /// دریافت اطلاعات کاربر جاری
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var accessToken = HttpContext.Session.GetString("access_token");
        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized();
        }

        var userInfo = await _onesignClient.GetUserInfoAsync(accessToken);
        return Ok(userInfo);
    }
}
```

#### پیاده‌سازی بدون SDK (خام)

```csharp
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public class OnesignAuthService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl = "https://localhost:7001";
    private readonly string _clientId = "your-client-id";
    private readonly string _clientSecret = "your-client-secret";
    private readonly string _redirectUri = "https://your-app.com/auth/callback";

    public OnesignAuthService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    /// <summary>
    /// تولید Code Verifier برای PKCE
    /// </summary>
    public string GenerateCodeVerifier()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Base64UrlEncode(bytes);
    }

    /// <summary>
    /// تولید Code Challenge از Code Verifier
    /// </summary>
    public string GenerateCodeChallenge(string codeVerifier)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(codeVerifier));
        return Base64UrlEncode(bytes);
    }

    /// <summary>
    /// ساخت URL برای Authorization
    /// </summary>
    public (string Url, string CodeVerifier) BuildAuthorizeUrl(string state)
    {
        var codeVerifier = GenerateCodeVerifier();
        var codeChallenge = GenerateCodeChallenge(codeVerifier);

        var url = $"{_baseUrl}/connect/authorize?" +
            $"client_id={Uri.EscapeDataString(_clientId)}&" +
            $"redirect_uri={Uri.EscapeDataString(_redirectUri)}&" +
            $"response_type=code&" +
            $"scope=openid profile email&" +
            $"state={Uri.EscapeDataString(state)}&" +
            $"code_challenge={Uri.EscapeDataString(codeChallenge)}&" +
            $"code_challenge_method=S256";

        return (url, codeVerifier);
    }

    /// <summary>
    /// تبدیل Authorization Code به Token
    /// </summary>
    public async Task<TokenResponse> ExchangeCodeForTokenAsync(string code, string codeVerifier)
    {
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["redirect_uri"] = _redirectUri,
            ["client_id"] = _clientId,
            ["client_secret"] = _clientSecret,
            ["code_verifier"] = codeVerifier
        });

        var response = await _httpClient.PostAsync($"{_baseUrl}/connect/token", content);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<TokenResponse>(json);
    }

    private string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}

public class TokenResponse
{
    public string AccessToken { get; set; }
    public string IdToken { get; set; }
    public string TokenType { get; set; }
    public int ExpiresIn { get; set; }
}
```

---

### نمونه کد برای React/Next.js

#### نصب SDK

```bash
npm install @onesign/react-sdk
```

#### تنظیمات Provider

```tsx
// app/providers.tsx
'use client';

import { OnesignProvider } from '@onesign/react-sdk';

const onesignConfig = {
  baseUrl: 'https://localhost:7001',
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/auth/callback',
  tenantId: 'your-tenant-id'
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OnesignProvider config={onesignConfig}>
      {children}
    </OnesignProvider>
  );
}
```

#### صفحه لاگین

```tsx
// app/login/page.tsx
'use client';

import { useOnesignAuth } from '@onesign/react-sdk';

export default function LoginPage() {
  const { login, isLoading } = useOnesignAuth();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ورود به سیستم</h1>
        <button
          onClick={login}
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'در حال انتقال...' : 'ورود با OneSign'}
        </button>
      </div>
    </div>
  );
}
```

#### صفحه Callback

```tsx
// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnesignAuth } from '@onesign/react-sdk';

export default function CallbackPage() {
  const { handleCallback, error } = useOnesignAuth();
  const router = useRouter();

  useEffect(() => {
    handleCallback()
      .then(() => {
        router.push('/dashboard');
      })
      .catch((err) => {
        console.error('Callback failed:', err);
      });
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">خطا: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">در حال پردازش...</p>
      </div>
    </div>
  );
}
```

#### محافظت از صفحات

```tsx
// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnesignAuth } from '@onesign/react-sdk';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = []
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, tokenInfo } = useOnesignAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // در حال بارگذاری
  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  // احراز هویت نشده
  if (!isAuthenticated) {
    return null;
  }

  // بررسی نقش‌ها
  if (requiredRoles.length > 0) {
    const userRoles = tokenInfo?.roles || [];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return <AccessDenied message="شما نقش لازم برای دسترسی به این صفحه را ندارید" />;
    }
  }

  // بررسی دسترسی‌ها
  if (requiredPermissions.length > 0) {
    const userPermissions = tokenInfo?.permissions || [];
    const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));
    if (!hasPermission) {
      return <AccessDenied message="شما دسترسی لازم برای این عملیات را ندارید" />;
    }
  }

  return <>{children}</>;
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">دسترسی غیرمجاز</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
```

#### استفاده در صفحات

```tsx
// app/dashboard/page.tsx
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useOnesignAuth } from '@onesign/react-sdk';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { tokenInfo, logout } = useOnesignAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">داشبورد</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>خوش آمدید، {tokenInfo?.name || tokenInfo?.email}</p>
        <p>نقش‌ها: {tokenInfo?.roles?.join(', ') || 'ندارد'}</p>
        <button
          onClick={logout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          خروج
        </button>
      </div>
    </div>
  );
}

// app/admin/page.tsx - صفحه با محدودیت نقش
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  );
}

// app/users/page.tsx - صفحه با محدودیت دسترسی
export default function UsersPage() {
  return (
    <ProtectedRoute requiredPermissions={['manage_users', 'read_users']}>
      <UserManagement />
    </ProtectedRoute>
  );
}
```

#### پیاده‌سازی بدون SDK (خام)

```tsx
// lib/onesign.ts
import { randomBytes, createHash } from 'crypto';

const ONESIGN_BASE_URL = 'https://localhost:7001';
const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${ONESIGN_BASE_URL}/connect/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const response = await fetch(`${ONESIGN_BASE_URL}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code_verifier: codeVerifier
    }).toString()
  });

  if (!response.ok) {
    throw new Error('Token exchange failed');
  }

  return response.json();
}

export async function getUserInfo(accessToken: string) {
  const response = await fetch(`${ONESIGN_BASE_URL}/connect/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
}
```

---

## مرحله ۴: استفاده از Token برای کنترل دسترسی

### ساختار Token‌ها

#### Access Token

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-guid",
    "tenant_id": "tenant-guid",
    "client_id": "client-guid",
    "exp": 1704067200,
    "iat": 1704063600
  }
}
```

#### ID Token (شامل اطلاعات کاربر)

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "tenant-guid",
  "client_id": "client-guid",
  "email": "user@example.com",
  "name": "نام کاربر",
  "given_name": "نام",
  "family_name": "نام خانوادگی",
  "roles": ["admin", "user"],
  "permissions": ["read", "write", "manage_users"],
  "org_unit": "فناوری اطلاعات",
  "exp": 1704067200,
  "iat": 1704063600
}
```

### اعتبارسنجی Token در Backend

#### .NET

```csharp
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

public class TokenValidationService
{
    private readonly string _jwksUrl;
    private readonly string _issuer;
    private readonly string _audience;

    public TokenValidationService(IConfiguration config)
    {
        _jwksUrl = "https://localhost:7001/.well-known/jwks.json";
        _issuer = "https://localhost:7001";
        _audience = config["Onesign:ClientId"];
    }

    public async Task<ClaimsPrincipal> ValidateTokenAsync(string token)
    {
        var handler = new JwtSecurityTokenHandler();

        // دریافت کلیدهای امضا از OneSign
        var httpClient = new HttpClient();
        var jwksJson = await httpClient.GetStringAsync(_jwksUrl);
        var jwks = new JsonWebKeySet(jwksJson);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _issuer,
            ValidateAudience = true,
            ValidAudience = _audience,
            ValidateLifetime = true,
            IssuerSigningKeys = jwks.Keys,
            ClockSkew = TimeSpan.FromMinutes(5)
        };

        try
        {
            var principal = handler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (SecurityTokenException)
        {
            return null;
        }
    }
}
```

#### Middleware برای اعتبارسنجی خودکار

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://localhost:7001";
        options.Audience = "your-client-id";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Policy بر اساس نقش
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("admin"));

    // Policy بر اساس Permission
    options.AddPolicy("CanManageUsers", policy =>
        policy.RequireClaim("permissions", "manage_users"));
});

// استفاده در Controller
[Authorize(Policy = "AdminOnly")]
[HttpGet("admin/dashboard")]
public IActionResult AdminDashboard()
{
    return Ok(new { message = "خوش آمدید به پنل ادمین" });
}

[Authorize(Policy = "CanManageUsers")]
[HttpGet("users")]
public IActionResult GetUsers()
{
    return Ok(new { users = new[] { "user1", "user2" } });
}
```

### کنترل دسترسی در Frontend

```tsx
// hooks/useAuthorization.ts
import { useOnesignAuth } from '@onesign/react-sdk';

export function useAuthorization() {
  const { tokenInfo, isAuthenticated } = useOnesignAuth();

  const hasRole = (role: string): boolean => {
    if (!isAuthenticated || !tokenInfo?.roles) return false;
    return tokenInfo.roles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!isAuthenticated || !tokenInfo?.roles) return false;
    return roles.some(role => tokenInfo.roles.includes(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    if (!isAuthenticated || !tokenInfo?.roles) return false;
    return roles.every(role => tokenInfo.roles.includes(role));
  };

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !tokenInfo?.permissions) return false;
    return tokenInfo.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!isAuthenticated || !tokenInfo?.permissions) return false;
    return permissions.some(perm => tokenInfo.permissions.includes(perm));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!isAuthenticated || !tokenInfo?.permissions) return false;
    return permissions.every(perm => tokenInfo.permissions.includes(perm));
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),
    canManageUsers: hasPermission('manage_users'),
    canViewReports: hasPermission('view_reports')
  };
}

// استفاده در کامپوننت
function AdminButton() {
  const { isAdmin } = useAuthorization();

  if (!isAdmin) return null;

  return <button>تنظیمات ادمین</button>;
}

function UserActions() {
  const { canManageUsers, hasPermission } = useAuthorization();

  return (
    <div>
      {canManageUsers && <button>افزودن کاربر</button>}
      {hasPermission('delete_users') && <button>حذف کاربر</button>}
      {hasPermission('edit_users') && <button>ویرایش کاربر</button>}
    </div>
  );
}
```

---

## مرحله ۵: Endpoint های مهم OneSign

### Discovery و OIDC

| Endpoint | Method | توضیح |
|----------|--------|-------|
| `/.well-known/openid-configuration` | GET | تنظیمات OIDC - شامل همه URL‌های مورد نیاز |
| `/.well-known/jwks.json` | GET | کلیدهای عمومی برای اعتبارسنجی JWT |
| `/connect/authorize` | GET | شروع فرآیند OAuth - ریدایرکت کاربر به لاگین |
| `/connect/token` | POST | تبدیل Authorization Code به Token |
| `/connect/userinfo` | GET | دریافت اطلاعات کاربر (نیاز به Bearer Token) |

### نمونه درخواست‌ها

#### دریافت تنظیمات OIDC

```bash
curl https://localhost:7001/.well-known/openid-configuration
```

پاسخ:
```json
{
  "issuer": "https://localhost:7001",
  "authorization_endpoint": "https://localhost:7001/connect/authorize",
  "token_endpoint": "https://localhost:7001/connect/token",
  "userinfo_endpoint": "https://localhost:7001/connect/userinfo",
  "jwks_uri": "https://localhost:7001/.well-known/jwks.json",
  "response_types_supported": ["code"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["HS256"],
  "scopes_supported": ["openid", "profile", "email"],
  "token_endpoint_auth_methods_supported": ["client_secret_post"],
  "code_challenge_methods_supported": ["S256"]
}
```

#### تبدیل Code به Token

```bash
curl -X POST https://localhost:7001/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=https://your-app.com/callback" \
  -d "client_id=your-client-id" \
  -d "client_secret=your-client-secret" \
  -d "code_verifier=YOUR_CODE_VERIFIER"
```

پاسخ:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "id_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### دریافت اطلاعات کاربر

```bash
curl https://localhost:7001/connect/userinfo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

پاسخ:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "نام کاربر",
  "roles": ["user", "admin"],
  "permissions": ["read", "write"]
}
```

---

## خلاصه فلو

```
┌────────────────────────────────────────────────────────────────────┐
│                        خلاصه مراحل اتصال                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. راه‌اندازی OneSign                                              │
│     ├── API Server (dotnet run)                                   │
│     ├── Login Portal (npm run dev)                                │
│     └── Admin Portal (npm run dev)                                │
│                                                                    │
│  2. ثبت Application در Admin Portal                               │
│     ├── نام اپلیکیشن                                               │
│     ├── Redirect URIs                                             │
│     └── دریافت Client ID و Client Secret                          │
│                                                                    │
│  3. پیاده‌سازی در سیستم شما                                         │
│     ├── نصب SDK (اختیاری)                                         │
│     ├── ایجاد صفحه Login → ریدایرکت به OneSign                     │
│     ├── ایجاد صفحه Callback → دریافت Token                        │
│     └── ذخیره Token در Session/Cookie                             │
│                                                                    │
│  4. کنترل دسترسی                                                   │
│     ├── اعتبارسنجی Token در Backend                                │
│     ├── استخراج roles و permissions از Token                      │
│     └── محافظت از صفحات و API‌ها                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### چک‌لیست سریع

- [ ] OneSign راه‌اندازی شده
- [ ] Application در Admin Portal ثبت شده
- [ ] Client ID و Client Secret ذخیره شده
- [ ] Redirect URI تنظیم شده
- [ ] صفحه Login پیاده‌سازی شده
- [ ] صفحه Callback پیاده‌سازی شده
- [ ] Token Validation در Backend انجام می‌شود
- [ ] کنترل دسترسی بر اساس roles/permissions فعال است

---

## منابع بیشتر

- [مستندات فنی کامل OneSign](./OneSign-Technical-Specification.md)
- [لیست کامل قابلیت‌ها](./OneSign-Features-Complete.md)
- [.NET SDK README](../src/Onesign.Sdk.DotNet/README.md)
- [React SDK](../sdk/react-sdk/)

---

## پشتیبانی

برای سوالات و مشکلات:
- مستندات API: `https://localhost:7001/swagger`
- Health Check: `https://localhost:7001/ready`
