using MediatR;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class CreateTokenRuleCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? TargetAppId { get; set; }
    public int Order { get; set; }
    public string RuleDefinitionJson { get; set; } = "{}";
}

public class CreateTokenRuleCommandHandler : IRequestHandler<CreateTokenRuleCommand, Result<Guid>>
{
    private readonly ITokenTransformationRuleRepository _repository;

    public CreateTokenRuleCommandHandler(ITokenTransformationRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateTokenRuleCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure<Guid>("InvalidName", "Rule name is required");

        var rule = new TokenTransformationRule
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            TargetAppId = request.TargetAppId,
            Order = request.Order,
            RuleDefinitionJson = request.RuleDefinitionJson,
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(rule, cancellationToken);

        return Result.Success(rule.Id);
    }
}
