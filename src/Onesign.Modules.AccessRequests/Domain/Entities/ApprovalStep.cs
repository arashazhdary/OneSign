using Onesign.Modules.AccessRequests.Domain.Enums;

namespace Onesign.Modules.AccessRequests.Domain.Entities;

public class ApprovalStep
{
    public Guid Id { get; set; }
    public Guid AccessRequestId { get; set; }
    public int StepNumber { get; set; }
    public Guid ApproverId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public ApprovalAction? Action { get; set; }
    public string? Comment { get; set; }
    public DateTime? ActionAt { get; set; }
    public bool IsRequired { get; set; }

    public AccessRequest? AccessRequest { get; set; }
}
