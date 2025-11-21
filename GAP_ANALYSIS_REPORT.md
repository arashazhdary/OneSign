# 📊 Gap Analysis Report - OneSign Platform

**تاریخ تحلیل:** 2025-11-21 08:53

---

## 🎯 خلاصه اجرایی

- **تعداد کل Endpoint های Backend:** 302
- **تعداد API Call های Frontend:** 113
- **Endpoint های Connected:** 56
- **Endpoint های بدون صفحه:** 246
- **درصد Coverage:** 18.54%

**Coverage Bar:** `███░░░░░░░░░░░░░░░░░` 18.54%

⚠️ **وضعیت:** نیاز به توسعه گسترده Frontend

---

## 🔥 خلاصه بر اساس اولویت

### 🔴 Critical Priority

**تعداد:** 35 endpoint

**توزیع بر اساس دسته:**
- Security Management: 24 endpoint
- Authentication & Discovery: 6 endpoint
- Developer Tools: 4 endpoint
- Analytics & Insights: 1 endpoint

### 🟠 High Priority

**تعداد:** 60 endpoint

**توزیع بر اساس دسته:**
- Security Monitoring: 39 endpoint
- Access Management: 11 endpoint
- Identity Management: 4 endpoint
- Identity Lifecycle: 3 endpoint
- Analytics & Insights: 2 endpoint
- Governance & Privacy: 1 endpoint

### 🟡 Medium Priority

**تعداد:** 82 endpoint

**توزیع بر اساس دسته:**
- Developer Tools: 14 endpoint
- Change Management: 12 endpoint
- AI & Automation: 10 endpoint
- Governance & Privacy: 8 endpoint
- Authorization & Policy: 7 endpoint
- Analytics & Insights: 6 endpoint
- Federation & SSO: 6 endpoint
- Identity Lifecycle: 5 endpoint
- Platform Features: 4 endpoint
- Billing & Subscription: 4 endpoint
- Tenant Management: 2 endpoint
- Organization Structure: 2 endpoint
- Application Management: 2 endpoint

### 🟢 Low Priority

**تعداد:** 69 endpoint

**توزیع بر اساس دسته:**
- Platform Management: 17 endpoint
- Multi-Region & DR: 13 endpoint
- Change Management: 12 endpoint
- Billing & Subscription: 8 endpoint
- AI & Automation: 7 endpoint
- Analytics & Insights: 6 endpoint
- Platform Monitoring: 4 endpoint
- Governance & Privacy: 2 endpoint

---

## 📂 خلاصه بر اساس دسته‌بندی

| دسته | تعداد بدون صفحه | اولویت |
|------|-----------------|--------|
| Security Monitoring | 39 | 🟠 High |
| Change Management | 24 | 🟡 Medium |
| Security Management | 24 | 🔴 Critical |
| Developer Tools | 18 | 🔴 Critical |
| AI & Automation | 17 | 🟡 Medium |
| Platform Management | 17 | 🟢 Low |
| Analytics & Insights | 15 | 🔴 Critical |
| Multi-Region & DR | 13 | 🟢 Low |
| Billing & Subscription | 12 | 🟡 Medium |
| Governance & Privacy | 11 | 🟠 High |
| Access Management | 11 | 🟠 High |
| Identity Lifecycle | 8 | 🟠 High |
| Authorization & Policy | 7 | 🟡 Medium |
| Authentication & Discovery | 6 | 🔴 Critical |
| Federation & SSO | 6 | 🟡 Medium |
| Platform Monitoring | 4 | 🟢 Low |
| Identity Management | 4 | 🟠 High |
| Platform Features | 4 | 🟡 Medium |
| Tenant Management | 2 | 🟡 Medium |
| Organization Structure | 2 | 🟡 Medium |
| Application Management | 2 | 🟡 Medium |

---

## 🏢 توزیع بر اساس Portal و Section

### admin-portal

- **tenant:** 152 endpoint
- **global:** 90 endpoint

### login-portal

- **auth:** 4 endpoint

---

## 📄 توزیع بر اساس نوع صفحه

| نوع صفحه | تعداد |
|----------|-------|
| Feature Page | 105 |
| List View | 73 |
| Form | 30 |
| Detail View | 25 |
| Search/Query Interface | 6 |
| Dashboard | 5 |
| Settings Form | 2 |

---

## 📋 لیست جامع Endpoint های بدون صفحه

### 🔴 Security Management

**تعداد:** 24 endpoint | **اولویت:** Critical

#### AdaptiveSecurityController

##### 🔵 GET `/api/tenant/adaptive-security/policies`

**توضیحات:** دریافت سیاست‌های امنیتی تطبیقی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/adaptive-security/policies`

**توضیحات:** ایجاد سیاست امنیتی تطبیقی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/adaptive-security/policies/{id}`

**توضیحات:** دریافت سیاست امنیتی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/adaptive-security/policies/{id}`

**توضیحات:** بروزرسانی سیاست امنیتی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/adaptive-security/policies/{id}`

**توضیحات:** حذف سیاست امنیتی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/adaptive-security/policies/{id}/disable`

**توضیحات:** غیرفعال‌سازی سیاست

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/adaptive-security/policies/{id}/enable`

**توضیحات:** فعال‌سازی سیاست

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/adaptive-security/signals`

**توضیحات:** دریافت سیگنال‌های امنیتی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/adaptive-security/signals`

**توضیحات:** پردازش سیگنال امنیتی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/adaptive-security/users/{userId}/context`

**توضیحات:** دریافت متن امنیتی کاربر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/adaptive-security/users/{userId}/context`

**توضیحات:** بروزرسانی متن امنیتی کاربر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### CryptoController

##### 🔵 GET `/api/global/crypto/keysets`

**توضیحات:** دریافت تمام KeySet ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/global/crypto/keysets/{id}`

**توضیحات:** دریافت KeySet با ورژن‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/crypto/keysets/{id}/rollover`

**توضیحات:** Rollover دستی کلید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/crypto/keyversions/{id}/revoke`

**توضیحات:** ابطال نسخه کلید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/crypto/rotation-policies`

**توضیحات:** دریافت سیاست‌های Rotation کلیدها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### MfaController

##### 🟢 POST `/api/tenant/mfa/challenge`

**توضیحات:** ایجاد چالش MFA

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/mfa/check-requirement`

**توضیحات:** بررسی الزام MFA

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/mfa/methods`

**توضیحات:** دریافت روش‌های MFA کاربر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔴 DELETE `/api/tenant/mfa/methods/{methodId}`

**توضیحات:** غیرفعال کردن روش MFA

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### SecurityPolicyController

##### 🔵 GET `/api/tenant/security/policy/org-unit-rules`

**توضیحات:** دریافت قوانین MFA سطح واحد سازمانی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/security/policy/org-unit-rules`

**توضیحات:** بروزرسانی قوانین MFA واحد سازمانی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Settings Form`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### TrustedDevicesController

##### 🔵 GET `/api/tenant/trusted-devices`

**توضیحات:** دریافت دستگاه‌های قابل اعتماد

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/trusted-devices/check`

**توضیحات:** بررسی قابل اعتماد بودن دستگاه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

---

### 🔴 Developer Tools

**تعداد:** 18 endpoint | **اولویت:** Critical

#### ApiKeyController

##### 🔵 GET `/api/tenant/api-keys`

**توضیحات:** دریافت لیست API Key ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/api-keys`

**توضیحات:** ایجاد API Key

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/api-keys/{id}/revoke`

**توضیحات:** ابطال API Key

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### ExtensibilityController

##### 🔵 GET `/api/tenant/extensibility/login-hooks`

**توضیحات:** دریافت Login Hook ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/extensibility/login-hooks`

**توضیحات:** ایجاد Login Hook

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟡 PUT `/api/tenant/extensibility/login-hooks/{id}`

**توضیحات:** بروزرسانی Login Hook

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/extensibility/login-hooks/{id}`

**توضیحات:** حذف Login Hook

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/extensibility/event-types`

**توضیحات:** دریافت انواع رویدادهای قابل Hook

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/extensibility/token-rules`

**توضیحات:** دریافت Token Enrichment Rule ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/extensibility/token-rules`

**توضیحات:** ایجاد Token Rule

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟡 PUT `/api/tenant/extensibility/token-rules/{id}`

**توضیحات:** بروزرسانی Token Rule

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/extensibility/token-rules/{id}`

**توضیحات:** حذف Token Rule

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/extensibility/webhooks`

**توضیحات:** دریافت Webhook ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/extensibility/webhooks`

**توضیحات:** ایجاد Webhook

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟡 PUT `/api/tenant/extensibility/webhooks/{id}`

**توضیحات:** بروزرسانی Webhook

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/extensibility/webhooks/{id}`

**توضیحات:** حذف Webhook

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### ServiceAccountController

##### 🔵 GET `/api/tenant/service-accounts`

**توضیحات:** دریافت لیست Service Account ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/service-accounts`

**توضیحات:** ایجاد Service Account

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🔴 Analytics & Insights

**تعداد:** 15 endpoint | **اولویت:** Critical

#### GlobalInsightsController

##### 🔵 GET `/api/global/insights/tenants/risky`

**توضیحات:** دریافت تنانت‌های پرخطر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/global/insights/export/tenants`

**توضیحات:** خروجی CSV خلاصه تنانت‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد | قابلیت Export داده

##### 🔵 GET `/api/global/insights/report-subscriptions`

**توضیحات:** دریافت اشتراک‌های گزارش سطح Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/insights/report-subscriptions`

**توضیحات:** ایجاد اشتراک گزارش Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟡 PUT `/api/global/insights/report-subscriptions/{id}`

**توضیحات:** بروزرسانی اشتراک گزارش

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/global/insights/report-subscriptions/{id}`

**توضیحات:** حذف اشتراک گزارش

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/insights/tenants/overview`

**توضیحات:** دریافت خلاصه تمام تنانت‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Dashboard`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### InsightsController

##### 🔵 GET `/api/tenant/insights/users/security-posture`

**توضیحات:** دریافت وضعیت امنیتی کاربران

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/insights/export/users`

**توضیحات:** خروجی CSV از وضعیت امنیتی کاربران

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد | قابلیت Export داده

##### 🔵 GET `/api/tenant/insights/apps`

**توضیحات:** دریافت آمار استفاده از اپلیکیشن‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/insights/export/overview`

**توضیحات:** خروجی CSV از گزارش خلاصه تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Dashboard`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد | قابلیت Export داده

##### 🔵 GET `/api/tenant/insights/report-subscriptions`

**توضیحات:** دریافت اشتراک‌های گزارش

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/insights/report-subscriptions`

**توضیحات:** ایجاد اشتراک گزارش جدید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟡 PUT `/api/tenant/insights/report-subscriptions/{id}`

**توضیحات:** بروزرسانی اشتراک گزارش

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/insights/report-subscriptions/{id}`

**توضیحات:** حذف اشتراک گزارش

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🔴 Authentication & Discovery

**تعداد:** 6 endpoint | **اولویت:** Critical

#### AuthController

##### 🟢 POST `/api/auth/complete-first-login`

**توضیحات:** تکمیل اولین ورود (تنظیم رمز عبور)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `login-portal`
- **Section:** `auth`
- **Route پیشنهادی:** `/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ✅ بله - `/login`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### ConnectController

##### 🔵 GET `/connect/authorize`

**توضیحات:** OIDC Authorization Endpoint (PKCE)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `login-portal`
- **Section:** `auth`
- **Route پیشنهادی:** `/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/connect/token`

**توضیحات:** OIDC Token Endpoint (تبدیل کد به توکن)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `login-portal`
- **Section:** `auth`
- **Route پیشنهادی:** `/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### DiscoveryController

##### 🔵 GET `/.well-known/openid-configuration`

**توضیحات:** دریافت OpenID Configuration

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### JwksController

##### 🔵 GET `/.well-known/jwks.json`

**توضیحات:** دریافت JWKS (برای HS256 خالی است)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### UserInfoController

##### 🔵 GET `/connect/userinfo`

**توضیحات:** دریافت اطلاعات کاربر (OIDC UserInfo Endpoint)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `login-portal`
- **Section:** `auth`
- **Route پیشنهادی:** `/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Critical`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

---

### 🟠 Security Monitoring

**تعداد:** 39 endpoint | **اولویت:** High

#### HuntingController (Global)

##### 🔵 GET `/api/global/hunting/hunt-runs/{runId}`

**توضیحات:** دریافت جزئیات اجرا

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/hunting/query`

**توضیحات:** اجرای Query در سطح Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Search/Query Interface`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد | نیاز به رابط جستجو

##### 🔵 GET `/api/global/hunting/saved-queries`

**توضیحات:** دریافت Query های Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/hunting/saved-queries`

**توضیحات:** ایجاد Query Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/hunting/saved-queries/{id}`

**توضیحات:** دریافت Query خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/global/hunting/saved-queries/{id}`

**توضیحات:** بروزرسانی Query

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/global/hunting/saved-queries/{id}`

**توضیحات:** حذف Query

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/hunting/scheduled-hunts`

**توضیحات:** دریافت Hunt های زمان‌بندی شده Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/hunting/scheduled-hunts`

**توضیحات:** ایجاد Hunt زمان‌بندی شده Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/hunting/scheduled-hunts/{id}`

**توضیحات:** دریافت Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/global/hunting/scheduled-hunts/{id}`

**توضیحات:** بروزرسانی Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/global/hunting/scheduled-hunts/{id}`

**توضیحات:** حذف Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/hunting/scheduled-hunts/{id}/runs`

**توضیحات:** دریافت اجراهای Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### HuntingController (Tenant)

##### 🔵 GET `/api/tenant/hunting/hunt-runs/{runId}`

**توضیحات:** دریافت جزئیات اجرای Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/hunting/query`

**توضیحات:** اجرای OQL Query (Threat Hunting)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Search/Query Interface`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد | نیاز به رابط جستجو

##### 🔵 GET `/api/tenant/hunting/saved-queries`

**توضیحات:** دریافت Query های ذخیره شده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/hunting/saved-queries`

**توضیحات:** ایجاد Query ذخیره شده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/hunting/saved-queries/{id}`

**توضیحات:** دریافت Query ذخیره شده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/hunting/saved-queries/{id}`

**توضیحات:** بروزرسانی Query

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/hunting/saved-queries/{id}`

**توضیحات:** حذف Query

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/hunting/scheduled-hunts`

**توضیحات:** دریافت Hunt های زمان‌بندی شده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/hunting/scheduled-hunts`

**توضیحات:** ایجاد Hunt زمان‌بندی شده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/hunting/scheduled-hunts/{id}`

**توضیحات:** دریافت Hunt زمان‌بندی شده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/hunting/scheduled-hunts/{id}`

**توضیحات:** بروزرسانی Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/hunting/scheduled-hunts/{id}`

**توضیحات:** حذف Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/hunting/scheduled-hunts/{id}/runs`

**توضیحات:** دریافت اجراهای Hunt

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### IncidentsController

##### 🔵 GET `/api/tenant/incidents/statistics`

**توضیحات:** دریافت آمار حوادث

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/incidents/{id}`

**توضیحات:** دریافت جزئیات حادثه امنیتی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/incidents/{id}`

**توضیحات:** بروزرسانی حادثه امنیتی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/incidents/{id}/acknowledge`

**توضیحات:** تایید دریافت حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/incidents/{id}/close`

**توضیحات:** بستن حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/incidents/{id}/entities`

**توضیحات:** اتصال موجودیت (کاربر، اپلیکیشن) به حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/incidents/{id}/notes`

**توضیحات:** افزودن یادداشت به حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/incidents/{id}/playbook`

**توضیحات:** اجرای Playbook روی حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/incidents/{id}/related`

**توضیحات:** دریافت حوادث مرتبط

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/incidents/{id}/resolve`

**توضیحات:** حل حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/incidents/{id}/status`

**توضیحات:** بروزرسانی وضعیت حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/incidents/{id}/timeline`

**توضیحات:** دریافت تایم‌لاین حادثه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### RiskEventsController

##### 🟢 POST `/api/tenant/risk-events`

**توضیحات:** ثبت رویداد ریسک

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟠 Governance & Privacy

**تعداد:** 11 endpoint | **اولویت:** High

#### GlobalObservabilityController

##### 🟢 POST `/api/global/observability/audit/search`

**توضیحات:** جستجوی Audit در تمام تنانت‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Search/Query Interface`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد | نیاز به رابط جستجو

##### 🔵 GET `/api/global/observability/audit/{id}`

**توضیحات:** دریافت رویداد Audit خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### GovernanceController

##### 🔵 GET `/api/tenant/governance/campaigns`

**توضیحات:** دریافت کمپین‌های بازبینی دسترسی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/governance/campaigns`

**توضیحات:** ایجاد کمپین بازبینی دسترسی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### ObservabilityController

##### 🟢 POST `/api/tenant/observability/audit/search`

**توضیحات:** جستجوی پیشرفته Audit Log

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Search/Query Interface`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد | نیاز به رابط جستجو

##### 🔵 GET `/api/tenant/observability/audit/{id}`

**توضیحات:** دریافت رویداد Audit خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### PrivacyController

##### 🟢 POST `/api/tenant/privacy/data-requests`

**توضیحات:** ایجاد درخواست موضوع داده (Access, Deletion, etc.)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/privacy/data-requests`

**توضیحات:** دریافت درخواست‌های موضوع داده (GDPR/CCPA)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/privacy/data-requests/{id}/execute`

**توضیحات:** اجرای درخواست موضوع داده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/privacy/retention-policies`

**توضیحات:** دریافت سیاست‌های نگهداری داده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/privacy/retention-policies/{category}`

**توضیحات:** بروزرسانی سیاست نگهداری داده برای دسته خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟠 Access Management

**تعداد:** 11 endpoint | **اولویت:** High

#### AccessRequestController

##### 🔵 GET `/api/tenant/access-requests`

**توضیحات:** دریافت درخواست‌های دسترسی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/access-requests`

**توضیحات:** ایجاد درخواست دسترسی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/access-requests/{requestId}/approve`

**توضیحات:** پردازش تایید/رد درخواست

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### PrivilegedAccessController

##### 🔵 GET `/api/tenant/privileged-access/breakglass-accounts`

**توضیحات:** دریافت حساب‌های Break-Glass

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/privileged-access/breakglass-accounts`

**توضیحات:** ایجاد حساب Break-Glass

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/privileged-access/dashboard`

**توضیحات:** داشبورد دسترسی ممتاز

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Dashboard`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/privileged-access/jit/grants`

**توضیحات:** دریافت دسترسی‌های JIT فعال

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/privileged-access/jit/grants/{grantId}/revoke`

**توضیحات:** لغو دسترسی JIT

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/privileged-access/jit/request`

**توضیحات:** درخواست JIT Access

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/privileged-access/sessions`

**توضیحات:** دریافت جلسات دسترسی ممتاز

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/privileged-access/sessions/{sessionId}/revoke`

**توضیحات:** لغو جلسه ممتاز

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟠 Identity Lifecycle

**تعداد:** 8 endpoint | **اولویت:** High

#### LifecycleController

##### 🔵 GET `/api/tenant/lifecycle/access-packages`

**توضیحات:** دریافت بسته‌های دسترسی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/lifecycle/access-packages`

**توضیحات:** ایجاد بسته دسترسی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/lifecycle/users/{userId}/timeline`

**توضیحات:** تایم‌لاین چرخه حیات کاربر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/lifecycle/events`

**توضیحات:** دریافت رویدادهای چرخه حیات

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/lifecycle/hr/sync`

**توضیحات:** همگام‌سازی با سیستم HR

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/lifecycle/policies`

**توضیحات:** دریافت سیاست‌های چرخه حیات

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/lifecycle/policies`

**توضیحات:** ایجاد سیاست چرخه حیات

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/lifecycle/processing-status`

**توضیحات:** وضعیت پردازش رویدادها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

---

### 🟠 Identity Management

**تعداد:** 4 endpoint | **اولویت:** High

#### AccountController

##### 🔵 GET `/api/user/account/activities`

**توضیحات:** دریافت فعالیت‌های کاربر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/user/account/profile`

**توضیحات:** بروزرسانی پروفایل کاربر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### UsersController

##### 🔵 GET `/api/tenant/users/current/scope`

**توضیحات:** دریافت Scope کاربر جاری

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/users/{tenantUserId}`

**توضیحات:** دریافت جزئیات کاربر

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `High`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

---

### 🟡 Change Management

**تعداد:** 24 endpoint | **اولویت:** Medium

#### ChangeSetsController (Global)

##### 🔵 GET `/api/global/change-sets`

**توضیحات:** دریافت ChangeSet های Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/change-sets`

**توضیحات:** ایجاد ChangeSet Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/change-sets/{id}`

**توضیحات:** دریافت جزئیات ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/global/change-sets/{id}`

**توضیحات:** بروزرسانی ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/change-sets/{id}/apply`

**توضیحات:** اعمال ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/change-sets/{id}/approve`

**توضیحات:** تایید ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/change-sets/{id}/execution-log`

**توضیحات:** دریافت لاگ اجرا

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/change-sets/{id}/reject`

**توضیحات:** رد ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/change-sets/{id}/rollback`

**توضیحات:** بازگشت ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/change-sets/{id}/schedule`

**توضیحات:** زمان‌بندی ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/change-sets/{id}/simulate`

**توضیحات:** شبیه‌سازی ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/change-sets/{id}/submit`

**توضیحات:** ثبت ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### ChangeSetsController (Tenant)

##### 🔵 GET `/api/tenant/change-sets`

**توضیحات:** دریافت لیست ChangeSet ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/change-sets`

**توضیحات:** ایجاد ChangeSet جدید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/change-sets/{id}`

**توضیحات:** دریافت جزئیات ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/change-sets/{id}`

**توضیحات:** بروزرسانی ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/change-sets/{id}/apply`

**توضیحات:** اعمال ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/change-sets/{id}/approve`

**توضیحات:** تایید ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/change-sets/{id}/execution-log`

**توضیحات:** دریافت لاگ اجرای ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/change-sets/{id}/reject`

**توضیحات:** رد ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/change-sets/{id}/rollback`

**توضیحات:** بازگشت ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/change-sets/{id}/schedule`

**توضیحات:** زمان‌بندی اعمال ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/change-sets/{id}/simulate`

**توضیحات:** شبیه‌سازی اعمال ChangeSet

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/change-sets/{id}/submit`

**توضیحات:** ثبت ChangeSet برای تایید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟡 AI & Automation

**تعداد:** 17 endpoint | **اولویت:** Medium

#### AutomationController

##### 🔵 GET `/api/tenant/automation/executions/{id}`

**توضیحات:** دریافت جزئیات اجرای Workflow

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/automation/templates`

**توضیحات:** دریافت الگوهای آماده Workflow

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/automation/templates/{templateId}/clone`

**توضیحات:** کپی الگو به Workflow جدید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/automation/workflows/{id}`

**توضیحات:** دریافت جزئیات Workflow

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/automation/workflows/{id}/disable`

**توضیحات:** غیرفعال‌سازی Workflow

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/automation/workflows/{id}/enable`

**توضیحات:** فعال‌سازی Workflow

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/automation/workflows/{id}/test`

**توضیحات:** تست Workflow

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### CopilotController (Tenant)

##### 🟢 POST `/api/tenant/copilot/actions/execute`

**توضیحات:** اجرای اکشن پیشنهادی Copilot

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/copilot/conversations/{id}`

**توضیحات:** دریافت مکالمه خاص با تمام پیام‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/copilot/query`

**توضیحات:** ارسال پرسش به Copilot AI

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Search/Query Interface`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد | نیاز به رابط جستجو

#### GlobalAutomationController

##### 🔵 GET `/api/global/automation/templates/{id}`

**توضیحات:** دریافت الگوی خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/global/automation/templates/{id}`

**توضیحات:** بروزرسانی الگو

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/global/automation/templates/{id}`

**توضیحات:** حذف الگو

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### GlobalCopilotController

##### 🟢 POST `/api/global/copilot/actions/execute`

**توضیحات:** اجرای اکشن پیشنهادی در سطح Global

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/copilot/conversations/{id}`

**توضیحات:** دریافت مکالمه خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/global/copilot/knowledge-base/status`

**توضیحات:** دریافت وضعیت Knowledge Base

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/copilot/query`

**توضیحات:** پرسش Global Admin به Copilot

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Search/Query Interface`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد | نیاز به رابط جستجو

---

### 🟡 Billing & Subscription

**تعداد:** 12 endpoint | **اولویت:** Medium

#### BillingController

##### 🔵 GET `/api/tenant/billing/quota-status`

**توضیحات:** دریافت وضعیت سهمیه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/billing/subscription`

**توضیحات:** دریافت اشتراک تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/tenant/billing/summary`

**توضیحات:** دریافت خلاصه استفاده و بیلینگ

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Dashboard`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/billing/upgrade-requests`

**توضیحات:** درخواست ارتقا پلن

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### BillingPlansController

##### 🔵 GET `/api/global/billing/plans`

**توضیحات:** دریافت لیست پلن‌های بیلینگ

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/billing/plans`

**توضیحات:** ایجاد پلن بیلینگ

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/billing/plans/{id}`

**توضیحات:** دریافت پلن خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/global/billing/plans/{id}`

**توضیحات:** بروزرسانی پلن

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### BillingTenantsController

##### 🔵 GET `/api/global/billing/tenants/{tenantId}/subscription`

**توضیحات:** دریافت اشتراک تنانت (Global Admin)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/billing/tenants/{tenantId}/subscription`

**توضیحات:** اختصاص اشتراک به تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟡 PUT `/api/global/billing/tenants/{tenantId}/subscription/plan`

**توضیحات:** تغییر پلن تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/billing/tenants/{tenantId}/usage`

**توضیحات:** دریافت استفاده تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

---

### 🟡 Authorization & Policy

**تعداد:** 7 endpoint | **اولویت:** Medium

#### PolicyController

##### 🔵 GET `/api/tenant/policies`

**توضیحات:** دریافت لیست سیاست‌های مجوز

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/policies`

**توضیحات:** ایجاد سیاست مجوز

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/policies/assign`

**توضیحات:** اختصاص سیاست به موجودیت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/policies/evaluate`

**توضیحات:** ارزیابی سیاست (تصمیم‌گیری مجوز)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/policies/{id}`

**توضیحات:** دریافت سیاست خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/policies/{id}`

**توضیحات:** بروزرسانی سیاست

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/tenant/policies/{id}`

**توضیحات:** حذف سیاست

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟡 Federation & SSO

**تعداد:** 6 endpoint | **اولویت:** Medium

#### FederationOidcController

##### 🔵 GET `/api/tenant/federation/oidc`

**توضیحات:** دریافت ارائه‌دهندگان OIDC

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/federation/oidc`

**توضیحات:** ایجاد ارائه‌دهنده OIDC

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### FederationSamlController

##### 🔵 GET `/api/tenant/federation/saml`

**توضیحات:** دریافت ارائه‌دهندگان SAML

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/federation/saml`

**توضیحات:** ایجاد ارائه‌دهنده SAML

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### FederationScimController

##### 🔵 GET `/api/tenant/federation/scim/tokens`

**توضیحات:** دریافت توکن‌های SCIM

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/federation/scim/tokens`

**توضیحات:** ایجاد توکن SCIM

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟡 Platform Features

**تعداد:** 4 endpoint | **اولویت:** Medium

#### NotificationController

##### 🔵 GET `/api/tenant/notifications`

**توضیحات:** دریافت اعلان‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/notifications`

**توضیحات:** ارسال اعلان

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/tenant/notifications/templates`

**توضیحات:** دریافت الگوهای اعلان

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/notifications/templates`

**توضیحات:** ایجاد الگوی اعلان

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟡 Tenant Management

**تعداد:** 2 endpoint | **اولویت:** Medium

#### TenantSettingsController

##### 🔵 GET `/api/tenant/settings`

**توضیحات:** دریافت تنظیمات تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/tenant/settings/branding`

**توضیحات:** بروزرسانی برندینگ تنانت (لوگو و رنگ اصلی)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Settings Form`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟡 Organization Structure

**تعداد:** 2 endpoint | **اولویت:** Medium

#### OrgUnitsController

##### 🔵 GET `/api/tenant/org-units/{orgUnitId}`

**توضیحات:** دریافت جزئیات واحد سازمانی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/tenant/org-units/{orgUnitId}/move`

**توضیحات:** انتقال واحد سازمانی به والد جدید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟡 Application Management

**تعداد:** 2 endpoint | **اولویت:** Medium

#### ApplicationsController

##### 🔴 DELETE `/api/tenant/applications/secrets/{secretId}`

**توضیحات:** حذف Client Secret

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/tenant/applications/{id}/secrets`

**توضیحات:** افزودن Client Secret

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `tenant`
- **Route پیشنهادی:** `/tenant/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Medium`
- **افزودن به صفحه موجود:** ✅ بله - `/mfa-challenge`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟢 Platform Management

**تعداد:** 17 endpoint | **اولویت:** Low

#### EnvironmentsController

##### 🔵 GET `/api/global/environments`

**توضیحات:** دریافت محیط‌های ثبت شده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/environments/bootstrap`

**توضیحات:** Bootstrap محیط جدید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/environments/{id}`

**توضیحات:** دریافت محیط خاص

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Detail View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/environments/{id}/heartbeat`

**توضیحات:** بروزرسانی Heartbeat محیط

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

#### PlatformController

##### 🔵 GET `/api/global/platform/diagnostics`

**توضیحات:** دریافت اطلاعات تشخیصی پلتفرم

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/platform/docs/generate`

**توضیحات:** تولید/بازتولید مستندات پلتفرم

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/platform/docs/openapi`

**توضیحات:** دریافت OpenAPI Specification

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/platform/migrations/apply`

**توضیحات:** اعمال مایگریشن دیتابیس

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/platform/tests/results`

**توضیحات:** دریافت تاریخچه نتایج تست‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/global/platform/tests/{testId}`

**توضیحات:** دریافت نتیجه تست

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

#### TenantLifecycleController

##### 🟢 POST `/api/global/tenants/{tenantId}/export`

**توضیحات:** خروجی داده‌های تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد | قابلیت Export داده

##### 🔵 GET `/api/global/tenants/{tenantId}/exports/{exportId}`

**توضیحات:** دریافت وضعیت و لینک دانلود خروجی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد | قابلیت Export داده

##### 🔵 GET `/api/global/tenants/{tenantId}/health`

**توضیحات:** دریافت سلامت و آمار تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/tenants/{tenantId}/migrate`

**توضیحات:** شروع مایگریشن تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/tenants/{tenantId}/migrations/{migrationId}`

**توضیحات:** دریافت وضعیت مایگریشن

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/tenants/{tenantId}/resume`

**توضیحات:** از سرگیری تنانت معلق

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/tenants/{tenantId}/suspend`

**توضیحات:** تعلیق تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟢 Multi-Region & DR

**تعداد:** 13 endpoint | **اولویت:** Low

#### RegionsController

##### 🔵 GET `/api/global/regions`

**توضیحات:** دریافت لیست مناطق

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/regions`

**توضیحات:** ایجاد منطقه جدید

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/regions/dr-dashboard`

**توضیحات:** داشبورد Disaster Recovery

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Dashboard`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/global/regions/health`

**توضیحات:** دریافت وضعیت سلامت مناطق

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/api/global/regions/tenants/{tenantId}/backups`

**توضیحات:** دریافت پشتیبان‌های تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/regions/tenants/{tenantId}/backups`

**توضیحات:** ایجاد پشتیبان تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/regions/tenants/{tenantId}/data-residency`

**توضیحات:** دریافت تنظیمات سکونت داده تنانت

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟡 PUT `/api/global/regions/tenants/{tenantId}/data-residency`

**توضیحات:** بروزرسانی سکونت داده

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟢 POST `/api/global/regions/tenants/{tenantId}/restore`

**توضیحات:** بازیابی تنانت از پشتیبان

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🟡 PUT `/api/global/regions/{id}`

**توضیحات:** بروزرسانی منطقه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔴 DELETE `/api/global/regions/{id}`

**توضیحات:** حذف منطقه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

##### 🔵 GET `/api/global/regions/{regionId}/backups`

**توضیحات:** دریافت پشتیبان‌های منطقه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🟢 POST `/api/global/regions/{regionId}/backups`

**توضیحات:** ایجاد پشتیبان منطقه

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Form`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ✅ بله - `/global/hunting`
- **یادداشت:** نیاز به فرم یا اکشن دارد

---

### 🟢 Platform Monitoring

**تعداد:** 4 endpoint | **اولویت:** Low

#### HealthController

##### 🔵 GET `/health`

**توضیحات:** بررسی کامل سلامت سیستم با تمام کامپوننت‌ها

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/health/live`

**توضیحات:** بررسی زنده بودن سیستم (Liveness Probe)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/health/ready`

**توضیحات:** بررسی آمادگی سیستم برای پذیرش ترافیک (Readiness Probe)

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `Feature Page`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

##### 🔵 GET `/health/regions`

**توضیحات:** دریافت وضعیت سلامت مناطق جغرافیایی

**پیشنهاد پیاده‌سازی:**

- **Portal:** `admin-portal`
- **Section:** `global`
- **Route پیشنهادی:** `/global/feature`
- **نوع صفحه:** `List View`
- **اولویت:** `Low`
- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید
- **یادداشت:** احتمالاً نیاز به نمایش داده دارد

---

## 🗺️ Roadmap پیاده‌سازی

### Phase 1: Critical & High Priority (0-3 ماه)

#### Security Monitoring (39 endpoints)

- **صفحه:** `/global/feature` (Search/Query Interface)
  - **Endpoints:** DELETE, GET, PUT, POST
  - **تعداد:** 13 endpoint
- **صفحه:** `/tenant/feature` (Detail View)
  - **Endpoints:** DELETE, GET, PUT, POST
  - **تعداد:** 26 endpoint

#### Security Management (24 endpoints)

- **صفحه:** `/global/feature` (List View)
  - **Endpoints:** GET, POST
  - **تعداد:** 5 endpoint
- **صفحه:** `/tenant/feature` (List View)
  - **Endpoints:** DELETE, GET, PUT, POST
  - **تعداد:** 19 endpoint

#### Access Management (11 endpoints)

- **صفحه:** `/tenant/feature` (Feature Page)
  - **Endpoints:** GET, POST
  - **تعداد:** 11 endpoint

#### Authentication & Discovery (6 endpoints)

- **صفحه:** `/feature` (List View)
  - **Endpoints:** GET, POST
  - **تعداد:** 4 endpoint
- **صفحه:** `/global/feature` (List View)
  - **Endpoints:** GET
  - **تعداد:** 2 endpoint

#### Identity Management (4 endpoints)

- **صفحه:** `/tenant/feature` (List View)
  - **Endpoints:** GET, PUT
  - **تعداد:** 4 endpoint

#### Developer Tools (4 endpoints)

- **صفحه:** `/tenant/feature` (List View)
  - **Endpoints:** DELETE, GET, PUT, POST
  - **تعداد:** 4 endpoint

#### Analytics & Insights (3 endpoints)

- **صفحه:** `/global/feature` (List View)
  - **Endpoints:** GET
  - **تعداد:** 1 endpoint
- **صفحه:** `/tenant/feature` (List View)
  - **Endpoints:** GET
  - **تعداد:** 2 endpoint

#### Identity Lifecycle (3 endpoints)

- **صفحه:** `/tenant/feature` (List View)
  - **Endpoints:** GET, POST
  - **تعداد:** 3 endpoint

#### Governance & Privacy (1 endpoints)

- **صفحه:** `/tenant/feature` (Form)
  - **Endpoints:** POST
  - **تعداد:** 1 endpoint

**تخمین زمان:** 2-3 ماه

---

### Phase 2: Medium Priority (3-6 ماه)

**تعداد کل:** 82 endpoints

- Developer Tools: 14 endpoints
- Change Management: 12 endpoints
- AI & Automation: 10 endpoints
- Governance & Privacy: 8 endpoints
- Authorization & Policy: 7 endpoints
- Analytics & Insights: 6 endpoints
- Federation & SSO: 6 endpoints
- Identity Lifecycle: 5 endpoints
- Platform Features: 4 endpoints
- Billing & Subscription: 4 endpoints
- Tenant Management: 2 endpoints
- Organization Structure: 2 endpoints
- Application Management: 2 endpoints

**تخمین زمان:** 3-4 ماه

---

### Phase 3: Low Priority (6-12 ماه)

**تعداد کل:** 69 endpoints

- Platform Management: 17 endpoints
- Multi-Region & DR: 13 endpoints
- Change Management: 12 endpoints
- Billing & Subscription: 8 endpoints
- AI & Automation: 7 endpoints
- Analytics & Insights: 6 endpoints
- Platform Monitoring: 4 endpoints
- Governance & Privacy: 2 endpoints

**تخمین زمان:** 4-6 ماه

---

## ⏱️ تخمین زمان کلی

- **تخمین کل:** 460 روز کاری (~92 هفته یا ~23 ماه)
- **با تیم 2 نفره:** ~11 ماه
- **با تیم 3 نفره:** ~7 ماه

*توجه: این تخمین‌ها شامل طراحی UI/UX، توسعه، تست و integration هستند.*

---

## 💡 توصیه‌ها

### اولویت‌های فوری

1. **Security Management Features**
   - MFA Settings & Management
   - Security Policy Configuration
   - Trusted Devices Management

2. **Identity & Access Management**
   - User Profile Management
   - Privileged Access Management
   - Access Request Workflow

3. **Monitoring & Analytics**
   - Security Incidents Details
   - Risk Events Management
   - Audit Log Advanced Search

### صفحات پیشنهادی برای Phase 1

1. **`/tenant/feature`** (List View) - admin-portal
   - 24 endpoints
2. **`/global/feature`** (List View) - admin-portal
   - 7 endpoints
3. **`/feature`** (List View) - login-portal
   - 4 endpoints

---

## 📈 آمار سریع

```
Total Backend Endpoints:     302
Frontend API Calls:          113
Connected:                   56 (18.54%)
Unmapped:                    246

By Priority:
  Critical       35 endpoints
  High           60 endpoints
  Medium         82 endpoints
  Low            69 endpoints

By Portal:
  admin-portal          242 endpoints
  login-portal            4 endpoints
```

---

**تاریخ تولید گزارش:** 2025-11-21 08:53:40

*این گزارش به صورت خودکار تولید شده است.*