# onesign - Core SSO SaaS Platform

A production-ready, multi-tenant Single Sign-On (SSO) platform built with .NET 10 and React/Next.js, implementing OIDC Authorization Code + PKCE flow.

## 🏗️ Architecture

### Backend (Modular Monolith)
- **Onesign.Api** - Main API project
- **Onesign.Shared** - Cross-cutting concerns (Result, Pagination, Localization, etc.)
- **Onesign.Modules.Tenants** - Tenant management
- **Onesign.Modules.Identity** - User identity and authentication
- **Onesign.Modules.Applications** - Application client management
- **Onesign.Modules.Audit** - Audit logging
- **Onesign.Sdk.DotNet** - .NET SDK for client applications

### Frontend
- **onesign-login-portal** - Login Portal for end users (Next.js)
- **onesign-admin-portal** - Admin Portal for Global Admin and Tenant Admin (Next.js)

### SDKs
- **Onesign.Sdk.DotNet** - .NET SDK
- **sdk/react-sdk** - React SDK

## 🚀 Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 18+ and npm
- SQL Server (or SQL Server Express)
- Visual Studio 2022 or VS Code (optional)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OneSignV2
   ```

2. **Configure database connection**
   
   Edit `src/Onesign.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=YOUR_SERVER;Database=OnesignDbV2;Trusted_Connection=True;MultipleActiveResultSets=true"
     },
     "Jwt": {
       "SigningKey": "your-secret-signing-key-change-in-production-min-32-chars"
     },
     "Google": {
       "ClientId": "YOUR_GOOGLE_CLIENT_ID_HERE"
     }
   }
   ```

3. **Run database migrations**
   ```bash
   cd src/Onesign.Api
   dotnet ef database update
   ```

4. **Run the API**
   ```bash
   dotnet run
   ```
   
   The API will be available at:
   - HTTP: `http://localhost:7000`
   - HTTPS: `https://localhost:7001`
   - Swagger: `https://localhost:7001/swagger`

### Frontend Setup

#### Login Portal

1. **Navigate to login portal**
   ```bash
   cd onesign-login-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update API base URL in your environment or configuration files.

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Login Portal will be available at `http://localhost:3000`

#### Admin Portal

1. **Navigate to admin portal**
   ```bash
   cd onesign-admin-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update API base URL in your environment or configuration files.

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Admin Portal will be available at `http://localhost:3001` (or next available port)

## 📚 API Endpoints

### Discovery & OIDC
- `GET /.well-known/openid-configuration` - OpenID Connect discovery
- `GET /connect/authorize` - Authorization endpoint
- `POST /connect/token` - Token endpoint
- `GET /connect/userinfo` - UserInfo endpoint
- `GET /.well-known/jwks.json` - JSON Web Key Set

### Admin Endpoints
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create new tenant
- `PATCH /api/admin/tenants/{tenantId}/status` - Update tenant status

### Tenant Endpoints
- `GET /api/tenant/users` - List tenant users
- `POST /api/tenant/users/invite` - Invite user to tenant
- `GET /api/tenant/users/{tenantUserId}` - Get user details
- `PATCH /api/tenant/users/{tenantUserId}/status` - Disable user
- `GET /api/tenant/applications` - List applications
- `POST /api/tenant/applications` - Create application
- `GET /api/tenant/applications/{id}` - Get application details
- `PUT /api/tenant/applications/{id}` - Update application
- `DELETE /api/tenant/applications/{id}` - Delete application
- `POST /api/tenant/applications/{id}/redirect-uris` - Add redirect URI
- `DELETE /api/tenant/applications/redirect-uris/{redirectUriId}` - Remove redirect URI
- `POST /api/tenant/applications/{id}/secrets` - Add client secret
- `DELETE /api/tenant/applications/secrets/{secretId}` - Remove client secret
- `GET /api/tenant/settings` - Get tenant settings
- `PUT /api/tenant/settings/branding` - Update tenant branding
- `GET /api/tenant/audit` - Get audit events

### Authentication Endpoints
- `POST /api/auth/login` - Password login
- `POST /api/auth/google-login` - Google social login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Confirm password reset
- `POST /api/auth/complete-first-login` - Complete first login (set password)

## 🌐 Multi-Language Support

The platform supports English and Persian (Farsi) out of the box. Language is determined by the `Accept-Language` HTTP header.

### Supported Languages
- `en` - English (default)
- `fa` - Persian/Farsi

### Example
```bash
curl -H "Accept-Language: fa" https://localhost:7001/api/tenant/users
```

## 🔐 Security Features

- **OIDC Authorization Code + PKCE** - Secure authentication flow
- **JWT Tokens** - Access tokens and ID tokens
- **Multi-tenant Isolation** - Tenant-scoped data and operations
- **Password Hashing** - BCrypt password hashing
- **Session Management** - Secure session handling
- **Audit Logging** - Comprehensive audit trail

## 🧪 Testing

### Run Unit Tests
```bash
cd src/Onesign.Api.Tests
dotnet test
```

### Test Coverage
- Tenant operations (create, update status)
- User operations (invite, activate)
- Application operations (create, redirect URI validation)
- OIDC PKCE flow

## 📦 SDK Usage

### .NET SDK

```csharp
using Onesign.Sdk.DotNet;

var options = new OnesignOptions
{
    BaseUrl = "https://your-onesign-instance.com",
    ClientId = "your-client-id",
    RedirectUri = "https://your-app.com/callback",
    TenantId = Guid.Parse("your-tenant-id")
};

var client = new OnesignClient(options);

// Build authorization URL
var authUrl = client.BuildAuthorizeUrl("state-value");

// Exchange code for tokens
var tokens = await client.ExchangeCodeForTokenAsync(code, codeVerifier);
```

### React SDK

```typescript
import { useOnesignAuth } from '@onesign/react-sdk';

const config = {
  baseUrl: 'https://your-onesign-instance.com',
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  tenantId: 'your-tenant-id'
};

const { login, handleCallback, tokenInfo, isAuthenticated } = useOnesignAuth(config);
```

See SDK README files for detailed documentation:
- [.NET SDK README](src/Onesign.Sdk.DotNet/README.md)
- [React SDK README](sdk/react-sdk/README.md)

## 🗄️ Database Schema

The platform uses Entity Framework Core with SQL Server. Key entities:

- **Tenants** - Tenant information and configuration
- **GlobalUsers** - Global user accounts
- **TenantUsers** - Tenant-specific user assignments
- **ApplicationClients** - OAuth/OIDC client applications
- **ClientRedirectUris** - Allowed redirect URIs
- **AuditEvents** - Audit log entries
- **PasswordResetTokens** - Password reset tokens
- **UserLoginSessions** - User login sessions
- **ExternalLogins** - External login providers (Google, etc.)

## 🔧 Configuration

### Environment Variables

For production, use environment variables or secure configuration:

- `ConnectionStrings:DefaultConnection` - Database connection string
- `Jwt:SigningKey` - JWT signing key (minimum 32 characters)
- `Google:ClientId` - Google OAuth client ID

### CORS Configuration

CORS is configured in `Program.cs`. Update allowed origins for production.

## 📝 Development

### Project Structure
```
OneSignV2/
├── src/
│   ├── Onesign.Api/              # Main API
│   ├── Onesign.Shared/           # Shared utilities
│   ├── Onesign.Modules.Tenants/  # Tenant module
│   ├── Onesign.Modules.Identity/ # Identity module
│   ├── Onesign.Modules.Applications/ # Applications module
│   ├── Onesign.Modules.Audit/    # Audit module
│   ├── Onesign.Sdk.DotNet/       # .NET SDK
│   └── Onesign.Api.Tests/        # Unit tests
├── onesign-login-portal/         # Login Portal (Next.js)
├── onesign-admin-portal/         # Admin Portal (Next.js)
└── sdk/
    └── react-sdk/                # React SDK
```

### Adding New Features

1. Follow the modular monolith architecture
2. Add domain entities in `Domain/Entities`
3. Add repositories in `Domain/Repositories`
4. Add EF Core entities in `Infrastructure/EfCore/Entities`
5. Add commands/queries in `Application/Commands` and `Application/Queries`
6. Add controllers in `Onesign.Api/Controllers`
7. Add unit tests in `Onesign.Api.Tests`

## 🐛 Troubleshooting

### Database Connection Issues
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure database exists or migrations are run

### Port Conflicts
- Default ports: 7000 (HTTP), 7001 (HTTPS)
- Change ports in `Properties/launchSettings.json`

### CORS Errors
- Update CORS configuration in `Program.cs`
- Ensure frontend URLs are in allowed origins

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Support

[Add support contact information here]

