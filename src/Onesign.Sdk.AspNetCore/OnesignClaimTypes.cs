namespace Onesign.Sdk.AspNetCore;

/// <summary>
/// Normalized claim types for OneSign access tokens.
/// </summary>
public static class OnesignClaimTypes
{
    public const string TenantId = "onesign:tenant_id";
    public const string ClientId = "onesign:client_id";
    public const string Subject = "onesign:sub";
    public const string Permission = "onesign:permission";
    public const string OrgUnitId = "onesign:org_unit_id";
}
