namespace Onesign.Modules.IdentityInsights.Application.DTOs;

public class InsightDetailDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string ScopeType { get; set; } = string.Empty;
    public Guid? ScopeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MessageKey { get; set; } = string.Empty;
    public string DataJson { get; set; } = "{}";
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedBy { get; set; }
}
