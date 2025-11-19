using MediatR;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class RecordUsageEventCommandHandler : IRequestHandler<RecordUsageEventCommand, Result<bool>>
{
    private readonly IUsageRepository _usageRepository;

    public RecordUsageEventCommandHandler(IUsageRepository usageRepository)
    {
        _usageRepository = usageRepository;
    }

    public async Task<Result<bool>> Handle(RecordUsageEventCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var counter = await _usageRepository.GetCounterAsync(
            request.TenantId,
            request.MetricType,
            now.Year,
            now.Month,
            cancellationToken);

        if (counter == null)
        {
            // Create new counter
            counter = new UsageCounter
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                MetricType = request.MetricType,
                PeriodYear = now.Year,
                PeriodMonth = now.Month,
                Value = request.Amount,
                CreatedAt = now
            };
        }
        else
        {
            // Increment existing counter
            counter.Increment(request.Amount);
        }

        await _usageRepository.UpsertCounterAsync(counter, cancellationToken);

        return Result.Success(true);
    }
}
