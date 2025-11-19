using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class DeleteLifecyclePolicyCommandHandler : IRequestHandler<DeleteLifecyclePolicyCommand, Result>
{
    private readonly ILifecyclePolicyRepository _repository;

    public DeleteLifecyclePolicyCommandHandler(ILifecyclePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeleteLifecyclePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = await _repository.GetByIdAsync(request.PolicyId, cancellationToken);
        if (policy == null || policy.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Lifecycle policy not found");

        await _repository.DeleteAsync(request.PolicyId, cancellationToken);
        return Result.Success();
    }
}
