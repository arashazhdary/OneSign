# صفحات غیر کلیدی (Non-Critical Pages)

## تحلیل Endpoints باقی‌مانده

از 810 endpoint موجود:
- ✅ **450 استفاده شده** در 23 صفحه کلیدی
- 🔧 **~250 helper methods** (activate, toggle, enable, disable)
- 📄 **~110 endpoints** نیاز به صفحه دارند

---

## صفحات پیشنهادی برای ساخت (30 صفحه)

### Tenant Pages (15 صفحه)

#### Operations & Monitoring
1. **Webhooks Management** (`/tenant/webhooks`)
   - لیست webhooks
   - Create/edit/delete webhooks
   - Test webhook
   - Webhook logs
   - Service: platformService

2. **API Usage & Monitoring** (`/tenant/api-usage`)
   - API call statistics
   - Rate limit monitoring
   - Usage by endpoint
   - Cost tracking
   - Service: platformService

3. **Active Sessions** (`/tenant/sessions`)
   - List active user sessions
   - Session details
   - Force logout
   - Session history
   - Service: usersService

4. **Certificates Management** (`/tenant/certificates`)
   - SSL/TLS certificates
   - Upload/renew certificates
   - Certificate expiry alerts
   - Service: platformService

5. **Backup Management** (`/tenant/backups`)
   - List backups
   - Create backup
   - Restore backup
   - Backup schedule
   - Service: platformService

#### Data Management
6. **Data Import** (`/tenant/imports`)
   - Import data (CSV, JSON)
   - Import history
   - Validation errors
   - Mapping configuration
   - Service: platformService

7. **Data Export** (`/tenant/exports`)
   - Export data
   - Export history
   - Scheduled exports
   - Export templates
   - Service: platformService

8. **Scheduled Jobs** (`/tenant/schedules`)
   - List scheduled jobs
   - Create/edit schedules
   - Job execution history
   - Cron expressions
   - Service: automationService

#### Resource Management
9. **Quota Management** (`/tenant/quotas`)
   - Resource quotas
   - Usage vs limits
   - Request quota increase
   - Quota history
   - Service: billingService

10. **Alert Configuration** (`/tenant/alerts`)
    - Alert rules
    - Alert channels
    - Alert history
    - Silence alerts
    - Service: securityService

#### Advanced Features
11. **Custom Domains** (`/tenant/domains`)
    - Custom domain configuration
    - DNS verification
    - SSL setup
    - Domain history
    - Service: platformService

12. **IP Whitelist** (`/tenant/ip-whitelist`)
    - Allowed IP ranges
    - Add/remove IPs
    - IP verification logs
    - Service: securityService

13. **Tokens Management** (`/tenant/tokens`)
    - Access tokens
    - Refresh tokens
    - Token rotation
    - Token usage
    - Service: authService

14. **Conditional Access** (`/tenant/conditional-access`)
    - Access policies based on conditions
    - Location-based access
    - Device-based access
    - Service: securityService

15. **Data Retention** (`/tenant/data-retention`)
    - Retention policies
    - Data cleanup
    - Retention schedule
    - Service: governanceService

---

### Global Pages (12 صفحه)

#### System Operations
1. **System Monitoring** (`/global/monitoring`)
   - Real-time metrics
   - Service health
   - Resource usage
   - Alerts dashboard
   - Service: platformService

2. **Database Migrations** (`/global/migrations`)
   - Migration history
   - Pending migrations
   - Run migrations
   - Rollback migrations
   - Service: platformService

3. **Global Backups** (`/global/backups`)
   - Platform-wide backups
   - Backup policies
   - Disaster recovery
   - Service: platformService

4. **System Diagnostics** (`/global/diagnostics`)
   - Run diagnostics
   - Health checks
   - Performance tests
   - Service: platformService

5. **System Logs** (`/global/logs`)
   - Application logs
   - Error logs
   - Access logs
   - Log filters
   - Service: observabilityService

6. **Platform Metrics** (`/global/metrics`)
   - Performance metrics
   - Business metrics
   - Technical metrics
   - Custom metrics
   - Service: platformService

#### Administration
7. **Global Alerts** (`/global/alerts`)
   - Platform alerts
   - Alert rules
   - Alert history
   - Service: securityService

8. **Maintenance Scheduler** (`/global/maintenance`)
   - Schedule maintenance
   - Maintenance windows
   - Notification planning
   - Service: platformService

9. **License Management** (`/global/licenses`)
   - License keys
   - License usage
   - Renewal management
   - Service: platformService

10. **Global Integrations** (`/global/integrations`)
    - Third-party integrations
    - OAuth apps
    - Webhooks
    - Service: platformService

11. **Global Webhooks** (`/global/webhooks`)
    - Platform webhooks
    - Webhook templates
    - Webhook testing
    - Service: platformService

12. **Rate Limiting** (`/global/rate-limiting`)
    - Global rate limits
    - Per-tenant limits
    - IP-based limits
    - Service: platformService

---

### Admin Pages (3 صفحه)

1. **Admin Activity Logs** (`/admin/logs`)
   - Admin actions
   - Security events
   - Login history
   - Service: observabilityService

2. **Admin API Keys** (`/admin/api-keys`)
   - Platform API keys
   - Key rotation
   - Usage tracking
   - Service: platformService

3. **Platform Roles** (`/admin/roles`)
   - System roles
   - Role templates
   - Permission sets
   - Service: platformService

---

## اولویت‌بندی

### High Priority (10 صفحه)
این صفحات بیشترین تاثیر رو دارند:
1. Webhooks (tenant)
2. API Usage (tenant)
3. Active Sessions (tenant)
4. Data Import/Export (tenant) - 2 صفحه
5. System Monitoring (global)
6. System Logs (global)
7. Admin Activity Logs
8. Backup Management (tenant)
9. Quota Management (tenant)

### Medium Priority (10 صفحه)
1. Scheduled Jobs
2. Alert Configuration
3. Certificates
4. Database Migrations
5. Global Backups
6. Platform Metrics
7. Custom Domains
8. IP Whitelist
9. Global Alerts
10. Maintenance Scheduler

### Low Priority (10 صفحه)
1. Tokens Management
2. Conditional Access
3. Data Retention
4. System Diagnostics
5. License Management
6. Global Integrations
7. Global Webhooks
8. Rate Limiting
9. Admin API Keys
10. Platform Roles

---

## استراتژی پیاده‌سازی

### Batch 1: Operations (5 صفحه)
- Webhooks
- API Usage
- Active Sessions
- Data Import
- Data Export

### Batch 2: System Management (5 صفحه)
- System Monitoring
- System Logs
- Backup Management
- Quota Management
- Scheduled Jobs

### Batch 3: Security & Access (5 صفحه)
- Alert Configuration
- Certificates
- IP Whitelist
- Conditional Access
- Admin Activity Logs

### Batch 4: Global Operations (5 صفحه)
- Database Migrations
- Global Backups
- Platform Metrics
- Global Alerts
- Maintenance Scheduler

### Batch 5: Advanced (5 صفحه)
- Custom Domains
- Tokens Management
- Data Retention
- System Diagnostics
- Global Integrations

### Batch 6: Admin & Misc (5 صفحه)
- License Management
- Global Webhooks
- Rate Limiting
- Admin API Keys
- Platform Roles

---

## تخمین

```
Total Pages: 30 صفحه
Total Lines: ~24,000 lines (800 lines/page average)
Total Time: 6 batches × parallel execution
Services: 10 services
Features: Monitoring, Management, Security, Operations
```

---

این 30 صفحه تمام endpoints باقی‌مانده با ارزش رو پوشش می‌دهند.
