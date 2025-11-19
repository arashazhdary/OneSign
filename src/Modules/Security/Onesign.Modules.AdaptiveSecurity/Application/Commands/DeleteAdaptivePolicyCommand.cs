using MediatR;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class DeleteAdaptivePolicyCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid PolicyId { get; set; }
}

public class DeleteAdaptivePolicyCommandHandler : IRequestHandler<DeleteAdaptivePolicyCommand, Result<bool>>
{
    private readonly IAdaptivePolicyRepository _repository;

    public DeleteAdaptivePolicyCommandHandler(IAdaptivePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteAdaptivePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = await _repository.GetByIdAsync(request.PolicyId, cancellationToken);

        if (policy == null)
            return Result.Failure<bool>("PolicyNotFound", "Adaptive policy not found");

        if (policy.TenantId != request.TenantId)
            return Result.Failure<bool>("Unauthorized", "Policy does not belong to this tenant");

        await _repository.DeleteAsync(request.PolicyId, cancellationToken);

        return Result.Success(true);
    }
}
