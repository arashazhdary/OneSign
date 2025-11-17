using MediatR;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class RecordUsageEventCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public UsageMetricType MetricType { get; set; }
    public long Amount { get; set; } = 1;
}
