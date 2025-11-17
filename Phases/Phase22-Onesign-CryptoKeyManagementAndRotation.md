# onesign – Phase 22 Crypto, Keys & Certificates Management + Rotation

## 1. محدوده Phase 22

### 1.1 هدف کلی

Phase 22 می‌خواهد onesign را از حالت:

> «یه سری کلید و certificate تو config»

تبدیل کند به یک **Key Management Layer واقعی** برای:

- مدیریت کلیدها و سرتیفیکیت‌ها:
  - OIDC signing keys (JWKS)
  - encryption keys (token, ساختار داخلی)
  - SAML certificates (اگر نیاز بود)
- per-tenant و per-environment key isolation
- key rotation اتوماتیک و دستی
- HSM/KMS-friendly design (امکان وصل شدن به HSM/Azure KeyVault/AWS KMS در فاز بعدی)
- UI و API برای:
  - دیدن keysets
  - رول‌اور (rollover) امن
  - revoke کردن key compromise شده

اگر این فاز را نداشته باشی، هر CISO جدی همین را می‌پرسد:

> «Signing keyهات کجا هستند؟ چطور rotate می‌کنی؟ چطور compromise را handle می‌کنی؟»

و الان جواب نداری.

### 1.2 Personas

- **Platform Crypto Owner / SRE / Global Admin**
  - می‌خواهد:
    - بداند هر environment و tenant با چه کلیدهایی sign می‌کند
    - policy rotation داشته باشد
    - بتواند emergency revocation انجام دهد

- **Tenant Security Officer**
  - می‌خواهد:
    - (برای حالت per-tenant signing) keyset خودش را ببیند
    - بفهمد JWKS endpoint چیست
    - در صورت نیاز، certificate خودش را upload کند (BYO key/cert)

- **Compliance / Auditor**
  - می‌خواهد:
    - log کامل:
      - key creation
      - rotation
      - revoke
    - policy مستند (rotation interval، HSM usage، …)

---

## 2. معماری کلی Phase 22

### 2.1 مفاهیم اصلی

- **KeySet**
  - مجموعه‌ای از کلیدها برای یک scope مشخص:
    - Environment-level (پیش‌فرض)
    - یا Tenant-level (اگر per-tenant signing را فعال کنیم)
  - نقش‌ها:
    - OIDC signing (id_token, access_token)
    - SAML signing (اگر فعال)
    - encryption (اختیاری در این فاز، فقط طراحی اولیه)

- **KeyVersion**
  - هر keyset چند ورژن دارد:
    - current (active)
    - previous (still valid برای validate tokens قدیمی)
    - retired (برای audit فقط)
  - شامل:
    - KID
    - key material (یا reference به HSM)
    - createdAt
    - activatedAt
    - expiredAt
    - state (Active / Passive / Retired / Revoked)

- **KeyStore Abstraction**
  - abstraction واقعی روی:
    - Local secure storage (e.g. DB + encryption)
    - external KMS/HSM (فاز بعدی)
  - بدون این abstraction، بعداً وصل شدن به HSM = جهنم.

- **Rotation Policy**
  - per environment:
    - rotationPeriod (مثلا ۳۰ روز)
    - overlapPeriod (مثلا ۷ روز برای نگه داشتن قبلی)
    - allowManualRollover (bool)

- **JWKS endpoint**
  - per environment (یا per tenant):
    - `/oidc/.well-known/jwks.json`
  - بر اساس KeySet و KeyVersionهای Active/Passive

---

## 3. Epics و User Storyها – Phase 22

### Epic 1 – Keysets & KeyVersion Model

#### US 22.1 – تعریف KeySet و KeyVersion

به عنوان Platform  
می‌خواهم KeySet و KeyVersion را به عنوان domain entity داشته باشم  
تا بتوانم کلیدها را versioned و قابل مدیریت نگه دارم.

Acceptance:

- موجودیت `KeySet`:
  - Id
  - ScopeType (Environment / Tenant)
  - ScopeId (EnvironmentId or TenantId)
  - Purpose (OidcSigning, SamlSigning, Encryption, …)
  - IsDefaultForScope
- موجودیت `KeyVersion`:
  - Id
  - KeySetId
  - Kid (string – stable identifier exposed via JWKS)
  - Algorithm (e.g. RS256, ES256)
  - KeyMaterial (encrypted blob یا HSM reference)
  - CreatedAt
  - ActivatedAt
  - ExpiredAt (nullable)
  - State (Active / Passive / Retired / Revoked)
- محدودیت‌ها:
  - در هر KeySet حداکثر ۱ Active (برای signing)
  - چند Passive برای validate tokens قبلی مجاز

#### US 22.2 – ساخت KeySet اولیه برای Environment

به عنوان Global Admin / Installer  
می‌خواهم هنگام bootstrap هر Environment یک KeySet اولیه ساخته شود  
تا از همان اول ساختار درست داشته باشیم.

Acceptance:

- هنگام bootstrap Environment (Phase 21):
  - اگر KeySet برای OidcSigning آن محیط وجود ندارد:
    - ساخت:
      - KeySet جدید
      - KeyVersion اولیه:
        - RSA/EC keypair تولید شود
        - state = Active
- JWKS endpoint همان key را expose کند.

---

### Epic 2 – JWKS و Token Signing/Validation

#### US 22.3 – JWKS Endpoint بر اساس KeySet/KeyVersion

به عنوان OIDC Client  
می‌خواهم JWKS endpoint onesign را ببینم  
تا keyهای مورد استفاده برای verify کردن tokenها را dynamically بگیرم.

Acceptance:

- endpoint:
  - `/oidc/.well-known/jwks.json`
  - اگر per-tenant طراحی شد:
    - `/t/{tenantSlug}/oidc/.well-known/jwks.json` یا شبیه آن
- دیتا:
  - شامل کلیدهایی با state = Active یا Passive (برای validate tokens recent)
  - public JWK properties:
    - kty, kid, alg, n/e (برای RSA) یا x/y (برای EC), use="sig"
- caching headers مناسب.

#### US 22.4 – استفاده از KeySet برای token signing

به عنوان TokenService  
می‌خواهم به جای config ثابت، از KeySet/KeyVersion استفاده کنم  
تا rotation و مدیریت نسخه کلید ساده شود.

Acceptance:

- در pipeline صدور token:
  - برای OIDC signing:
    - KeySet برای scope مربوطه (Environment-level) را lookup کند:
      - Purpose = OidcSigning
    - KeyVersion Active را بگیرد:
      - private key
      - alg
      - kid
    - token را با همین key/alg sign کند
    - kid در header token قرار گیرد.
- در pipeline validation (داخل platform):
  - از همان KeySet public key استفاده شود (یا از JWKS داخلی).

---

### Epic 3 – Rotation Policy و Scheduled Rotation

#### US 22.5 – تعریف Rotation Policy per Environment

به عنوان Global Admin  
می‌خواهم بتوانم policy rotation برای هر Environment تنظیم کنم  
تا طبق استانداردهای امنیتی، کلیدها auto-rotate شوند.

Acceptance:

- مدل `KeyRotationPolicy`:
  - ScopeType (Environment/Tenant)
  - ScopeId
  - Purpose (OidcSigning, …)
  - RotationPeriodDays
  - OverlapPeriodDays
  - Enabled
- API Global:
  - `GET /api/global/crypto/rotation-policies`
  - `PUT /api/global/crypto/rotation-policies/{scopeType}/{scopeId}/{purpose}`
- مقادیر پیشفرض:
  - مثلا:
    - RotationPeriodDays = 90
    - OverlapPeriodDays = 14

#### US 22.6 – Job اتوماتیک Rotation

به عنوان SRE  
می‌خواهم job دوره‌ای rotation، به صورت امن کلیدها را rotate کند  
تا نیازی به عملیات دستی همیشه نباشد.

Acceptance:

- background job:
  - `KeyRotationJob`
- behavior:
  - برای هر KeySet که policy Enabled دارد:
    - اگر زمان از `lastActivation + RotationPeriod` گذشت:
      - KeyVersion جدید تولید کند:
        - state = Active
      - قبلی را:
        - اگر در بازه overlap:
          - state → Passive
          - ExpiredAt = now + OverlapPeriod
        - اگر Overlap تمام شده:
          - state → Retired
- log + audit برای هر rotation.

---

### Epic 4 – Manual Rollover & Emergency Revoke

#### US 22.7 – Manual Key Rollover

به عنوان Global Admin  
می‌خواهم بتوانم از طریق UI/API، برای یک Environment یا Tenant key rollover دستی انجام دهم  
تا در شرایط خاص (تست، تغییر policy) کلید را خودم عوض کنم.

Acceptance:

- API:
  - `POST /api/global/crypto/keysets/{keySetId}/rollover`
- behavior:
  - KeyVersion جدید تولید کند:
    - Active
  - قبلی:
    - Passive (با ExpiredAt مناسب)
- محدودیت:
  - اگر rotation job هم هست، رفتار سازگار باشد.

#### US 22.8 – Emergency Key Revoke

به عنوان Security Officer  
می‌خواهم در صورت compromise، یک key را فوراً revoke کنم  
تا هیچ token جدیدی دیگر با آن کلید قابل قبول نباشد.

Acceptance:

- API:
  - `POST /api/global/crypto/keyversions/{id}/revoke`
- behavior:
  - state = Revoked
  - اگر key Active است:
    - باید فوراً KeyVersion جدید ساخته و Active شود
  - JWKS دیگر آن key را برنگرداند
- توجه:
  - tokenهایی که با آن key صادر شده‌اند:
    - اگر validation logic فقط از JWKS استفاده کند، invalid خواهند شد → قابل قبول در حالت emergency.

---

### Epic 5 – Admin Portal UI برای Crypto

#### US 22.9 – Global Crypto Dashboard

به عنوان Global Admin  
می‌خواهم یک صفحه Crypto Dashboard داشته باشم  
تا بتوانم KeySetها، KeyVersionها و rotation status را ببینم و مدیریت کنم.

Acceptance:

- صفحه:
  - `/global/crypto/keys`
- قابلیت‌ها:
  - لیست KeySetها:
    - Scope (Environment/Tenant)
    - ScopeId / Name
    - Purpose
    - ActiveKey Kid
    - LastRotationAt
  - انتخاب یک KeySet:
    - نمایش KeyVersionها:
      - Kid
      - Algorithm
      - State
      - CreatedAt
      - ActivatedAt
      - ExpiredAt
    - دکمه:
      - Manual Rollover
      - Revoke روی هر KeyVersion (با warning)

#### US 22.10 – Rotation Policy UI

به عنوان Global Admin  
می‌خواهم rotation policyها را در UI ببینم و تنظیم کنم  
تا مقدارها فقط در DB مخفی نباشند.

Acceptance:

- صفحه:
  - `/global/crypto/rotation-policies`
- لیست:
  - Scope (Environment/Tenant)
  - Purpose
  - RotationPeriodDays
  - OverlapPeriodDays
  - Enabled
- فرم edit:
  - عدد روزها
  - toggle Enabled

---

## 4. Dev Tasks – Backend

### 4.1 Data Model

**Task B22-1 – KeySet Entity & Mapping**

- ایجاد entity `KeySet`:
  - Id (Guid)
  - ScopeType (enum/string)
  - ScopeId (string / Guid)
  - Purpose (string/enum)
  - IsDefaultForScope (bool)
- EF:
  - جدول `Crypto_KeySets`
  - index روی (ScopeType, ScopeId, Purpose).

**Task B22-2 – KeyVersion Entity & Mapping**

- entity `KeyVersion`:
  - Id (Guid)
  - KeySetId
  - Kid (string, unique per KeySet)
  - Algorithm (string)
  - KeyMaterial (encrypted blob یا reference)
  - CreatedAt
  - ActivatedAt
  - ExpiredAt
  - State (Active, Passive, Retired, Revoked)
- EF:
  - جدول `Crypto_KeyVersions`
  - index روی (KeySetId, State)
  - constraint:
    - حداکثر یک Active per KeySet (در سطح سرویس enforce کن).

**Task B22-3 – KeyRotationPolicy Entity & Mapping**

- entity `KeyRotationPolicy`:
  - Id
  - ScopeType
  - ScopeId
  - Purpose
  - RotationPeriodDays
  - OverlapPeriodDays
  - Enabled
- EF:
  - جدول `Crypto_KeyRotationPolicies`
  - unique index روی (ScopeType, ScopeId, Purpose).

### 4.2 KeyStore Abstraction

**Task B22-4 – KeyStore Service Interface**

- `IKeyStore`
  - `Task<KeyMaterial> GenerateKeyAsync(Algorithm alg)`
  - `Task<PrivateKeyHandle> GetPrivateKeyAsync(KeyVersion version)`
  - `Task<PublicKeyMaterial> GetPublicKeyAsync(KeyVersion version)`
- implementation اولیه:
  - local DB storage + in-memory caching.
- design:
  - طوری بنویس که بعداً بتوانی HSM/KMS provider اضافه کنی.

### 4.3 Signing & JWKS Integration

**Task B22-5 – Token Signing Integration**

- در TokenService:
  - جایگزینی استفاده از static key با:
    - `IKeySetService.GetActiveSigningKey(scope)`:
      - scope = Environment / Tenant.
- نتیجه:
  - token header:
    - kid = KeyVersion.Kid
    - alg = Algorithm

**Task B22-6 – JWKS Endpoint**

- controller:
  - `JwksController`
- route:
  - `/oidc/.well-known/jwks.json`
- logic:
  - keyset برای scope فعال را پیدا کن.
  - همه KeyVersionهایی که State ∈ {Active, Passive} را بخوان.
  - map به JWK:
    - kty, kid, alg, use, n/e یا x/y.
- caching:
  - ETag یا Cache-Control برای چند دقیقه.

### 4.4 Rotation Job & APIs

**Task B22-7 – KeyRotationJob**

- job زمان‌بندی‌شده:
  - برای هر KeySet با policy Enabled:
    - چک اگر now >= ActivatedAtActive + RotationPeriod:
      - GenerateKey جدید:
        - new KeyVersion (Active)
      - قبلی:
        - Passive و ExpiredAt = now + OverlapPeriod
- logging:
  - هر rotation → log + audit.

**Task B22-8 – Manual Rollover API**

- service:
  - `IKeyRolloverService`
    - `Task RolloverAsync(keySetId)`
- API:
  - `POST /api/global/crypto/keysets/{keySetId}/rollover`
- behavior:
  - مشابه job، ولی immediate و با audit.

**Task B22-9 – Revoke API**

- service:
  - `IKeyRevocationService`
    - `Task RevokeAsync(keyVersionId, bool autoCreateNewActive)`
- API:
  - `POST /api/global/crypto/keyversions/{id}/revoke`
- behavior:
  - set State = Revoked
  - اگر Active و autoCreate:
    - create new Active version
    - برای continuity.

### 4.5 Rotation Policy APIs

**Task B22-10 – RotationPolicy Service & API**

- service:
  - `IRotationPolicyService`
    - CRUD per (ScopeType, ScopeId, Purpose).
- API Global:
  - `GET /api/global/crypto/rotation-policies`
  - `PUT /api/global/crypto/rotation-policies/{scopeType}/{scopeId}/{purpose}`

---

## 5. Dev Tasks – Frontend (Admin Portal)

### 5.1 Crypto Dashboard

**Task F22-1 – Global Crypto KeySets List**

- route:
  - `/global/crypto/keys`
- data:
  - `GET /api/global/crypto/keysets`
- table:
  - ScopeType
  - ScopeId / Name (مثلاً Environment name)
  - Purpose
  - ActiveKey Kid
  - LastRotationAt
- row click → جزئیات KeySet.

**Task F22-2 – KeySet Detail & KeyVersions**

- route:
  - `/global/crypto/keys/{keySetId}`
- data:
  - `GET /api/global/crypto/keysets/{id}` (with versions)
- UI:
  - لیست KeyVersionها:
    - Kid
    - Algorithm
    - State badge
    - CreatedAt, ActivatedAt, ExpiredAt
  - actions:
    - "Manual Rollover"
    - "Revoke" (per version) با modal تأیید و توضیح خطر.

### 5.2 Rotation Policy UI

**Task F22-3 – Rotation Policies Page**

- route:
  - `/global/crypto/rotation-policies`
- data:
  - `GET /api/global/crypto/rotation-policies`
- table:
  - ScopeType
  - ScopeId
  - Purpose
  - RotationPeriodDays
  - OverlapPeriodDays
  - Enabled
- edit modal:
  - عدد روزها + toggle Enabled
- همه labelها via i18n.

---

## 6. Cross-Cutting – Security, Audit, Migration, Testing

### 6.1 Security & Access Control

**Task X22-1 – Permissions**

- همه `/api/global/crypto/*`:
  - فقط Global Admin / SecurityOfficer.
- JWKS endpoint:
  - public (طبق استاندارد), بدون leak غیر از public keys.

### 6.2 Audit & Logging

**Task X22-2 – Audit Events**

ثبت:

- "Crypto.KeySet.Created"
- "Crypto.KeyVersion.Created"
- "Crypto.KeyVersion.Rotated"
- "Crypto.KeyVersion.Revoked"
- "Crypto.RotationPolicy.Updated"
- "Crypto.Jwks.Served" (aggregate level، optional)

هر event باید شامل:

- ScopeType, ScopeId
- Kid
- Actor (GlobalAdmin user id) برای عملیات مدیریتی.

### 6.3 Migration & Backward Compatibility

**Task X22-3 – Migration از config قدیمی**

- اگر تا قبل از Phase 22 keyها در appsettings یا config ثابت بودند:
  - migration script:
    - On first startup:
      - از config ثابت، یک KeySet + KeyVersion بساز.
      - سپس config ثابت را ignore کن.
- این‌طوری:
  - بدون شکستن tokens قبلی، به مدل جدید مهاجرت می‌کنی.

### 6.4 Tests

**Task X22-4 – Unit و Integration Tests**

- Testها:
  - key generation + persistence
  - token signing با KeyVersionActive
  - JWKS شامل Active و Passive
  - rotation job:
    - Active → Passive → Retired
  - manual rollover:
    - Active جدید و کارکردن tokens جدید با kid جدید
  - revoke:
    - JWKS دیگر آن kid را برنمی‌گرداند.

---

## 7. نکات طراحی Phase 22

- هدف:
  - onesign از نظر مدیریت کلید و crypto شبیه یک IdP enterprise-grade شود، نه یک web app معمولی.
- حواست باشد:
  - هر مسخره‌بازی مثل:
    - نگه‌داشتن private key در plain text
    - نداشتن state برای KeyVersion
    - نبودن kid و JWKS واقعی
  - در audit/penetration test سریعاً لو می‌رود.

اگر بعد از Phase 22 هنوز:

- فقط یک کلید ثابت در config داری
- JWKS درست و حسابی و rotation policy نداری
- emergency revoke نداری  

یعنی این فاز را عملاً انجام ندادی و فقط یه دکور روی سیستم چسباندی.
