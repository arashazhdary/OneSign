using MediatR;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class DeleteTokenRuleCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid RuleId { get; set; }
}

public class DeleteTokenRuleCommandHandler : IRequestHandler<DeleteTokenRuleCommand, Result<bool>>
{
    private readonly ITokenTransformationRuleRepository _repository;

    public DeleteTokenRuleCommandHandler(ITokenTransformationRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteTokenRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = await _repository.GetByIdAsync(request.RuleId, cancellationToken);

        if (rule == null)
            return Result.Failure<bool>("RuleNotFound", "Token transformation rule not found");

        if (rule.TenantId != request.TenantId)
            return Result.Failure<bool>("Unauthorized", "Rule does not belong to this tenant");

        await _repository.DeleteAsync(request.RuleId, cancellationToken);

        return Result.Success(true);
    }
}
