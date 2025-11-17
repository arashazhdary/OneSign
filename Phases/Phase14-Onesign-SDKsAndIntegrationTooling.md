# onesign – Phase 14 SDKs & Integration Tooling & Sandbox

## 1. محدوده Phase 14

### 1.1 هدف کلی

Phase 14 تمرکز دارد روی این که onesign برای App Developer / Integrator واقعا “developer-friendly” بشود، نه یک IdP خشک:

- SDK استاندارد و پایدار برای:
  - Backend (.NET)
  - Backend (Node.js)
  - Frontend (React SPA)
- Dev Sandbox:
  - محیط تست جدا برای هر tenant (یا shared sandbox)
  - ابزار ساده برای تست login / token / callbacks
- ابزارهای Developer:
  - CLI / Tooling برای:
    - ثبت client
    - مدیریت redirect URIs
    - خواندن metadata
  - Postman collection و OpenAPI منظم

بدون این فاز، هرچقدر هم Core خوب باشد، Adoption می‌خورد به دیوار.

### 1.2 personas

- **App Developer (.NET / Node / React)**  
  می‌خواهد:
  - یک package نصب کند
  - ۳–۴ خط config بنویسد
  - auth را بسپارد به SDK
  - مثال‌های آماده copy–paste کند

- **Integrator / SSO Consultant**  
  می‌خواهد:
  - tenant sandbox داشته باشد
  - sample app برای مشتری نمایش بدهد
  - CLI برای automation داشته باشد

- **Tenant Admin / Dev Lead**  
  می‌خواهد:
  - مطمئن شود همه appهای تیمش با یک الگو و best practice به onesign وصل می‌شوند
  - onboarding تیم‌ها ساده باشد

---

## 2. معماری و محدوده فنی Phase 14

### 2.1 SDKها (scope Phase 14)

در این فاز، تمرکز روی چهار خروجی concrete:

1. **Onesign SDK for .NET Backend (API)**  
   - هدف اصلی: ASP.NET Core APIs که می‌خواهند:
     - OIDC/OAuth2 bearer tokens را validate کنند
     - user info/claims را دریافت و normalize کنند
     - tenant & app metadata را راحت بخوانند

2. **Onesign SDK for Node.js Backend (Express/Koa)**  
   - برای سرویس‌های Node که در Edge/Backend هستند:
     - middleware برای token validation
     - helper برای OIDC discovery و JWKS

3. **Onesign SDK for React SPA**  
   - برای SPA که پشت یک backend خودش قرار دارد:
     - auth hooks (useAuth)
     - login/logout redirect helpers
     - token storage (in-memory/session storage) با best-practice (no XSS bait)

4. **Dev Sandbox & CLI**  
   - CLI برای developer:
     - onesign-cli  
   - توانایی:
     - create/update client
     - pull config و generate .env یا appsettings.json
   - Sandbox tenant یا محیط آزمایشی:
     - domain مثل `dev.login.your-sso.com` یا per-tenant `sandbox` flag

در فازهای بعد می‌توانی اضافه کنی:
- SDK برای mobile (React Native / native)
- SDK برای زبان‌های دیگر (Java, Go, Python)

---

## 3. Epics و User Story ها – Phase 14

### Epic 1 – Backend .NET SDK

#### US 14.1 – نصب ساده و wiring حداقلی

به عنوان .NET Backend Developer  
می‌خواهم با نصب یک package و چند خط config، API خودم را به onesign وصل کنم  
تا لازم نباشد خودم OIDC flows و token validation را پیاده کنم.

Acceptance:

- NuGet package: `Onesign.Sdk.AspNetCore`
- اضافه extension method:
  - `services.AddOnesignAuthentication(...)`
  - `app.UseOnesignAuthentication()`
- Config:
  - در appsettings:
    - Authority (login.your-sso.com / tenant domain)
    - ClientId (در صورت نیاز)
    - Audience / ApiResource
- نمونه minimal:
  - Program.cs با ۵–۶ خط wirings
  - Controller با `[Authorize]` که claims درست را دارد

#### US 14.2 – Token Validation & Claims Normalization

به عنوان backend  
می‌خواهم token-validation را به SDK بسپارم  
تا:
- signature و expiry و audience چک شود
- multi-tenant claims (tenant_id) و org claims به شکل استاندارد برسند

Acceptance:

- SDK:
  - discovery از /.well-known/openid-configuration
  - JWKS fetch و cache
  - validation:
    - issuer, audience, exp, nbf
- claims mapping:
  - Standard: sub, email, name
  - Tenant: tenant_id
  - Org: org_unit_ids یا primary_org_unit
  - Roles: roles / permissions claims (از Phase 7)

---

### Epic 2 – Backend Node.js SDK

#### US 14.3 – Express Middleware برای token validation

به عنوان Node.js Backend Developer  
می‌خواهم با یک middleware، API خودم را در مقابل tokens onesign امن کنم  
تا خودم نروم دنبال کتابخانه‌های OIDC پراکنده.

Acceptance:

- NPM package: `@onesign/sdk-node`
- Export:
  - `createOnesignAuthMiddleware(config)`
- Config:
  - authority
  - audience
  - optional tenant_selection strategy
- Behavior:
  - token از header می‌خواند (`Authorization: Bearer ...`)
  - validate از طریق JWKS
  - on success: `req.user` را با claims پر می‌کند
  - on failure: 401/403 مناسب

#### US 14.4 – Helper برای OIDC Discovery

به عنوان Integrator  
می‌خواهم helperهایی داشته باشم که discovery و JWKS و config caching را 
برایم انجام دهد  
تا تمرکز روی business logic بماند.

Acceptance:

- در `@onesign/sdk-node`:
  - `discoverOpenIdConfig(authority)`
  - `getJwks(authority)`
- هر دو:
  - cache internal با TTL مناسب داشته باشند
  - error handling مناسب

---

### Epic 3 – React SPA SDK

#### US 14.5 – Hook useOnesignAuth

به عنوان Frontend React Developer  
می‌خواهم hookی داشته باشم که:
  - login / logout
  - user state
  - loading/error state  
را به من بدهد  
تا مجبور نباشم OIDC client خودم بسازم.

Acceptance:

- NPM package: `@onesign/sdk-react`
- Export:
  - `OnesignAuthProvider`
  - `useOnesignAuth()`
- Config در Provider:
  - authority
  - clientId
  - redirectUri
  - postLogoutRedirectUri
  - silentRefresh (اختیاری برای phase بعد)
- `useOnesignAuth()` برگرداند:
  - `isAuthenticated`
  - `isLoading`
  - `user` (claims مهم)
  - `login()`
  - `logout()`

#### US 14.6 – Handling Redirects & State

به عنوان Frontend Developer  
می‌خواهم redirect-based OIDC login را بدون دردسر هندل کنم  
تا کد من از هزار خط callback-handling پر نشود.

Acceptance:

- Component یا helper:
  - `OnesignAuthCallback` برای route مثلا `/auth/callback`
- Behavior:
  - روی load:
    - code و state را از URL بخواند
    - token را از onesign بگیرد (از طریق backend proxy یا direct PKCE flow بسته به design قبلی)
    - نتیجه را در context ذخیره کند
    - بعد به route مناسب redirect کند
- Example app:
  - sample React app که این جریان را end-to-end نشان دهد.

---

### Epic 4 – Dev Sandbox & CLI

#### US 14.7 – Sandbox Tenant Flag

به عنوان Integrator  
می‌خواهم tenant را به صورت sandbox علامت بزنم  
تا محیطی داشته باشیم که بتوانم بدون ترس از داده واقعی تست کنم.

Acceptance:

- TenantConfig:
  - `IsSandbox` flag
- Behavior:
  - در DevPortal و Admin Portal جایی که لازم است tag نمایش دهد:
    - `[SANDBOX]`
- login domain:
  - حداقل:
    - config قابل تفکیک برای sandbox vs production

#### US 14.8 – onesign CLI برای Client Management

به عنوان App Developer  
می‌خواهم با یک CLI بتوانم client بسازم و تنظیماتش را بخوانم  
تا نیازی نباشد هر بار داخل UI بروم.

Acceptance:

- ابزار CLI: `onesign-cli` (یا مشابه)
- قابلیت‌ها:
  - `onesign login`:
    - auth به عنوان tenant admin در sandbox
  - `onesign apps list`:
    - لیست ApplicationClient ها
  - `onesign apps create`:
    - نام، نوع (confidential/public)، redirect URIs
  - `onesign apps update-redirects`
- Output:
  - clientId, clientSecret (فقط هنگام ساخت)
  - helper برای تولید appsettings / .env snippet

#### US 14.9 – Quickstart Templates

به عنوان Dev Lead  
می‌خواهم نمونه‌های آماده برای هر stack داشته باشم  
تا onboarding تیم را تسریع کنم.

Acceptance:

- چند repo/پروژه نمونه (یا پوشه در repo):
  - `samples/dotnet-api`
  - `samples/node-api`
  - `samples/react-spa`
- هر sample:
  - README کوتاه:
    - قدم ۱: ساخت client (از CLI یا DevPortal)
    - قدم ۲: تنظیم config
    - قدم ۳: run و تست login

---

## 4. Dev Tasks – Backend SDK (.NET & Node)

### 4.1 .NET SDK

**Task B14-1 – ایجاد پروژه `Onesign.Sdk.AspNetCore`**

- Class library با target net10.0
- ساختار:
  - Authentication/
  - Configuration/
  - Claims/

**Task B14-2 – AddOnesignAuthentication Extensions**

- `IServiceCollection.AddOnesignAuthentication(OnesignAuthOptions options)`
- `IApplicationBuilder.UseOnesignAuthentication()`
- خواندن:
  - Authority
  - Audience
- OIDC discovery + JWKS caching

**Task B14-3 – Claims Mapping**

- کلاس mapper:
  - استاندارد mapping برای:
    - sub → UserId
    - tenant_id
    - org_unit_*
    - roles/permissions
- ارائه type-safe accessors, مثلا:
  - `HttpContext.User.GetTenantId()`

**Task B14-4 – نمونه API**

- پروژه Sample:
  - minimal API با `[Authorize]`
  - مستند در README:
    - نصب package
    - config ساده

---

### 4.2 Node SDK

**Task B14-5 – ایجاد package `@onesign/sdk-node`**

- structure:
  - src/auth-middleware.ts
  - src/discovery.ts
  - src/jwks-cache.ts

**Task B14-6 – Auth Middleware**

- `createOnesignAuthMiddleware(config)`:
  - خواندن bearer token
  - استفاده از discovery + JWKS
  - validate:
    - issuer, audience, exp
  - set `req.user` و `req.tenantId`

**Task B14-7 – Discovery & JWKS Cache**

- `discoverOpenIdConfig(authority)`
- `getJwks(authority)`
- caching با TTL و error handling

**Task B14-8 – Sample Express App**

- `/api/secure` با middleware
- README برای راه‌اندازی و تست با onesign tenant

---

## 5. Dev Tasks – React SDK & Samples

### 5.1 React SDK

**Task F14-1 – ایجاد package `@onesign/sdk-react`**

- structure:
  - src/OnesignAuthProvider.tsx
  - src/useOnesignAuth.ts
  - src/OnesignAuthCallback.tsx

**Task F14-2 – AuthProvider و Config**

- props:
  - authority
  - clientId
  - redirectUri
  - postLogoutRedirectUri
- manage:
  - auth state
  - token storage (safe: no localStorage برای refresh، بسته به design security)

**Task F14-3 – Hook و Callback Component**

- `useOnesignAuth()`:
  - state ها و متدها
- `OnesignAuthCallback`:
  - handle OIDC redirect
  - update state
  - redirect به route اصلی

**Task F14-4 – Sample React App**

- صفحه:
  - Login button → redirect
  - Profile page → claims نمایش بدهد
- README:
  - config و run

---

## 6. Dev Tasks – CLI & Sandbox

### 6.1 Sandbox

**Task B14-9 – TenantConfig.IsSandbox**

- اضافه flag به TenantConfig و Db.
- migration لازم.
- استفاده در DevPortal/UI برای برچسب `[SANDBOX]`.

**Task B14-10 – Sandbox Behavior**

- هیچ منطق امنیتی جدا (در این فاز) لازم نیست، ولی:
  - در اسناد واضح شود که sandbox برای تست است.
  - optional: limit روی SMS/Email واقعی.

### 6.2 CLI

**Task B14-11 – onesign-cli اسکلت اولیه**

- ابزار console (مثلا .NET global tool یا Node CLI).
- دستور:
  - `onesign login`:
    - OIDC device code flow یا browser-based login
  - اطلاعات tenant و token در local config ذخیره شود.

**Task B14-12 – Client Management Commands**

- `onesign apps list`
- `onesign apps create`
- `onesign apps update-redirects`
- استفاده از DevPortal/management API های موجود:
  - `/api/tenant/devportal/apps/*` (Phase 8)

**Task B14-13 – Config Generator**

- دستور:
  - `onesign apps generate-config --app <id> --format dotnet|node|react`
- خروجی:
  - snippet آماده:
    - appsettings.json section برای .NET
    - .env برای Node
    - env vars برای React

---

## 7. Cross-cutting Tasks

**Task X14-1 – Versioning & Package Metadata**

- تعریف versioning:
  - SemVer
  - align با core platform version (major).
- metadata:
  - README, description, links to docs.

**Task X14-2 – Docs & Quickstart Pages**

- برای هر SDK:
  - صفحه Quickstart در DevPortal:
    - .NET Backend
    - Node Backend
    - React SPA
- شامل:
  - install
  - configure
  - run
  - troubleshoot

**Task X14-3 – Observability برای SDK Usage (اختیاری اما مفید)**

- لاگ یا metric قابل مشاهده:
  - در DevPortal نشان بده:
    - تعداد appهایی که از SDK رسمی استفاده می‌کنند (بر اساس User-Agent یا config)

---

## 8. نکات طراحی Phase 14

- این فاز feature امنیتی اضافه نمی‌کند، ولی بدونش:
  - هر integration یک پروژه تحقیقاتی جداست.
- هدف این فاز:
  - کاهش **Time To First Login** برای developer به حدود چند دقیقه.
- اشتباه کلاسیک:
  - SDK را بسازی اما:
    - مستندات ناقص.
    - sample ندارید.
    - config سخت و پر از corner case.

Phase 14 باید به این سؤال جواب بدهد:

> “اگر یک تیم جدید فردا خواست اپش را به onesign وصل کند، با نگاه به DevPortal و SDK، بدون سوال از تو، می‌تواند این کار را ظرف یک عصر انجام بدهد یا نه؟”
