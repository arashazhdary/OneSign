using MediatR;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Commands;

public class DismissInsightCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid InsightId { get; set; }
    public Guid DismissedBy { get; set; }
    public string? Reason { get; set; }
}

public class DismissInsightCommandHandler : IRequestHandler<DismissInsightCommand, Result<bool>>
{
    private readonly IInsightRepository _repository;

    public DismissInsightCommandHandler(IInsightRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DismissInsightCommand request, CancellationToken cancellationToken)
    {
        var insight = await _repository.GetByIdAsync(request.TenantId, request.InsightId, cancellationToken);

        if (insight == null)
            return Result.Failure<bool>("InsightNotFound", "Insight not found");

        if (insight.Status != InsightStatus.Open)
            return Result.Failure<bool>("InsightNotOpen", "Insight is not in open status");

        insight.Status = InsightStatus.Dismissed;
        insight.ResolvedAt = DateTime.UtcNow;
        insight.ResolvedBy = request.DismissedBy;

        await _repository.UpdateAsync(insight, cancellationToken);

        return Result.Success(true);
    }
}
