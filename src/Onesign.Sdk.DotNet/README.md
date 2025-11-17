# Onesign .NET SDK

A minimal but clean SDK for integrating Onesign SSO into .NET applications.

## Installation

Add a project reference to `Onesign.Sdk.DotNet`:

```xml
<ProjectReference Include="..\Onesign.Sdk.DotNet\Onesign.Sdk.DotNet.csproj" />
```

## Configuration

Create an `OnesignOptions` instance:

```csharp
var options = new OnesignOptions
{
    BaseUrl = "https://your-onesign-instance.com",
    ClientId = "your-client-id",
    RedirectUri = "https://your-app.com/callback",
    TenantId = "optional-tenant-id" // Optional
};
```

## Usage

### Initialize the Client

```csharp
var client = new OnesignClient(options);
```

### Build Authorization URL

```csharp
var (authorizeUrl, codeVerifier) = client.BuildAuthorizeUrl(state: "optional-state");

// Store codeVerifier securely (e.g., in session or encrypted cookie)
// Redirect user to authorizeUrl
Response.Redirect(authorizeUrl);
```

### Exchange Authorization Code for Tokens

```csharp
// After user returns from authorization, get the code from query string
var code = Request.Query["code"];

// Retrieve the stored codeVerifier
var codeVerifier = GetStoredCodeVerifier(); // Your implementation

// Exchange code for tokens
var tokenResponse = await client.ExchangeCodeForTokenAsync(code, codeVerifier);

if (tokenResponse != null)
{
    var accessToken = tokenResponse.AccessToken;
    var idToken = tokenResponse.IdToken;
    // Use tokens as needed
}
```

## Complete Example

```csharp
using Onesign.Sdk.DotNet;

public class AuthController : Controller
{
    private readonly OnesignClient _onesignClient;

    public AuthController(IConfiguration configuration)
    {
        var options = new OnesignOptions
        {
            BaseUrl = configuration["Onesign:BaseUrl"],
            ClientId = configuration["Onesign:ClientId"],
            RedirectUri = configuration["Onesign:RedirectUri"],
            TenantId = configuration["Onesign:TenantId"]
        };
        _onesignClient = new OnesignClient(options);
    }

    [HttpGet("login")]
    public IActionResult Login()
    {
        var (authorizeUrl, codeVerifier) = _onesignClient.BuildAuthorizeUrl();
        
        // Store codeVerifier in session
        HttpContext.Session.SetString("code_verifier", codeVerifier);
        
        return Redirect(authorizeUrl);
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(string code, string state)
    {
        var codeVerifier = HttpContext.Session.GetString("code_verifier");
        if (string.IsNullOrEmpty(codeVerifier))
        {
            return BadRequest("Code verifier not found");
        }

        var tokenResponse = await _onesignClient.ExchangeCodeForTokenAsync(code, codeVerifier);
        
        if (tokenResponse == null)
        {
            return BadRequest("Failed to exchange code for token");
        }

        // Store tokens securely
        HttpContext.Session.SetString("access_token", tokenResponse.AccessToken);
        HttpContext.Session.SetString("id_token", tokenResponse.IdToken);

        return RedirectToAction("Index", "Home");
    }
}
```

## Token Response

The `TokenResponse` class contains:

- `AccessToken`: The OAuth 2.0 access token
- `IdToken`: The OpenID Connect ID token (JWT)
- `TokenType`: Usually "Bearer"
- `ExpiresIn`: Token expiration time in seconds

## Error Handling

The SDK methods return `null` on failure. Always check for null before using the response:

```csharp
var tokenResponse = await client.ExchangeCodeForTokenAsync(code, codeVerifier);
if (tokenResponse == null)
{
    // Handle error - token exchange failed
    return BadRequest("Authentication failed");
}
```

## Security Notes

1. **Code Verifier Storage**: Store the `codeVerifier` securely (session, encrypted cookie, or server-side storage). Never expose it to the client.

2. **Token Storage**: Store access tokens and ID tokens securely. Consider using secure cookies or server-side storage.

3. **HTTPS**: Always use HTTPS in production to protect tokens and authorization codes.

4. **State Parameter**: Use the `state` parameter to prevent CSRF attacks. Validate it on callback.

## Multi-Tenant Support

If your application supports multiple tenants, you can specify the `TenantId` in `OnesignOptions`. The SDK will automatically include it in the authorization request.

## License

MIT

