namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

public class InsightEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public int Type { get; set; }
    public int Severity { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid? ScopeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MessageKey { get; set; } = string.Empty;
    public string DataJson { get; set; } = "{}";
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedBy { get; set; }
}
