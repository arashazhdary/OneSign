using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class DeleteAccessPackageCommandHandler : IRequestHandler<DeleteAccessPackageCommand, Result>
{
    private readonly IAccessPackageRepository _repository;

    public DeleteAccessPackageCommandHandler(IAccessPackageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeleteAccessPackageCommand request, CancellationToken cancellationToken)
    {
        var package = await _repository.GetByIdAsync(request.PackageId, cancellationToken);
        if (package == null || package.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Access package not found");

        await _repository.DeleteAsync(request.PackageId, cancellationToken);
        return Result.Success();
    }
}
