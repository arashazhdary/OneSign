namespace Onesign.Modules.Deployment.Domain.Entities;

public class LicenseKey
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public LicenseType Type { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int MaxUsers { get; set; }
    public int MaxApplications { get; set; }
    public bool IsActive { get; set; }
    public List<string> EnabledFeatures { get; set; } = new();
    public List<string> EnabledModules { get; set; } = new();
    public string? Signature { get; set; }
    public Dictionary<string, string>? Metadata { get; set; }
    public DateTime? LastValidatedAt { get; set; }
}

public enum LicenseType
{
    Trial,
    Starter,
    Professional,
    Enterprise,
    Unlimited
}
