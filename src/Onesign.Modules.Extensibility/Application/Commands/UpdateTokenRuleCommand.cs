using MediatR;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class UpdateTokenRuleCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid RuleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? TargetAppId { get; set; }
    public int Order { get; set; }
    public string RuleDefinitionJson { get; set; } = "{}";
    public bool IsEnabled { get; set; }
}

public class UpdateTokenRuleCommandHandler : IRequestHandler<UpdateTokenRuleCommand, Result<bool>>
{
    private readonly ITokenTransformationRuleRepository _repository;

    public UpdateTokenRuleCommandHandler(ITokenTransformationRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(UpdateTokenRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = await _repository.GetByIdAsync(request.RuleId, cancellationToken);

        if (rule == null)
            return Result.Failure<bool>("RuleNotFound", "Token transformation rule not found");

        if (rule.TenantId != request.TenantId)
            return Result.Failure<bool>("Unauthorized", "Rule does not belong to this tenant");

        rule.Name = request.Name;
        rule.TargetAppId = request.TargetAppId;
        rule.Order = request.Order;
        rule.RuleDefinitionJson = request.RuleDefinitionJson;
        rule.IsEnabled = request.IsEnabled;

        await _repository.UpdateAsync(rule, cancellationToken);

        return Result.Success(true);
    }
}
