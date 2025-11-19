using Onesign.Modules.AccessRequests.Domain.Enums;

namespace Onesign.Modules.AccessRequests.Domain.Entities;

public class AccessRequest
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid RequesterId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public RequestStatus Status { get; set; }
    public string Justification { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }
    public string? ReviewComment { get; set; }

    public ICollection<AccessRequestItem> Items { get; set; } = new List<AccessRequestItem>();
    public ICollection<ApprovalStep> ApprovalSteps { get; set; } = new List<ApprovalStep>();
}
