using Onesign.Modules.Governance.Domain.Enums;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Entities;

public class SodViolationEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid RuleId { get; set; }
    public Guid UserId { get; set; }
    public ViolationSeverity Severity { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public bool Resolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }
}
