# خلاصه Endpoint های استفاده نشده در Tenant Controllers

## آمار کلی
- **تعداد کل Controller ها**: 31
- **تعداد Controller های با endpoint استفاده نشده**: 19
- **تعداد کل endpoint های استفاده نشده**: 78

## Controller های بدون endpoint استفاده نشده
این Controller ها همه endpoint هایشان در frontend استفاده شده‌اند:
1. AccessRequestController
2. CopilotController
3. FederationOidcController
4. FederationSamlController
5. FederationScimController
6. GovernanceController
7. IncidentsController
8. NotificationController
9. ObservabilityController
10. ServiceAccountController
11. TenantSettingsController
12. TrustedDevicesController

## Controller های با بیشترین endpoint استفاده نشده

### 1. AdaptiveSecurityController (16 endpoints)
- GET /api/tenant/adaptive-security/dashboard
- GET /api/tenant/adaptive-security/policies
- POST /api/tenant/adaptive-security/policies
- PUT /api/tenant/adaptive-security/policies/{id}
- DELETE /api/tenant/adaptive-security/policies/{id}
- POST /api/tenant/adaptive-security/policies/{id}/enable
- POST /api/tenant/adaptive-security/policies/{id}/disable
- GET /api/tenant/adaptive-security/signals
- POST /api/tenant/adaptive-security/signals
- GET /api/tenant/adaptive-security/users/{userId}/risk-score
- GET /api/tenant/adaptive-security/high-risk-users
- POST /api/tenant/adaptive-security/evaluate
- GET /api/tenant/adaptive-security/users/{userId:guid}/context
- PUT /api/tenant/adaptive-security/users/{userId:guid}/context
- PUT /api/tenant/adaptive-security/policies/{policyId:guid}
- DELETE /api/tenant/adaptive-security/policies/{policyId:guid}

### 2. ExtensibilityController (12 endpoints)
- GET /api/tenant/extensibility/webhooks
- POST /api/tenant/extensibility/webhooks
- PUT /api/tenant/extensibility/webhooks/{id}
- DELETE /api/tenant/extensibility/webhooks/{id}
- GET /api/tenant/extensibility/login-hooks
- POST /api/tenant/extensibility/login-hooks
- PUT /api/tenant/extensibility/login-hooks/{id}
- DELETE /api/tenant/extensibility/login-hooks/{id}
- GET /api/tenant/extensibility/token-rules
- POST /api/tenant/extensibility/token-rules
- PUT /api/tenant/extensibility/token-rules/{id}
- DELETE /api/tenant/extensibility/token-rules/{id}

### 3. LifecycleController (8 endpoints)
- POST /api/tenant/lifecycle/hr/sync
- GET /api/tenant/lifecycle/access-packages
- POST /api/tenant/lifecycle/access-packages
- GET /api/tenant/lifecycle/policies
- POST /api/tenant/lifecycle/policies
- GET /api/tenant/lifecycle/events
- GET /api/tenant/lifecycle/users/{userId}/timeline
- GET /api/tenant/lifecycle/processing-status

### 4. PrivilegedAccessController (8 endpoints)
- POST /api/tenant/privileged-access/jit/request
- GET /api/tenant/privileged-access/jit/grants
- POST /api/tenant/privileged-access/jit/grants/{grantId}/revoke
- GET /api/tenant/privileged-access/sessions
- POST /api/tenant/privileged-access/sessions/{sessionId}/revoke
- GET /api/tenant/privileged-access/breakglass-accounts
- POST /api/tenant/privileged-access/breakglass-accounts
- GET /api/tenant/privileged-access/dashboard

### 5. ChangeSetsController (6 endpoints)
- POST /api/tenant/change-sets/{id}/submit
- POST /api/tenant/change-sets/{id}/approve
- POST /api/tenant/change-sets/{id}/reject
- POST /api/tenant/change-sets/{id}/schedule
- POST /api/tenant/change-sets/{id}/apply
- POST /api/tenant/change-sets/{id}/rollback

### 6. PrivacyController (5 endpoints)
- GET /api/tenant/privacy/retention-policies
- PUT /api/tenant/privacy/retention-policies/{category}
- GET /api/tenant/privacy/data-requests
- POST /api/tenant/privacy/data-requests
- POST /api/tenant/privacy/data-requests/{id:guid}/execute

### 7. ApplicationsController (4 endpoints)
- DELETE /api/tenant/applications/{id}
- DELETE /api/tenant/applications/redirect-uris/{redirectUriId}
- DELETE /api/tenant/applications/secrets/{secretId}
- PUT /api/tenant/applications/{applicationId}/org-units

### 8. AutomationController (3 endpoints)
- DELETE /api/tenant/automation/workflows/{id}
- POST /api/tenant/automation/workflows/{id}/enable
- POST /api/tenant/automation/workflows/{id}/disable

### 9. InsightsController (3 endpoints)
- GET /api/tenant/insights/export/overview
- GET /api/tenant/insights/export/users
- DELETE /api/tenant/insights/report-subscriptions/{id}

### 10. HuntingController (2 endpoints)
- DELETE /api/tenant/hunting/saved-queries/{id}
- DELETE /api/tenant/hunting/scheduled-hunts/{id}

### 11. OrgUnitsController (2 endpoints)
- POST /api/tenant/org-units/{orgUnitId}/move
- DELETE /api/tenant/org-units/{orgUnitId}

### 12. SecurityPolicyController (2 endpoints)
- GET /api/tenant/security/policy/org-unit-rules
- PUT /api/tenant/security/policy/org-unit-rules

## Controller های با 1 endpoint استفاده نشده
- **ApiKeyController**: POST /api/tenant/api-keys/{id}/revoke
- **BillingController**: POST /api/tenant/billing/upgrade-requests
- **DelegatedAdminsController**: DELETE /api/tenant/delegated-admins/{id}
- **MfaController**: DELETE /api/tenant/mfa/methods/{methodId}
- **PolicyController**: DELETE /api/tenant/policies/{id}
- **RiskEventsController**: POST /api/tenant/risk-events
- **UsersController**: PUT /api/tenant/users/{tenantUserId}/org-units

## توصیه‌ها
1. **Priority بالا**: AdaptiveSecurityController و ExtensibilityController endpoint های زیادی دارند که استفاده نشده‌اند
2. **Feature های ناقص**: LifecycleController و PrivilegedAccessController نشان‌دهنده feature هایی هستند که احتماالاً هنوز کامل پیاده‌سازی نشده‌اند
3. **عملیات CRUD ناقص**: بسیاری از Controller ها عملیات DELETE را دارند که در frontend استفاده نشده است
4. **Export و Reporting**: InsightsController قابلیت‌های export دارد که استفاده نشده‌اند

## فایل‌های مرتبط
- فایل JSON کامل: `/home/user/OneSign/TENANT_UNMAPPED_ENDPOINTS.json`
- اسکریپت تحلیل: `/home/user/OneSign/analyze_endpoints.py`
