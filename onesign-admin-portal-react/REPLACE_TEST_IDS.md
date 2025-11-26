# راهنمای جایگزینی Test IDs

این فایل راهنمای جایگزینی شناسه‌های hardcoded با شناسه‌های معتبر از DatabaseSeeder است.

## شناسه‌های معتبر

از فایل `src/lib/constants/testIds.ts` استفاده کنید:

```typescript
import { DEFAULT_TENANT_ID, TEST_IDS } from '@/lib/constants/testIds';
```

## شناسه‌های موجود

- `DEFAULT_TENANT_ID`: `11111111-1111-1111-1111-111111111111` (TestTenantId)
- `TEST_IDS.TENANT_ID`: همان DEFAULT_TENANT_ID
- `TEST_IDS.ADMIN_USER_ID`: `44444444-4444-4444-4444-444444444444`
- `TEST_IDS.TENANT_USER_ID`: `33333333-3333-3333-3333-333333333333`
- `TEST_IDS.APPLICATION_ID`: `77777777-7777-7777-7777-777777777777`
- و سایر شناسه‌ها...

## الگوهای جایگزینی

### الگوی 1: Fallback در useEffect
```typescript
// قبل
setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');

// بعد
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
setTenantIdState(contextTenantId || DEFAULT_TENANT_ID);
```

### الگوی 2: مقدار مستقیم
```typescript
// قبل
setTenantIdState('00000000-0000-0000-0000-000000000000');

// بعد
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
setTenantIdState(DEFAULT_TENANT_ID);
```

### الگوی 3: در متغیر
```typescript
// قبل
const tenantId = '00000000-0000-0000-0000-000000000000';

// بعد
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
const tenantId = DEFAULT_TENANT_ID;
```

## فایل‌های به‌روزرسانی شده

- ✅ `src/lib/tenant-context.ts`
- ✅ `src/stores/tenantStore.ts`
- ✅ `src/pages/tenant/dashboard/TenantDashboardPage.tsx`
- ✅ `src/pages/tenant/lifecycle/TenantLifecyclePage.tsx`

## فایل‌های باقی‌مانده

برای به‌روزرسانی بقیه فایل‌ها، از الگوهای بالا استفاده کنید.

## نکات مهم

1. همیشه import را در بالای فایل اضافه کنید
2. از `DEFAULT_TENANT_ID` برای tenant ID استفاده کنید
3. برای سایر شناسه‌ها از `TEST_IDS` استفاده کنید

