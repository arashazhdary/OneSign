using MediatR;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Queries;

public class GetTokenRulesQuery : IRequest<Result<List<TokenRuleDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? TargetAppId { get; set; }
}

public class TokenRuleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? TargetAppId { get; set; }
    public int Order { get; set; }
    public string RuleDefinitionJson { get; set; } = "{}";
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetTokenRulesQueryHandler : IRequestHandler<GetTokenRulesQuery, Result<List<TokenRuleDto>>>
{
    private readonly ITokenTransformationRuleRepository _repository;

    public GetTokenRulesQueryHandler(ITokenTransformationRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<TokenRuleDto>>> Handle(GetTokenRulesQuery request, CancellationToken cancellationToken)
    {
        var rules = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (request.TargetAppId.HasValue)
        {
            rules = rules.Where(r => r.TargetAppId == null || r.TargetAppId == request.TargetAppId).ToList();
        }

        var dtos = rules
            .OrderBy(r => r.Order)
            .Select(r => new TokenRuleDto
            {
                Id = r.Id,
                Name = r.Name,
                TargetAppId = r.TargetAppId,
                Order = r.Order,
                RuleDefinitionJson = r.RuleDefinitionJson,
                IsEnabled = r.IsEnabled,
                CreatedAt = r.CreatedAt
            })
            .ToList();

        return Result.Success(dtos);
    }
}
