namespace Onesign.Sdk.DotNet;

public class OnesignOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
    public string? TenantId { get; set; }
}

