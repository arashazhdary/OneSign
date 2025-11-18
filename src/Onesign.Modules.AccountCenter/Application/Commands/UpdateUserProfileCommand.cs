using MediatR;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccountCenter.Application.Commands;

public class UpdateUserProfileCommand : IRequest<Result<UserProfileDto>>
{
    public Guid UserId { get; set; }
    public string? DisplayName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredLanguage { get; set; }
}
