using MediatR;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Modules.AccountCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccountCenter.Application.Queries;

public class GetUserActivitiesQueryHandler : IRequestHandler<GetUserActivitiesQuery, Result<List<UserActivityDto>>>
{
    private readonly IUserActivityRepository _activityRepository;

    public GetUserActivitiesQueryHandler(IUserActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<Result<List<UserActivityDto>>> Handle(GetUserActivitiesQuery request, CancellationToken cancellationToken)
    {
        var activities = await _activityRepository.GetByUserIdAsync(
            request.UserId, request.From, request.To, request.Skip, request.Take, cancellationToken);

        var dtos = activities.Select(a => new UserActivityDto
        {
            Id = a.Id,
            ActivityType = a.ActivityType.ToString(),
            Description = a.Description,
            IpAddress = a.IpAddress,
            OccurredAt = a.OccurredAt
        }).ToList();

        return Result.Success(dtos);
    }
}
