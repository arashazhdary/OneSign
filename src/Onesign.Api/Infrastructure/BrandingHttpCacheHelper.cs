using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Onesign.Modules.Tenants.Application.DTOs;

namespace Onesign.Api.Infrastructure;

/// <summary>
/// HTTP caching helpers for tenant branding responses (ETag / Last-Modified).
/// </summary>
public static class BrandingHttpCacheHelper
{
    public const string CacheControlValue = "public, max-age=3600, stale-while-revalidate=86400";

    public static readonly DateTimeOffset DefaultBrandingLastModified =
        new(2024, 1, 1, 0, 0, 0, TimeSpan.Zero);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
    };

    public static string ComputeETag(TenantBrandingDto branding, Guid tenantId)
    {
        var payload = JsonSerializer.Serialize(branding, JsonOptions);
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes($"{tenantId:N}:{payload}"));
        var hash = Convert.ToHexString(bytes)[..16].ToLowerInvariant();
        return $"\"{hash}\"";
    }

    public static DateTimeOffset ResolveLastModified(TenantBrandingDto branding) =>
        branding.UpdatedAt ?? DefaultBrandingLastModified;

    public static bool MatchesIfNoneMatch(string? ifNoneMatch, string etag)
    {
        if (string.IsNullOrWhiteSpace(ifNoneMatch))
        {
            return false;
        }

        if (ifNoneMatch.Trim() == "*")
        {
            return true;
        }

        foreach (var part in ifNoneMatch.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
        {
            var token = part;
            if (token.StartsWith("W/", StringComparison.OrdinalIgnoreCase))
            {
                token = token[2..].Trim();
            }

            if (string.Equals(token, etag, StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }

    public static bool IsNotModifiedSince(DateTimeOffset lastModified, DateTimeOffset? ifModifiedSince)
    {
        if (!ifModifiedSince.HasValue)
        {
            return false;
        }

        var modified = lastModified.AddTicks(-(lastModified.Ticks % TimeSpan.TicksPerSecond));
        var since = ifModifiedSince.Value.AddTicks(-(ifModifiedSince.Value.Ticks % TimeSpan.TicksPerSecond));
        return modified <= since;
    }
}
