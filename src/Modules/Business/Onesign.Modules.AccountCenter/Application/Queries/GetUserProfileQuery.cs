using MediatR;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccountCenter.Application.Queries;

public class GetUserProfileQuery : IRequest<Result<UserProfileDto>>
{
    public Guid UserId { get; set; }
}
