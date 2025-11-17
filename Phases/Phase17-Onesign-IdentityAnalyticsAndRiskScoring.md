# onesign – Phase 17 Identity Analytics & Risk Scoring

## 1. محدوده Phase 17

### 1.1 هدف کلی

Phase 17 تمرکز دارد روی این که onesign:

- برای هر **User / Tenant / Application** یک تصویر تحلیلی داشته باشد (Identity 360°).
- برای هر کاربر یک **Risk Score** قابل توضیح بدهد.
- یک **Insight Feed** تولید کند:
  - High-risk users
  - Dormant/Zombie accounts
  - Over-privileged users
  - Tenants با ریسک بالا
- این داده‌ها را در Security Center و Governance قابل مشاهده و اکشن کند.

این فاز نه Core SSO اضافه می‌کند، نه feature رگباری. این فاز باعث می‌شود CISO و Security Officer حس کنند محصول «مغز» دارد، نه فقط «دکمه لاگین».

### 1.2 Personas

- **Security Officer / SOC Lead**
  - می‌خواهد:
    - بداند امروز چه کسی بیشترین ریسک را دارد.
    - anomaly یا pattern‌های عجیب را روی login و access ببیند.
    - بتواند روی این insightها اقدام کند (revoke, review, campaign).

- **Compliance / Auditor**
  - می‌خواهد:
    - گزارش ریسک کاربر / گروه / tenant داشته باشد.
    - نشان بدهد که ریسک access تحت کنترل است.

- **Tenant Admin / IAM Owner**
  - می‌خواهد:
    - بفهمد کدام userها دسترسی اضافه دارند.
    - کدام حساب‌ها عملا استفاده نمی‌شوند.
    - به زبان ساده بفهمد «چرا user X به app Y دسترسی دارد».

---

## 2. معماری کلی Phase 17

### 2.1 ماژول جدید: IdentityInsights

ماژول جدید:

- `Onesign.Modules.IdentityInsights`

مسئولیت‌ها:

- جمع‌آوری داده از:
  - Audit & Login Logs (Phase 6)
  - Lifecycle Events (Phase 15)
  - AccessRequests (Phase 12)
  - Governance / Access Reviews (Phase 10)
  - PrivilegedAccess / JIT (Phase 16)
  - Notification & Security Center (Phase 3, 11)
- ساخت مدل تحلیلی:
  - UserRiskProfile
  - TenantRiskProfile
  - Insight (eventهای آماده برای Security/Compliance)
- ارائه API برای:
  - داشبورد Security Center
  - Governance / گزارش‌ها

### 2.2 مفاهیم کلیدی

- **UserRiskScore**
  - عدد (مثلا ۰–۱۰۰) که ریسک کلی user را نشان می‌دهد:
    - MFA وضعیت
    - privileged roles
    - failed logins / suspicious logins
    - Joiner/Mover/Leaver anomalies
    - SoD violations
    - stale access (roleهایی که استفاده نمی‌شوند)

- **Insight**
  - یک finding قابل action:
    - نوع: `HighRiskUser`, `ZombieAccount`, `ExcessivePrivileges`, `TenantRiskHigh`, …
    - severity: Info / Low / Medium / High / Critical
    - scope: User, Tenant, App
    - توصیه (remediation hint)

- **Analytics Snapshot**
  - جدول/رکورد دوره‌ای برای aggregation:
    - روزانه/ساعتی برای:
      - login count
      - failed logins
      - MFA bypass
      - privileged session count
      - JIT grants, BreakGlass usage

---

## 3. Epics و User Storyها – Phase 17

### Epic 1 – Identity Analytics Data Model (User 360)

#### US 17.1 – User Analytics Snapshot

به عنوان Security Officer  
می‌خواهم برای هر User یک پروفایل تحلیلی داشته باشم  
تا بفهمم رفتار، دسترسی و سابقه‌اش در یک جا دیده شود.

Acceptance:

- مدل `UserAnalyticsSnapshot`:
  - TenantId
  - UserId
  - LastLoginAt
  - FailedLoginCount (window زمانی)
  - SuccessfulLoginCount
  - MFAEnabled (bool)
  - PrivilegedRolesCount
  - AppsCount
  - ActiveJitGrantsCount
  - LastAccessReviewResult (Approved/Revoked/Missing)
  - LastLifecycleEventType (Joiner/Mover/Leaver)
  - LastLifecycleEventAt

- Snapshotها دوره‌ای (job) ساخته شوند.

#### US 17.2 – Tenant Analytics Summary

به عنوان Global/Tenant Admin  
می‌خواهم بدانم کدام tenantها ریسک بیشتری دارند  
تا تمرکز مراقبت را روی آنها بگذارم.

Acceptance:

- مدل `TenantAnalyticsSummary`:
  - TenantId
  - UsersCount
  - PrivilegedUsersCount
  - MFAEnrollmentRate
  - FailedLoginRate
  - HighRiskUsersCount
  - BreakGlassUsageCount (window زمانی)
  - OpenGovernanceFindingsCount

---

### Epic 2 – Risk Scoring Engine

#### US 17.3 – User Risk Score Rule-based Engine

به عنوان سیستم  
می‌خواهم برای هر کاربر، بر اساس ruleهای مشخص، RiskScore محاسبه کنم  
تا بتوانم آنها را sort و segment کنم.

Acceptance:

- سرویس `IUserRiskScoringService`:
  - `Task<UserRiskScore> CalculateAsync(UserAnalyticsSnapshot snapshot, …context)`
- UserRiskScore:
  - Score (0–100)
  - Breakdown: list از عوامل با weight:
    - e.g.:
      - MFA disabled → +20
      - Has privileged role(s) → +25
      - Recent failed logins spike → +15
      - BreakGlass login for this user → +20
      - Has SoD violation unresolved → +15
      - No login in 90 days ولی active access دارد → +10
- Ruleها کاملا در کد پیاده شوند (نه TODO برای “ML بعدا”).

#### US 17.4 – Tenant Risk Score

به عنوان Security Officer  
می‌خواهم یک RiskScore برای هر tenant داشته باشم  
تا در بین صدها tenant بتوانم quickly high-riskها را ببینم.

Acceptance:

- سرویس `ITenantRiskScoringService`
  - بر اساس TenantAnalyticsSummary:
    - MFAEnrollmentRate پایین → افزایش ریسک
    - تعداد زیاد HighRiskUsers → افزایش ریسک
    - BreakGlassUsage زیاد → افزایش ریسک
    - Governance findings باز → افزایش ریسک

---

### Epic 3 – Insight Feed

#### US 17.5 – High Risk Users Insight

به عنوان Security Officer  
می‌خواهم لیست High Risk Users را در یک feed ببینم  
تا بتوانم رویشان اقدام کنم.

Acceptance:

- Entity `Insight`:
  - Id
  - TenantId
  - Type (e.g. HighRiskUser)
  - ScopeType (User/Tenant/App)
  - ScopeId
  - Severity (Low/Medium/High/Critical)
  - Title / MessageKey
  - Data (json for extra fields)
  - CreatedAt
  - ResolvedAt (nullable)
  - Status (Open, Resolved, Dismissed)

- Rule برای تولید HighRiskUser Insight:
  - اگر UserRiskScore > threshold مشخص (مثلا ۷۰):
    - Insight جدید نوع HighRiskUser تولید شود:
      - Severity بر اساس Score.

#### US 17.6 – Zombie Accounts / Dormant High-Access Users

به عنوان IAM Owner  
می‌خواهم بدانم چه userهایی access دارند ولی مدت طولانی log in نکرده‌اند  
تا بتوانم access را پاکسازی کنم.

Acceptance:

- Insight Type: `ZombieAccount`
  - شرایط:
    - LastLoginAt > N روز قبل (مثلا ۹۰ روز)
    - ولی roles و apps فعال دارد.
  - Severity:
    - اگر privileged role هم دارد → بالاتر.

#### US 17.7 – Excessive Privileges Insight

به عنوان Governance Officer  
می‌خواهم insight بگیرم برای userهایی که بیش از حد role/permission دارند  
تا بتوانم reduce access کنم.

Acceptance:

- Insight Type: `ExcessivePrivileges`
  - شرایط:
    - تعداد roles یا access به apps حساس بیشتر از threshold.
    - یا مشابه userهای هم‌رده در OrgUnit/JobRole نمی‌باشد (outlier ساده rule-based).
  - Data:
    - list roles/apps اضافی.

---

### Epic 4 – Security Center & Admin Portal Integration

#### US 17.8 – Security Center – Risk Overview

به عنوان Security Officer  
می‌خواهم صفحه‌ای در Security Center داشته باشم که:
- HighRiskUsers
- TenantRisk
- Insights جدید  
را نشان دهد.

Acceptance:

- صفحه `/tenant/security/insights`:
  - chart:
    - HighRiskUsers count over time
  - table:
    - Insights (filter by type/severity/status)
  - widget:
    - top N HighRiskUsers (نام + score + quick actions)

#### US 17.9 – User Risk Profile در User Detail

به عنوان Tenant Admin  
می‌خواهم وقتی User را باز می‌کنم، RiskScore و عواملش را ببینم  
تا بفهمم چرا پرریسک شده.

Acceptance:

- در User Detail (همان صفحه که Lifecycle و … دارد):
  - تب/section "Risk & Insights"
- نمایش:
  - UserRiskScore (با رنگ/badge)
  - breakdown:
    - factor → impact score
  - لیست Insights مربوط به این user.

---

## 4. Dev Tasks – Backend

### 4.1 Data Model و Aggregation

**Task B17-1 – Entities برای Analytics**

در `Onesign.Modules.IdentityInsights.Domain`:

- `UserAnalyticsSnapshot`
- `TenantAnalyticsSummary`
- `UserRiskScoreEntity` (اختیاری، اگر persisted)
- `Insight`

Mappings:

- EF mapping + migration Phase 17.

**Task B17-2 – Snapshot Builder Jobs**

- Background job برای `UserAnalyticsSnapshot`:
  - دوره‌ای (مثلا هر ۱۵ دقیقه یا هر ساعت).
  - منابع:
    - Login/audit logs:
      - last success/fail
      - counts در window
    - MFA enrollment state از Security module
    - Roles از Authorization
    - Apps از ApplicationRegistry
    - Lifecycle events آخرین (Joiner/Mover/Leaver)
    - Governance review status (آخرین نتیجه)
    - JIT grants فعال (Phase 16)
- Background job برای `TenantAnalyticsSummary`:
  - aggregate از snapshotهای user و سایر داده‌ها.

### 4.2 Risk Engine

**Task B17-3 – UserRiskScoringService**

- interface:
  - `IUserRiskScoringService`
- پیاده‌سازی rule-based:
  - config-driven weights (از appsettings یا TenantConfig، ولی default global).
- کار:
  - گرفتن UserAnalyticsSnapshot و context:
    - Governance findings
    - Privileged access info
  - calculate score 0–100
  - produce breakdown (list factors).

**Task B17-4 – TenantRiskScoringService**

- interface:
  - `ITenantRiskScoringService`
- بر اساس TenantAnalyticsSummary:
  - وزن دادن به:
    - MFAEnrollmentRate
    - HighRiskUsersCount نسبی
    - BreakGlassUsage
    - OpenGovernanceFindingsCount

**Task B17-5 – Scheduled Risk Calculation**

- job:
  - برای هر UserAnalyticsSnapshot:
    - calculate UserRiskScore
    - ذخیره در table مخصوص یا در همان snapshot (فیلد Score + BreakdownJson).
  - برای هر TenantAnalyticsSummary:
    - tenant risk را محاسبه و ذخیره کند.

### 4.3 Insight Generation

**Task B17-6 – InsightGenerationService**

- service:
  - `IInsightGenerationService`
- وظیفه:
  - براساس Snapshotها و RiskScores، Insightهای جدید بسازد:
    - HighRiskUser
    - ZombieAccount
    - ExcessivePrivileges
    - TenantHighRisk (optional)
- پیاده‌سازی:

  - HighRiskUser:
    - اگر score > threshold و Insight باز قبلی ندارد:
      - Insight جدید ایجاد کند.
  - ZombieAccount:
    - اگر LastLoginAt > N روز و roles/apps فعال دارد:
      - Insight باز ایجاد کند.
  - ExcessivePrivileges:
    - اگر roles/apps count از threshold بیشتر و از median peers در OrgUnit/JobRole خیلی بیشتر است (outlier ساده):
      - Insight ایجاد.

- Insight lifecycle:
  - اگر شرایط دیگر برقرار نیست:
    - Insight را به Resolved تغییر وضعیت بده.

**Task B17-7 – Insight Repository & API**

- APIs:
  - `GET /api/tenant/insights`
    - filter: type, severity, status, date range
  - `GET /api/tenant/insights/{id}`
  - `POST /api/tenant/insights/{id}/resolve`
  - `POST /api/tenant/insights/{id}/dismiss`

Authorization:
- فقط SecurityOfficer / TenantAdmin.

### 4.4 User Risk Profile APIs

**Task B17-8 – User Risk Profile API**

- `GET /api/tenant/insights/users/{userId}/risk-profile`
- پاسخ:
  - UserRiskScore
  - Breakdown (list factors)
  - Related Insights (list)

### 4.5 Tenant Risk & Metrics APIs

**Task B17-9 – Tenant Risk API**

- `GET /api/tenant/insights/tenant-risk`
  - برگرداند:
    - TenantRiskScore
    - summary metrics (HighRiskUsersCount, MFAEnrollmentRate, …)

**Task B17-10 – High Risk Users API**

- `GET /api/tenant/insights/high-risk-users`
  - paging
  - sort by score descending
  - برگرداند:
    - UserId, DisplayName, Score, main factors.

---

## 5. Dev Tasks – Frontend / Admin Portal

### 5.1 Security Center Insights Page

**Task F17-1 – صفحه `/tenant/security/insights`**

- بخش‌ها:
  - Top cards:
    - HighRiskUsers count
    - TenantRiskScore badge
    - OpenInsights count
  - chart (simple):
    - HighRiskUsers count over time (مثلا ۳۰ روز)
  - table Insights:
    - columns:
      - Type
      - Severity (badge)
      - Scope (User/Tenant/App)
      - CreatedAt
      - Status
    - actions:
      - View details
      - Resolve
      - Dismiss

**Task F17-2 – High Risk Users Widget**

- component در همان صفحه:
  - list top N high risk users:
    - display name
    - score
    - risk badge
    - quick action:
      - link to user detail
      - link to start Governance review campaign (در صورت امکان) یا Access review page.

### 5.2 User Detail – Risk Tab

**Task F17-3 – User Risk & Insights Tab**

- در صفحه User Detail:
  - تب "Risk & Insights"
- نمایش:
  - RiskScore gauge/indicator
  - breakdown:
    - list:
      - “MFA disabled” (+20)
      - “Has privileged role(s)” (+25)
      - “Failed login spike last 24h” (+15)
      - … بر اساس breakdown دریافت شده.
  - جدول Insights مربوط به user:
    - Type, Severity, CreatedAt, Status.

---

## 6. Cross Cutting – Observability, Governance, Security

**Task X17-1 – Logging & Audit**

- audit events:
  - "Insights.UserRiskCalculated"
  - "Insights.TenantRiskCalculated"
  - "Insights.Created"
  - "Insights.Resolved"
  - "Insights.Dismissed"

**Task X17-2 – Metrics**

- metrics:
  - HighRiskUsersCount per tenant
  - Insights count by type/severity
  - RiskScore distribution (bucketed)
- استفاده در dashboard و آینده برای ML اگر خواستی.

**Task X17-3 – Governance Integration**

- در Governance (Phase 10):
  - امکان:
    - شروع campaign بر اساس HighRiskUsers:
      - checkbox "Seed from HighRiskUsers".
- integration minimal:
  - endpoint Governance را call کن تا campaign را با subsetی از userها بسازد.

**Task X17-4 – Security & Access Control**

- فقط نقش‌های:
  - SecurityOfficer / TenantAdmin:
    - می‌توانند insights را ببینند/resolve کنند.
- کاربر عادی:
  - فقط RiskScore یا Insights شخص خودش را ببیند؟  
    - اگر در scope محصول هست، با دقت و role check.

**Task X17-5 – Localization**

- همه labelهای جدید:
  - "Risk Score", "High Risk Users", "Insights", "Zombie Account", "Excessive Privileges" …
- همه با i18n key، ترجمه فارسی/انگلیسی.

---

## 7. نکات طراحی Phase 17

- این فاز باید خروجی ملموس بدهد:
  - یک Security Officer وارد Security Center می‌شود و ببیند:
    - “Top 10 High-Risk Users”
    - “اینها چرا High-Risk شدند”
    - “از همینجا بتواند اقدام کند (Review, Revoke, …)”
- اشتباه کشنده:
  - فقط نمودار «خوشگل» بسازی ولی RiskScore و Insight واقعا درست و قابل توضیح نباشد.
- Rule-based بودن در این فاز کاملا قابل قبول است  
  (ML/AI را می‌توانی بذاری Phase 18، وقتی data pipeline درست شد).

هدف Phase 17:

> از یک سیستم SSO/IAM، به یک **Identity Risk & Insight Platform** نزدیک شوی؛ جایی که سؤال "خطرناک‌ترین کاربر من الان کیه و چرا؟" جواب واقعی دارد، نه حدس.
