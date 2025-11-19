using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class RevokeJitGrantCommandHandler : IRequestHandler<RevokeJitGrantCommand, Result>
{
    private readonly IJitGrantRepository _repository;
    private readonly ILogger<RevokeJitGrantCommandHandler> _logger;

    public RevokeJitGrantCommandHandler(
        IJitGrantRepository repository,
        ILogger<RevokeJitGrantCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result> Handle(RevokeJitGrantCommand request, CancellationToken cancellationToken)
    {
        var grant = await _repository.GetByIdAsync(request.GrantId, cancellationToken);
        if (grant == null || grant.TenantId != request.TenantId)
            return Result.Failure("NotFound", "JIT grant not found");

        if (grant.Status != JitGrantStatus.Active && grant.Status != JitGrantStatus.Pending)
            return Result.Failure("InvalidState", "Grant cannot be revoked in current state");

        grant.Status = JitGrantStatus.Revoked;

        await _repository.UpdateAsync(grant, cancellationToken);

        _logger.LogInformation(
            "JIT grant {GrantId} revoked by {RevokedBy}. Reason: {Reason}",
            request.GrantId, request.RevokedBy, request.Reason ?? "No reason provided");

        return Result.Success();
    }
}
