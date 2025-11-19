using MediatR;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Queries;

public class GetWebhookDeliveryLogsQuery : IRequest<Result<List<WebhookDeliveryLogDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public string? Status { get; set; }
    public int Limit { get; set; } = 100;
}

public class WebhookDeliveryLogDto
{
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public int? ResponseStatusCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastAttemptAt { get; set; }
}

public class GetWebhookDeliveryLogsQueryHandler : IRequestHandler<GetWebhookDeliveryLogsQuery, Result<List<WebhookDeliveryLogDto>>>
{
    private readonly IWebhookDeliveryLogRepository _repository;

    public GetWebhookDeliveryLogsQueryHandler(IWebhookDeliveryLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<WebhookDeliveryLogDto>>> Handle(GetWebhookDeliveryLogsQuery request, CancellationToken cancellationToken)
    {
        var logs = await _repository.GetByTenantIdAsync(request.TenantId, request.Limit, cancellationToken);

        if (request.SubscriptionId.HasValue)
        {
            logs = logs.Where(l => l.SubscriptionId == request.SubscriptionId.Value).ToList();
        }

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<Domain.Enums.WebhookDeliveryStatus>(request.Status, true, out var status))
        {
            logs = logs.Where(l => l.Status == status).ToList();
        }

        var dtos = logs
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new WebhookDeliveryLogDto
            {
                Id = l.Id,
                SubscriptionId = l.SubscriptionId,
                EventType = l.EventType,
                Status = l.Status.ToString(),
                AttemptCount = l.AttemptCount,
                ResponseStatusCode = l.ResponseStatusCode,
                ErrorMessage = l.ErrorMessage,
                CreatedAt = l.CreatedAt,
                LastAttemptAt = l.LastAttemptAt
            })
            .ToList();

        return Result.Success(dtos);
    }
}
