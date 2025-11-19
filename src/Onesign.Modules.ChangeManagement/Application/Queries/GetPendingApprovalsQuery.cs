using MediatR;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Queries;

public class GetPendingApprovalsQuery : IRequest<Result<List<ChangeSetDto>>>
{
    public Guid UserId { get; set; }
}
