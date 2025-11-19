using Onesign.Modules.IdentityInsights.Domain.Enums;

namespace Onesign.Modules.IdentityInsights.Domain.Entities;

public class Insight
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public InsightType Type { get; set; }
    public InsightSeverity Severity { get; set; }
    public string ScopeType { get; set; } = string.Empty; // User, Tenant, App
    public Guid? ScopeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MessageKey { get; set; } = string.Empty;
    public string DataJson { get; set; } = "{}";
    public InsightStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedBy { get; set; }
}
