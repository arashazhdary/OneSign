using MediatR;
using Onesign.Modules.Authorization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Queries;

public class EvaluatePolicyQueryHandler : IRequestHandler<EvaluatePolicyQuery, Result<PolicyEvaluationResult>>
{
    private readonly IPolicyEvaluationService _evaluationService;

    public EvaluatePolicyQueryHandler(IPolicyEvaluationService evaluationService)
    {
        _evaluationService = evaluationService;
    }

    public async Task<Result<PolicyEvaluationResult>> Handle(EvaluatePolicyQuery request, CancellationToken cancellationToken)
    {
        var result = await _evaluationService.EvaluateAsync(
            request.TenantId,
            request.UserId,
            request.ClientId,
            request.TargetKey,
            request.TargetType,
            request.Context,
            cancellationToken);

        return Result.Success(result);
    }
}
