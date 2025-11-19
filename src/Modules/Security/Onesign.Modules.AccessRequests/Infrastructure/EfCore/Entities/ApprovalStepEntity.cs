namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

public class ApprovalStepEntity
{
    public Guid Id { get; set; }
    public Guid AccessRequestId { get; set; }
    public int StepNumber { get; set; }
    public Guid ApproverId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public int? Action { get; set; }
    public string? Comment { get; set; }
    public DateTime? ActionAt { get; set; }
    public bool IsRequired { get; set; }

    public AccessRequestEntity? AccessRequest { get; set; }
}
