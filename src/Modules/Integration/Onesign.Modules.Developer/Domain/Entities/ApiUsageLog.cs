namespace Onesign.Modules.Developer.Domain.Entities;

public class ApiUsageLog
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ApiKeyId { get; set; }
    public Guid? ServiceAccountId { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public long ResponseTimeMs { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}
