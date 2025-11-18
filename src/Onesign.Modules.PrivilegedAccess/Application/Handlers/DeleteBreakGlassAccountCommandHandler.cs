using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class DeleteBreakGlassAccountCommandHandler : IRequestHandler<DeleteBreakGlassAccountCommand, Result>
{
    private readonly IBreakGlassAccountRepository _repository;

    public DeleteBreakGlassAccountCommandHandler(IBreakGlassAccountRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeleteBreakGlassAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _repository.GetByIdAsync(request.AccountId, cancellationToken);
        if (account == null)
            return Result.Failure("NotFound", "Break glass account not found");

        await _repository.DeleteAsync(request.AccountId, cancellationToken);
        return Result.Success();
    }
}
