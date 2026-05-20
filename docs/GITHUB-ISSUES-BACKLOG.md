# OneSign — GitHub Issues Backlog

وضعیت به‌روز: **۲۰۲۶-۰۵-۲۰** — اکثر issueهای backlog در `master` پیاده شده‌اند.

## وضعیت کلی

| لایه | وضعیت |
|------|--------|
| **Backend** | ماژول‌ها و APIهای اصلی ✅ |
| **Admin Portal** | صفحات کلیدی به API وصل شده؛ برخی صفحات فرعی هنوز mock جزئی دارند |
| **SDK / CLI / Sandbox** | ✅ (#64–#67) |
| **Platform / CI / Helm / Email** | ✅ (`69db5f3` و بعد) |

## بستن issueها در GitHub

```bash
export GH_TOKEN=ghp_xxxx
./scripts/github-close-completed-issues.sh
```

## فهرست backlog (۲۲ مورد) — وضعیت پیاده‌سازی

| # | عنوان | وضعیت کد |
|---|--------|----------|
| 1 | Admin: Users/Tenants/Roles/Apps → API | ✅ (#54) |
| 2 | Admin: Policy Engine UI | ✅ (#55) |
| 3 | Admin: Change Management → API | ✅ (#56) |
| 4 | Admin: Global Operations — حذف mock | ✅ (#57) + تکمیل جزئی |
| 5 | Admin: Tenant Ops دسته ۱ | ✅ (#58) |
| 6 | Admin: Tenant Ops دسته ۲ | ✅ (#59) |
| 7 | Phase 30: Copilot Sidebar | ✅ (#60) |
| 8 | Backend: Branding ETag/304 | ✅ (#61) |
| 9 | Backend: SendTestEmail | ✅ (#62) |
| 10 | Backend: SMS Provider | ✅ (#63) |
| 11–13 | SDKs + CLI | ✅ (#64–#66) |
| 14 | Dev Sandbox + Samples | ✅ (#67) |
| 15 | Platform Completion | ✅ (#68) |
| 16 | CI/CD یکپارچه | ✅ `monorepo-ci.yml` |
| 17 | Helm/K8s | ✅ `deploy/helm/onesign/` |
| 18 | Integration tests گسترش | ✅ + InMemory در Testing |
| 19 | Docs LICENSE/CONTRIBUTING | ✅ |
| 20 | OpenAPI + Postman | ✅ |
| 21 | Email production | ✅ SendGrid + health |

## کارهای باقی‌مانده (جزئی)

- بستن issueهای باز در GitHub (نیاز به `GH_TOKEN`)
- صفحات Admin با mock جزئی: `TenantBackupsPage`, `TenantAuditPage`, `TenantAppsDetailPage`, `TenantAnalyticsPage`, …
- `CustomWebApplicationFactory` + Testcontainers برای CI با SQL Server (اختیاری)
- Login Portal Dockerfile: فعال‌سازی `output: 'standalone'` در Next برای image کوچک‌تر

## مراجع

- [`docs/DEV-SANDBOX-QUICKSTART.md`](DEV-SANDBOX-QUICKSTART.md)
- [`docs/DEPLOYMENT.md`](DEPLOYMENT.md)
- [`docs/EMAIL-PRODUCTION.md`](EMAIL-PRODUCTION.md)
