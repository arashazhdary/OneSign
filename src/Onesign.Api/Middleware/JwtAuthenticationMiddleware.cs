using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Onesign.Shared.Security;

namespace Onesign.Api.Middleware;

public class JwtAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IJwtSigningKeyProvider _signingKeyProvider;

    public JwtAuthenticationMiddleware(RequestDelegate next, IJwtSigningKeyProvider signingKeyProvider)
    {
        _next = next;
        _signingKeyProvider = signingKeyProvider;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip authentication for public endpoints
        if (IsPublicEndpoint(context.Request.Path))
        {
            await _next(context);
            return;
        }

        var token = ExtractTokenFromHeader(context.Request);
        
        if (string.IsNullOrEmpty(token))
        {
            await _next(context);
            return;
        }

        var principal = ValidateToken(token);
        if (principal != null)
        {
            context.User = principal;
        }

        await _next(context);
    }

    private static bool IsPublicEndpoint(PathString path)
    {
        var publicPaths = new[]
        {
            "/.well-known/openid-configuration",
            "/connect/authorize",
            "/connect/token",
            "/api/auth/login",
            "/api/auth/google-login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/swagger",
            "/swagger/index.html"
        };

        return publicPaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }

    private static string? ExtractTokenFromHeader(HttpRequest request)
    {
        var authHeader = request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return authHeader.Substring("Bearer ".Length).Trim();
    }

    private ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var parts = token.Split('.');
            if (parts.Length != 3)
            {
                return null;
            }

            // Decode header
            var header = DecodeBase64Url(parts[0]);
            var headerJson = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(header);
            if (headerJson == null || !headerJson.ContainsKey("alg") || headerJson["alg"].GetString() != "HS256")
            {
                return null;
            }

            // Decode payload
            var payload = DecodeBase64Url(parts[1]);
            var payloadJson = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(payload);
            if (payloadJson == null)
            {
                return null;
            }

            // Validate signature
            var signingKey = _signingKeyProvider.GetSigningKey();
            var signature = ComputeHMACSHA256($"{parts[0]}.{parts[1]}", signingKey);
            if (signature != parts[2])
            {
                return null;
            }

            // Check expiration
            if (payloadJson.ContainsKey("exp"))
            {
                var exp = payloadJson["exp"].GetInt64();
                var expirationTime = DateTimeOffset.FromUnixTimeSeconds(exp);
                if (expirationTime < DateTimeOffset.UtcNow)
                {
                    return null;
                }
            }

            // Create claims
            var claims = new List<Claim>();
            
            if (payloadJson.ContainsKey("sub"))
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, payloadJson["sub"].GetString() ?? string.Empty));
                claims.Add(new Claim("sub", payloadJson["sub"].GetString() ?? string.Empty));
            }

            if (payloadJson.ContainsKey("tenant_id"))
            {
                claims.Add(new Claim("tenant_id", payloadJson["tenant_id"].GetString() ?? string.Empty));
            }

            if (payloadJson.ContainsKey("client_id"))
            {
                claims.Add(new Claim("client_id", payloadJson["client_id"].GetString() ?? string.Empty));
            }

            if (payloadJson.ContainsKey("email"))
            {
                claims.Add(new Claim(ClaimTypes.Email, payloadJson["email"].GetString() ?? string.Empty));
            }

            var identity = new ClaimsIdentity(claims, "JWT");
            return new ClaimsPrincipal(identity);
        }
        catch
        {
            return null;
        }
    }

    private static string DecodeBase64Url(string input)
    {
        var padding = input.Length % 4;
        if (padding != 0)
        {
            input += new string('=', 4 - padding);
        }

        input = input.Replace('-', '+').Replace('_', '/');
        var bytes = Convert.FromBase64String(input);
        return Encoding.UTF8.GetString(bytes);
    }

    private static string ComputeHMACSHA256(string input, string key)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Base64UrlEncode(hash);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}

