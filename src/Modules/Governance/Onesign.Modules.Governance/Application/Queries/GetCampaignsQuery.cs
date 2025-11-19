using MediatR;
using Onesign.Modules.Governance.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Governance.Application.Queries;

public class GetCampaignsQuery : IRequest<Result<List<CampaignDto>>>
{
    public Guid TenantId { get; set; }
}
