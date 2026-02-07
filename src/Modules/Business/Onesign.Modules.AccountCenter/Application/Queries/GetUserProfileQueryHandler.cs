using MediatR;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Modules.AccountCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccountCenter.Application.Queries;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    private readonly IUserProfileRepository _userProfileRepository;

    public GetUserProfileQueryHandler(IUserProfileRepository userProfileRepository)
    {
        _userProfileRepository = userProfileRepository;
    }

    public async Task<Result<UserProfileDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await _userProfileRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        if (profile == null)
        {
            return Result.Failure<UserProfileDto>("PROFILE_NOT_FOUND", "User profile not found");
        }

        var dto = new UserProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            DisplayName = profile.DisplayName,
            PhoneNumber = profile.PhoneNumber,
            ProfilePictureUrl = profile.ProfilePictureUrl,
            TimeZone = profile.TimeZone,
            PreferredLanguage = profile.PreferredLanguage,
            CustomAttributes = profile.CustomAttributes
        };

        return Result.Success(dto);
    }
}
