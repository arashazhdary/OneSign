namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

public class AccessRequestEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid RequesterId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public int Status { get; set; }
    public string Justification { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }
    public string? ReviewComment { get; set; }

    public ICollection<AccessRequestItemEntity> Items { get; set; } = new List<AccessRequestItemEntity>();
    public ICollection<ApprovalStepEntity> ApprovalSteps { get; set; } = new List<ApprovalStepEntity>();
}
