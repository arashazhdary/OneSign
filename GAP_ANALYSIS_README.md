# 📊 Gap Analysis - OneSign Platform

## 📁 فایل‌های تولید شده

این تحلیل شامل 3 فایل اصلی است:

### 1. `GAP_ANALYSIS.json`
**فایل JSON جامع با تمام جزئیات**

این فایل شامل:
- آمار کلی (summary)
- لیست کامل 246 endpoint بدون صفحه (unmappedEndpoints)
- خلاصه هر دسته (categorySummary)
- توصیه‌های پیاده‌سازی برای هر endpoint

**ساختار:**
```json
{
  "summary": {
    "totalBackendEndpoints": 302,
    "totalFrontendApiCalls": 113,
    "mappedEndpoints": 56,
    "unmappedEndpoints": 246,
    "percentageConnected": 18.54
  },
  "unmappedEndpoints": [
    {
      "controller": "...",
      "category": "...",
      "endpoint": {
        "method": "GET",
        "route": "/api/...",
        "action": "...",
        "description": "..."
      },
      "recommendation": {
        "portal": "admin-portal",
        "section": "tenant",
        "suggestedRoute": "/tenant/...",
        "pageType": "List View",
        "priority": "Critical",
        "canBeAddedToExistingPage": false,
        "notes": "..."
      }
    }
  ],
  "categorySummary": {
    "Security Management": {
      "unmapped": 24,
      "priority": "Critical"
    }
  }
}
```

### 2. `GAP_ANALYSIS_REPORT.md`
**گزارش جامع Markdown با نمودارها و جداول**

این فایل شامل:
- ✅ خلاصه اجرایی
- 🔥 خلاصه بر اساس اولویت
- 📂 خلاصه بر اساس دسته‌بندی
- 🏢 توزیع بر اساس Portal و Section
- 📄 توزیع بر اساس نوع صفحه
- 📋 لیست جامع تمام endpoint ها با جزئیات کامل
- 🗺️ Roadmap پیاده‌سازی (3 Phase)
- ⏱️ تخمین زمان
- 💡 توصیه‌ها و صفحات پیشنهادی

### 3. `RECOMMENDATIONS.md`
**توصیه‌های عملی برای پیاده‌سازی**

این فایل شامل:
- 🎯 اولویت‌بندی دقیق صفحات
- 📝 جزئیات کامل هر صفحه پیشنهادی
- 🛠️ توصیه‌های فنی
- 📊 Metrics & KPIs
- 💻 Development Guidelines
- 📅 Sprint Planning پیشنهادی

---

## 🎯 خلاصه نتایج

### آمار کلی

```
Total Backend Endpoints:     302
Frontend API Calls:          113
Connected Endpoints:          56  (18.54%)
Unmapped Endpoints:          246  (81.46%)
```

### Coverage Bar
```
███░░░░░░░░░░░░░░░░░ 18.54%
```

### اولویت‌بندی

| اولویت | تعداد | درصد |
|--------|-------|------|
| 🔴 Critical | 35 | 14.2% |
| 🟠 High | 60 | 24.4% |
| 🟡 Medium | 82 | 33.3% |
| 🟢 Low | 69 | 28.0% |

### دسته‌های اصلی (Top 10)

| رتبه | دسته | تعداد بدون صفحه | اولویت |
|------|------|-----------------|--------|
| 1 | Security Monitoring | 39 | 🟠 High |
| 2 | Change Management | 24 | 🟡 Medium |
| 3 | Security Management | 24 | 🔴 Critical |
| 4 | Developer Tools | 18 | 🔴 Critical |
| 5 | AI & Automation | 17 | 🟡 Medium |
| 6 | Platform Management | 17 | 🟢 Low |
| 7 | Analytics & Insights | 15 | 🔴 Critical |
| 8 | Multi-Region & DR | 13 | 🟢 Low |
| 9 | Billing & Subscription | 12 | 🟡 Medium |
| 10 | Governance & Privacy | 11 | 🟠 High |

---

## 🗺️ Roadmap خلاصه

### Phase 1: Critical & High (0-3 ماه)
- **تعداد:** 95 endpoints
- **تخمین:** 2-3 ماه
- **فوکوس:**
  - Security Management
  - Identity & Access Management
  - Security Monitoring
  - Developer Tools
  - Analytics

### Phase 2: Medium (3-6 ماه)
- **تعداد:** 82 endpoints
- **تخمین:** 3-4 ماه
- **فوکوس:**
  - Change Management
  - AI & Automation
  - Governance & Privacy
  - Identity Lifecycle
  - Authorization & Policy

### Phase 3: Low (6-12 ماه)
- **تعداد:** 69 endpoints
- **تخمین:** 4-6 ماه
- **فوکوس:**
  - Platform Management
  - Multi-Region & DR
  - Global Admin Features
  - Additional Features

---

## 🚀 Quick Start Guide

### 1. بررسی اولویت‌ها

**برای مشاهده سریع endpoint های Critical:**
```bash
cat GAP_ANALYSIS.json | jq '.unmappedEndpoints[] | select(.recommendation.priority == "Critical")'
```

**برای شمارش endpoint ها بر اساس اولویت:**
```bash
cat GAP_ANALYSIS.json | jq '[.unmappedEndpoints[].recommendation.priority] | group_by(.) | map({priority: .[0], count: length})'
```

**برای دسته‌بندی بر اساس Portal:**
```bash
cat GAP_ANALYSIS.json | jq '[.unmappedEndpoints[].recommendation.portal] | group_by(.) | map({portal: .[0], count: length})'
```

### 2. فیلتر کردن endpoint ها

**فقط endpoint های Security Management:**
```bash
cat GAP_ANALYSIS.json | jq '.unmappedEndpoints[] | select(.category == "Security Management")'
```

**فقط endpoint های admin-portal/tenant:**
```bash
cat GAP_ANALYSIS.json | jq '.unmappedEndpoints[] | select(.recommendation.portal == "admin-portal" and .recommendation.section == "tenant")'
```

**فقط endpoint های GET (read-only):**
```bash
cat GAP_ANALYSIS.json | jq '.unmappedEndpoints[] | select(.endpoint.method == "GET")'
```

### 3. تولید لیست کار

**ایجاد لیست TODO برای Phase 1:**
```bash
cat GAP_ANALYSIS.json | jq -r '.unmappedEndpoints[] | select(.recommendation.priority == "Critical" or .recommendation.priority == "High") | "- [ ] \(.endpoint.method) \(.endpoint.route) (\(.recommendation.priority))"'
```

---

## 📊 استفاده از داده‌ها

### Python

```python
import json

# Load data
with open('GAP_ANALYSIS.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get critical endpoints
critical = [e for e in data['unmappedEndpoints']
            if e['recommendation']['priority'] == 'Critical']

print(f"Critical endpoints: {len(critical)}")

# Group by category
from collections import defaultdict
by_category = defaultdict(list)
for item in critical:
    by_category[item['category']].append(item)

for category, items in sorted(by_category.items(), key=lambda x: -len(x[1])):
    print(f"\n{category}: {len(items)} endpoints")
    for item in items[:3]:  # Show first 3
        print(f"  - {item['endpoint']['method']} {item['endpoint']['route']}")
```

### JavaScript/TypeScript

```typescript
import gapAnalysis from './GAP_ANALYSIS.json';

// Filter critical endpoints
const critical = gapAnalysis.unmappedEndpoints.filter(
  e => e.recommendation.priority === 'Critical'
);

// Group by suggested route
const byRoute = critical.reduce((acc, endpoint) => {
  const route = endpoint.recommendation.suggestedRoute;
  if (!acc[route]) acc[route] = [];
  acc[route].push(endpoint);
  return acc;
}, {});

// Generate page list
Object.entries(byRoute).forEach(([route, endpoints]) => {
  console.log(`\n${route} (${endpoints.length} endpoints):`);
  endpoints.forEach(e => {
    console.log(`  - ${e.endpoint.method} ${e.endpoint.route}`);
  });
});
```

---

## 🎨 Visualization Ideas

### 1. Coverage Dashboard
- نمودار دایره‌ای: Connected vs Unmapped
- نمودار میله‌ای: توزیع بر اساس اولویت
- Heatmap: دسته × اولویت

### 2. Progress Tracker
- Timeline برای 3 Phase
- Kanban board برای صفحات
- Burndown chart برای endpoint ها

### 3. Priority Matrix
- محور X: تعداد endpoint ها
- محور Y: اولویت
- رنگ: دسته

---

## 📝 تغییرات و به‌روزرسانی

برای تولید مجدد تحلیل (در صورت تغییر backend یا frontend):

```bash
# Run gap analysis
python3 gap_analysis.py

# Generate markdown report
python3 generate_report.py
```

---

## 🔍 نکات مهم

### 1. Endpoint Matching

تحلیل بر اساس **exact match** انجام شده است:
- Method + Route باید دقیقاً یکسان باشند
- Path parameters به `{id}` normalize شده‌اند
- Query parameters در مقایسه در نظر گرفته نشده‌اند

### 2. Priority Calculation

اولویت‌ها بر اساس:
- **Category:** Security-related = Critical/High
- **Keywords:** auth, security, user, access = Higher priority
- **Scope:** tenant endpoints > global endpoints
- **Type:** Read operations < Write operations

### 3. Suggested Routes

Route های پیشنهادی بر اساس:
- Backend route structure
- Portal/Section detection
- Resource naming
- Existing page patterns

---

## 🤝 Contributing

برای بهبود این تحلیل:

1. **افزودن endpoint جدید به backend:**
   - به‌روزرسانی `BACKEND_ENDPOINTS_ANALYSIS.json`
   - اجرای مجدد `gap_analysis.py`

2. **افزودن صفحه جدید به frontend:**
   - به‌روزرسانی `FRONTEND_PAGES_ANALYSIS.json`
   - اجرای مجدد `gap_analysis.py`

3. **بهبود اولویت‌بندی:**
   - ویرایش تابع `categorize_priority()` در `gap_analysis.py`
   - افزودن keywords یا categories جدید

4. **بهبود route suggestions:**
   - ویرایش تابع `suggest_route()` در `gap_analysis.py`

---

## 📞 پشتیبانی

برای سوالات یا مشکلات:
- مراجعه به `GAP_ANALYSIS_REPORT.md` برای جزئیات
- مراجعه به `RECOMMENDATIONS.md` برای توصیه‌های عملی
- بررسی `GAP_ANALYSIS.json` برای داده‌های خام

---

## 📈 Metrics Dashboard

### Current Status
- **Coverage:** 18.54%
- **Target (3 months):** 30%+
- **Target (6 months):** 60%+
- **Target (12 months):** 80%+

### Progress Tracking
```
Phase 1: [░░░░░░░░░░░░░░░░░░░░] 0% (0/95)
Phase 2: [░░░░░░░░░░░░░░░░░░░░] 0% (0/82)
Phase 3: [░░░░░░░░░░░░░░░░░░░░] 0% (0/69)
```

---

## 🎯 Next Steps

1. ✅ بررسی `GAP_ANALYSIS_REPORT.md` برای فهم کامل وضعیت
2. ✅ مطالعه `RECOMMENDATIONS.md` برای برنامه‌ریزی پیاده‌سازی
3. ⏳ اولویت‌بندی صفحات بر اساس نیاز تیم
4. ⏳ شروع توسعه از Phase 1 - Critical endpoints
5. ⏳ تنظیم Metrics برای پیگیری پیشرفت

---

**تاریخ تولید:** 2025-11-21
**نسخه:** 1.0
**Coverage:** 18.54%

**این تحلیل به صورت خودکار از فایل‌های Backend و Frontend تولید شده است.**
