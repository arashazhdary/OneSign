# onesign – Phase 16 Privileged Access & Just In Time Access (PAM Lite)

## 1. محدوده Phase 16

### 1.1 هدف کلی

Phase 16 تمرکز دارد روی این که onesign بتواند دسترسی های پرریسک و ادمین را به صورت:

- زمان دار (Just In Time)
- با تایید چندمرحله ای
- قابل مانیتور و audit دقیق

کنترل کند.

اهداف:

- تعریف "Privileged Role" و "Privileged Application"
- Workflow درخواست و تایید دسترسی ادمین بر اساس زمان و ریسک
- Break Glass حساب اضطراری با کنترل و لاگ جدی
- Session level visibility برای دسترسی های حساس

این فاز پل بین AccessRequests، Governance و Security Center است. بدونش، همه چیز روی کاغذ امن است ولی در عمل ادمین ها God mode هستند.

### 1.2 personas

- Security Officer / CISO
  - می خواهد:
    - هیچکس دسترسی دائمی به نقش های ادمین نداشته باشد
    - هر دسترسی ادمین زمان دار و قابل ردیابی باشد
    - Break Glass حساب کنترل شده و محدود داشته باشد

- Privileged Admin (Infra / App Owner / Security Admin)
  - می خواهد:
    - در صورت نیاز بتواند سریع، شفاف و رسمی دسترسی ادمین بگیرد
    - مطمئن باشد بعد از کار، نقش از او برداشته می شود

- Compliance / Auditor
  - می خواهد:
    - گزارش واضح بگیرد:
      - چه کسی
      - چه زمانی
      - روی چه سامانه ای
      - چه دسترسی پرریسکی گرفته
      - با چه تاییدی

---

## 2. معماری و محدوده فنی Phase 16

### 2.1 ماژول logical

این فاز ماژول جدید جدا نمی خواهد، ولی در سطح دامین باید یک زیرماژول در Authorization / Security داشته باشی:

- `Onesign.Modules.Authorization.PrivilegedAccess`
  - PrivilegedRole definitions
  - PrivilegedApp definitions
  - JIT grants
  - BreakGlass accounts

با integration شدید به:

- AccessRequests (Phase 12)
- Authorization / PolicyEngine (Phase 7)
- Security Center (Phase 3)
- Governance / Access Reviews (Phase 10)
- Observability / Audit (Phase 6)
- NotificationCenter (Phase 11)

### 2.2 مفاهیم کلیدی

- Privileged Role  
  نقش هایی که دسترسی پرریسک دارند، مثل:
  - TenantAdmin
  - SecurityOfficer
  - OrgAdmin
  - DatabaseAdmin برای یک app

- Privileged Application  
  اپلیکیشن هایی که دسترسی به داده حساس یا سیستم زیرساخت دارند.

- JIT Grant  
  اعطای موقت نقش پرریسک با:
  - مدت زمانی مشخص
  - دلیل (justification)
  - مسیر تایید

- Break Glass Account  
  حساب اضطراری با:
  - تعداد محدود
  - محافظت شدید
  - فقط برای شرایط Incident
  - الزام به post incident review و rotate credential

---

## 3. Epics و User Storyها – Phase 16

### Epic 1 – تعریف Privileged Roles و Apps

#### US 16.1 – علامت گذاری نقش های Privileged

به عنوان Security Officer  
می خواهم بتوانم نقش هایی را به عنوان Privileged علامت بزنم  
تا روی آنها کنترل ویژه اعمال شود.

Acceptance:

- برای Role در Authorization module:
  - فیلد IsPrivileged
  - Optional: RiskLevel (High, Critical)
- API:
  - `PUT /api/tenant/authorization/roles/{id}/privileged`
    - تغییر IsPrivileged و RiskLevel
- در PolicyEngine:
  - امکان تشخیص اینکه یک role privileged است

#### US 16.2 – علامت گذاری اپلیکیشن های Privileged

به عنوان Security Officer  
می خواهم بعضی ApplicationClient ها را privileged اعلام کنم  
تا درخواست دسترسی به آنها سختگیرانه تر باشد.

Acceptance:

- در Application registry:
  - فیلد IsPrivilegedApp
  - Optional RiskLevel
- API:
  - `PUT /api/tenant/applications/{id}/privileged`
- Integration:
  - AccessRequests و Governance بدانند که این app privileged است

---

### Epic 2 – Just In Time Privileged Access

#### US 16.3 – JIT Request برای Privileged Role

به عنوان Admin یا Engineer  
می خواهم بتوانم برای نقش های privileged، دسترسی موقت درخواست کنم  
تا دسترسی دائمی نداشته باشم.

Acceptance:

- Extended AccessRequests (Phase 12):
  - نوع جدید AccessRequestItem:
    - TargetType = PrivilegedRole
- فیلد اضافه:
  - DurationRequested (مثلا 1 ساعت، 4 ساعت، 1 روز)
- Policy:
  - حداقل duration و حداکثر duration per role
- Workflow:
  - مثل AccessRequests، اما:
    - الزامی برای justification
    - حداقل یک approver security یا owner

#### US 16.4 – JIT Grant Engine

به عنوان سیستم  
می خواهم وقتی یک درخواست JIT برای privileged role approved شد  
نقش موقت به کاربر داده شود و بعد از مدت تعیین شده برداشته شود.

Acceptance:

- روی Approve در AccessRequests برای PrivilegedRole:
  - ثبت JITGrant record:
    - UserId
    - RoleId
    - GrantedAt
    - ExpiresAt
    - ApprovedBy
    - RequestId
  - call Authorization برای assign role
- Background job:
  - JIT expiry worker:
    - پیدا کردن JITGrant های منقضی
    - remove role via Authorization
    - ثبت audit "PrivilegedAccess.JITExpired"
- اگر تامین نشود:
  - نقش privileged بعد از زمان مقرر قطع نمی شود و این فاز بی ارزش است

---

### Epic 3 – Break Glass Accounts

#### US 16.5 – تعریف BreakGlass Account

به عنوان Security Officer  
می خواهم چند حساب BreakGlass تعریف کنم  
تا در مواقع Incident، حتی اگر SSO مشکل داشت بتوانم وارد شوم.

Acceptance:

- Entity جدید در Security module:
  - BreakGlassAccount:
    - Id
    - Username
    - IsEnabled
    - AllowedScopes (کدام tenant ها, چه نقش هایی)
    - LastUsedAt
- این حساب ها:
  - احراز هویت خاص (مثلا local credential / HSM integrated)
  - خارج از جریان معمول IdP اما با audit بسیار سختگیرانه

#### US 16.6 – Policy روی BreakGlass Usage

به عنوان CISO  
می خواهم استفاده از BreakGlass محدود و کاملا track شود  
تا از حالت "در پشتی" uncontrolled خارج نشود.

Acceptance:

- Policy:
  - require justification text هنگام login
  - optional: require ticket id (مثلا from external incident system)
- روی هر login BreakGlass:
  - Audit:
    - "PrivilegedAccess.BreakGlassLogin"
    - با ip, useragent, target tenant
  - Notification:
    - realtime notify SecurityOfficerها

---

### Epic 4 – Session Visibility و Security Center integration

#### US 16.7 – لیست Session های Privileged

به عنوان Security Officer  
می خواهم همه sessionهای فعال کاربران با دسترسی privileged را ببینم  
تا در صورت نیاز بتوانم kill کنم.

Acceptance:

- API:
  - `GET /api/tenant/security/privileged-sessions`
- داده:
  - UserId
  - UserDisplayName
  - Roles privileged
  - Apps حساس که در session درگیرند
  - Login time, last activity
- Action:
  - `POST /api/tenant/security/privileged-sessions/{sessionId}/revoke`

#### US 16.8 – Security Center – Privileged Access View

به عنوان Security Officer  
می خواهم در Security Center یک view ویژه برای privileged access داشته باشم  
تا ریسک کلی را ببینم.

Acceptance:

- در Security Center (Phase 3):
  - صفحه یا section "Privileged Access"
- نمایش:
  - تعداد کاربران دارای privileged roles دائمی
  - تعداد JIT grants فعال
  - تعداد BreakGlass logins در بازه زمانی
  - کارت یا جدول session های فعال privileged

---

### Epic 5 – Governance و Review برای Privileged Access

#### US 16.9 – Campaign ویژه Privileged Access Review

به عنوان Governance Officer  
می خواهم برای role های privileged، campaign review جدا داشته باشم  
تا آنها را با سختگیری بیشتری بررسی کنم.

Acceptance:

- در Governance module (Phase 10):
  - امکان تعریف campaign مخصوص privileged roles
- Campaign:
  - فقط کاربران دارای privileged roles
  - cadence کوتاه تر (مثلا ماهانه)
- نتایج:
  - اگر on review access رد شد:
    - revoke role via Authorization
    - log "PrivilegedAccess.RevokedByReview"

---

## 4. Dev Tasks – Backend

### 4.1 Data Model و Entities جدید

**Task B16-1 – تمدید مدل Role و Application برای Privileged**

- اضافه فیلد به Role:
  - IsPrivileged bit
  - RiskLevel (tinyint یا enum)
- اضافه فیلد به Application (Client):
  - IsPrivilegedApp
  - RiskLevel
- Migration Phase 16

**Task B16-2 – JITGrant Entity**

- جدول:
  - Id
  - TenantId
  - UserId
  - RoleId
  - GrantedAt
  - ExpiresAt
  - ApprovedByUserId
  - RequestId (link به AccessRequest)
  - Status (Active, Expired, Revoked)
- Index:
  - TenantId + UserId + Status
  - TenantId + ExpiresAt

**Task B16-3 – BreakGlassAccount Entity**

- جدول:
  - Id
  - Username
  - IsEnabled
  - AllowedTenants (json یا join table)
  - AllowedRoles (json یا join table)
  - LastUsedAt
- Index:
  - Username unique

### 4.2 JIT Integration با AccessRequests و Authorization

**Task B16-4 – Extended AccessRequestItem برای PrivilegedRole**

- اضافه TargetType = PrivilegedRole
- فیلد:
  - DurationRequestedMinutes
- Validation:
  - Duration در بازه مجاز per role

**Task B16-5 – JITGrant Service**

سرویس:

- `IPrivilegedAccessService` یا مشابه:
  - `Task<JitGrantDto> CreateJitGrantAsync(accessRequestItem, approvedBy)`
  - `Task ExpireJitGrantAsync(Guid jitGrantId)`
  - `Task<IReadOnlyList<JitGrantDto>> GetActiveGrantsForUserAsync(...)`

Behavior:

- CreateJitGrant:
  - validate:
    - role IsPrivileged
  - create JITGrant
  - call Authorization service:
    - assign role to user
  - audit:
    - "PrivilegedAccess.JITGranted"

**Task B16-6 – JIT Expiry Worker**

- Background service:
  - periodic scan:
    - find Active JITGrant with ExpiresAt < now
  - for each:
    - call PrivilegedAccessService.ExpireJitGrantAsync
      - remove role via Authorization
      - set Status = Expired
      - audit "PrivilegedAccess.JITExpired"

### 4.3 BreakGlass Flow

**Task B16-7 – BreakGlass Authentication Integration**

- در auth pipeline:
  - امکان login با BreakGlassAccount:
    - path خاص (مثلا `/auth/breakglass`)
    - استفاده از credential store امن (local hashed or HSM backed, بسته به design)
- محدودیت ها:
  - فقط برای tenant هایی که در AllowedTenants هستند
- روی login موفق:
  - assign temporary high level access طبق AllowedRoles
  - audit:
    - "PrivilegedAccess.BreakGlassLogin" با:
      - time, tenant, ip, userAgent, justification, ticketId
  - notify SecurityOfficer via NotificationCenter

**Task B16-8 – BreakGlass Admin APIs**

- `GET /api/tenant/security/breakglass-accounts`
- `POST /api/tenant/security/breakglass-accounts`
- `PUT /api/tenant/security/breakglass-accounts/{id}`
- `DELETE /api/tenant/security/breakglass-accounts/{id}` (disable)

### 4.4 Privileged Sessions و Security Center

**Task B16-9 – Privileged Session Query Service**

- بر اساس مدل session موجود:
  - تابع:
    - `Task<IReadOnlyList<PrivilegedSessionDto>> GetActivePrivilegedSessionsAsync(Guid tenantId)`
- PrivilegedSessionDto:
  - SessionId
  - UserId, DisplayName
  - PrivilegedRoles
  - StartedAt
  - LastActivityAt
  - ClientAppIds

**Task B16-10 – Session Revoke API**

- `POST /api/tenant/security/privileged-sessions/{sessionId}/revoke`
  - revoke session و tokens
  - audit "PrivilegedAccess.SessionRevokedByAdmin"

---

## 5. Dev Tasks – Frontend / Admin Portal

### 5.1 علامت گذاری Privileged Roles و Apps

**Task F16-1 – Role List – Privileged Flag**

- در صفحه مدیریت Roles:
  - ستون:
    - Privileged (badge)
  - filter برای فقط privileged
- فرم Role:
  - toggle IsPrivileged
  - انتخاب RiskLevel

**Task F16-2 – Application List – Privileged Flag**

- در صفحه Applications:
  - ستون:
    - PrivilegedApp badge
  - فرم:
    - toggle IsPrivilegedApp
    - RiskLevel

### 5.2 Security Center – Privileged Access View

**Task F16-3 – Security Center Privileged Dashboard**

مسیر: `/tenant/security/privileged`

- نمایش:
  - card: تعداد کاربران دارای privileged roles دائمی
  - card: تعداد JIT grants فعال
  - card: تعداد BreakGlass logins در 30 روز اخیر
  - جدول:
    - Active Privileged Sessions:
      - User, Roles, LoginTime, LastActivity
      - action: Revoke

### 5.3 BreakGlass Management UI

**Task F16-4 – BreakGlass Accounts Page**

مسیر: `/tenant/security/breakglass-accounts` (یا GlobalAdmin section)

- لیست:
  - Username
  - IsEnabled
  - LastUsedAt
- فرم:
  - Username
  - AllowedTenants (اگر global view)
  - AllowedRoles
  - Enabled toggle
- هشدار شدید (banner) در UI که:
  - استفاده از این حساب ها فقط برای اضطرار است

---

## 6. Cross Cutting – Governance, Observability, Security

**Task X16-1 – Governance Integration**

- Campaign templates:
  - Campaign مخصوص privileged roles:
    - از Phase 10، یک template predefined با filter روی IsPrivileged roles
- در UI Governance:
  - toggle "Privileged Only"

**Task X16-2 – Observability و Metrics**

- metrics:
  - count JIT grants created, active, expired
  - count BreakGlass logins
  - count privileged sessions
- log:
  - همه events key:
    - JITGranted, JITExpired, BreakGlassLogin, SessionRevokedByAdmin

**Task X16-3 – Security و Hardening**

- محدود کردن:
  - کسانی که می توانند:
    - IsPrivileged را تغییر دهند
    - BreakGlass accounts را مدیریت کنند
  - فقط SecurityOfficer/GlobalAdmin
- rate limit ویژه برای BreakGlass login endpoint
- enforce MFA سختگیرانه برای:
  - کسانی که privileged roles را approve می کنند
  - استفاده از BreakGlass (اگر با SSO ترکیب شده)

**Task X16-4 – Localization**

- کل UI های جدید:
  - labels:
    - Privileged Role
    - Just In Time Access
    - Break Glass
    - Risk Level
  - همه با i18n key و ترجمه فارسی.

---

## 7. نکات طراحی Phase 16

- این فاز فرق بین "SSO خوب" و "پلتفرم امنیتی جدی" است.
- اگر بعد از این فاز:
  - ادمین ها هنوز privileged roles دائمی دارند
  - session های privileged را نمی توانی ببینی و kill کنی
  - BreakGlass بدون audit و notification است

یعنی Phase 16 را کشتی و فقط قیافه درست کردی.

هدف Phase 16:

> هر دسترسی پرریسک باید زمان دار، قابل توجیه، قابل audit و قابل قطع فوری باشد. هر چیز کمتر از این، حفره است نه فیچر.
