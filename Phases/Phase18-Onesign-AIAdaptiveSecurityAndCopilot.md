# onesign – Phase 18 AI Adaptive Security & Security Copilot

## 1. محدوده Phase 18

### 1.1 هدف کلی

Phase 18 روی دو چیز سوار است:

1. **Adaptive Security**  
   استفاده از RiskScore و Insights برای:
   - Risk-based MFA و session policy
   - Dynamic access hardening (step-up auth, session clampdown)
   - Auto-playbooks ساده (semi-auto remediation)

2. **Security Copilot (AI Assistant)**  
   یک لایه کمکی برای Security Officer / Tenant Admin که:
   - وضعیت ریسک و وقایع را به زبان طبیعی خلاصه کند
   - پیشنهادهای concrete بدهد (MFA را برای فلان segment فعال کن، این ۱۰ تا ZombieAccount را ببند، این roles را کم کن)
   - روی این پیشنهادها «one-click apply» ارائه دهد (با تأیید انسان)

Phase 17 داده و RiskScore و Insights را ساخته؛ Phase 18 این داده را زنده و actionable می‌کند.  
اگر بعد از این فاز، هنوز Security Officer مجبور است همه چیز را دستی تحلیل کند، فاز ۱۸ را خراب کردی.

### 1.2 Personas

- **Security Officer / SOC Lead**
  - می‌خواهد:
    - به جای گشتن لای ۱۰۰ تا جدول، یک Copilot بهش بگوید «الان کجا خطرناک است و چه کن».
    - بتواند با یک کلیک MFA / campaign / revoke را روی segmentهای مشخص اعمال کند.

- **Tenant Admin / IAM Owner**
  - می‌خواهد:
    - پیشنهادهای ساده برای hardening و پاکسازی بگیرد.
    - بدون این‌که متخصص Security باشد، کارهای درست را انجام دهد.

- **Global Admin / Product Owner**
  - می‌خواهد:
    - adaptive security از همان پلتفرم بیاید، نه از ده تا سیستم جدا.
    - تضمین کند که همه چیز audit و قابل توضیح است (هیچ «AI جادویی» که معلوم نیست چی کرده).

---

## 2. معماری کلی Phase 18

### 2.1 ماژول جدید: AI & Adaptive Security

دو لایه:

1. **AdaptivePolicy Engine** (deterministic)
   - Rule-based engine که از:
     - UserRiskScore / TenantRiskScore (Phase 17)
     - Insights (HighRiskUser, ZombieAccount, ExcessivePrivileges, …)
   - استفاده می‌کند تا:
     - Policy پیشنهاد دهد (یا enforce کند):
       - risk-based MFA
       - session lifetime adjustment
       - login anomaly response
   - ماژول:  
     `Onesign.Modules.SecurityAdaptive` (در کنار Security/Authorization)

2. **Security Copilot** (AI-assisted)
   - Gateway برای اتصال به AI provider (LLM), اما با abstraction واضح:
     - `IAiAdvisorClient`
   - روی داده‌های IdentityInsights, Governance, PrivilegedAccess، …:
     - خلاصه‌سازی، explanation، پیشنهاد.
   - ماژول:  
     `Onesign.Modules.SecurityCopilot`

هیچ Logic حیاتی نباید «فقط» در AI باشد؛ AI فقط پیشنهاد و خلاصه می‌دهد، enforce همیشه از طریق PolicyEngine/AdaptivePolicy است.

---

## 3. Epics و User Storyها – Phase 18

### Epic 1 – Risk-Based Authentication & MFA

#### US 18.1 – Risk-Based MFA Policy per Tenant

به عنوان Security Officer  
می‌خواهم بتوانم Policy تعریف کنم که مثلاً:  
«اگر UserRiskScore بالاتر از ۷۰ بود، همیشه MFA اجباری باشد»  
تا authentication براساس ریسک تنظیم شود.

Acceptance:

- Policy مدل جدید (یا extension روی PolicyEngine):
  - RiskBasedAuthPolicy:
    - TenantId
    - Enabled
    - MinRiskScoreForMfa
    - MinRiskScoreForStepUp (مثلاً extra verification)
- ذخیره در DB:
  - جدول RiskBasedAuthPolicies یا فیلد جدید در TenantSecurityConfig.
- Evaluation:
  - در جریان login / token issuance:
    - از UserRiskScore (Phase 17) استفاده کند.
    - اگر score >= MinRiskScoreForMfa → MFA required.
    - اگر score >= MinRiskScoreForStepUp → risk-based step-up (مثلاً device binding, extra OTP).
- Audit:
  - "AdaptiveSecurity.RiskBasedMfaEnforced" با tenant, user, score, policyId.

#### US 18.2 – Dynamic Session Hardening

به عنوان Security Officer  
می‌خواهم براساس ریسک کاربر، session lifetime و رفتار محدود شود  
تا کاربران پرریسک، session طولانی و آزاد نداشته باشند.

Acceptance:

- Policy:
  - RiskBasedSessionPolicy:
    - DefaultSessionLifetimeMinutes
    - HighRiskMaxSessionLifetimeMinutes
    - IdleTimeoutHighRiskMinutes
- در جریان session issuance:
  - اگر UserRiskScore > threshold:
    - lifetime را کوتاه‌تر کن.
    - idle timeout را کم کن.
- Audit:
  - "AdaptiveSecurity.SessionHardened" وقتی تنظیم سخت‌تر اعمال شد.

---

### Epic 2 – Adaptive Recommendations & Playbooks

#### US 18.3 – Recommendation برای MFA Coverage

به عنوان Security Officer  
می‌خواهم پیشنهاد بگیرم که برای چه segmentهایی MFA را فعال کنم  
تا کار از «گمانه‌زنی» خارج شود.

Acceptance:

- Recommendation type: `MfaCoverageRecommendation`
  - TargetScope:
    - Tenant-wide
    - OrgUnit segment
    - HighRiskUsers segment
- استفاده از:
  - TenantAnalyticsSummary (MFAEnrollmentRate)
  - UserRiskScores
- مثال:
  - "Enable MFA for all users in OrgUnit = 'Finance' where MFA disabled AND risk score > 50".
- Recommendation object:
  - Id
  - Type
  - ScopeDescription
  - EstimatedImpact (e.g. usersAffected)
  - ProposedAction (structured, نه فقط text)

#### US 18.4 – Recommendation برای Zombie Cleanup

به عنوان IAM Owner  
می‌خواهم پیشنهاد دریافت کنم که کدام ZombieAccountها را disable کنم  
تا پاکسازی access راحت شود.

Acceptance:

- Recommendation type: `ZombieCleanupRecommendation`
  - input:
    - Insights of type ZombieAccount (Phase 17)
- پیشنهاد:
  - batch disable users یا revoke roles/app access.
- Must:
  - پیشنهاد فقط، نه auto-enforce در این فاز.
  - execution از طریق Playbook action (با confirmation).

#### US 18.5 – Recommendation برای Excessive Privileges

به عنوان Governance Officer  
می‌خواهم لیست پیشنهاد برای کاهش دسترسی‌های اضافه بگیرم  
تا نیازی نباشد تک‌به‌تک roleها را audit کنم.

Acceptance:

- Recommendation type: `ExcessivePrivilegesRecommendation`
  - از Insights ExcessivePrivileges استفاده می‌کند.
- پیشنهاد:
  - کاهش roleهای مشخص (with before/after diff).
  - link به Governance campaign اگر لازم باشد.

---

### Epic 3 – Security Copilot (AI Assistant)

#### US 18.6 – Natural Language Risk Summary

به عنوان Security Officer  
می‌خواهم بتوانم در Security Copilot بنویسم:  
"High-risk users in Germany in the last 7 days را برایم توضیح بده"  
و یک خلاصه قابل فهم بگیرم  
تا سریع situational awareness داشته باشم.

Acceptance:

- API:
  - `POST /api/tenant/security-copilot/query`
    - input:
      - natural language query (English برای now; multi-language later)
- Behavior:
  - Backend:
    - query را normalize کند (tenant, زمان، scope).
    - داده را از IdentityInsights، Governance، PrivilegedAccess بگیرد.
    - ساختار context JSON به AI layer بدهد (نه raw DB).
    - از `IAiAdvisorClient` برای تولید پاسخ متنی structured استفاده کند:
      - Sections: Summary, KeyRisks, SuggestedActions.
- Output:
  - text + structured suggested actions (ids/links) که UI می‌تواند به action تبدیل کند.

#### US 18.7 – Copilot Suggested Actions with One-Click Execution

به عنوان Security Officer  
می‌خواهم پیشنهادی مثل:  
"Disable MFA exemptions for 5 high-risk users"  
را از Copilot بگیرم و با یک کلیک اجرا کنم  
تا از حداقل friction برای hardening استفاده کنم.

Acceptance:

- SuggestedAction model:
  - ActionType (e.g. EnforceMfaForUsers, DisableUsers, DowngradeRoles, StartAccessReviewCampaign)
  - Scope (userIds / orgUnits / tenant)
  - PreviewImpact (counts)
  - Origin (Copilot / RuleEngine).
- API:
  - `POST /api/tenant/security-copilot/actions/execute`
    - input: SuggestedActionId
- Backend:
  - validate:
    - caller role (SecurityOfficer فقط).
  - translate ActionType → calls:
    - PolicyEngine / Authorization / Lifecycle / Governance / NotificationCenter.
  - audit:
    - "SecurityCopilot.ActionExecuted" با context کامل.

---

### Epic 4 – Adaptive Policy Integration with Login & Token Flow

#### US 18.8 – Risk-aware Login Pipeline

به عنوان AuthService  
می‌خواهم قبل از نهایی کردن login، RiskScore و Insightها را چک کنم  
تا تصمیم بگیرم MFA، step-up یا حتی block لازم است یا نه.

Acceptance:

- در Auth pipeline (OIDC/OAuth flows):
  - بعد از validation اولیه credential:
    - Load UserRiskScore.
    - Evaluate RiskBasedAuthPolicy.
    - اگر:
      - risk > cutoffCritical و Insightهایی مثل "AccountUnderInvestigation" یا "CompromisedCredential" موجود است:
        - login را block یا require manual unlock.
      - risk > MinRiskScoreForMfa:
        - enforce MFA.
- همه تصمیم‌ها:
  - در audit log بصورت structured ثبت شوند:
    - reason codes (e.g. RISK_MFA_ENFORCED, RISK_LOGIN_BLOCKED).

---

## 4. Dev Tasks – Backend

### 4.1 Adaptive Policy Engine

**Task B18-1 – RiskBasedAuthPolicy Model & Storage**

- اضافه entity/aggregate:
  - RiskBasedAuthPolicy:
    - TenantId
    - Enabled
    - MinRiskScoreForMfa
    - MinRiskScoreForStepUp
- EF mapping + migration Phase 18.
- سرویس:
  - `IRiskBasedAuthPolicyService`
    - `Task<RiskBasedAuthPolicy?> GetForTenantAsync(Guid tenantId)`
    - `Task UpdateAsync(RiskBasedAuthPolicy policy)`

**Task B18-2 – RiskBasedSessionPolicy Model & Storage**

- entity:
  - RiskBasedSessionPolicy:
    - TenantId
    - DefaultSessionLifetimeMinutes
    - HighRiskMaxSessionLifetimeMinutes
    - HighRiskIdleTimeoutMinutes
- migration + service.

**Task B18-3 – AdaptiveAuthEvaluator**

- سرویس:
  - `IAdaptiveAuthEvaluator`
    - `Task<AdaptiveAuthDecision> EvaluateAsync(UserContext, UserRiskScore, RiskBasedAuthPolicy)`
- AdaptiveAuthDecision:
  - RequireMfa (bool)
  - RequireStepUp (bool)
  - BlockLogin (bool)
  - ReasonCodes (list)
- پیاده‌سازی rule-based طبق spec.

**Task B18-4 – AdaptiveSessionConfigurator**

- سرویس:
  - `IAdaptiveSessionConfigurator`
    - `AdaptiveSessionConfig GetConfig(UserRiskScore, RiskBasedSessionPolicy)`
- AdaptiveSessionConfig:
  - SessionLifetime
  - IdleTimeout
- در session issuance، از این config استفاده شود.

### 4.2 Recommendations Engine

**Task B18-5 – Recommendation Entities**

- entity:
  - Recommendation:
    - Id
    - TenantId
    - Type (MfaCoverage, ZombieCleanup, ExcessivePrivileges, …)
    - Scope (User/OrgUnit/Tenant)
    - ScopeData (json)
    - EstimatedImpact (ints, counts)
    - Status (Open, Applied, Dismissed)
    - CreatedAt, UpdatedAt
- EF mapping + migration.

**Task B18-6 – RecommendationGenerator**

- سرویس:
  - `IRecommendationGenerator`
    - `Task GenerateOrUpdateAsync(TenantId)`
- Rules:
  - MfaCoverage:
    - اگر MFAEnrollmentRate < threshold:
      - برای segments (OrgUnit, HighRiskUsers) پیشنهاد بده.
  - ZombieCleanup:
    - بر اساس ZombieAccount Insights باز.
  - ExcessivePrivileges:
    - بر اساس ExcessivePrivileges Insights.

**Task B18-7 – Recommendation APIs**

- `GET /api/tenant/security/recommendations`
  - filter by type/status.
- `POST /api/tenant/security/recommendations/{id}/dismiss`
- `POST /api/tenant/security/recommendations/{id}/approve`
  - approval قبل از اجرای Playbook.

### 4.3 Security Copilot Backend

**Task B18-8 – AiAdvisorClient abstraction**

- interface:
  - `IAiAdvisorClient`
    - `Task<SecurityCopilotResponse> AskAsync(SecurityCopilotPrompt prompt)`
- SecurityCopilotPrompt:
  - NaturalLanguageQuery
  - TenantContext (ids, locale)
  - DataContext (summarized IdentityInsights data)
- SecurityCopilotResponse:
  - SummaryText
  - KeyRisks (list)
  - SuggestedActions (list of structured actions)

**Task B18-9 – SecurityCopilotController**

- API:
  - `POST /api/tenant/security-copilot/query`
- Steps:
  - Parse query
  - Build DataContext:
    - call IdentityInsights, Governance, PrivilegedAccess services.
  - Build prompt object
  - Call `IAiAdvisorClient`
  - Map response به DTO:
    - include SuggestedActions.

**Task B18-10 – SuggestedAction Model + Execution**

- entity:
  - SuggestedAction:
    - Id
    - TenantId
    - Origin (Copilot / RecommendationEngine)
    - ActionType
    - ScopeData (json: users, orgunits, apps)
    - PreviewImpact
    - Status (Pending, Executed, Cancelled)
    - CreatedAt, ExecutedAt
- API:
  - `POST /api/tenant/security-copilot/actions/{id}/execute`
- Execution service:
  - map ActionType → calls:
    - e.g. `EnforceMfaForUsers` → Security module
    - `DisableUsers` → Lifecycle/User module
    - `DowngradeRoles` → Authorization
    - `StartAccessReviewCampaign` → Governance.

### 4.4 Login / Token Pipeline Integration

**Task B18-11 – Integrate AdaptiveAuthEvaluator into Login Flow**

- در Auth server:
  - بعد از credential validation:
    - Load:
      - UserRiskScore
      - RiskBasedAuthPolicy
    - call `IAdaptiveAuthEvaluator`.
  - اگر:
    - BlockLogin → reject + proper error + audit.
    - RequireMfa / StepUp → branch به flow MFA/step-up.

**Task B18-12 – Integrate AdaptiveSessionConfigurator**

- در token/session issuance:
  - call `IAdaptiveSessionConfigurator`.
  - تنظیم lifetime/idle timeout.

---

## 5. Dev Tasks – Frontend / Admin Portal

### 5.1 Security Center – Adaptive & Recommendations UI

**Task F18-1 – Risk-Based Policy Settings UI**

مسیر: `/tenant/security/adaptive-settings`

- فرم:
  - Risk-based MFA:
    - Enabled toggle
    - MinRiskScoreForMfa (slider/input)
    - MinRiskScoreForStepUp
  - Risk-based Session:
    - DefaultSessionLifetime
    - HighRiskMaxSessionLifetime
    - HighRiskIdleTimeout
- اتصال به:
  - RiskBasedAuthPolicy / RiskBasedSessionPolicy APIs.
- هشدار واضح:
  - تغییر این مقادیر می‌تواند روی login همه کاربران اثر بگذارد.

**Task F18-2 – Recommendations Panel**

مسیر: `/tenant/security/recommendations`

- لیست Recommendations:
  - Type, ScopeDescription, EstimatedImpact, Status.
  - Actions:
    - View details
    - Approve (→ ممکن است SuggestedAction بسازد)
    - Dismiss
- UI ساده ولی واضح، با badge‌های severity/impact.

### 5.2 Security Copilot UI

**Task F18-3 – Copilot Panel در Security Center**

- در صفحه `/tenant/security/insights` یا جدا: `/tenant/security/copilot`
- UI:
  - Textarea / input برای query طبیعی.
  - Button "Ask Copilot".
  - نمایش:
    - SummaryText
    - Key risks (bullet list)
    - SuggestedActions list:
      - هر کدام:
        - توضیح کوتاه
        - EstimatedImpact
        - Button "Apply" (call execute API).

**Task F18-4 – Suggested Actions Modal/Detail**

- وقتی روی یک SuggestedAction کلیک می‌شود:
  - Modal:
    - شرح
    - scope (لیست کاربران/OrgUnits یا preview نمونه)
    - impact (تعداد کاربران، apps)
    - confirmation ("Yes, apply").
- بعد از اجرا:
  - نمایش نتیجه + لینک به log/Audit.

---

## 6. Cross Cutting – Observability, Audit, Security

**Task X18-1 – Audit Events**

ثبت این eventها:

- "AdaptiveSecurity.RiskBasedMfaEnforced"
- "AdaptiveSecurity.SessionHardened"
- "AdaptiveSecurity.LoginBlockedByRisk"
- "SecurityCopilot.QueryExecuted"
- "SecurityCopilot.ActionSuggested"
- "SecurityCopilot.ActionExecuted"
- "SecurityRecommendations.Generated"
- "SecurityRecommendations.Dismissed"

**Task X18-2 – Metrics**

- تعداد:
  - risk-based MFA triggers per tenant
  - risk-based blocks
  - Copilot queries
  - actions executed via Copilot/recommendations.

**Task X18-3 – Security & Permissions**

- فقط SecurityOfficer / TenantAdmin:
  - دسترسی به adaptive settings.
  - دیدن و اجرای SuggestedActions / Recommendations.
- logging:
  - همه executionها باید userId actor را داشته باشند.

**Task X18-4 – Localization**

- کل UI جدید:
  - "Adaptive Security", "Risk-based MFA", "Security Copilot", "Recommendation", …
- همگی با i18n key و ترجمه فارسی/انگلیسی.

---

## 7. نکات طراحی Phase 18

- فاز ۱۷ جواب می‌داد: «چه کسی خطرناک است و چرا؟»  
- فاز ۱۸ باید جواب بدهد: «حالا دقیقا چه کار کنیم؟ و آن را برای من آماده کن.»

اگر بعد از این فاز، Security Officer هنوز مجبور است از CSV export بگیرد و دستی توی Excel تصمیم بگیرد، یعنی Adaptive / Copilot را تبدیل به اسباب‌بازی کرده‌ای، نه feature جدی محصول.

هدف Phase 18:

> اتصال Risk & Analytics به **action واقعی**، با یک لایه AI که پیشنهاد می‌دهد، ولی همیشه انسان دکمه‌ی نهایی را می‌زند و همه چیز audit می‌شود.
