# onesign – Phase 21 On-Prem & Hybrid Deployment Kit

## 1. محدوده Phase 21

### 1.1 هدف کلی

Phase 21 تمرکز دارد روی این که onesign:

- فقط روی SaaS اصلی تو نچرخد
- بتواند به صورت **On-Prem / Dedicated / Hybrid** روی زیرساخت مشتری هم نصب و نگهداری شود
- با:
  - Deployment Descriptor استاندارد (YAML)
  - Installer/Bootstrap سرویس‌محور (CLI + API)
  - لایسنسینگ و محدودیت فیچر per environment
  - Health & Versioning قابل مشاهده از UI

اگر این فاز را نداشته باشی، هر Enterprise که بگوید:  
«ما SSO را فقط On-Prem می‌خواهیم»، تو در بهترین حالت برمی‌گردی به کپی‌پیست و SSH دستی  
و این یعنی پروژه‌ات scale ندارد.

### 1.2 Personas

- **Platform SRE / Global Admin (مالک onesign)**
  - می‌خواهد:
    - با یک Descriptor استاندارد، برای مشتری Dedicated/On-Prem محیط جدید بسازد
    - نسخه، کانفیگ، Region و لایسنس هر محیط را مدیریت کند

- **Customer Infrastructure / DevOps (سمت مشتری)**
  - می‌خواهد:
    - یک Deployment Kit واضح داشته باشد (Helm / Docker Compose / Terraform Inputs)
    - config را با یک فایل YAML کنترل کند، نه با ۱۰۰ تا متغیر پراکنده

- **Security / Compliance Officer (مشتری)**
  - می‌خواهد:
    - بداند کدام نسخه‌ی onesign روی دیتاسنتر خودش است
    - لایسنس، فیچرهای فعال، Region و DR وضعیت مشخص داشته باشند

---

## 2. معماری کلی Phase 21

### 2.1 مفاهیم جدید

- **Environment**
  - یک instance منطقی از onesign:
    - `env-001-eu-saas`
    - `env-bankx-prod-onprem`
  - شامل:
    - نوع محیط: SaaSShared / SaaSDedicated / OnPrem / Test
    - RegionId
    - BaseUrl
    - Version (AppVersion, DbSchemaVersion)
    - LicenseKey / FeatureFlags

- **Deployment Descriptor (YAML)**
  - فایل ورودی برای bootstrap و نصب:
    - اطلاعات:
      - EnvironmentId
      - EnvironmentType
      - RegionId
      - Domains (auth, admin, devportal)
      - Database connection(s)
      - Storage endpoints
      - External IdPs, SMTP, Observability endpoints
      - LicenseKey

- **License & FeatureConfig**
  - پر محیط:
    - کدام feature/module فعال است:
      - Federation, Governance, DevPortal, Extensibility, …
    - limitها:
      - Max tenants, Max users, Max apps

- **Installer / Bootstrap Service**
  - یک service/CLI که:
    - Deployment Descriptor را می‌خواند
    - DB schema را initialize / migrate می‌کند
    - Global config و Environment را در DB ثبت می‌کند

---

## 3. Epics و User Storyها – Phase 21

### Epic 1 – Environment Model & Registry

#### US 21.1 – تعریف Environment Registry در Platform

به عنوان Global Admin  
می‌خواهم همه Environmentهای onesign (SaaS، Dedicated، On-Prem) به صورت ثبت شده در یک Registry ذخیره شوند  
تا بتوانم نسخه، Region و لایسنس هر محیط را ردیابی کنم.

Acceptance:

- موجودیت `Environment`:
  - Id (string – یکتا)
  - Name
  - Type (SaaSShared / SaaSDedicated / OnPrem / Test)
  - RegionId
  - BaseUrl (مثلا `https://sso.bankx.local`)
  - AppVersion
  - DbSchemaVersion
  - LicenseKey (masked در UI)
  - CreatedAt
  - LastHeartbeatAt
- API Global:
  - `GET /api/global/environments`
  - `GET /api/global/environments/{id}`
  - `POST /api/global/environments`
  - `PUT /api/global/environments/{id}`
- Environment محلی (همان instance جاری) باید خودش را در این Registry ثبت و به‌روز کند.

#### US 21.2 – Heartbeat و Status Environment

به عنوان SRE  
می‌خواهم بدانم هر Environment زنده است یا نه  
تا بتوانم سریع بفهمم کدام On-Prem/Dedicated instance مشکل دارد.

Acceptance:

- هر instance onesign:
  - بین زمانی (مثلا هر ۵ دقیقه) یک heartbeat به central registry (یا خودش، در حالت air-gapped فقط local) ارسال کند:
    - EnvironmentId
    - AppVersion
    - DbSchemaVersion
    - basic health flags
- Environment.Status از روی LastHeartbeatAt و health flags مشتق شود:
  - Healthy / Stale / Down (قابل محاسبه).

---

### Epic 2 – Deployment Descriptor & Bootstrap

#### US 21.3 – تعریف ساختار Deployment Descriptor (YAML)

به عنوان DevOps (پلتفرم و مشتری)  
می‌خواهم بتوانم با یک YAML استاندارد، همه تنظیمات یک Environment را تعریف کنم  
تا نصب onesign به یک فرآیند repeatable تبدیل شود.

Acceptance:

- اسکیمای YAML (در docs و DevPortal و در code):
  - `environment.id`
  - `environment.name`
  - `environment.type`
  - `environment.region`
  - `environment.baseUrl`
  - `license.key`
  - `database.main.connectionString` (یا ref به secret)
  - `storage.audit.endpoint`
  - `storage.blob.endpoint`
  - `smtp.*`
  - `observability.*` (log/metrics traces endpoint(s))
  - `features.*` (feature flags)
- Validation:
  - در bootstrap service:
    - YAML parse + validate required fields
    - خطاهای واضح و log مناسب

#### US 21.4 – Bootstrap Service برای نصب Environment جدید

به عنوان SRE / Customer DevOps  
می‌خواهم یک CLI/Service داشته باشم که Descriptor را بگیرد و محیط را bootstrap کند  
تا نیازی به صد مرحله دستی نباشد.

Acceptance:

- سرویس `EnvironmentBootstrapService` در backend:
  - متد:
    - `Task BootstrapAsync(DeploymentDescriptor descriptor)`
- اقدامات:
  - Validation descriptor
  - ایجاد/به‌روزرسانی:
    - Environment record
    - Global config (connection strings، endpoints، feature flags)
  - اجرای initial migrations (اگر DB خالی است)
  - sync نسخه DbSchemaVersion با AppVersion
- CLI (یا API endpoint) برای bootstrap:
  - حالت ۱: در SaaS مرکزی:
    - Global Admin یک Descriptor را آپلود و bootstrap می‌کند برای Dedicated/Managed محیط.
  - حالت ۲: On-Prem:
    - CLI روی همان محیط اجرا می‌شود و DB را initialize می‌کند (Registry ممکن است local باشد).

---

### Epic 3 – License & Feature Flags per Environment

#### US 21.5 – مدل License & FeatureConfig محیط

به عنوان Product Owner / Global Admin  
می‌خواهم بتوانم per environment مشخص کنم چه فیچرهایی فعال است  
تا برای مشتری On-Prem یا Planهای مختلف، امکانات را روشن/خاموش کنم.

Acceptance:

- موجودیت `EnvironmentLicense` یا `EnvironmentFeatureConfig`:
  - EnvironmentId
  - LicenseKey (encrypted)
  - MaxTenants
  - MaxUsers
  - MaxApplications
  - EnabledModules:
    - Federation
    - Governance
    - DevPortal
    - Extensibility
    - IdentityLifecycle
    - AdaptiveSecurity
    - …
- Enforcement:
  - در startup:
    - config از license خوانده شود.
  - در runtime:
    - limitهای کلیدی چک شوند (مثلا هنگام ایجاد tenant جدید MaxTenants enforce شود).
- Developer-friendly:
  - یک helper:
    - `IFeatureGate` یا `IFeatureFlagService`:
      - `IsEnabled("Module.Governance")` …

#### US 21.6 – نمایش License & Feature Flags در UI

به عنوان Global Admin یا Customer Admin  
می‌خواهم ببینم در محیط فعلی چه نسخه‌ای و چه فیچرهایی فعال است  
تا شفافیت فنی/قراردادی وجود داشته باشد.

Acceptance:

- در Admin Portal:
  - صفحه `Environment / About` یا مشابه:
    - AppVersion
    - DbSchemaVersion
    - EnvironmentType
    - RegionId
    - EnabledModules (لیست)
    - limits (MaxTenants, MaxUsers, …)
- برای On-Prem:
  - Tenant Admin (مشتری) این اطلاعات را می‌بیند (بدون دیدن LicenseKey کامل).

---

### Epic 4 – Deployment Kit: Helm / Compose / Config

#### US 21.7 – تولید Template Helm / Docker Compose + Docs

به عنوان Customer DevOps  
می‌خواهم یک نمونه رسمی از Deployment داشته باشم  
تا بدانم سرویس‌ها چطور کنار هم بالا می‌آیند.

Acceptance (حداقل سطح کد در repo / docs):

- فولدر `deploy/` در repo backend شامل:
  - `helm/` یا chart skeleton:
    - values.example.yaml با map به DeploymentDescriptor
  - `docker-compose.example.yml` برای محیط dev/on-prem ساده
- نه این که Helm کامل production-grade بنویسی، اما:
  - ساختار سرویس‌ها، ports، envها و secrets کاملاً مشخص باشد.
- Documentation در DevPortal:
  - نشان دهد چطور DeploymentDescriptor → Helm values / Compose envs map می‌شود.

---

## 4. Dev Tasks – Backend

### 4.1 Environment Registry

**Task B21-1 – Environment Entity & EF Mapping**

- اضافه entity `Environment`:
  - Id, Name, Type, RegionId, BaseUrl, AppVersion, DbSchemaVersion, LicenseKey, CreatedAt, LastHeartbeatAt.
- EF:
  - جدول `Global_Environments`
  - index روی Type, RegionId.

**Task B21-2 – Environment Repository & Service**

- سرویس:
  - `IEnvironmentService`
    - CRUD + search.
- API:
  - `GET /api/global/environments`
  - `GET /api/global/environments/{id}`
  - `POST /api/global/environments`
  - `PUT /api/global/environments/{id}`
- Permission:
  - فقط Global Admin.

**Task B21-3 – Heartbeat Endpoint & Scheduler**

- Endpoint:
  - `POST /api/environment/heartbeat`
    - body: EnvironmentId, AppVersion, DbSchemaVersion, health flags.
- Service:
  - هر instance backend:
    - job دوره‌ای:
      - EnvironmentId را از config بخواند
      - heartbeat را ارسال کند.
- Update:
  - Environment.LastHeartbeatAt و health flags.

### 4.2 Deployment Descriptor & Bootstrap

**Task B21-4 – DeploymentDescriptor Model & Parser**

- کلاس‌ها:
  - `DeploymentDescriptor`
    - Environment (id, name, type, region, baseUrl)
    - License (key)
    - Database (main connection, optional others)
    - Storage (audit, blob)
    - Smtp
    - Observability
    - Features
- YAML parser integration:
  - از یک lib YAML (یا JSON + schema) استفاده شود.
- Validation:
  - متد:
    - `DeploymentDescriptorValidator.Validate(descriptor)` → list of errors.

**Task B21-5 – EnvironmentBootstrapService**

- `IEnvironmentBootstrapService`
  - `Task BootstrapAsync(DeploymentDescriptor descriptor)`
- رفتار:
  - validate descriptor
  - create/update Environment
  - set global config records
  - run DB migrations (اگر دیتابیس خالی است):
    - call migration runner موجود.
  - update DbSchemaVersion.

**Task B21-6 – Bootstrap API / CLI**

- API:
  - `POST /api/global/environments/bootstrap`
    - input: descriptor (raw YAML or JSON).
- یا:
  - CLI کوچک که descriptor را بخواند و همین API/Service را صدا بزند.
- Permission:
  - فقط Global Admin (در SaaS).
  - در On-Prem local، permission بر اساس local config.

### 4.3 License & FeatureConfig

**Task B21-7 – EnvironmentLicense / FeatureConfig Model**

- entity:
  - می‌توانی LicenseKey و feature config را در خود Environment نگه داری
  - یا یک جدول جدا:
    - `EnvironmentFeatureConfig`:
      - EnvironmentId
      - MaxTenants, MaxUsers, MaxApplications
      - EnabledModules (json یا table)
- EF + migration.

**Task B21-8 – FeatureGate Service**

- interface:
  - `IFeatureGate`
    - `bool IsEnabled(string moduleKey)`
- پیاده‌سازی:
  - براساس EnvironmentFeatureConfig محیط فعلی.
- استفاده:
  - در startup برای wiring:
    - مثلاً ماژول Federation فقط اگر فعال باشد، routeهایش enable شوند.
  - در بیزنس:
    - قبل از استفاده از Governance/DevPortal/… check شود.

**Task B21-9 – License Enforcement points**

- کد:
  - حین ایجاد Tenant:
    - count tenants برای Environment با MaxTenants مقایسه شود.
  - حین ایجاد User:
    - اگر MaxUsers set است، limit enforce شود.
  - خطا:
    - exception قابل فهم (کد + message).

---

## 5. Dev Tasks – Frontend

### 5.1 Global Admin – Environments صفحه

**Task F21-1 – Global Environments List Page**

- مسیر:
  - `/global/environments`
- داده:
  - `GET /api/global/environments`
- UI:
  - جدول:
    - EnvironmentId
    - Name
    - Type
    - RegionId
    - BaseUrl
    - AppVersion
    - Status (مشتق از LastHeartbeatAt)
  - جزئیات:
    - لینک به `/global/environments/{id}`.

**Task F21-2 – Environment Detail Page**

- `/global/environments/{id}`
- نمایش:
  - همه فیلدهای Environment
  - License summary:
    - MaxTenants, MaxUsers, EnabledModules (badge)
  - آخرین Heartbeat
- امکان:
  - ویرایش Name, Type, RegionId, BaseUrl (نه AppVersion و DbSchemaVersion).

### 5.2 Tenant / Environment About

**Task F21-3 – Environment About برای Admin Portal فعلی**

- صفحه:
  - مثلا `/admin/environment/about`
- داده:
  - از API:
    - EnvironmentInfo + FeatureConfig برای محیط فعلی.
- نمایش:
  - AppVersion
  - DbSchemaVersion
  - EnvironmentType
  - RegionId
  - EnabledModules
  - MaxTenants/MaxUsers (اگر قابل نمایش به مشتری است).

همه با i18n.

---

## 6. Dev Tasks – Deployment Kit (Repo / Docs)

### 6.1 Helm / Docker Compose نمونه

**Task D21-1 – Helm/Compose Templates**

- فولدر `deploy/` در repo:
  - `docker-compose.example.yml`:
    - سرویس‌ها:
      - api
      - identity-service/workerها
      - database (اگر برای dev)، redis اگر هست، …
    - env vars map شده به config اصلی.
  - `helm/`:
    - chart skeleton برای:
      - api
      - workerها
    - `values.example.yaml` که:
      - بخش env config را با یک ساختار شبیه DeploymentDescriptor نگه می‌دارد.

### 6.2 DevPortal Documentation

**Task D21-2 – DevPortal صفحه On-Prem & Hybrid Deployments**

- مسیر:
  - `/devportal/deployment/onprem-hybrid`
- محتوا:
  - توضیح:
    - DeploymentDescriptor
    - نحوه map Descriptor → Helm values / Compose env
  - مثال YAML کامل
  - مراحل high-level نصب:
    - آماده کردن DB/Storage
    - اجرای bootstrap
    - بالا آوردن سرویس‌ها
  - اشاره به محدودیت‌ها و best practiceها.

---

## 7. Cross-Cutting – Security, Audit, Versioning

### 7.1 Security & Permissions

**Task X21-1 – Guarding Global APIs**

- تمام `/api/global/environments*`، `/bootstrap`:
  - فقط Global Admin / SRE دسترسی داشته باشند.
- On-Prem:
  - مکانیزم auth مناسب (مثلاً local admin account).

### 7.2 Audit

**Task X21-2 – Audit Events**

- ثبت:
  - "Environment.Created"
  - "Environment.Updated"
  - "Environment.HeartbeatReceived"
  - "Environment.BootstrapStarted / Completed / Failed"
  - "Environment.LicenseUpdated"

### 7.3 Version Consistency

**Task X21-3 – Version Sync on Startup**

- در startup backend:
  - AppVersion و DbSchemaVersion خوانده شوند.
  - اگر EnvironmentInfo در DB هست:
    - update شوند.
  - اگر نیست (اولین‌بار):
    - خود Environment local ساخته/ثبت شود (برای SaaS shared).

---

## 8. نکات طراحی Phase 21

- این فاز قرار نیست همه‌ی DevOps جهان را حل کند؛
- اما باید سه چیز را **واقعی** ارائه کند:
  1. مدل Environment + Registry شفاف
  2. Descriptor استاندارد برای نصب / bootstrap
  3. License & feature gating واقعی per environment

اگر بعد از Phase 21، برای نصب On-Prem هنوز باید:

- connection string را داخل ۸ جای مختلف دستی ست کنی
- featureها را با appsettings پراکنده روشن/خاموش کنی  
و هیچ جایی در UI ننوشته این محیط چه نسخه‌ای و چه لایسنس/فیچری دارد،

یعنی این فاز را تبدیل کردی به PDF دکور، نه Deployment Kit.
