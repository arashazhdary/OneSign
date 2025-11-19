using MediatR;
using Onesign.Modules.Extensibility.Application.DTOs;
using Onesign.Modules.Extensibility.Application.Queries;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Handlers;

public class GetWebhooksQueryHandler : IRequestHandler<GetWebhooksQuery, Result<List<WebhookSubscriptionDto>>>
{
    private readonly IWebhookSubscriptionRepository _repository;

    public GetWebhooksQueryHandler(IWebhookSubscriptionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<WebhookSubscriptionDto>>> Handle(GetWebhooksQuery request, CancellationToken cancellationToken)
    {
        var webhooks = request.EnabledOnly
            ? await _repository.GetEnabledByTenantIdAsync(request.TenantId, cancellationToken)
            : await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = webhooks.Select(w => new WebhookSubscriptionDto
        {
            Id = w.Id,
            Name = w.Name,
            EndpointUrl = w.EndpointUrl,
            EventTypesJson = w.EventTypesJson,
            IsEnabled = w.IsEnabled,
            MaxRetries = w.MaxRetries,
            CreatedAt = w.CreatedAt,
            LastDeliveryAt = w.LastDeliveryAt,
            LastDeliveryStatus = w.LastDeliveryStatus
        }).ToList();

        return Result.Success(dtos);
    }
}
