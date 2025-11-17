# onesign – Phase 19 Extensibility & Hooks Platform

## 1. محدوده Phase 19

### 1.1 هدف کلی

Phase 19 تمرکز دارد روی این که onesign از یک محصول ثابت، تبدیل شود به یک **پلتفرم قابل توسعه**:

- پشتیبانی از **Event & Webhook**‌های استاندارد (user.created, login.succeeded, token.issued, …)
- **Inline Actions / Hooks** در جریان:
  - Login
  - Token issuance (claims enrichment / transformation)
  - Lifecycle / AccessRequests
- UI برای مدیریت این Hooks و Webhookها در Admin Portal و DevPortal
- Guardrailهای امنیتی تا مشتری نتواند با یک اسکریپت خراب، کل SSO را بترکاند

اگر این فاز را نزنی، هر تغییری مشتری بخواهد باید در Core کد بزنی؛ یعنی از روز اول بدهی فنی.

### 1.2 Personas

- **Tenant Admin / IAM Owner**
  - می‌خواهد:
    - روی eventهای مهم (user created, password reset, access granted) Webhook بزند.
    - بتواند login flow را کمی customize کند بدون این که core را عوض کند.

- **App Developer / Integrator**
  - می‌خواهد:
    - روی token و claims کنترل بیشتری داشته باشد:
      - mapping نقش‌های داخلی به claims
      - اضافه کردن custom attributes
    - event-driven integration با سامانه‌های خودش.

- **Security Officer**
  - می‌خواهد:
    - مطمئن باشد inline hookها:
      - قابل audit هستند
      - timeout دارند
      - نمی‌توانند به راحتی login flow را نابود کنند.

---

## 2. معماری کلی Phase 19

### 2.1 ماژول جدید: Extensibility & Hooks

ماژول منطقی:

- `Onesign.Modules.Extensibility`

زیرماژول‌ها:

- Event & Webhook Publishing
- Inline Actions Engine (Login / Token / Lifecycle hooks)
- Admin APIs & UI
- DevPortal تجمیع hook/event docs

### 2.2 مفاهیم کلیدی

- **Domain Event** (درون سیستم):
  - UserCreated
  - UserUpdated
  - UserDeleted
  - LoginSucceeded / LoginFailed
  - TokenIssued / TokenRevoked
  - AccessRequestApproved / AccessRequestDenied
  - LifecycleEventTriggered (Joiner/Mover/Leaver)
  - PrivilegedJitGranted / Expired
  - …

- **EventType** (برای Webhook و اکشن):
  - string / enum پایدار، مثل:
    - `identity.user.created`
    - `auth.login.succeeded`
    - `auth.token.issued`
    - `governance.accessreview.completed`
    - …

- **WebhookSubscription**
  - tenant-specific:
    - چه EventTypeهایی
    - به چه URLی
    - با چه secretی (HMAC)

- **Inline Action / Hook**
  - تعریف per tenant:
    - در چه نقطه‌ای:
      - pre-login / post-login
      - pre-token-issue / post-token-issue
      - pre-lifecycle / pre-access-request-approve
    - نوع:
      - outbound call (HTTP)
      - claims transformation rule (rule-based، نه لزوما کد arbitrary)
  - رفتار:
    - input: context (user, tenant, app, claims)
    - output:
      - modified claims / flags (مثلاً denyLogin, extraClaims)
      - یا نه، فقط side-effect (برای HTTP call)

---

## 3. Epics و User Storyها – Phase 19

### Epic 1 – Event & Webhook Platform

#### US 19.1 – ثبت Webhook per Tenant

به عنوان Tenant Admin  
می‌خواهم بتوانم برای tenant خودم یک Webhook ثبت کنم  
تا وقتی eventهایی مثل `identity.user.created` رخ می‌دهند، payload به سیستم من ارسال شود.

Acceptance:

- موجودیت `WebhookSubscription`:
  - Id
  - TenantId
  - Name
  - EndpointUrl
  - Secret
  - Enabled
  - SubscribedEventTypes (لیست)
  - RetryPolicy (backoff ساده)
- API:
  - `GET /api/tenant/extensibility/webhooks`
  - `POST /api/tenant/extensibility/webhooks`
  - `PUT /api/tenant/extensibility/webhooks/{id}`
  - `DELETE /api/tenant/extensibility/webhooks/{id}` (یا disable)
- فقط TenantAdmin می‌تواند مدیریت کند.

#### US 19.2 – ارسال Eventهای اصلی به Webhookها

به عنوان سیستم  
می‌خواهم هر وقت eventهای اصلی هویتی رخ می‌دهد، به Webhookهای مشترک شده ارسال کنم  
تا یکپارچگی event-driven با سیستم‌های بیرونی ممکن شود.

Acceptance:

- لیست EventTypeهای اولیه:
  - `identity.user.created`
  - `identity.user.updated`
  - `identity.user.deleted`
  - `auth.login.succeeded`
  - `auth.login.failed`
  - `auth.token.issued`
  - `auth.token.revoked`
  - `access.request.approved`
  - `access.request.denied`
  - `lifecycle.event.executed`
- Publisher:
  - در زمان وقوع event در ماژول‌های مربوطه، یک event داخلی fire می‌کند.
  - Extensibility module این eventها را مپ می‌کند به EventType و payload.
- Webhook Dispatcher:
  - background worker:
    - queue از eventهایی که باید ارسال شوند.
    - ارسال HTTP POST با header HMAC (مثلاً X-Onesign-Signature).
    - retry با backoff در صورت failure (۵xx یا timeout).
- Audit:
  - برای هر subscription:
    - success / failure ثبت شود (در حد حداقل).

---

### Epic 2 – Inline Login & Token Hooks (Actions)

#### US 19.3 – تعریف Login Hook برای tenant

به عنوان Tenant Admin  
می‌خواهم برای login flow یک hook تعریف کنم  
تا بتوانم قبل/بعد از login، کارهایی مثل audit اضافی یا call به سیستم HR انجام دهم.

Acceptance:

- موجودیت `LoginHook`:
  - Id
  - TenantId
  - Name
  - Stage (`pre-login` / `post-login`)
  - Type (`http-callback`)
  - EndpointUrl
  - Secret
  - TimeoutSeconds
  - Enabled
- API:
  - `GET /api/tenant/extensibility/login-hooks`
  - `POST /api/tenant/extensibility/login-hooks`
  - `PUT /api/tenant/extensibility/login-hooks/{id}`
  - `DELETE /api/tenant/extensibility/login-hooks/{id}` (یا disable)

#### US 19.4 – اجرای Login Hooks در جریان Auth

به عنوان AuthService  
می‌خواهم در جریان login (بعد از credential validation) بتوانم LoginHookها را اجرا کنم  
تا مشتری بتواند logic اضافی خودش را تزریق کند.

Acceptance:

- Flow:
  - pre-login stage:
    - بعد از این که user و tenant شناسایی شدند، قبل از صدور token:
      - call همه LoginHookهای Enabled و Stage = pre-login برای آن tenant.
  - post-login stage:
    - بعد از موفقیت و صدور token (یا session)، به صورت fire-and-forget / async.
- قرارداد برای HTTP callback:
  - input JSON:
    - userId, tenantId
    - clientId
    - riskScore (از Phase 17)
    - authContext (ip, userAgent, geo اگر موجود)
  - response:
    - امکان:
      - `allow = true/false`
      - optional claim additions
      - optional flags (مثلاً require_mfa_again = true)
- محدودیت:
  - Timeout در pre-login:
    - مثلا ۲ ثانیه max.
  - اگر endpoint fail کرد (timeout / error):
    - default behavior:
      - fail-open یا fail-closed باید per-hook قابل تنظیم باشد (تنظیم خطرناک، اما لازم).

---

### Epic 3 – Token & Claims Transformation Rules

#### US 19.5 – تعریف Token Transformation Rule

به عنوان App Developer  
می‌خواهم کارهایی مثل mapping نقش‌ها و attributes را روی claims انجام دهم  
تا لازم نباشد backend خودم همه چیز را دوباره نگاشت کند.

Acceptance:

- موجودیت `TokenTransformationRule`:
  - Id
  - TenantId
  - Name
  - TargetAppId (ClientId)
  - Enabled
  - Order (priority)
  - RuleDefinition (یک DSL ساده یا JSON rule-based)
    - examples:
      - If role == "TenantAdmin" then add claim `"is_admin": true`
      - Map internal roles to `groups` claim
      - Map OrgUnit path به claim `org_path`
- Rule engine:
  - deterministic + pure function:
    - input: current claims set
    - output: modified claims set
- حتما **بدون** اجرای کد arbitrary (نه script engine فعلا).

#### US 19.6 – اعمال Transformation Rule در جریان Token Issuance

به عنوان TokenService  
می‌خواهم قبل از صدور نهایی token، همه TokenTransformationRuleهای مربوط به app را اعمال کنم  
تا token نهایی برای app customize شده باشد.

Acceptance:

- در pipeline صدور token:
  - بعد از جمع‌آوری claims و قبل از sign:
    - load rules برای (TenantId, ClientId, Enabled=true) به ترتیب Order.
    - apply rule chain روی claims.
- اگر rule fail کرد (bad config):
  - log error
  - امکان fallback:
    - یا fail token issuance (سختگیرانه)
    - یا skip آن rule (trace در Observability)
  - strategy باید در config مشخص باشد (برای MVP می‌توان per-tenant shared باشد).

---

### Epic 4 – Admin Portal & DevPortal UI

#### US 19.7 – مدیریت Webhookها در Admin Portal

به عنوان Tenant Admin  
می‌خواهم در Admin Portal بتوانم Webhookها را ببینم/تعریف/ویرایش کنم  
تا نیازی به API خام نباشد.

Acceptance:

- صفحه `/tenant/extensibility/webhooks`
- قابلیت‌ها:
  - لیست:
    - Name
    - EndpointUrl (mask شده)
    - Enabled
    - SubscribedEventTypes
    - LastDeliveryStatus (success / fail / n/a)
  - فرم ساخت/ویرایش:
    - انتخاب event typeها از لیست
    - تنظیم URL و Secret
    - toggle Enabled
  - نمایش چند نمونه event payload در UI (read-only JSON).

#### US 19.8 – مدیریت Login Hooks و Token Rules

به عنوان Tenant Admin / Developer  
می‌خواهم در پنل، LoginHook و TokenTransformationRule را مدیریت کنم  
تا Extensibility فقط روی کاغذ نباشد.

Acceptance:

- صفحه `/tenant/extensibility/login-hooks`:
  - لیست و CRUD
  - نمایش:
    - Stage
    - EndpointUrl
    - Timeout
    - FailBehavior (fail-open / fail-closed)
- صفحه `/tenant/extensibility/token-rules`:
  - لیست:
    - Name
    - TargetApp
    - Enabled
    - Order
  - فرم rule:
    - editor ساده برای RuleDefinition (JSON/DSL) با validation حداقلی.

#### US 19.9 – DevPortal: Event & Hook Documentation

به عنوان App Developer  
می‌خواهم در DevPortal ببینم:
- چه eventهایی موجودند
- نمونه payload
- مدل security (signature)  
تا راحت‌تر integration بنویسم.

Acceptance:

- در DevPortal (Phase 8):
  - بخش جدید:
    - "Extensibility & Events"
- محتوا:
  - لیست EventTypeها با description
  - مثال Webhook payload
  - روش verify HMAC signature
  - نمونه code snippet برای چند زبان (C#, Node, …) برای verify signature.

---

## 4. Dev Tasks – Backend

### 4.1 Data Model و EF

**Task B19-1 – WebhookSubscription Entity & Mapping**

- ایجاد entity:
  - WebhookSubscription
- EF config:
  - جدول `Extensibility_WebhookSubscriptions`
  - Index روی:
    - TenantId
    - Enabled
- Migration Phase 19.

**Task B19-2 – LoginHook Entity & Mapping**

- entity:
  - LoginHook
- جدول `Extensibility_LoginHooks`
- Index روی:
  - TenantId
  - Stage
  - Enabled

**Task B19-3 – TokenTransformationRule Entity & Mapping**

- entity:
  - TokenTransformationRule
- جدول `Extensibility_TokenTransformationRules`
- Index روی:
  - TenantId
  - TargetAppId
  - Enabled
  - Order

### 4.2 Event to Webhook pipeline

**Task B19-4 – Domain Event → Extensibility Event Mapping**

- ایجاد mapping service:
  - `IExtensibilityEventMapper`
    - `Map(DomainEvent e) -> (EventType, PayloadJson)?`
- پوشش EventTypeهای اولیه:
  - user created/updated/deleted
  - login succeeded/failed
  - token issued/revoked
  - access request approved/denied
  - lifecycle event executed

**Task B19-5 – Webhook Dispatch Service**

- سرویس:
  - `IWebhookDispatcher`
    - queue + ارسال HTTP POST async
- Behavior:
  - HMAC signature:
    - header مثل: `X-Onesign-Signature`
    - HMAC-SHA256(secret, body)
  - retry:
    - exponential backoff با حداکثر N تلاش
  - logging + minimal metrics:
    - تعداد ارسال موفق / fail per tenant.

### 4.3 Login Hooks execution

**Task B19-6 – LoginHooksExecutor Service**

- سرویس:
  - `ILoginHooksExecutor`
    - `Task<LoginHookResult> ExecutePreLoginAsync(context)`
    - `Task ExecutePostLoginAsync(context)`
- LoginHookResult:
  - Allow (bool)
  - AdditionalClaims (dictionary)
  - ExtraFlags (e.g. RequireAdditionalMfa)
- در Auth pipeline:
  - pre-login:
    - load hooks برای tenant.
    - call HTTP endpoints با timeout.
    - combine responses.
    - در صورت Allow=false:
      - login block شود با پیام مناسب.
  - post-login:
    - fire-and-forget (queue background job).

### 4.4 Token Transformation Engine

**Task B19-7 – TokenTransformationEngine**

- سرویس:
  - `ITokenTransformationEngine`
    - `ClaimsPrincipal ApplyRules(ClaimsPrincipal principal, TenantId, ClientId)`
- پیاده‌سازی DSL ساده RuleDefinition:
  - مثلاً JSON schema:
    - rules: [
      {
        "when": { "hasRole": "TenantAdmin" },
        "addClaims": { "is_admin": true }
      },
      {
        "mapRolesToClaim": "groups"
      }
    ]
- Validation:
  - هنگام save rule، RuleDefinition parse و validate شود.
- Integration:
  - در TokenService:
    - fetch rules.
    - apply engine.

---

## 5. Dev Tasks – Frontend / Admin Portal

### 5.1 Webhooks UI

**Task F19-1 – Webhooks List & CRUD**

- صفحه `/tenant/extensibility/webhooks`:
  - جدول:
    - Name
    - EndpointUrl (کوتاه + mask)
    - Enabled
    - SubscribedEventTypes (chips)
    - LastStatus
  - دکمه:
    - Create / Edit / Delete / Toggle
- Modal فرم:
  - name, url, secret, event types, enabled.

### 5.2 Login Hooks UI

**Task F19-2 – Login Hooks Page**

- صفحه `/tenant/extensibility/login-hooks`:
  - لیست:
    - Name
    - Stage (pre/post)
    - EndpointUrl
    - TimeoutSeconds
    - FailBehavior
    - Enabled
- فرم:
  - انتخاب stage
  - URL
  - secret
  - timeout
  - failBehavior (radio: fail-open / fail-closed)

### 5.3 Token Rules UI

**Task F19-3 – Token Rules Page**

- صفحه `/tenant/extensibility/token-rules`:
  - لیست:
    - Name
    - TargetApp
    - Enabled
    - Order
- فرم:
  - انتخاب app از combo
  - Order
  - JSON editor برای RuleDefinition (با syntax highlight ساده یا حداقل textarea + validation).
- show sample input claims & preview output (اگر امکان quick simulate).

---

## 6. Dev Tasks – DevPortal

**Task D19-1 – Extensibility Docs Section**

- در DevPortal frontend:
  - route: `/devportal/extensibility`
- محتوا:
  - توضیح:
    - EventTypes
    - Webhooks
    - Login hooks
    - Token transformation
  - نمونه payload:
    - identity.user.created
    - auth.login.succeeded
  - مثال code:
    - verify HMAC در C# و Node.js.

---

## 7. Cross-cutting – امنیت، Observability، Localization

### 7.1 Security

**Task X19-1 – Permission Checks**

- فقط TenantAdmin / SecurityOfficer:
  - می‌توانند webhook و hooks/token rules را مدیریت کنند.
- rate limit:
  - روی webhooks dispatch انبوه، logging مناسب.

**Task X19-2 – Safe Defaults**

- pre-login hooks:
  - timeout و fail behavior باید default امن داشته باشند.
- Token rules:
  - اگر parsing fail شود:
    - save منع شود (validation).

### 7.2 Observability & Audit

**Task X19-3 – Audit Events**

- ثبت:
  - "Extensibility.WebhookCreated/Updated/Deleted"
  - "Extensibility.WebhookDeliverySucceeded/Failed"
  - "Extensibility.LoginHookBlockedLogin"
  - "Extensibility.TokenTransformationApplied" (می‌توان aggregate-level log داشت نه هر claim جزئی)

### 7.3 Localization

**Task X19-4 – i18n**

- همه labelهای UI جدید:
  - "Webhooks", "Login Hooks", "Token Transformation Rules", …
- کل پیام‌ها دو زبانه از طریق i18n.

---

## 8. نکات طراحی Phase 19

- این فاز نباید onesign را تبدیل به «execution engine اسکریپت‌های مشتری» بدون کنترل کند.
- باید تعادل بین:
  - **Extensibility** (قدرت)  
  - **Safety** (timeout, fail behavior, rule-based DSL)  
  حفظ شود.
- اگر بعد از فاز ۱۹، برای هر event کوچک هنوز باید در core کد بزنی، یعنی Extensibility را نصفه و بی‌خاصیت پیاده کرده‌ای.

هدف Phase 19:

> onesign از یک SSO + IAM ثابت، تبدیل شود به یک **Identity Platform قابل توسعه** که tenantها بتوانند با Webhook و Hook و Token Rules آن را روی use caseهای خودشان customize کنند، بدون این که تو هر سری core را هک کنی.
