using MediatR;
using Onesign.Modules.Governance.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Governance.Application.Commands;

public class CreateAccessReviewCampaignCommand : IRequest<Result<CampaignDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string> TargetRoles { get; set; } = new();
    public Guid CreatedBy { get; set; }
}
