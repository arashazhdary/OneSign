# تحلیل صفحات کم‌شده و برنامه توسعه

## 🎯 رویکرد واقع‌بینانه

از 810 endpoint موجود، **همه نیاز به صفحه جداگانه ندارند**. بسیاری از endpoints عملیات CRUD ساده هستند که در صفحات موجود استفاده می‌شوند.

صفحاتی که **واقعاً** کم هستند و باید ساخته شوند:

---

## 📋 صفحات کلیدی که باید ساخته شوند

### Priority 1: صفحات اصلی (HIGH)

#### Tenant Pages

1. **Notifications Management** (`/tenant/notifications`)
   - لیست notification ها
   - تنظیمات notification
   - Templates
   - Service: notificationsService
   - Endpoints: ~20 endpoint

2. **Service Accounts** (`/tenant/service-accounts`)
   - لیست service accounts
   - ساخت/ویرایش service account
   - Credentials management
   - Service: usersService / authService
   - Page موجود است اما ممکنه ناقص باشد

3. **Reports** (`/tenant/reports`)
   - گزارش‌های از پیش تعریف شده
   - ساخت custom report
   - Export data
   - Page directory موجود است ولی page.tsx نیست

4. **Templates Management** (برای Automation)
   - Workflow templates
   - Email templates
   - Policy templates
   - Service: automationService

#### Global Pages

5. **Global Templates** (`/global/templates`)
   - Global workflow templates
   - Policy templates
   - Configuration templates
   - Service: automationService, change-managementService

6. **Global Tenants Management** (`/global/tenants`)
   - لیست تمام tenants
   - ساخت/حذف tenant
   - Tenant health monitoring
   - Service: platformService
   - Directory موجود اما page.tsx نیست

7. **Global Health Dashboard** (`/global/health`)
   - System health overview
   - Service status
   - Monitoring dashboards
   - Directory موجود اما page.tsx نیست

8. **Global Security Policies** (`/global/security`)
   - Global security policies
   - Threat detection rules
   - Compliance rules
   - Service: securityService

9. **Global Access Reviews** (`/global/access-reviews`)
   - Periodic access reviews
   - Certification campaigns
   - Risk-based reviews
   - Service: accessService, governanceService

10. **Global Audit** (`/global/audit`)
    - Global audit logs
    - Cross-tenant investigations
    - Compliance reports
    - Service: observabilityService

#### Admin Pages

11. **Admin Dashboard** (`/admin/dashboard`)
    - Super admin overview
    - Platform statistics
    - Quick actions

12. **Admin Users** (`/admin/users`)
    - Platform administrators
    - Role assignments

### Priority 2: صفحات جزئیات (MEDIUM)

این صفحات می‌تونند features موجود رو کامل کنند:

13. **Role Details** (`/tenant/roles/[id]`)
    - نمایش جزئیات role
    - Permission assignments
    - Assigned users

14. **Integration Details** (`/tenant/integrations/[id]`)
    - نمایش جزئیات integration
    - Sync logs
    - Configuration

15. **Delegation Details** (`/tenant/delegated-admins/[id]`)
    - جزئیات delegated admin
    - Scopes and permissions

16. **Service Account Details** (`/tenant/service-accounts/[id]`)
    - Credentials
    - API usage
    - Audit trail

17. **Notification Template Details** (`/tenant/notifications/templates/[id]`)
    - Template editor
    - Preview
    - Test sending

### Priority 3: صفحات تحلیلی (LOW)

18. **Tenant Insights Advanced** (`/tenant/insights/advanced`)
    - پیشرفته‌تر از صفحه فعلی
    - Custom dashboards
    - Advanced analytics

19. **Global Insights Advanced** (`/global/insights/advanced`)
    - Cross-tenant analytics
    - Trend analysis
    - Predictive insights

20. **Compliance Dashboard** (`/tenant/compliance`)
    - Compliance status
    - Audit reports
    - Violations

---

## 🔧 صفحاتی که باید تکمیل شوند

### Tenant Pages

1. **Analytics** - subdirectories دارد اما parent page ندارد
   - `/tenant/analytics/page.tsx` - Overview dashboard

2. **Governance** - subdirectory دارد اما parent page ندارد
   - `/tenant/governance/page.tsx` - Governance overview

3. **Reports** - directory دارد اما page ندارد
   - `/tenant/reports/page.tsx` - Reports list

### Global Pages

4. **Tenants** - subdirectory دارد اما parent page ندارد
   - `/global/tenants/page.tsx` - Tenants list & management

5. **Health** - directory دارد اما page ندارد
   - `/global/health/page.tsx` - System health dashboard

---

## 📊 آمار صفحات پیشنهادی

| Category | تعداد صفحات جدید |
|----------|-----------------|
| Priority 1 (High) | 12 صفحه |
| Priority 2 (Medium) | 6 صفحه |
| Priority 3 (Low) | 3 صفحه |
| صفحات برای تکمیل | 5 صفحه |
| **جمع کل** | **26 صفحه** |

---

## 🚀 استراتژی پیاده‌سازی موازی

### Phase 1: Parent Pages (5 صفحات)
- `/tenant/analytics/page.tsx`
- `/tenant/governance/page.tsx`
- `/tenant/reports/page.tsx`
- `/global/tenants/page.tsx`
- `/global/health/page.tsx`

### Phase 2: High Priority (12 صفحات)
**Batch A** (موازی):
- Notifications management
- Service accounts
- Templates management
- Global templates

**Batch B** (موازی):
- Global tenants detailed
- Global health dashboard
- Global security policies
- Global access reviews

**Batch C** (موازی):
- Global audit
- Admin dashboard
- Admin users

### Phase 3: Detail Pages (6 صفحات)
**Batch D** (موازی):
- Role details
- Integration details
- Delegation details

**Batch E** (موازی):
- Service account details
- Notification template details

### Phase 4: Analytics & Insights (3 صفحات)
- Advanced insights pages

---

## 🎨 تمپلیت صفحات

همه صفحات جدید باید از این ساختار پیروی کنند:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { serviceName } from '@/lib/api/services';

export default function PageName() {
  const params = useParams();
  const tenantId = params.tenantId as string; // برای tenant pages

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await serviceName.methodName(tenantId);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* UI components */}
    </div>
  );
}
```

---

## ✅ چک‌لیست پیاده‌سازی

برای هر صفحه جدید:

- [ ] ساخت component با Next.js App Router
- [ ] اتصال به service مربوطه
- [ ] State management (loading, error, data)
- [ ] UI components (table, forms, modals)
- [ ] Error handling
- [ ] i18n support
- [ ] Responsive design
- [ ] Permission checks
- [ ] Testing

---

## 🎯 هدف نهایی

بعد از پیاده‌سازی این 26 صفحه:

```
صفحات قبلی: 68 صفحه
صفحات جدید: 26 صفحه
───────────────────────
جمع کل: 94 صفحه ✅

Coverage:
- Endpoints پوشش داده شده: ~400 از 810 (~50%)
- صفحات کلیدی: 100%
```

---

**توضیح مهم**:
برخی endpoints صرفاً عملیات helper هستند (activate, deactivate, toggle, etc.) که در صفحات موجود قرار می‌گیرند و نیاز به صفحه جداگانه ندارند. با ساخت این 26 صفحه، تمام **features کلیدی** پوشش داده می‌شوند.
