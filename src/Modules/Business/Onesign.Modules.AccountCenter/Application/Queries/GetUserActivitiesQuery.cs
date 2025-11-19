using MediatR;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccountCenter.Application.Queries;

public class GetUserActivitiesQuery : IRequest<Result<List<UserActivityDto>>>
{
    public Guid UserId { get; set; }
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public int Skip { get; set; }
    public int Take { get; set; } = 50;
}
