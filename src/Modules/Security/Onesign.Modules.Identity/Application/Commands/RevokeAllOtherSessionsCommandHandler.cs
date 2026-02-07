using MediatR;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class RevokeAllOtherSessionsCommandHandler : IRequestHandler<RevokeAllOtherSessionsCommand, Result>
{
    private readonly IUserLoginSessionRepository _sessionRepository;

    public RevokeAllOtherSessionsCommandHandler(IUserLoginSessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<Result> Handle(RevokeAllOtherSessionsCommand request, CancellationToken cancellationToken)
    {
        // Get current session to exclude it
        var currentSession = await _sessionRepository.GetByTokenAsync(request.CurrentSessionToken, cancellationToken);

        if (currentSession == null)
        {
            return Result.Failure("INVALID_SESSION", "Current session not found");
        }

        await _sessionRepository.DeleteByTenantUserIdAsync(
            request.TenantUserId,
            currentSession.Id,
            cancellationToken);

        return Result.Success();
    }
}
