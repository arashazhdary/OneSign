# Onesign.Sdk.AspNetCore

ASP.NET Core integration for validating OneSign JWT access tokens and exposing normalized claims.

## Install

```bash
dotnet add package Onesign.Sdk.AspNetCore
```

Or project reference:

```xml
<ProjectReference Include="..\Onesign.Sdk.AspNetCore\Onesign.Sdk.AspNetCore.csproj" />
```

## Configuration

```json
{
  "Onesign": {
    "Authority": "https://localhost:5001",
    "Audience": "my-api-client-id",
    "SigningKey": "your-secret-signing-key-change-in-production-min-32-chars"
  }
}
```

`SigningKey` must match `Jwt:SigningKey` on your OneSign server while tokens use HS256.

## Usage

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOnesignAuthentication(builder.Configuration);
builder.Services.AddControllers();

var app = builder.Build();

app.UseOnesignAuthentication();
app.MapControllers();

app.Run();
```

Protected controller:

```csharp
[Authorize]
[ApiController]
[Route("api/me")]
public class MeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new
        {
            UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            TenantId = User.FindFirst(OnesignClaimTypes.TenantId)?.Value,
            Email = User.FindFirst(ClaimTypes.Email)?.Value,
        });
}
```

## Normalized claims

| Token claim | ASP.NET claim |
|-------------|----------------|
| `sub` | `ClaimTypes.NameIdentifier`, `onesign:sub` |
| `email` | `ClaimTypes.Email` |
| `tenant_id` | `onesign:tenant_id` |
| `client_id` | `onesign:client_id` |
| `role` / `roles` | `ClaimTypes.Role` |
| `permission` | `onesign:permission` |

## Pack for NuGet

```bash
dotnet pack src/Onesign.Sdk.AspNetCore/Onesign.Sdk.AspNetCore.csproj -c Release -o ./nupkgs
```

## Sample

See `samples/Onesign.Sdk.AspNetCore.Sample`.
