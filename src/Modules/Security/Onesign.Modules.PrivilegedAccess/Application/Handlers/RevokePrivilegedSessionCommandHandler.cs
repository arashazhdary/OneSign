using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class RevokePrivilegedSessionCommandHandler : IRequestHandler<RevokePrivilegedSessionCommand, Result<bool>>
{
    private readonly IPrivilegedSessionRepository _sessionRepository;

    public RevokePrivilegedSessionCommandHandler(IPrivilegedSessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<Result<bool>> Handle(RevokePrivilegedSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId, cancellationToken);
        if (session == null)
            return Result.Failure<bool>("SessionNotFound", "Privileged session not found");

        if (!session.IsActive)
            return Result.Failure<bool>("SessionAlreadyEnded", "Session is already ended");

        session.IsActive = false;
        session.EndedAt = DateTime.UtcNow;

        await _sessionRepository.UpdateAsync(session, cancellationToken);

        return Result.Success(true);
    }
}
