# onesign – Phase 13 Platform Hardening, Scale & Tenant Isolation

## 1. محدوده Phase 13

### 1.1 هدف کلی

Phase 13 تمرکز دارد روی این که onesign از یک “feature-rich SSO” تبدیل شود به یک **پلتفرم قابل اعتماد در سطح enterprise**:

- Tenant lifecycle واقعی:
  - Active / Suspended / Terminated
  - Export/Import tenant data
- Tenant isolation و topology:
  - shared DB با TenantId
  - امکان per-tenant database
  - routing و migration بین این دو
- Scale & Performance:
  - caching درست
  - rate limiting / throttling
  - health/readiness پروپ
- Backup/Restore & DR:
  - snapshot و restore در سطح tenant
  - plan برای region failure و RPO/RTO

بدون این فاز، هر RFP جدی‌ای در بخش Non-Functional Requirements تو را می‌زند کنار.

### 1.2 personas

- **SaaS Owner / Platform Engineer (خودت)**  
  می‌خواهد:
  - روشن بداند هر tenant کجاست (shared/per-tenant)
  - بتواند tenant را move کند
  - backup/restore نقطه‌ای و DR داشته باشد

- **Enterprise Tenant Admin / Security Officer**  
  می‌خواهد:
  - مطمئن شود دیتا قابل backup/restore است
  - بداند اگر breach/incident شد می‌توانید rollback/restore کنید
  - امکان جداسازی دیتابیس (compliance, data residency) داشته باشد

- **Ops / SRE**  
  می‌خواهد:
  - probe و health جدی
  - dashboard برای latency/QPS/error rate per tenant
  - rate limit و protection در برابر abuse

---

## 2. معماری و مفاهیم کلیدی

### 2.1 Tenant Lifecycle Model

برای هر tenant:

- Status:
  - **Active**
  - **Suspended**
  - **Terminating**
  - **Terminated**
- Operational behavior:
  - Active → همه چیز عادی
  - Suspended →
    - login و token issue برای tenant block شود
    - Admin هنوز بتواند وارد پنل tenant شود (اختیاری) یا فقط GlobalAdmin
  - Terminating →
    - فقط عملیات لازم برای export/backup
  - Terminated →
    - هیچ API و login ای فعال نباشد
    - دیتا یا حذف شده یا archive شده (طبق سیاست)

### 2.2 Data Topology

دو حالت:

- **Shared DB** (الان داری): یک DB با TenantId در همه جدول‌ها
- **Per-Tenant DB**:
  - هر tenant دیتابیس خودش را دارد
  - جدول‌ها و schema یکسان، connection string جدا

نیاز:

- Routing لایه data بر اساس TenantConfig:
  - Shared: به default connection
  - Per-tenant: به connection اختصاصی
- Migration ابزار:
  - از shared به per-tenant
  - اختیاری: برعکس (per-tenant → shared) برای تست/POC

### 2.3 Backup, Restore, DR

نیازهای high-level:

- Backup policy:
  - full + incremental
  - حداقل daily برای shared
  - per-tenant برای per-tenant DB
- Tenant-level restore:
  - بتوانی tenant X را به یک point in time برگردانی بدون خراب کردن بقیه
- DR:
  - حداقل:
    - secondary region/DB ready
    - documented RPO/RTO

---

## 3. Epics و User Storyها – Phase 13

### Epic 1 – Tenant Lifecycle & Status Enforcement

#### US 13.1 – Tenant Status Field

به عنوان SaaS Owner  
می‌خواهم هر tenant یک status مشخص داشته باشد  
تا رفتار سیستم را بر اساس آن کنترل کنم.

Acceptance:

- اضافه شدن TenantStatus به مدل Tenant:
  - Active / Suspended / Terminating / Terminated
- API مدیریت tenant (GlobalAdmin):
  - `PUT /api/global/tenants/{id}/status`
    - فقط بعضی transitionها مجاز:
      - Active → Suspended
      - Suspended → Active
      - Active/Suspended → Terminating → Terminated

#### US 13.2 – Enforce Status روی تمام flows

به عنوان Security Officer  
می‌خواهم tenant suspended نتواند login/token داشته باشد  
تا بتوانم tenant مشکل‌دار را سریع قطع کنم.

Acceptance:

- همه endpointهای public (login/token/user/account/DevPortal و …) قبل از اجرا:
  - status tenant را چک کنند:
    - اگر Suspended:
      - 4xx مناسب (مثلا 403 با error code مشخص)
    - اگر Terminated:
      - 404 یا error اختصاصی
- Dashboard و Admin Portal نباید برای tenant suspended رفتار عادی نشان دهند (حداقل banner هشدار).

---

### Epic 2 – Tenant Data Isolation & DB Routing

#### US 13.3 – TenantConfig برای DB Topology

به عنوان SaaS Owner  
می‌خواهم تعیین کنم هر tenant روی shared DB است یا per-tenant  
تا برای مشتریان بزرگ isolation قوی‌تری داشته باشم.

Acceptance:

- TenantConfig:
  - DataIsolationMode:
    - SharedDatabase
    - DedicatedDatabase
  - ConnectionStringName (برای DedicatedDatabase)
- GlobalAdmin API:
  - `PUT /api/global/tenants/{id}/data-topology`
- Internal config:
  - registry/lookup برای tenant → connection string

#### US 13.4 – Data Access Routing Layer

به عنوان Developer  
می‌خواهم data access لایه‌ای داشته باشیم که بر اساس tenant routing کند  
تا مجبور نباشم در همه repositoryها if/else بنویسم.

Acceptance:

- یک abstraction مثل:
  - `ITenantDbConnectionFactory`
- Behavior:
  - برای هر request با TenantId:
    - TenantConfig را می‌گیرد
    - connection (shared یا dedicated) را تحویل می‌دهد
- Integration با EF:
  - pattern مناسب:
    - یا DbContext per tenant connection
    - یا connection string switching روی OnConfiguring
- همه moduleها از همین abstraction استفاده کنند.

#### US 13.5 – Migration Tool: Shared → Per-Tenant

به عنوان SaaS Operator  
می‌خواهم بتوانم tenantهای مهم را از shared DB به per-tenant DB migrate کنم  
تا نیاز isolation را بدون downtime جدی پوشش بدهم.

Acceptance (backend tool/CLI, نه UI پیچیده):

- ابزار (console/CLI) یا background job:
  - ورودی: TenantId, TargetConnectionString
  - قدم‌ها:
    - tenant را به حالت Terminating ببرد (یا Maintenance)
    - از shared DB:
      - همه rowهایی که TenantId = X است را dump/insert به DB جدید
    - روی TenantConfig:
      - DataIsolationMode = DedicatedDatabase
      - ConnectionStringName/Value تنظیم شود
    - tenant را به Active برگرداند
- Logging کامل:
  - audit "Tenant.MigrationStarted" / "Tenant.MigrationCompleted" / "Tenant.MigrationFailed"

---

### Epic 3 – Performance, Caching & Rate Limiting

#### US 13.6 – Config & Token Cache

به عنوان Platform Engineer  
می‌خواهم configهای tenant و token validation را cache کنیم  
تا latency کم و load DB کنترل شود.

Acceptance:

- Cache برای:
  - TenantConfig
  - ApplicationClient configs
  - PolicyEngine evaluation resultهای کوتاه‌مدت (اختیاری)
- TTL و invalidation:
  - روی تغییر tenant/application، cache invalid شود.
- Metrics:
  - cache hit/miss rate.

#### US 13.7 – Rate Limiting & Throttling

به عنوان SaaS Owner  
می‌خواهم rate limit per tenant و per client داشته باشم  
تا یک tenant یا client نتواند کل سیستم را down کند.

Acceptance:

- سطح API gateway / edge یا خود API:
  - rate limit per:
    - TenantId
    - ClientId (OIDC client)
- تنظیمات per plan:
  - هر plan یک سقف QPS یا requests/day داشته باشد.
- Behavior:
  - روی تجاوز از limit → پاسخ 429 با error code مناسب
- Observability:
  - metric و log برای rate limit triggered.

---

### Epic 4 – Backup, Restore & DR

#### US 13.8 – Backup Strategy Documented & Codified

به عنوان SRE  
می‌خواهم backup policy برای shared و per-tenant DB کاملا مشخص و تا حد ممکن خودکار باشد  
تا RPO/RTO قابل تضمین باشد.

Acceptance:

- حداقل:
  - full backup روزانه برای shared DB
  - per-tenant DB backup مطابق SLA هر plan
- ثبت در config:
  - BackupPolicy per plan:
    - RPO (ساعت)
    - retention duration

(پیاده‌سازی فیزیکی backup در این فاز می‌تواند با integration به infra موجود انجام شود، ولی حداقل hooking و metadata باید در کد باشد.)

#### US 13.9 – Tenant-Level Restore Flow (Logical)

به عنوان SaaS Owner  
می‌خواهم بتوانم فقط tenant X را به یک زمان قبلی برگردانم  
بدون این که tenant های دیگر را خراب کنم.

Acceptance (logical flow + hooks):

- برای shared DB:
  - هنوز backup در سطح DB است، اما:
    - flow مستند و automation برای:
      - export current tenant
      - restore DB به snapshot
      - reapply diff برای سایر tenantها (حداقل design-level)
- برای per-tenant:
  - ساده‌تر:
    - restore DB tenant X از backup
- در کد:
  - TenantStatus = Terminating/Terminated روی عملیات restore enforce شود.
  - audit "Tenant.RestoreStarted" / "Tenant.RestoreCompleted" / "Tenant.RestoreFailed".

#### US 13.10 – DR Mode & Readiness

به عنوان Enterprise Customer  
می‌خواهم بدانم اگر region اصلی down شد، شما DR plan دارید  
تا SSO معطل نماند.

Acceptance:

- Health endpoints:
  - /health/live
  - /health/ready
  - /health/tenant/{tenantId} (اختیاری)
- DR switches:
  - حداقل:
    - config برای secondary connection
    - toggle برای failover (این فاز بیشتر prepare و hook، نه full automation)

---

## 4. Dev Tasks – Backend

### 4.1 Tenant Lifecycle

**Task B13-1 – TenantStatus Field & Model**

- اضافه field TenantStatus به جدول Tenant.
- enum:
  - Active, Suspended, Terminating, Terminated.

**Task B13-2 – Tenant Status API (Global)**

- `PUT /api/global/tenants/{id}/status`
  - validate transitions.
  - audit events:
    - Tenant.StatusChanged.

**Task B13-3 – Status Enforcement Middleware**

- Middleware یا filter در لایه API:
  - بر اساس TenantId در context، TenantStatus را چک کند.
  - برای Suspended/Terminated requestها را reject کند.
  - exception list:
    - خود endpointهای GlobalAdmin/Status.

### 4.2 Data Topology & Routing

**Task B13-4 – TenantConfig.DataIsolationMode**

- اضافه کردن:
  - DataIsolationMode (Shared, Dedicated).
  - DedicatedConnectionString/Name.

**Task B13-5 – TenantDbConnectionFactory**

- interface:
  - `GetConnectionStringForTenant(Guid tenantId)`.
- پیاده‌سازی:
  - خواندن TenantConfig (با cache).
  - برگشت shared یا dedicated connection string.

**Task B13-6 – EF Integration**

- اصلاح composition DbContext:
  - OnConfiguring یا factory pattern:
    - برای هر request context بر اساس tenant connection string ساخته شود.
- اطمینان از:
  - transaction behavior درست
  - migration story (shared vs per-tenant) مشخص.

**Task B13-7 – Migration Tool: Shared → Dedicated**

- Console app یا command داخل solution:
  - ورودی:
    - TenantId
    - TargetConnectionString
  - process:
    - tenant → Terminating
    - copy data for that tenant from shared DB to new DB
    - update TenantConfig DataIsolationMode و connection
    - tenant → Active
  - logging و audit.

### 4.3 Caching, Rate Limiting

**Task B13-8 – TenantConfig & ClientConfig Cache**

- پیاده‌سازی cache لایه‌ای:
  - in-memory + distributed (redis, …) اگر معماری‌ات دارد.
- wrapper برای:
  - GetTenantConfig
  - GetApplicationClientConfig

**Task B13-9 – Token/Config Cache Integration**

- استفاده از cache در:
  - OIDC discovery, client config resolve
  - PolicyEngine (اگر مناسب)

**Task B13-10 – Rate Limiting Middleware**

- پیاده‌سازی:
  - per TenantId
  - per ClientId (OIDC client)
- config per plan:
  - Basic, Pro, Enterprise caps.
- بلاک کردن و log:
  - پاسخ 429 با code مشخص.

### 4.4 Backup/Restore Hooks & DR

**Task B13-11 – BackupPolicy Metadata**

- مدل:
  - BackupPolicy per plan:
    - RpoHours
    - RetentionDays
- در Billing/Plan module اضافه شود.

**Task B13-12 – Tenant Restore Flow API (internal)**

- Internal endpoint یا CLI:
  - `POST /api/global/tenants/{id}/restore` (protected)
- فقط:
  - status را به Terminating ببرد
  - call به infra/backup layer بدهد
  - انتظار برای completion (یا async job)
  - status را برگرداند یا Terminated اگر لازم.

**Task B13-13 – Health & DR Probes**

- اضافه health endpoints:
  - /health/live
  - /health/ready
- optional:
  - /health/tenant/{tenantId} که فقط تست سبک روی DB آن tenant انجام داده و status برگرداند.

---

## 5. Dev Tasks – Frontend / Admin UI

### 5.1 Global Tenant Management

**Task F13-1 – Tenant Status Management UI (Global Admin Portal)**

اگر Global Admin Portal داری (یا اضافه می‌کنی):

- صفحه Tenant List:
  - TenantName
  - Status
  - DataIsolationMode (Shared/Dedicated)
- امکان تغییر Status:
  - Active ↔ Suspended
  - Active/Suspended → Terminating/Terminated (با تأیید خطرناک)

**Task F13-2 – Tenant Data Topology View**

- نشان بده:
  - کدام tenant روی shared DB است
  - کدام روی dedicated
- اگر migration ابزار CLI است، UI فقط readonly باشد.

### 5.2 Tenant Admin Warnings

**Task F13-3 – Suspended Tenant Banner**

- در Tenant Admin Portal:
  - اگر TenantStatus = Suspended یا Terminating:
    - banner هشدار
    - disable اکثر عملیات
    - نمایش پیام مناسب (localizable).

---

## 6. Cross-cutting Tasks

**Task X13-1 – Localization**

- تمام پیام‌های مرتبط با:
  - status tenant
  - rate limit
  - maintenance / suspension
- دو زبانه باشد.

**Task X13-2 – Observability**

- metricها:
  - QPS per tenant/client
  - rate limit hits
  - cache hit/miss
  - DB latency per topology (shared vs dedicated)
- logها:
  - Tenant status changes
  - Tenant migrations
  - DR/restore attempts.

**Task X13-3 – Security & Compliance**

- ensure:
  - migration tool audit-heavy است.
  - access به APIs global محدود به GlobalAdmin است.
- در مستندات:
  - توضیح data isolation story و DR story.

---

## 7. نکات طراحی Phase 13

- این فاز feature اضافه نمی‌کند، ولی اگر ignore بشود:
  - اولین enterprise جدی تو را با دو تا سؤال می‌کشد:
    - "tenant من dedicated DB می‌خواهد"
    - "اگر دیتام خراب شد چه می‌کنید؟"
- اشتباه کلاسیک:
  - همه‌چیز را در shared DB اجرا کنی و بگویی بعداً فکر می‌کنم.
  - آن "بعداً" یعنی 6 ماه کابوس migration.

Phase 13 یعنی:
- **پلتفرم** داری، نه فقط **اپلیکیشن**.
