# onesign – Phase 20 Multi Region, Data Residency, Backup & DR

## 1. محدوده Phase 20

### 1.1 هدف کلی

Phase 20 تمرکز دارد روی این که onesign از یک SaaS تک دیتاسنتر  
تبدیل شود به یک پلتفرم **Enterprise grade** با این قابلیت‌ها:

- Multi Region واقعی
- Data Residency per tenant
- Backup / Restore در سطح platform و tenant
- Disaster Recovery با RPO/RTO مشخص
- UI و API برای مدیریت Region و وضعیت سلامت

اگر این فاز را نداشته باشی، هر CTO Enterprise به این سوال می‌رسد:

> «اگر دیتاسنتر اصلیت پرید، SSO ما چه می‌شود؟ دیتای ما کجاست؟ می‌توانیم روی اروپا فقط نگه داری؟»

و جواب تو الان: هیچ.

### 1.2 Personas

- **Platform SRE / Global Admin (مالک onesign)**
  - می‌خواهد:
    - Regionهای پلتفرم را تعریف و مدیریت کند
    - بداند هر tenant در کدام Region است
    - Backupها و DR plan واقعی داشته باشد

- **Enterprise Customer CIO / CISO**
  - می‌خواهد:
    - Region یا کشور دیتای tenant خودش را انتخاب کند
    - قرارداد RPO/RTO واضح داشته باشد
    - امکان export/restore برای tenant خودش را داشته باشد (با کنترل)

- **Tenant Admin**
  - می‌خواهد:
    - وضعیت Region و health را ببیند
    - بداند backup و retention برای tenantش چطور است

---

## 2. معماری کلی Phase 20

### 2.1 مفاهیم جدید

- **Region**
  - مثلا:
    - `eu-west-1` (اروپا)
    - `me-central-1` (خاورمیانه)
    - `ap-south-1` (آسیا)
  - برای هر Region:
    - endpointهای SSO
    - دیتابیس / storage
    - health status

- **TenantRegionBinding**
  - هر tenant دقیقا در یک Region primary قرار دارد
  - option:
    - secondaryRegion برای DR (اختیاری در این فاز، حداقل طراحی شود)

- **Data Residency Policy**
  - per tenant:
    - DataRegion
    - CrossRegionReplicationAllowed (bool)
    - BackupRegion (ممکن است متفاوت باشد)

- **BackupSet**
  - snapshot منطقی از دیتای tenant یا کل platform
  - metadata:
    - type (tenant-level / region-level / global)
    - createdAt
    - retention

- **DR Plan**
  - config:
    - هدف RPO و RTO
    - runbook سناریو failover Region

---

## 3. Epics و User Storyها – Phase 20

### Epic 1 – Region Model و Tenant Binding

#### US 20.1 – تعریف و مدیریت Region توسط Global Admin

به عنوان Global Admin  
می‌خواهم بتوانم Regionهای قابل استفاده در onesign را تعریف کنم  
تا بتوانم tenantها را بین Regionها نگه داری و مدیریت کنم.

Acceptance:

- Entity: `Region`
  - Id (short name، مثلا `eu-west-1`)
  - DisplayName
  - IsActive
  - EndpointBaseUrl (مثلا `https://eu.onesign.com`)
  - DbClusterId / Connection ref (logical id)
  - StorageClusterId (برای object storage، audit، log)
- API Global:
  - `GET /api/global/regions`
  - `POST /api/global/regions`
  - `PUT /api/global/regions/{id}`
  - `DELETE /api/global/regions/{id}` (اگر امکان، فقط de-activate)
- فقط Global Admin به این API ها دسترسی دارد.

#### US 20.2 – Bind شدن Tenant به Region

به عنوان Platform  
می‌خواهم هر tenant دقیقا به یک Region primary وصل باشد  
تا تمام داده‌های اصلی آن tenant در همان Region قرار بگیرد.

Acceptance:

- در مدل Tenant:
  - فیلد `RegionId` (اجباری)
  - فیلد اختیاری `SecondaryRegionId` (برای DR future)
- هنگام ساخت tenant:
  - RegionId باید مشخص شود
  - rule:
    - اگر customer Region خواسته، از آن استفاده شود
    - اگر unspecified، default global policy
- Tenant-level API & UI:
  - Tenant Admin و Global Admin بتوانند Region کنونی tenant را ببینند (فقط read).

---

### Epic 2 – Data Residency Policy per Tenant

#### US 20.3 – تعریف Data Residency Policy per Tenant

به عنوان Global Admin  
می‌خواهم بتوانم برای هر tenant Policyهای Data Residency را تنظیم کنم  
تا مطابق قوانین و قرارداد، دیتا جابه‌جا نشود.

Acceptance:

- مدل: `TenantDataResidencyPolicy`
  - TenantId
  - DataRegionId (همان RegionId primary)
  - BackupRegionId (می‌تواند همان Region یا Region دیگر باشد)
  - CrossRegionReplicationAllowed (bool)
  - Notes / ComplianceTag
- API:
  - `GET /api/global/tenants/{id}/data-residency`
  - `PUT /api/global/tenants/{id}/data-residency`
- Enforcement:
  - هنگام backup، replication و export، policy چک شود.
  - اگر CrossRegionReplicationAllowed=false:
    - بکاپها تنها در Region همان DataRegionId یا BackupRegionId باشند، نه جای دیگر.

#### US 20.4 – نمایش Data Residency برای Tenant Admin

به عنوان Tenant Admin  
می‌خواهم در Admin Portal ببینم دیتای ما در کدام Region است و چه Policyهایی دارد  
تا بتوانم به مشتریان داخلی خودم پاسخ بدهم.

Acceptance:

- UI:
  - در صفحه Tenant Settings:
    - نمایش:
      - Region
      - BackupRegion
      - residency flags
    - read-only برای Tenant Admin (تغییر فقط توسط Global Admin).

---

### Epic 3 – Backup & Restore (Platform & Tenant Level)

#### US 20.5 – Job Backup Region Level

به عنوان SRE  
می‌خواهم بتوانم backupهای دوره‌ای برای هر Region داشته باشم  
تا در صورت خرابی، بتوانم Region را برگردانم.

Acceptance:

- بکاند:
  - Background job per Region:
    - data snapshot (DB backup + config + critical storage metadata)
  - Metadata entity: `RegionBackupSet`:
    - Id
    - RegionId
    - CreatedAt
    - Type (full / incremental اگر بعدا لازم شد، فعلا full)
    - StorageLocation
    - Status (Completed / Failed / InProgress)
- API Global:
  - `GET /api/global/regions/{regionId}/backups`
  - `POST /api/global/regions/{regionId}/backups` (trigger manual)
- Retention:
  - تنظیم retention بر اساس config:
    - مثلا نگه داشتن آخر N backup per region.

#### US 20.6 – Tenant Level Backup & Export

به عنوان Global Admin یا SRE  
می‌خواهم بتوانم backup / export در سطح یک tenant انجام دهم  
تا در موارد خاص (migration، legal) بتوانم دیتا را جداگانه مدیریت کنم.

Acceptance:

- Entity: `TenantBackupSet`:
  - Id
  - TenantId
  - RegionId
  - CreatedAt
  - Type (LogicalExport / FullTenantBackup)
  - StorageLocation
  - Status
- API:
  - `POST /api/global/tenants/{tenantId}/backups` (global)
  - `GET /api/global/tenants/{tenantId}/backups`
- محتوا:
  - schema + data مربوط به tenant
  - secretها را با encryption ذخیره کن (مکانیزم فعلی platform)

#### US 20.7 – Restore Tenant از Backup

به عنوان Global Admin  
می‌خواهم بتوانم یک tenant را از یک TenantBackupSet Restore کنم  
تا در شرایط failure یا migration، tenant را برگردانم.

Acceptance:

- API:
  - `POST /api/global/tenants/{tenantId}/restore`
    - body: BackupSetId, targetRegionId (optional، اگر اجازه داشته باشد)
- Behavior:
  - چک DataResidencyPolicy:
    - اگر targetRegionId != DataRegionId و policy اجازه نمی‌دهد → error.
  - توقف temporary traffic روی آن tenant (maintenance mode).
  - اجرای restore:
    - clean و سپس import داده برای tenant در دیتابیس و storage منطقه هدف.
  - خروج از maintenance mode بعد از موفقیت.
- Audit:
  - "DR.TenantRestoreStarted"
  - "DR.TenantRestoreCompleted"
  - "DR.TenantRestoreFailed"

---

### Epic 4 – DR Plan و Health

#### US 20.8 – Region Health & DR Status Dashboard

به عنوان SRE  
می‌خواهم داشبوردی برای Region Health و DR readiness داشته باشم  
تا بدانم در هر لحظه وضعیت کجاست.

Acceptance:

- داده‌ها:
  - per Region:
    - Status (Healthy / Degraded / Down)
    - Last successful backup time
    - Number of tenants
    - Count از critical alerts
- API Global:
  - `GET /api/global/regions/health`
- UI Global (نه Tenant):
  - صفحه داشبورد DR/Region:
    - لیست Regionها با رنگ سلامت
    - Drill down برای هر Region.

#### US 20.9 – DR Runbook ادغام شده در سیستم

به عنوان SRE  
می‌خواهم برای سناریو failover Region، یک Runbook حداقلی در سیستم داشته باشم  
تا عملیات DR قابل reproducible باشد.

Acceptance:

- مدل ساده:
  - `DRRunbookStep`:
    - Id
    - RegionId (یا global)
    - Name
    - Description
    - ScriptReference (اختیاری)
  - اینجا لازم نیست execution engine داشته باشی، خودت را نکش.
- UI Global:
  - صفحه read-only برای نمایش گام‌های DR برای هر Region.
- هدف:
  - حداقل مستندات DR در سیستم version شده، نه داخل Word فایل گم شده.

---

## 4. Dev Tasks – Backend

### 4.1 Region & Tenant binding

**Task B20-1 – Region Entity & Repository**

- ایجاد entity `Region` در ماژول global config:
  - Id, DisplayName, IsActive, EndpointBaseUrl, DbClusterRef, StorageClusterRef.
- EF mapping:
  - جدول `Global_Regions`
  - migration Phase 20.

**Task B20-2 – اضافه کردن RegionId به Tenant**

- اضافه فیلد `RegionId` و `SecondaryRegionId` به مدل Tenant.
- migration:
  - مقدار دهی اولیه:
    - همه tenantهای موجود یک Region default بگیرند (مثلا `primary`).
- Validation:
  - هنگام build Tenant:
    - RegionId required.

**Task B20-3 – TenantDataResidencyPolicy**

- entity:
  - TenantId (PK)
  - DataRegionId
  - BackupRegionId
  - CrossRegionReplicationAllowed
  - ComplianceTag (string)
- EF mapping + migration.
- service:
  - `ITenantDataResidencyService`
    - get / update policies.

### 4.2 Backup infrastructure

**Task B20-4 – RegionBackupSet و TenantBackupSet Entities**

- `RegionBackupSet`:
  - Id
  - RegionId
  - CreatedAt
  - StorageLocation
  - Status
- `TenantBackupSet`:
  - Id
  - TenantId
  - RegionId
  - CreatedAt
  - Type
  - StorageLocation
  - Status
- EF mapping + migration.

**Task B20-5 – Region Backup Job**

- background job:
  - per Region:
    - read config (backup schedule، retention).
    - trigger DB backup (از طریق external tool/script integration) و ثبت metadata.
- abstraction:
  - interface برای backup provider (اجرا نمی‌خواهد Cloud-specific شود در کد domain).

**Task B20-6 – Tenant Backup / Export Service**

- service:
  - `ITenantBackupService`
    - `Task<TenantBackupSet> CreateBackupAsync(tenantId, type)`
    - `Task<IReadOnlyList<TenantBackupSet>> GetBackupsAsync(tenantId)`
- implementation:
  - logical export of tenant data:
    - همه جداول multi tenant با TenantId filter.
  - zip + encrypt و ذخیره در StorageLocation.

**Task B20-7 – Tenant Restore Service**

- service:
  - `ITenantRestoreService`
    - `Task RestoreAsync(tenantId, backupSetId, targetRegionId?)`
- behavior:
  - چک policy.
  - maintenance mode برای tenant.
  - clear data مربوط به tenant در region target.
  - import snapshot backup.
  - sync indexها و cacheها.
  - exit maintenance mode.

### 4.3 Health و DR

**Task B20-8 – Region Health Aggregator**

- سرویس:
  - `IRegionHealthService`
    - `Task<IReadOnlyList<RegionHealthDto>> GetRegionsHealthAsync()`
- RegionHealthDto:
  - RegionId
  - Status (derived از health checks و recent failures)
  - LastSuccessfulBackupAt
  - TenantsCount
  - CriticalAlertsCount

**Task B20-9 – DR Runbook Model**

- entity:
  - DRRunbookStep:
    - Id
    - RegionId (nullable برای global)
    - Order
    - Name
    - Description
    - ScriptReference
- EF mapping + migration.
- simple CRUD service برای Global Admin.

---

## 5. Dev Tasks – Frontend

### 5.1 Global Admin – Regions & DR Dashboard

**Task F20-1 – Global Regions Management UI**

- صفحه `Global / Regions` (فقط برای Global Admin):
  - لیست Regionها:
    - Id, DisplayName, IsActive, EndpointBaseUrl.
  - فرم add / edit:
    - Id (immutable بعد از ساخت)
    - DisplayName
    - EndpointBaseUrl
    - IsActive.

**Task F20-2 – DR / Health Dashboard**

- صفحه `Global / DR & Health`:
  - cards:
    - Region count
    - Regions Healthy / Degraded / Down
  - جدول RegionHealth:
    - RegionId
    - Status (badge)
    - LastSuccessfulBackupAt
    - TenantsCount
    - CriticalAlerts
  - link به backup list per region.

### 5.2 Tenant Settings – Region & Residency

**Task F20-3 – Tenant Settings Data Residency**

- در Admin Portal tenant:
  - بخش "Data Residency & Region":
    - نمایش:
      - Region (name)
      - BackupRegion
      - residency flags (CrossRegionReplicationAllowed / NotAllowed)
    - برای Tenant Admin: read-only.
    - برای Global Admin (اگر shared UI): امکان edit.

### 5.3 Backup / Restore UI (Global)

**Task F20-4 – Tenant Backup / Restore UI**

- صفحه برای Global Admin:
  - `Global / Tenants / {tenantId} / Backups`
    - لیست TenantBackupSet:
      - CreatedAt
      - Type
      - RegionId
      - Status
    - دکمه:
      - "Create backup"
      - "Restore" روی BackupSet (با modal confirmation و هشدار قوی).

**Task F20-5 – Region Backups UI**

- صفحه:
  - `Global / Regions / {regionId} / Backups`
    - لیست RegionBackupSet
    - دکمه trigger backup دستی.

---

## 6. Cross Cutting – Security, Observability, Compliance

### 6.1 Security & Access Control

**Task X20-1 – Permission Guard**

- APIs Global:
  - Region management
  - Data residency policies
  - backup/restore
  - DR runbooks
- فقط Global Admin / SRE roles دسترسی دارند.
- Tenant Admin:
  - فقط read-only residency info.

### 6.2 Audit & Logging

**Task X20-2 – Audit Events**

ثبت eventهای زیر:

- "Region.Created / Updated / Deactivated"
- "Tenant.DataResidency.Updated"
- "Backup.RegionBackupStarted / Completed / Failed"
- "Backup.TenantBackupStarted / Completed / Failed"
- "DR.TenantRestoreStarted / Completed / Failed"

### 6.3 Compliance Hooks

**Task X20-3 – Compliance Metadata**

- در TenantDataResidencyPolicy:
  - `ComplianceTag` را طوری استفاده کن که:
    - مثلا GDPR / LocalReg / …  
  - این برای گزارشات بعدی و DevPortal مفید است.

---

## 7. Dev Tasks – DevPortal / Docs

**Task D20-1 – Deployment & Residency Docs**

- در DevPortal اضافه کن:
  - صفحه:
    - "Deployment, Regions & Data Residency"
- محتوا:
  - توضیح:
    - Regionها
    - DataResidencyPolicy
    - Backup & Restore overview
    - RPO/RTO هدف (configurable)
  - نمودار ساده logical:
    - multi region
    - tenant binding

---

## 8. نکات طراحی Phase 20

- این فاز باید جواب دو سوال را بدهد:
  - «اگر Region اصلی down شد، چه می‌شود؟»
  - «دیتای من دقیقا کجاست و چطور backup می‌شود؟»
- اشتباه کشنده:
  - فقط جدول Region بسازی و دو تا enum اضافه کنی
  - بدون backup واقعی، بدون restore واقعی، بدون health واقعی  
  - این می‌شود دکور، نه DR.

هدف Phase 20:

> onesign از یک SaaS تک‌ریجن ناقابل، تبدیل شود به یک **پلتفرم SSO Enterprise grade** که بتوانی جلوی بانک/تلکو/دولت با افتخار بگویی:  
> Region, Residency, Backup, DR همه طراحی و پیاده شده‌اند، نه فقط روی پاورپوینت.
