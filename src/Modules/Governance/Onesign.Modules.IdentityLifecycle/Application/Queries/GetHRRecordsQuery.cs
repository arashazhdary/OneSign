using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Queries;

public class GetHRRecordsQuery : IRequest<Result<List<HRIdentityRecordDto>>>
{
    public Guid TenantId { get; set; }
}
