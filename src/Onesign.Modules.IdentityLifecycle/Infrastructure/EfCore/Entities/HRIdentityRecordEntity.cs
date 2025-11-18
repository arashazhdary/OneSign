namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

public class HRIdentityRecordEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string ExternalEmployeeId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string OrgUnitCode { get; set; } = string.Empty;
    public string JobRole { get; set; } = string.Empty;
    public string? ManagerEmployeeId { get; set; }
    public int Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime LastSyncedAt { get; set; }
}
