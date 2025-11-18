using MediatR;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Modules.AccountCenter.Domain.Entities;
using Onesign.Modules.AccountCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccountCenter.Application.Commands;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, Result<UserProfileDto>>
{
    private readonly IUserProfileRepository _profileRepository;

    public UpdateUserProfileCommandHandler(IUserProfileRepository profileRepository)
    {
        _profileRepository = profileRepository;
    }

    public async Task<Result<UserProfileDto>> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await _profileRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        if (profile == null)
        {
            profile = new UserProfile
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                TenantId = Guid.Empty, // Should be set from context
                CreatedAt = DateTime.UtcNow
            };
        }

        profile.DisplayName = request.DisplayName;
        profile.PhoneNumber = request.PhoneNumber;
        profile.TimeZone = request.TimeZone;
        profile.PreferredLanguage = request.PreferredLanguage;
        profile.UpdatedAt = DateTime.UtcNow;

        if (profile.CreatedAt == default)
            await _profileRepository.AddAsync(profile, cancellationToken);
        else
            await _profileRepository.UpdateAsync(profile, cancellationToken);

        return Result.Success(new UserProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            DisplayName = profile.DisplayName,
            PhoneNumber = profile.PhoneNumber,
            TimeZone = profile.TimeZone,
            PreferredLanguage = profile.PreferredLanguage
        });
    }
}
