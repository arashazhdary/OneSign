using MediatR;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class DeleteLoginHookCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid HookId { get; set; }
}

public class DeleteLoginHookCommandHandler : IRequestHandler<DeleteLoginHookCommand, Result<bool>>
{
    private readonly ILoginHookRepository _repository;

    public DeleteLoginHookCommandHandler(ILoginHookRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteLoginHookCommand request, CancellationToken cancellationToken)
    {
        var hook = await _repository.GetByIdAsync(request.HookId, cancellationToken);

        if (hook == null)
            return Result.Failure<bool>("HookNotFound", "Login hook not found");

        if (hook.TenantId != request.TenantId)
            return Result.Failure<bool>("Unauthorized", "Hook does not belong to this tenant");

        await _repository.DeleteAsync(request.HookId, cancellationToken);

        return Result.Success(true);
    }
}
