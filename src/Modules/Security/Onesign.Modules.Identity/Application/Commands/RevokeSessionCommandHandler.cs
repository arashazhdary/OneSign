using MediatR;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class RevokeSessionCommandHandler : IRequestHandler<RevokeSessionCommand, Result>
{
    private readonly IUserLoginSessionRepository _sessionRepository;

    public RevokeSessionCommandHandler(IUserLoginSessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<Result> Handle(RevokeSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId, cancellationToken);

        if (session == null)
        {
            return Result.Failure("SESSION_NOT_FOUND", "Session not found");
        }

        if (session.TenantUserId != request.TenantUserId)
        {
            return Result.Failure("UNAUTHORIZED", "You can only revoke your own sessions");
        }

        await _sessionRepository.DeleteAsync(request.SessionId, cancellationToken);

        return Result.Success();
    }
}
