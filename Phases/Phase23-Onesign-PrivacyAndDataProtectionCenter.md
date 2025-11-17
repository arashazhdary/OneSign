# onesign – Phase 23 Privacy & Data Protection Center

## 1. محدوده Phase 23

### 1.1 هدف کلی

Phase 23 تمرکز دارد روی این که onesign از دید Privacy و Data Protection از حالت:

> "یه عالمه لاگ و دیتا، هر چی شد شد"

تبدیل بشه به یک پلتفرم که حداقل این‌ها را داشته باشه:

- Data Retention per tenant & per data category (login logs, audit, tokens, federation logs, …)
- Data Subject Requests (DSR):
  - Right of Access (export data per user)
  - Right to Erasure / Anonymization (delete or anonymize user data)
- Privacy Center UI برای:
  - Tenant Data Protection Officer / Security Officer
  - End User (سطح Account Center) برای درخواست‌ها و consents
- مکانیزم Anonymization قابل‌کنترل (نه فقط DELETE کور)

بدون این فاز، برای GDPR/قوانین محلی، عملاً هیچ‌چیزی نداری جز یک دیتابیس بی‌صاحب.

### 1.2 Personas

- **Tenant DPO / Security Officer**
  - می‌خواهد:
    - سیاست Retention برای انواع داده (logs, audit, events) تعریف کند
    - درخواست‌های DSR را ببیند، approve/execute کند
    - به auditor نشان دهد چه delete / export انجام شده

- **Tenant Admin**
  - می‌خواهد:
    - وضعیت privacy tenant را ببیند
    - بتواند manual purge روی بعضی داده‌ها انجام بدهد (مثلاً قدیمی‌تر از X روز)

- **End User (Account Owner)**
  - می‌خواهد:
    - بتواند درخواست "Export my data" بدهد
    - بتواند درخواست "Delete/Anonymize my account data" بدهد (در حد tenant خودش)

- **Compliance / Auditor**
  - می‌خواهد:
    - لیست DSRها، وضعیت اجرا، timestamps
    - policyها و لاگ اجرای retention را ببینید

---

## 2. مفاهیم اصلی Phase 23

### 2.1 Data Category & Retention Policy

- **DataCategory**
  - نوع داده:
    - IdentityProfile (نام، ایمیل، claimها)
    - AuthEvents (login/logout, MFA)
    - AuditLogs
    - FederationLogs
    - AccessRequests
    - LifecycleHistory
  - سطح tenant-specific (همه برای یک tenant)

- **DataRetentionPolicy**
  - per tenant + per data category:
    - RetentionPeriodDays (مثلاً ۹۰ روز برای AuthEvents)
    - HardDeleteAfter (bool) – بعد از این بازه hard delete یا فقط anonymize
    - Enabled

### 2.2 Data Subject Request (DSR)

- نوع‌ها:
  - **Export** (Right of Access)
  - **Delete** (Right to Erasure / Anonymize)
- برای یک user (در یک tenant) و تمام data category‌های مربوطه.

- **DataSubjectRequest**
  - Id
  - TenantId
  - SubjectId (UserId)
  - Type (Export / Delete)
  - Status (Requested / InReview / Approved / Processing / Completed / Rejected)
  - RequestedAt
  - CompletedAt
  - RequestedBy (خود user یا admin)
  - ResultLocation (برای Export – لینک موقت به فایل)
  - Reason / Notes

### 2.3 Anonymization

- به جای DELETE کور، برای بعضی جداول:
  - user identifiers → hashed or pseudonymized
  - PII → پاک یا جایگزین با مقادیر generic
- Scope:
  - Profile و user-related data در tenant
  - logs/audits با حفظ integrity business (فقط بدون PII مستقیم)

---

## 3. Epics و User Storyها – Phase 23

### Epic 1 – Data Categories & Retention Policy

#### US 23.1 – تعریف DataCategory و Retention Policy per Tenant

به عنوان Tenant DPO  
می‌خواهم بتوانم Retention Policy برای هر نوع داده تعریف کنم  
تا مطابق قانون، داده‌ها بعد از X روز پاک یا anonymize شوند.

Acceptance:

- DataCategory ثابت (enum) در سیستم:
  - IdentityProfile
  - AuthEvents
  - AuditLogs
  - FederationLogs
  - AccessRequests
  - LifecycleHistory
- Entity `DataRetentionPolicy`:
  - TenantId
  - DataCategory
  - RetentionPeriodDays
  - HardDeleteAfter (bool)
  - Enabled
- API Tenant:
  - `GET /api/tenant/privacy/retention-policies`
  - `PUT /api/tenant/privacy/retention-policies/{category}`
- Default policies:
  - برای tenant جدید، defaultهای امن (مثلاً ۳۶۵ روز audit, ۱۸۰ روز auth events).

#### US 23.2 – Job اتوماتیک Retention Cleanup

به عنوان Platform  
می‌خواهم jobی باشد که طبق policyها داده‌ را پاک/آنونیمایز کند  
تا دیتابیس به مرور compliant و سبک بماند.

Acceptance:

- background job:
  - `DataRetentionCleanupJob`
- رفتار:
  - per tenant:
    - policyها را بخواند
    - برای هر category:
      - رکوردهای قدیمی‌تر از now - RetentionPeriodDays را پیدا کند
      - اگر HardDeleteAfter=true → DELETE
      - اگر false → anonymize
- حداقل دسته‌ها:
  - AuthEvents
  - AuditLogs
  - FederationLogs
- Audit:
  - log aggregated event:
    - "Privacy.RetentionCleanupExecuted" با تعداد رکورد per category.

---

### Epic 2 – Data Subject Requests (Export & Delete)

#### US 23.3 – ثبت DSR Export توسط End User

به عنوان End User  
می‌خواهم بتوانم درخواست "Export my data" برای tenant فعلی بدهم  
تا مطابق حق دسترسی به داده، اطلاعاتم را دریافت کنم.

Acceptance:

- در Account Center:
  - دکمه "Request data export"
- API:
  - `POST /api/account/privacy/data-requests`
    - body:
      - Type = Export
- سیستم:
  - DataSubjectRequest جدید:
    - Status = Requested
    - SubjectId = current user
    - TenantId = current tenant
- DPO/Admin:
  - می‌توانند از Admin UI آن را approve/execute کنند (یا auto-approve ساده در فاز اول).

#### US 23.4 – ثبت DSR Delete/Anonymize توسط End User یا Admin

به عنوان End User یا Tenant DPO  
می‌خواهم بتوانم درخواست "Delete/Anonymize my data" ثبت کنم  
تا در صورت نیاز، داده‌هایم مطابق قانون پاک شوند.

Acceptance:

- API:
  - `POST /api/account/privacy/data-requests`
    - Type = Delete
- یا Tenant Admin/DPO:
  - API:
    - `POST /api/tenant/privacy/data-requests` با SubjectId مشخص (مثلاً برای کارمند سابق).
- DataSubjectRequest:
  - Type = Delete
  - Status = Requested
  - Reason optional.

#### US 23.5 – اجرای DSR Export

به عنوان Tenant DPO  
می‌خواهم بتوانم درخواست Export را اجرا کنم  
تا سیستم یک بسته قابل‌دانلود از داده‌های user تولید کند.

Acceptance:

- API DPO:
  - `POST /api/tenant/privacy/data-requests/{id}/execute`
- Behavior:
  - جمع‌آوری data متعلق به SubjectId در tenant:
    - IdentityProfile (user profile, claims)
    - AuthEvents مربوط به user
    - AccessRequests
    - Lifecycle events برای آن user
  - ساخت یک بسته:
    - JSON یا ZIP با JSONها
  - ذخیره در storage امن با expiry time
  - update DataSubjectRequest:
    - Status = Completed
    - ResultLocation = signed URL
    - CompletedAt = now
- End User:
  - در Account Center بتواند نتیجه را ببیند و لینک را بردارد.

#### US 23.6 – اجرای DSR Delete/Anonymize

به عنوان Tenant DPO  
می‌خواهم بتوانم درخواست Delete را اجرا کنم  
تا داده user مطابق policy پاک یا anonymize شود.

Acceptance:

- API:
  - `POST /api/tenant/privacy/data-requests/{id}/execute`
    - اگر Type=Delete:
      - اجرا anonymization/delete.
- Behavior:
  - روی tenant scope:
    - user profile:
      - اگر business اجازه می‌دهد → حذف logical/physical
      - یا آنونیمایز: name/email/… → مقادیر generic یا hashed
    - logs/events:
      - user-identifying fields → hash یا null؛ باقی metadata حفظ شود.
  - Dependencies:
    - اگر جایی foreign key سخت به user دارد که حذفش سیستم را می‌ترکاند:
      - آنونیمایز به جای delete.
- update DataSubjectRequest:
  - Status = Completed
  - CompletedAt = now
- Audit:
  - "Privacy.DSR.DeleteExecuted" با tenant, subjectId, type.

---

### Epic 3 – Privacy Center UI (Tenant & Account)

#### US 23.7 – Tenant Privacy Center (Admin Portal)

به عنوان Tenant DPO  
می‌خواهم یک صفحه Privacy Center داشته باشم  
تا Retention، DSRها و وضعیت کلی privacy را مدیریت کنم.

Acceptance:

- صفحه `Admin Portal / Privacy Center`:
  - تب ۱: Retention Policies
    - جدول categories + RetentionPeriodDays + HardDeleteAfter + Enabled
    - فرم edit inline/modal
  - تب ۲: Data Subject Requests
    - جدول DSR:
      - Id
      - SubjectId (user display name/email)
      - Type (Export/Delete)
      - Status
      - RequestedAt
      - CompletedAt
      - RequestedBy
    - actions:
      - View details
      - Execute (برای Requested/InReview)
      - Mark as Rejected (با reason)
  - تب ۳: Summary
    - کارت‌ها:
      - تعداد DSRهای ۳۰ روز اخیر
      - آخرین اجرای retention job
      - حجم داده purge شده (اختیاری)

#### US 23.8 – Account Center – Privacy & Data

به عنوان End User  
می‌خواهم در Account Center وضعیت privacy خودم را ببینم  
و بتوانم DSR ثبت کنم و نتیجه را ببینم.

Acceptance:

- صفحه/تب جدید در Account Center:
  - `Account / Privacy`
- محتوا:
  - Info:
    - "Your data in this tenant"
  - لیست DSRهای خود user:
    - Type, Status, RequestedAt, CompletedAt
    - اگر Export با ResultLocation → لینک دانلود (تا زمانی که expiry تمام نشده)
  - دکمه‌ها:
    - "Request Data Export"
    - "Request Data Deletion" (با warning modal)

---

## 4. Dev Tasks – Backend

### 4.1 DataRetentionPolicy

**Task B23-1 – Entity & EF Mapping برای DataRetentionPolicy**

- Entity:
  - `DataRetentionPolicy`:
    - Id (Guid)
    - TenantId (Guid)
    - DataCategory (string/enum)
    - RetentionPeriodDays (int)
    - HardDeleteAfter (bool)
    - Enabled (bool)
- EF:
  - جدول `Privacy_DataRetentionPolicies`
  - unique index روی (TenantId, DataCategory)

**Task B23-2 – Service & API برای RetentionPolicy**

- Service:
  - `IDataRetentionPolicyService`
    - `Task<IReadOnlyList<DataRetentionPolicy>> GetForTenantAsync(tenantId)`
    - `Task<DataRetentionPolicy> UpsertAsync(tenantId, category, RetentionPeriodDays, HardDeleteAfter, Enabled)`
- API:
  - `GET /api/tenant/privacy/retention-policies`
  - `PUT /api/tenant/privacy/retention-policies/{category}`
- Permission:
  - Tenant DPO / SecurityOfficer / TenantAdmin با role خاص.

### 4.2 Retention Cleanup Job

**Task B23-3 – RetentionCleanupJob برای AuthEvents/Audit/FederationLogs**

- Job:
  - `DataRetentionCleanupJob`
- رفتار:
  - per tenant:
    - load policies.
    - برای هر category known که در آن جدول/ماژول داری:
      - کوئری رکوردهای قدیمی‌تر از now - RetentionPeriodDays.
      - اگر HardDeleteAfter=true → delete.
      - اگر false → anonymize:
        - e.g. for AuthEvents:
          - UserId → null یا hash
          - IP & UserAgent شاید نگه داری یا truncate.
- Audit:
  - aggregated event `Privacy.RetentionCleanupExecuted` با summary per tenant/category.

### 4.3 DataSubjectRequest Model & API

**Task B23-4 – Entity & EF Mapping برای DataSubjectRequest**

- Entity:
  - `DataSubjectRequest`:
    - Id (Guid)
    - TenantId (Guid)
    - SubjectId (UserId – Guid/string)
    - Type (Export/Delete)
    - Status (Requested/InReview/Approved/Processing/Completed/Rejected)
    - RequestedAt
    - RequestedBy (UserId)
    - CompletedAt
    - ResultLocation (string nullable)
    - Reason (string nullable)
- EF:
  - جدول `Privacy_DataSubjectRequests`
  - index روی TenantId, SubjectId, Type, Status.

**Task B23-5 – Account API برای ثبت DSR**

- Endpoint:
  - `POST /api/account/privacy/data-requests`
  - body:
    - Type = "Export" or "Delete"
    - Reason optional
- Behavior:
  - TenantId از context.
  - SubjectId = current user.
  - Status = Requested.
- Response:
  - DSR summary.

**Task B23-6 – Tenant API برای ثبت DSR برای کاربر دیگر**

- Endpoint:
  - `POST /api/tenant/privacy/data-requests`
  - body:
    - SubjectId
    - Type
    - Reason
- Permission:
  - Tenant DPO / SecurityOfficer.
- Status initial:
  - Requested یا InReview (configurable).

### 4.4 اجرای Export

**Task B23-7 – Service برای Data Export**

- Service:
  - `IDataExportService`
    - `Task<string> ExportUserDataAsync(tenantId, subjectId, dsrId)`
- Behavior:
  - در scope‌ی tenant:
    - gather:
      - user profile (Identity module)
      - auth events (Auth/Audit module)
      - access requests (AccessRequests module)
      - lifecycle events (IdentityLifecycle module)
  - ساخت مدل خروجی:
    - e.g.:
      - `profile.json`
      - `auth-events.json`
      - `access-requests.json`
  - بسته:
    - zip + jsonها.
  - ذخیره در storage (مثل MinIO/S3) با expiry.
  - return storage path / signed URL.

**Task B23-8 – API اجرای Export DSR**

- Endpoint:
  - `POST /api/tenant/privacy/data-requests/{id}/execute` وقتی Type=Export
- Behavior:
  - validate:
    - DSR Type = Export
    - Status in {Requested, InReview}
  - call `IDataExportService.ExportUserDataAsync`
  - update DSR:
    - Status = Completed
    - ResultLocation = URL
    - CompletedAt = now.
- Audit:
  - `Privacy.DSR.ExportExecuted`.

### 4.5 اجرای Delete/Anonymize

**Task B23-9 – Service برای Anonymization/Delete**

- Service:
  - `IDataDeletionService`
    - `Task ExecuteDeleteAsync(tenantId, subjectId, dsrId)`
- Behavior:
  - برای tenant و user:
    - User profile:
      - اگر می‌شود hard delete: delete
      - اگر نه: anonymize:
        - Name → "Deleted User"
        - Email → random hash با suffix ثابت مثلا `deleted@example.com`
        - Phone/PII → null
    - AuthEvents/AuditLogs:
      - بشکل:
        - UserId → null یا hash
        - فقط metadata فنی نگه داری.
  - Configurable per module (با helpers).

**Task B23-10 – API اجرای Delete DSR**

- Endpoint:
  - `POST /api/tenant/privacy/data-requests/{id}/execute` وقتی Type=Delete
- Behavior:
  - validate DSR
  - call `IDataDeletionService.ExecuteDeleteAsync`
  - update:
    - Status = Completed
    - CompletedAt = now.
- Audit:
  - `Privacy.DSR.DeleteExecuted`.

---

## 5. Dev Tasks – Frontend

### 5.1 Tenant Privacy Center

**Task F23-1 – Privacy Center Page در Admin Portal**

- Route:
  - `/tenant/privacy`
- Tabs:
  - `Retention`
  - `Data Requests`
  - `Overview`

**Task F23-2 – Retention Tab UI**

- Calls:
  - `GET /api/tenant/privacy/retention-policies`
  - `PUT /api/tenant/privacy/retention-policies/{category}`
- Table:
  - DataCategory
  - RetentionPeriodDays (editable)
  - HardDeleteAfter (toggle)
  - Enabled (toggle)
- همه labelها i18n.

**Task F23-3 – Data Requests Tab UI**

- Calls:
  - `GET /api/tenant/privacy/data-requests`
  - `POST /api/tenant/privacy/data-requests` (for admin-created)
  - `POST /api/tenant/privacy/data-requests/{id}/execute`
- Table:
  - Id
  - Subject (display name + email)
  - Type
  - Status (badge)
  - RequestedAt
  - CompletedAt
- Actions:
  - View details:
    - Reason
    - ResultLocation (for Export)
  - Execute:
    - confirm modal
  - Mark as Rejected:
    - reason modal.

**Task F23-4 – Overview Tab**

- Cards:
  - Count of DSR last 30 days
  - Last retention cleanup timestamp (from API summary)
  - Total records cleaned last run (optional)

### 5.2 Account Center – Privacy

**Task F23-5 – Account Privacy Tab**

- Route:
  - `/account/privacy`
- Calls:
  - `GET /api/account/privacy/data-requests`
  - `POST /api/account/privacy/data-requests` (Export/Delete)
- UI:
  - Section info about data usage (static text + i18n).
  - List:
    - Type
    - Status
    - RequestedAt
    - CompletedAt
    - For Export with ResultLocation → "Download" button (opens new tab, until expiry).
  - Buttons:
    - "Request Data Export" → POST Export
    - "Request Data Deletion" → POST Delete with strong warning.

---

## 6. Cross-Cutting – Security, Audit, Compliance

### 6.1 Permissions

**Task X23-1 – Roles & Permissions**

- Tenant APIs `/api/tenant/privacy/*`:
  - فقط:
    - TenantDPO
    - SecurityOfficer
    - یا role اختصاصی مثلا `Tenant.PrivacyAdmin`.
- Account APIs:
  - فقط authenticated user برای خودش (subjectId = current user).

### 6.2 Audit Events

**Task X23-2 – Audit Logging**

ثبت eventهای زیر:

- "Privacy.RetentionPolicy.Updated"
- "Privacy.RetentionCleanupExecuted"
- "Privacy.DSR.RequestCreated"
- "Privacy.DSR.ExportExecuted"
- "Privacy.DSR.DeleteExecuted"
- "Privacy.DSR.RequestRejected"

هر event:
- TenantId
- SubjectId (وقتی relevant)
- ActorId (admin یا user)

### 6.3 Compliance Documentation (DevPortal)

**Task X23-3 – DevPortal Privacy & DSR Docs**

- صفحه جدید:
  - `/devportal/privacy-and-dsr`
- محتوا:
  - توضیح:
    - DSR types (Export/Delete)
    - Retention policies
    - behavior anonymization vs hard delete
  - برای مشتری B2B:
    - برای RFP بتوانند این صفحه را لینک کنند.

---

## 7. Tests

### 7.1 Backend Tests

**Task T23-1 – Unit/Integration Tests**

- Retention:
  - اعمال policy و حذف/آنونیمایز رکوردهای قدیمی.
- DSR Export:
  - ایجاد DSR → execute → فایل export شامل profile + events.
- DSR Delete:
  - بعد از اجرا:
    - profile anonymized/deleted
    - logs بدون PII مستقیم.
- Permissions:
  - End user نمی‌تواند DSR برای user دیگری بسازد.
  - فقط DPO می‌تواند DSR دیگری را execute کند.

### 7.2 Frontend Tests (حداقل Manual)

**Task T23-2 – Manual UI Verification**

- Tenant Privacy Center:
  - تغییر Retention policy و دیدن اعمال شدن.
  - مشاهده DSR و اجرای Export/Delete.
- Account Privacy:
  - ثبت درخواست Export/Delete.
  - دیدن نتیجه.

---

## 8. نکته نهایی Phase 23

هدف این فاز:

- onesign بتواند به این سؤال جواب بدهد:
  - «داده‌های کاربر چقدر نگه داشته می‌شود؟»
  - «اگر کاربر درخواست delete/export بدهد چه می‌شود؟»
  - «logهای شما بی‌نهایت نیست؟»

اگر بعد از Phase 23 هنوز:

- هیچ Retention واقعی نداری
- DSR فقط عنوان در UI است
- آنونیمایز یعنی `DELETE FROM Users WHERE Id=@id`  

یعنی این فاز را کشتی و محصولت از نظر privacy هنوز اسباب‌بازی است.
