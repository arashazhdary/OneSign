using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class ExpireJitGrantCommandHandler : IRequestHandler<ExpireJitGrantCommand, Result>
{
    private readonly IJitGrantRepository _repository;

    public ExpireJitGrantCommandHandler(IJitGrantRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(ExpireJitGrantCommand request, CancellationToken cancellationToken)
    {
        var grant = await _repository.GetByIdAsync(request.GrantId, cancellationToken);
        if (grant == null || grant.TenantId != request.TenantId)
            return Result.Failure("NotFound", "JIT grant not found");

        if (grant.Status != JitGrantStatus.Active)
            return Result.Failure("InvalidState", "Only active grants can be expired");

        grant.Status = JitGrantStatus.Expired;

        await _repository.UpdateAsync(grant, cancellationToken);
        return Result.Success();
    }
}
