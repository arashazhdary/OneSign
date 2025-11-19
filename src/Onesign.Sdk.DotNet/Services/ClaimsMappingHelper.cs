using System.Security.Claims;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Sdk.DotNet.Services;

public static class ClaimsMappingHelper
{
    public static class ClaimTypes
    {
        public const string Subject = "sub";
        public const string Email = "email";
        public const string EmailVerified = "email_verified";
        public const string Name = "name";
        public const string GivenName = "given_name";
        public const string FamilyName = "family_name";
        public const string PreferredUsername = "preferred_username";
        public const string PhoneNumber = "phone_number";
        public const string PhoneNumberVerified = "phone_number_verified";
        public const string Address = "address";
        public const string Picture = "picture";
        public const string Locale = "locale";
        public const string ZoneInfo = "zoneinfo";
        public const string UpdatedAt = "updated_at";
        public const string TenantId = "tenant_id";
        public const string TenantName = "tenant_name";
        public const string Role = "role";
        public const string Permission = "permission";
        public const string Scope = "scope";
        public const string Groups = "groups";
        public const string OrganizationUnit = "org_unit";
        public const string Department = "department";
        public const string Title = "title";
        public const string EmployeeId = "employee_id";
        public const string Manager = "manager";
        public const string CostCenter = "cost_center";
    }

    public static UserProfile MapToUserProfile(IEnumerable<Claim> claims)
    {
        var claimsList = claims.ToList();

        return new UserProfile
        {
            Id = GetClaimValue(claimsList, ClaimTypes.Subject),
            Email = GetClaimValue(claimsList, ClaimTypes.Email),
            EmailVerified = GetClaimValueBool(claimsList, ClaimTypes.EmailVerified),
            Name = GetClaimValue(claimsList, ClaimTypes.Name),
            GivenName = GetClaimValue(claimsList, ClaimTypes.GivenName),
            FamilyName = GetClaimValue(claimsList, ClaimTypes.FamilyName),
            PreferredUsername = GetClaimValue(claimsList, ClaimTypes.PreferredUsername),
            PhoneNumber = GetClaimValue(claimsList, ClaimTypes.PhoneNumber),
            PhoneNumberVerified = GetClaimValueBool(claimsList, ClaimTypes.PhoneNumberVerified),
            Picture = GetClaimValue(claimsList, ClaimTypes.Picture),
            Locale = GetClaimValue(claimsList, ClaimTypes.Locale),
            TenantId = GetClaimValue(claimsList, ClaimTypes.TenantId),
            TenantName = GetClaimValue(claimsList, ClaimTypes.TenantName),
            Roles = GetClaimValues(claimsList, ClaimTypes.Role),
            Permissions = GetClaimValues(claimsList, ClaimTypes.Permission),
            Groups = GetClaimValues(claimsList, ClaimTypes.Groups),
            OrganizationUnit = GetClaimValue(claimsList, ClaimTypes.OrganizationUnit),
            Department = GetClaimValue(claimsList, ClaimTypes.Department),
            Title = GetClaimValue(claimsList, ClaimTypes.Title),
            EmployeeId = GetClaimValue(claimsList, ClaimTypes.EmployeeId),
            Manager = GetClaimValue(claimsList, ClaimTypes.Manager),
            CustomClaims = GetCustomClaims(claimsList)
        };
    }

    public static UserProfile MapToUserProfile(Dictionary<string, string> claims)
    {
        return new UserProfile
        {
            Id = GetDictValue(claims, ClaimTypes.Subject),
            Email = GetDictValue(claims, ClaimTypes.Email),
            EmailVerified = GetDictValueBool(claims, ClaimTypes.EmailVerified),
            Name = GetDictValue(claims, ClaimTypes.Name),
            GivenName = GetDictValue(claims, ClaimTypes.GivenName),
            FamilyName = GetDictValue(claims, ClaimTypes.FamilyName),
            PreferredUsername = GetDictValue(claims, ClaimTypes.PreferredUsername),
            PhoneNumber = GetDictValue(claims, ClaimTypes.PhoneNumber),
            PhoneNumberVerified = GetDictValueBool(claims, ClaimTypes.PhoneNumberVerified),
            Picture = GetDictValue(claims, ClaimTypes.Picture),
            Locale = GetDictValue(claims, ClaimTypes.Locale),
            TenantId = GetDictValue(claims, ClaimTypes.TenantId),
            TenantName = GetDictValue(claims, ClaimTypes.TenantName),
            Roles = GetDictValues(claims, ClaimTypes.Role),
            Permissions = GetDictValues(claims, ClaimTypes.Permission),
            Groups = GetDictValues(claims, ClaimTypes.Groups),
            OrganizationUnit = GetDictValue(claims, ClaimTypes.OrganizationUnit),
            Department = GetDictValue(claims, ClaimTypes.Department),
            Title = GetDictValue(claims, ClaimTypes.Title),
            EmployeeId = GetDictValue(claims, ClaimTypes.EmployeeId),
            Manager = GetDictValue(claims, ClaimTypes.Manager),
            CustomClaims = GetCustomClaimsFromDict(claims)
        };
    }

    public static bool HasPermission(IEnumerable<Claim> claims, string permission)
    {
        return claims.Any(c => c.Type == ClaimTypes.Permission &&
            c.Value.Equals(permission, StringComparison.OrdinalIgnoreCase));
    }

    public static bool HasAnyPermission(IEnumerable<Claim> claims, params string[] permissions)
    {
        var userPermissions = claims
            .Where(c => c.Type == ClaimTypes.Permission)
            .Select(c => c.Value.ToLowerInvariant())
            .ToHashSet();

        return permissions.Any(p => userPermissions.Contains(p.ToLowerInvariant()));
    }

    public static bool HasAllPermissions(IEnumerable<Claim> claims, params string[] permissions)
    {
        var userPermissions = claims
            .Where(c => c.Type == ClaimTypes.Permission)
            .Select(c => c.Value.ToLowerInvariant())
            .ToHashSet();

        return permissions.All(p => userPermissions.Contains(p.ToLowerInvariant()));
    }

    public static bool HasRole(IEnumerable<Claim> claims, string role)
    {
        return claims.Any(c => c.Type == ClaimTypes.Role &&
            c.Value.Equals(role, StringComparison.OrdinalIgnoreCase));
    }

    public static bool HasAnyRole(IEnumerable<Claim> claims, params string[] roles)
    {
        var userRoles = claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value.ToLowerInvariant())
            .ToHashSet();

        return roles.Any(r => userRoles.Contains(r.ToLowerInvariant()));
    }

    public static bool HasAllRoles(IEnumerable<Claim> claims, params string[] roles)
    {
        var userRoles = claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value.ToLowerInvariant())
            .ToHashSet();

        return roles.All(r => userRoles.Contains(r.ToLowerInvariant()));
    }

    public static bool BelongsToTenant(IEnumerable<Claim> claims, string tenantId)
    {
        return claims.Any(c => c.Type == ClaimTypes.TenantId &&
            c.Value.Equals(tenantId, StringComparison.OrdinalIgnoreCase));
    }

    public static bool IsInGroup(IEnumerable<Claim> claims, string group)
    {
        return claims.Any(c => c.Type == ClaimTypes.Groups &&
            c.Value.Equals(group, StringComparison.OrdinalIgnoreCase));
    }

    public static string? GetTenantId(IEnumerable<Claim> claims)
    {
        return claims.FirstOrDefault(c => c.Type == ClaimTypes.TenantId)?.Value;
    }

    public static string? GetUserId(IEnumerable<Claim> claims)
    {
        return claims.FirstOrDefault(c => c.Type == ClaimTypes.Subject)?.Value;
    }

    public static IEnumerable<string> GetRoles(IEnumerable<Claim> claims)
    {
        return claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value);
    }

    public static IEnumerable<string> GetPermissions(IEnumerable<Claim> claims)
    {
        return claims.Where(c => c.Type == ClaimTypes.Permission).Select(c => c.Value);
    }

    public static IEnumerable<string> GetScopes(IEnumerable<Claim> claims)
    {
        var scopeClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.Scope)?.Value;
        if (string.IsNullOrEmpty(scopeClaim))
        {
            return Enumerable.Empty<string>();
        }

        return scopeClaim.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    }

    private static string? GetClaimValue(IEnumerable<Claim> claims, string type)
    {
        return claims.FirstOrDefault(c => c.Type == type)?.Value;
    }

    private static bool GetClaimValueBool(IEnumerable<Claim> claims, string type)
    {
        var value = claims.FirstOrDefault(c => c.Type == type)?.Value;
        return bool.TryParse(value, out var result) && result;
    }

    private static List<string> GetClaimValues(IEnumerable<Claim> claims, string type)
    {
        return claims.Where(c => c.Type == type).Select(c => c.Value).ToList();
    }

    private static Dictionary<string, string> GetCustomClaims(IEnumerable<Claim> claims)
    {
        var standardClaims = new HashSet<string>
        {
            ClaimTypes.Subject, ClaimTypes.Email, ClaimTypes.EmailVerified,
            ClaimTypes.Name, ClaimTypes.GivenName, ClaimTypes.FamilyName,
            ClaimTypes.PreferredUsername, ClaimTypes.PhoneNumber, ClaimTypes.PhoneNumberVerified,
            ClaimTypes.Picture, ClaimTypes.Locale, ClaimTypes.TenantId, ClaimTypes.TenantName,
            ClaimTypes.Role, ClaimTypes.Permission, ClaimTypes.Groups,
            ClaimTypes.OrganizationUnit, ClaimTypes.Department, ClaimTypes.Title,
            ClaimTypes.EmployeeId, ClaimTypes.Manager, ClaimTypes.Scope,
            "iss", "aud", "exp", "iat", "nbf", "jti", "auth_time", "nonce", "acr", "amr", "azp"
        };

        return claims
            .Where(c => !standardClaims.Contains(c.Type))
            .GroupBy(c => c.Type)
            .ToDictionary(g => g.Key, g => g.First().Value);
    }

    private static string? GetDictValue(Dictionary<string, string> claims, string type)
    {
        return claims.TryGetValue(type, out var value) ? value : null;
    }

    private static bool GetDictValueBool(Dictionary<string, string> claims, string type)
    {
        return claims.TryGetValue(type, out var value) && bool.TryParse(value, out var result) && result;
    }

    private static List<string> GetDictValues(Dictionary<string, string> claims, string type)
    {
        if (claims.TryGetValue(type, out var value))
        {
            if (value.StartsWith('['))
            {
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<List<string>>(value) ?? new List<string>();
                }
                catch
                {
                    return new List<string> { value };
                }
            }
            return new List<string> { value };
        }
        return new List<string>();
    }

    private static Dictionary<string, string> GetCustomClaimsFromDict(Dictionary<string, string> claims)
    {
        var standardClaims = new HashSet<string>
        {
            ClaimTypes.Subject, ClaimTypes.Email, ClaimTypes.EmailVerified,
            ClaimTypes.Name, ClaimTypes.GivenName, ClaimTypes.FamilyName,
            ClaimTypes.PreferredUsername, ClaimTypes.PhoneNumber, ClaimTypes.PhoneNumberVerified,
            ClaimTypes.Picture, ClaimTypes.Locale, ClaimTypes.TenantId, ClaimTypes.TenantName,
            ClaimTypes.Role, ClaimTypes.Permission, ClaimTypes.Groups,
            ClaimTypes.OrganizationUnit, ClaimTypes.Department, ClaimTypes.Title,
            ClaimTypes.EmployeeId, ClaimTypes.Manager, ClaimTypes.Scope,
            "iss", "aud", "exp", "iat", "nbf", "jti", "auth_time", "nonce", "acr", "amr", "azp"
        };

        return claims
            .Where(c => !standardClaims.Contains(c.Key))
            .ToDictionary(c => c.Key, c => c.Value);
    }
}
