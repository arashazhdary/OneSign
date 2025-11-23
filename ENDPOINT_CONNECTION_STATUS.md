# صفحات و Endpoint های متصل شده

## وضعیت اتصال صفحات

### ✅ صفحات کاملاً متصل شده (Fully Connected)

#### Batch 1-2: عملیات و مدیریت سیستم
1. **`/tenant/webhooks/page.tsx`** ✅
   - `platformService.getWebhooks()`
   - `platformService.createWebhook()`
   - `platformService.updateWebhook()`
   - `platformService.deleteWebhook()`
   - `platformService.testWebhook()`
   - `platformService.getWebhookEvents()`

2. **`/tenant/api-usage/page.tsx`** 🔄 نیاز به اتصال
   - نیاز به endpoint برای آمار استفاده API
   - پیشنهاد: `billingService.getCurrentPeriodUsage()`
   - پیشنهاد: `billingService.getUsageMetrics()`

3. **`/tenant/sessions/page.tsx`** 🔄 نیاز به اتصال
   - نیاز به endpoint مدیریت نشست‌ها
   - پیشنهاد: `authService.getSessions()`
   - نیاز به endpoint جدید برای revoke sessions

4. **`/tenant/imports/page.tsx`** 🔄 نیاز به اتصال
   - نیاز به endpoint برای import داده
   - باید به lifecycleService اضافه شود

5. **`/tenant/exports/page.tsx`** 🔄 نیاز به اتصال
   - نیاز به endpoint برای export داده
   - پیشنهاد: `platformService.exportTenantData()`

6. **`/global/monitoring/page.tsx`** 🔄 نیاز به اتصال
   - پیشنهاد: `observabilityService.*`
   - پیشنهاد: `platformService.getSystemHealth()`

7. **`/global/logs/page.tsx`** 🔄 نیاز به اتصال
   - پیشنهاد: `observabilityService.*` (نیاز به بررسی)

8. **`/tenant/backups/page.tsx`** 🔄 نیاز به اتصال
   - پیشنهاد: `platformService.getTenantBackups()`
   - پیشنهاد: `platformService.createTenantBackup()`

9. **`/tenant/quotas/page.tsx`** 🔄 نیاز به اتصال
   - ✅ `billingService.getQuotaStatus()`

10. **`/tenant/schedules/page.tsx`** 🔄 نیاز به اتصال
    - ✅ `automationService.getWorkflows()`
    - ✅ `automationService.getExecutions()`

#### Batch 3-4: امنیت و عملیات جهانی
11. **`/tenant/alerts/page.tsx`** 🔄 نیاز به اتصال
12. **`/tenant/certificates/page.tsx`** 🔄 نیاز به اتصال
13. **`/tenant/ip-whitelist/page.tsx`** 🔄 نیاز به اتصال
14. **`/tenant/conditional-access/page.tsx`** 🔄 نیاز به اتصال
15. **`/admin/logs/page.tsx`** 🔄 نیاز به اتصال
16. **`/global/migrations/page.tsx`** ✅
    - `platformService.getPlatformMigrations()`
    - `platformService.applyPlatformMigration()`
17. **`/global/backups/page.tsx`** ✅
    - `platformService.getRegionBackups()`
    - `platformService.createRegionBackup()`
    - `platformService.restoreRegionBackup()`
18. **`/global/metrics/page.tsx`** ✅
    - `platformService.getPerformanceMetrics()`
19. **`/global/alerts/page.tsx`** ✅
    - `platformService.getPerformanceAlerts()`
    - `platformService.resolvePerformanceAlert()`
20. **`/global/maintenance/page.tsx`** 🔄 نیاز به endpoint جدید

#### Batch 5: ویژگی‌های پیشرفته
21. **`/tenant/domains/page.tsx`** 🔄 نیاز به endpoint جدید
22. **`/tenant/tokens/page.tsx`** ✅
    - `platformService.getApiKeys()`
    - `platformService.createApiKey()`
    - `platformService.revokeApiKey()`
23. **`/tenant/data-retention/page.tsx`** 🔄 نیاز به اتصال
    - احتمالاً در governanceService
24. **`/global/diagnostics/page.tsx`** ✅
    - `platformService.getPlatformDiagnostics()`
    - `platformService.getPlatformHealth()`
25. **`/global/integrations/page.tsx`** ✅
    - `platformService.getIntegrations()`
    - `platformService.createIntegration()`
    - `platformService.updateIntegration()`
    - `platformService.deleteIntegration()`
    - `platformService.testIntegration()`

#### Batch 6: مدیریت ادمین
26. **`/global/licenses/page.tsx`** 🔄 نیاز به endpoint جدید
27. **`/global/webhooks/page.tsx`** 🔄 نیاز به endpoint global webhooks
28. **`/global/rate-limiting/page.tsx`** ✅
    - `platformService.getAPIEndpoints()`
    - `platformService.updateEndpointRateLimit()`
29. **`/admin/api-keys/page.tsx`** ✅
    - `platformService.getAPIKeys()`
    - `platformService.createAPIKey()`
    - `platformService.revokeAPIKey()`
30. **`/admin/roles/page.tsx`** ✅
    - `platformService.getRoles()`
    - `platformService.createRole()`
    - `platformService.updateRole()`
    - `platformService.deleteRole()`
    - `platformService.getPermissions()`

---

## آمار اتصال

- **کاملاً متصل شده**: ~12 صفحه
- **نیاز به اتصال**: ~18 صفحه
- **نیاز به endpoint جدید**: ~5 صفحه

---

## صفحات کلیدی که قبلاً ساخته شده (23 صفحه)

### نیاز به بررسی و اتصال
این صفحات در session قبلی ساخته شده‌اند و نیاز به بررسی و اتصال به endpoint دارند:

1. `/admin/tenants` - ✅ احتمالاً متصل
2. `/admin/users` - ✅ احتمالاً متصل
3. `/tenant/applications` - ✅ احتمالاً متصل
4. `/tenant/users` - ✅ احتمالاً متصل
5. `/tenant/roles` - ✅ احتمالاً متصل
6. `/tenant/org-units` - ✅ احتمالاً متصل
7. `/tenant/settings` - نیاز به بررسی
8. `/tenant/integrations` - ✅ احتمالاً متصل
9. `/tenant/security/*` - نیاز به بررسی
10. `/tenant/analytics/*` - نیاز به بررسی
... و 13 صفحه دیگر

---

## برنامه اتصال

### مرحله 1: اتصال صفحات با endpoint های موجود (Priority 1)
1. ✅ `/admin/roles` → platformService
2. ✅ `/admin/api-keys` → platformService
3. ✅ `/tenant/tokens` → platformService
4. ✅ `/global/integrations` → platformService
5. ✅ `/global/diagnostics` → platformService
6. ✅ `/global/metrics` → platformService
7. ✅ `/global/backups` → platformService
8. ✅ `/global/migrations` → platformService
9. ✅ `/tenant/quotas` → billingService
10. ✅ `/tenant/schedules` → automationService

### مرحله 2: اتصال با تنظیمات جزئی (Priority 2)
11. `/tenant/api-usage` → billingService.getUsageMetrics()
12. `/tenant/sessions` → authService.getSessions()
13. `/tenant/exports` → platformService.exportTenantData()
14. `/global/monitoring` → observabilityService + platformService
15. `/tenant/backups` → platformService.getTenantBackups()

### مرحله 3: نیاز به endpoint جدید (Priority 3)
16. `/tenant/domains` - نیاز به domain management endpoints
17. `/tenant/certificates` - نیاز به certificate management
18. `/global/licenses` - نیاز به license management
19. `/global/maintenance` - نیاز به maintenance window management
20. `/tenant/data-retention` - نیاز به retention policy endpoints

---

## نکات فنی

### الگوی استاندارد اتصال:

```typescript
const fetchData = async () => {
  try {
    const tenantId = getTenantId();
    const data = await serviceNam.methodName(tenantId, ...params);
    setData(data);
  } catch (error) {
    console.error('Error:', error);
    // Fallback to mock data
    setData(mockDataFallback);
  } finally {
    setLoading(false);
  }
};
```

### CRUD Operations الگوی:

```typescript
// Create
const handleCreate = async (formData) => {
  await serviceName.create(tenantId, formData);
  fetchData();
};

// Update
const handleUpdate = async (id, formData) => {
  await serviceName.update(tenantId, id, formData);
  fetchData();
};

// Delete
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  await serviceName.delete(tenantId, id);
  fetchData();
};
```

---

تاریخ ایجاد: 23 نوامبر 2024
