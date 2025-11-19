using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Queries;

public class GetAccessRequestDetailsQuery : IRequest<Result<AccessRequestDto>>
{
    public Guid TenantId { get; set; }
    public Guid RequestId { get; set; }
}
