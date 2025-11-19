using MediatR;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Commands;

public class DisableMfaMethodCommandHandler : IRequestHandler<DisableMfaMethodCommand, Unit>
{
    private readonly IUserMfaMethodRepository _repository;

    public DisableMfaMethodCommandHandler(IUserMfaMethodRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(DisableMfaMethodCommand request, CancellationToken cancellationToken)
    {
        var method = await _repository.GetByIdAsync(request.MethodId, cancellationToken);
        if (method == null || method.UserId != request.UserId)
            throw new InvalidOperationException("MFA method not found");

        await _repository.DeleteAsync(request.MethodId, cancellationToken);
        return Unit.Value;
    }
}
