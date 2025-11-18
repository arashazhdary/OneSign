# onesign – Phase 8 Developer Experience & Integration Portal

## 1. محدوده Phase 8

### 1.1 هدف کلی

Phase 8 تمرکز دارد روی این‌که onesign از دید Developer به یک **محصول قابل‌استفاده و خوش‌دست** تبدیل شود:

- Developer / Integrator Portal مستقل
- Dynamic Client Registration و مدیریت Application از دید dev
- API Keys / Service Accounts برای integration بک‌اند به بک‌اند
- SDKهای رسمی (Backend .NET, Node.js, Frontend React)
- Sample Apps و Quickstart flows
- Token Debugger, Log Snippets و Webhook Tester

اگر این‌ها را نداشته باشی، از دید مشتری Enterprise:

- «SSO‌ت قشنگه، اما devهای ما نمی‌تونن باهاش سریع integrate کنن»  
یعنی باخت.

### 1.2 چه چیزهایی اضافه می‌شود

Personas:

- **App Developer / Integrator** (قبلاً هم داشتی، الان واقعاً براش portal می‌سازی)
  - داشبورد مخصوص خودش (نه Admin Portal tenant)
  - ایجاد/مدیریت Client‌ها و API Key ها
  - دریافت snippet کد آماده (SDK + مثال)
  - دیدن errorهای integration خودش

- **Tenant Admin**
  - کنترل می‌کند کدام devها اجازه دارند روی tenant او app تعریف کنند
  - می‌تواند scopes و محدودیت‌ها را تنظیم کند

Key features Phase 8:

- Developer Portal (multi-tenant-aware)
- Developer identity و roles (Dev, Integrator)
- Application/Client Management از دید Dev
- API Keys / Service Accounts
- SDK packages structure (حتی اگر publish را ببری فاز بعد، ساختار و سورس باید آماده شود)
- Quickstart docs (multi-language)
- Token Debugger و Log View برای dev

### 1.3 چه چیزهایی عمداً در Phase 8 نیست

چیزهایی که **فعلاً نمی‌زنیم**:

- Marketplace کامل برای third-party apps
- Billing integration پیچیده روی استفاده SDK (فازهای بعد)
- Versioning خیلی پیچیده برای SDK (چند major در کنار هم)

Phase 8 فقط:

- Dev Portal
- Integration UX
- SDK + نمونه کدهای قابل استفاده واقعی

---

## 2. معماری و ماژول‌ها

### 2.1 ماژول DevPortal / DeveloperExperience

اضافه کن:

- `Onesign.Modules.DevPortal`

ساختار:

```text
Onesign.Modules.DevPortal/
  Domain/
    Entities/
      DeveloperAccount.cs
      DeveloperTenantAccess.cs
      IntegrationApplication.cs      // view از ApplicationClient + تنظیمات dev
      ApiKey.cs                      // برای Backend-to-backend
      ServiceAccount.cs              // non-human principal
      WebhookEndpoint.cs             // برای eventها (اختیاری در این فاز، فقط config ساده)
    Enums/
      ApiKeyStatus.cs                // Active, Revoked
      WebhookStatus.cs               // Active, Disabled
    Services/
      IDeveloperOnboardingService.cs
      IIntegrationApplicationService.cs
      IApiKeyService.cs
      IWebhookEndpointService.cs
    Repositories/
      IDeveloperAccountRepository.cs
      IIntegrationApplicationRepository.cs
      IApiKeyRepository.cs
      IWebhookEndpointRepository.cs
  Application/
    DTOs/
      DeveloperProfileDto.cs
      DeveloperTenantAccessDto.cs
      IntegrationApplicationDto.cs
      CreateIntegrationApplicationRequest.cs
      UpdateIntegrationApplicationRequest.cs
      ApiKeyDto.cs
      CreateApiKeyRequest.cs
      ServiceAccountDto.cs
      CreateServiceAccountRequest.cs
      WebhookEndpointDto.cs
      CreateWebhookEndpointRequest.cs
      UpdateWebhookEndpointRequest.cs
      TokenDebugRequestDto.cs
      TokenDebugResultDto.cs
    Commands/
      CreateDeveloperAccountCommand.cs
      GrantDeveloperTenantAccessCommand.cs
      CreateIntegrationApplicationCommand.cs
      UpdateIntegrationApplicationCommand.cs
      CreateApiKeyCommand.cs
      RevokeApiKeyCommand.cs
      CreateServiceAccountCommand.cs
      CreateWebhookEndpointCommand.cs
      UpdateWebhookEndpointCommand.cs
      DeleteWebhookEndpointCommand.cs
      DebugTokenCommand.cs
    Queries/
      GetDeveloperProfileQuery.cs
      GetDeveloperTenantAccessListQuery.cs
      GetIntegrationApplicationsQuery.cs
      GetIntegrationApplicationDetailsQuery.cs
      GetApiKeysQuery.cs
      GetServiceAccountsQuery.cs
      GetWebhookEndpointsQuery.cs
  Infrastructure/
    EfCore/Entities/
      DeveloperAccountEntity.cs
      DeveloperTenantAccessEntity.cs
      IntegrationApplicationEntity.cs
      ApiKeyEntity.cs
      ServiceAccountEntity.cs
      WebhookEndpointEntity.cs
    EfCore/Configurations/
      DeveloperAccountEntityTypeConfiguration.cs
      DeveloperTenantAccessEntityTypeConfiguration.cs
      IntegrationApplicationEntityTypeConfiguration.cs
      ApiKeyEntityTypeConfiguration.cs
      ServiceAccountEntityTypeConfiguration.cs
      WebhookEndpointEntityTypeConfiguration.cs
    EfCore/Repositories/
      DeveloperAccountRepository.cs
      IntegrationApplicationRepository.cs
      ApiKeyRepository.cs
      WebhookEndpointRepository.cs


توجه: IntegrationApplication از نظر بیزنسی wrapper روی ApplicationClient‌ ماژول Applications است، اما با metadata مخصوص Dev (مثل notes، environments، sandbox flags).

2.2 Developer Account و Tenant Access

DeveloperAccount

public class DeveloperAccount
{
    public Guid Id { get; private set; }

    public string UserId { get; private set; }          // link to GlobalUser or Identity user
    public string DisplayName { get; private set; }
    public string Email { get; private set; }

    public DateTime CreatedAt { get; private set; }
}


DeveloperTenantAccess

public class DeveloperTenantAccess
{
    public Guid Id { get; private set; }

    public Guid DeveloperAccountId { get; private set; }
    public Guid TenantId { get; private set; }

    public bool CanManageApplications { get; private set; }
    public bool CanManageApiKeys { get; private set; }
    public bool CanViewLogs { get; private set; }
}

2.3 API Keys و Service Accounts

ServiceAccount

public class ServiceAccount
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; }

    public string Description { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public bool IsActive { get; private set; }
}


ApiKey

public class ApiKey
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }
    public Guid ServiceAccountId { get; private set; }

    public string KeyHash { get; private set; }        // never store plain key
    public DateTime CreatedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }

    public ApiKeyStatus Status { get; private set; }   // Active, Revoked
}


در زمان ساخت ApiKey، فقط یکبار plain key را برگردان و در DB hash شده نگه دار.

3. Epics و User Storyها – Phase 8
Epic 1 – Developer Onboarding & Portal
US 1.1 – DeveloperProfile و دسترسی‌ها

به عنوان App Developer
می‌خواهم یک پروفایل dev داشته باشم و ببینم روی کدام tenantها اجازه‌ی integration دارم
تا بدانم کجا می‌توانم app ثبت کنم.

Acceptance:

DeveloperProfile:

DisplayName, Email

لیست Tenantهایی که dev روی آن‌ها access دارد

TenantAdmin می‌تواند از داخل Admin Portal:

یک user را به عنوان Developer برای tenant خودش تعریف کند

سطح دسترسی: manage apps / manage api keys / view logs

Endpointها:

GET /api/devportal/profile

GET /api/devportal/tenants-access

US 1.2 – Developer Dashboard

به عنوان App Developer
می‌خواهم یک داشبورد ساده ببینم که همه‌ی app‌ها و keys من روی یک tenant را نشان دهد
تا نقطه شروع واضحی برای integration داشته باشم.

Acceptance:

صفحه /devportal/dashboard (frontend جدید یا بخش ویژه در Admin Portal با layout dev)

Tenant selector (برای devهایی که چند tenant دارند)

کارت‌ها:

Applications

API Keys

Webhooks

Quickstart links

Epic 2 – Integration Applications (Client Management از دید Dev)
US 2.1 – ایجاد Application برای یک tenant

به عنوان App Developer
می‌خواهم برای tenant انتخاب شده، یک app ثبت کنم و clientId/secret بگیرم
تا بتوانم OIDC flow را راه بیندازم.

Acceptance:

IntegrationApplication:

لینک به ApplicationClient موجود (Phase 1)

Name, Description

Environment: Sandbox/Production flag

Redirect URIs

Allowed Grants (AuthorizationCode + PKCE, RefreshToken, …)

When dev creates an app:

پشت صحنه:

ApplicationClient در ماژول Applications ساخته شود

تنظیمات tenant و Policy/Scopes حداقلی ست شود

Endpoint:

GET /api/devportal/apps

GET /api/devportal/apps/{id}

POST /api/devportal/apps

PUT /api/devportal/apps/{id}

DELETE /api/devportal/apps/{id} (اگر هنوز استفاده نشده/قابلیت حذف تعریف شود)

US 2.2 – نمایش Client Credentials

به عنوان App Developer
می‌خواهم clientId را همیشه ببینم و clientSecret را در زمان ایجاد/rotate دریافت کنم
تا بتوانم امن با onesign صحبت کنم.

Acceptance:

On creation:

clientId + clientSecret (یکبار نمایش secret)

On rotate:

Endpoint:

POST /api/devportal/apps/{id}/rotate-secret

Secret جدید فقط یکبار نمایش داده شود

Secret در DB به شکل امن (hash یا encrypted) نگهداری شود.

Epic 3 – API Keys و Service Accounts
US 3.1 – ساخت ServiceAccount

به عنوان Tenant Admin یا Dev با permission لازم
می‌خواهم ServiceAccount بسازم
تا برای backend-to-backend، به جای user واقعی از آن استفاده کنم.

Acceptance:

Create ServiceAccount:

Name, Description

Allowed scopes (محدود)

Endpoint:

GET /api/devportal/service-accounts

POST /api/devportal/service-accounts

PUT /api/devportal/service-accounts/{id}

DELETE /api/devportal/service-accounts/{id} (اگر دیگر استفاده نمی‌شود)

US 3.2 – ساخت و مدیریت API Key

به عنوان App Developer
می‌خواهم برای ServiceAccount، API Key بسازم
تا از طرف backend سیستم خودم API های onesign را مصرف کنم.

Acceptance:

ساخت ApiKey:

POST /api/devportal/service-accounts/{id}/api-keys

ExpiresAt اختیاری

خروجی:

PlainKey (فقط در response)

مشاهده لیست:

GET /api/devportal/api-keys

Revoke:

POST /api/devportal/api-keys/{id}/revoke

ApiKey داخلی:

روی Callهای API‌ از طریق middleware احراز هویت شود

TenantId و ServiceAccount از روی key resolve شوند

Observability:

هر استفاده از ApiKey باید در AuditLogs (Phase 6) ثبت شود.

Epic 4 – SDKها و Quickstart
US 4.1 – SDK Backend .NET

به عنوان Backend .NET Developer
می‌خواهم یک SDK رسمی برای onesign داشته باشم
تا لازم نباشد هر بار دستی OIDC/Token/Introspection را بنویسم.

Acceptance:

پروژه جدید:

sdk/dotnet/Onesign.Sdk (یا چیزی مشابه)

قابلیت‌ها:

Client برای:

Token endpoint

Introspection

UserInfo

helper برای config:

Authority

ClientId/Secret

Scopes

این فاز:

سورس کامل و قابل استفاده در solution

نیازی به publish به NuGet در همین فاز نیست (می‌تواند فاز بعدی باشد، ولی آماده publish باشد).

US 4.2 – SDK JavaScript/TypeScript (Frontend React)

به عنوان Frontend React Developer
می‌خواهم یک SDK سبک برای کاری مثل login redirect, token storage, silent refresh داشته باشم
تا سریع بتونم SPA را وصل کنم.

Acceptance:

پروژه:

sdk/js/onesign-sdk (داخل repo، ساختار npm-ready)

قابلیت‌ها:

loginRedirect

handleRedirectCallback

getAccessToken / getIdToken

logout

config چند tenant (بر اساس domain)

هماهنگی با Login Portal flow موجود.

US 4.3 – Quickstart Samples

به عنوان dev که عجله دارد
می‌خواهم چند نمونه با سورس روشن داشته باشم
تا با copy/paste سریع به نتیجه برسم.

Acceptance:

چند نمونه:

samples/dotnet-webapp-onesign

samples/react-spa-onesign

هر sample:

README دو زبانه (en/fa) با مراحل:

ساخت tenant

ساخت app

تنظیم redirect

اجرای sample

config قابل تنظیم از Dev Portal (clientId/redirectUrl)

Epic 5 – Token Debugger و Log View برای dev
US 5.1 – Token Debugger

به عنوان App Developer
می‌خواهم یک ابزار داشته باشم که token‌هایی که از onesign گرفته‌ام را decode و صحت‌سنجی کند
تا راحت بفهمم چرا integration من کار نمی‌کند.

Acceptance:

در Dev Portal:

صفحه /devportal/tools/token-debugger

input: JWT token

output:

Header/Payload decoded

امضای token معتبر است یا نه

tenant, clientId, scopes

expiry, notBefore

Backend:

POST /api/devportal/tools/token-debug

TokenDebugRequestDto

TokenDebugResultDto

از کلیدهای signing فعلی onesign برای validate استفاده کند.

US 5.2 – Log Snippets per app

به عنوان App Developer
می‌خواهم در صفحه app خودم، آخرین خطاهای مرتبط با آن app را ببینم
تا راحت‌تر دیباگ کنم.

Acceptance:

در صفحه details هر IntegrationApplication:

تب "Logs"

نمایش چند event اخیر از Audit/Observability مرتبط با همان clientId:

login fail

invalid redirect_uri

policy deny

Endpoint:

GET /api/devportal/apps/{id}/logs?take=50

4. Dev Tasks – Backend
4.1 Database و Entities

Task B8-1 – اضافه کردن Entities DevPortal

ایجاد Entities و mappings در Infrastructure:

DeveloperAccountEntity

DeveloperTenantAccessEntity

IntegrationApplicationEntity

ApiKeyEntity

ServiceAccountEntity

WebhookEndpointEntity

Task B8-2 – DbContext و Indexها

DbSet های جدید در OnesignDbContext

Indexها:

DeveloperAccount: unique Email یا UserId

DeveloperTenantAccess: unique (DeveloperAccountId, TenantId)

ApiKey: index روی (TenantId, ServiceAccountId, Status)

ServiceAccount: index روی (TenantId, Name)

IntegrationApplication: index روی (TenantId, ClientId)

Task B8-3 – Migration Phase 8

ساخت همه جداول DevPortal

بدون تغییر destructive روی جداول قبلی.

4.2 Services

Task B8-4 – IDeveloperOnboardingService

ساخت DeveloperAccount از user موجود (وقتی tenant admin او را dev می‌کند).

مدیریت DeveloperTenantAccess:

Grant / revoke access per tenant.

متدها:

EnsureDeveloperAccountForUserAsync(userId, email, displayName)

GrantAccessAsync(developerId, tenantId, permissions)

GetDeveloperTenantsAsync(userId)

Task B8-5 – IIntegrationApplicationService

ایجاد IntegrationApplication:

ایجاد/آپدیت ApplicationClient در ماژول Applications

sync redirectUrls, grants, scopes.

متدها:

CreateApplicationAsync(tenantId, request)

UpdateApplicationAsync(appId, request)

RotateSecretAsync(appId)

GetForTenantAsync(tenantId)

GetDetailsAsync(appId)

Task B8-6 – IApiKeyService

ساخت ApiKey:

generate secure random key

hash it

ذخیره ApiKeyEntity

برگرداندن plain key یکبار

Validate ApiKey:

برای middleware auth

Task B8-7 – IWebhookEndpointService (اگر در این فاز فقط config لازم است)

CRUD ساده برای WebhookEndpoint

integration اصلی event push می‌تواند فاز بعدی باشد؛ ولی endpoint برای ثبت config باید کامل باشد.

Task B8-8 – Token Debug Service

decode و validate JWT:

بررسی امضا

expiry

audience/clientId

tenantId

برگرداندن TokenDebugResultDto.

4.3 API Endpoints – DevPortal

Base: /api/devportal

Task B8-9 – Developer Profile & Tenants

GET /api/devportal/profile

GET /api/devportal/tenants-access

Task B8-10 – Integration Applications

GET /api/devportal/apps

GET /api/devportal/apps/{id}

POST /api/devportal/apps

PUT /api/devportal/apps/{id}

DELETE /api/devportal/apps/{id}

POST /api/devportal/apps/{id}/rotate-secret

GET /api/devportal/apps/{id}/logs

Task B8-11 – Service Accounts & API Keys

Service Accounts:

GET /api/devportal/service-accounts

POST /api/devportal/service-accounts

PUT /api/devportal/service-accounts/{id}

DELETE /api/devportal/service-accounts/{id}

API Keys:

GET /api/devportal/api-keys

POST /api/devportal/service-accounts/{id}/api-keys

POST /api/devportal/api-keys/{id}/revoke

Task B8-12 – Webhook Endpoints

GET /api/devportal/webhooks

POST /api/devportal/webhooks

PUT /api/devportal/webhooks/{id}

DELETE /api/devportal/webhooks/{id}

Task B8-13 – Tools (Token Debugger)

POST /api/devportal/tools/token-debug

4.4 Integration با Security / Observability

Task B8-14 – ApiKey Authentication Middleware

Middleware یا handler برای:

گرفتن ApiKey از header (مثلاً X-Onesign-ApiKey)

validate از طریق IApiKeyService

set TenantId, ServiceAccount در context

محدود کردن این نوع auth فقط برای endpoints مناسب (REST APIهای SSO، نه admin داخلی).

Task B8-15 – Audit Logs برای Dev Events

با استفاده از IAuditWriter (Phase 6):

"DevPortal.App.Created"

"DevPortal.App.SecretRotated"

"DevPortal.ApiKey.Created"

"DevPortal.ApiKey.Revoked"

"DevPortal.Webhook.Created"

Category = Integration / DeveloperExperience

5. Dev Tasks – Frontend (Developer Portal UI)
5.1 – ساخت Dev Portal Shell

Task F8-1 – ساخت layout DevPortal

route base:

/devportal/*

Layout:

Tenant selector

Navigation:

Dashboard

Applications

API Keys / Service Accounts

Webhooks

Tools (Token Debugger)

Docs / Quickstart links

5.2 – صفحات اصلی

Task F8-2 – Dashboard

نمایش:

تعداد apps، api keys، webhooks

cardهای Quickstart:

".NET Backend Quickstart"

"React SPA Quickstart"

"API Key integration"

Task F8-3 – Applications Page

/devportal/apps

جدول:

Name

clientId

Environment (Sandbox/Production)

last updated

actions:

New App

Edit

Delete

صفحه App Details:

Overview:

Name, Description, clientId, redirectUris

Environment

Credentials:

clientId همیشه

clientSecret فقط در ساخت یا rotate

Logs tab:

آخرین auditهای مرتبط با این app

Task F8-4 – Service Accounts & API Keys

/devportal/service-accounts

لیست ServiceAccountها

Create/Edit:

Name, Description, AllowedScopes

/devportal/api-keys

لیست ApiKeyها:

ServiceAccountName

CreatedAt

ExpiresAt

Status (Active/Revoked)

Create Key (از روی ServiceAccount):

نمایش plainKey در modal (قابل copy)

Task F8-5 – Webhooks UI

/devportal/webhooks

لیست endpoints:

Url

Status

Events subscribed (اگر در این فاز simple list است، حداقل placeholder)

CRUD کامل

5.3 – Tools

Task F8-6 – Token Debugger UI

/devportal/tools/token-debugger

Textarea برای JWT

دکمه "Decode & Verify"

نمایش:

Header/Payload JSON (beautified)

Valid/Invalid signature

Expiry، Issuer، Audience، TenantId، ClientId، Scopes

6. Cross-cutting Tasks

Task X8-1 – Multi-language

تمام UI Dev Portal دو زبانه (en/fa).

متن‌های حساس (warning درباره not storing secret again، جملات امنیتی) با message code.

Task X8-2 – Security

DevPortal endpoints فقط برای userهایی که:

DeveloperAccount دارند

DeveloperTenantAccess مناسب برای آن tenant دارند

Tenant Admin UI برای مدیریت dev access:

(اگر در فاز قبلی جایش خالی است، حداقل:

در Admin Portal → Tenant Users → assign "Developer" permissions)

Task X8-3 – DX polish

همه‌ی Quickstartها در UI:

لینک به sampleها در repo

display clientId/redirectUrl که باید در sample تنظیم شود

Error messages برای dev:

واضح، بدون لو دادن info حساس.

قابل trace در Observability.

7. نکات طراحی Phase 8

Dev Portal اگر نصفه و بی‌ربط به بقیه فازها پیاده شود، بیشتر از این که کمک کند، آبروریزی می‌کند.

Developer UX مستقیم روی این اثر دارد که مشتری اصلاً حاضر می‌شود onesign را integrate کند یا نه.

ApiKey و ServiceAccount را از نظر امنیتی جدی بگیر؛ اگر این قسمت شل باشد، کل platform زیر سوال می‌رود.

SDKها باید واقعاً usable باشند؛ فقط چند wrapper مسخره روی HttpClient به اسم SDK نده.

