using System.Text.Json;
using MediatR;
using Onesign.Modules.Extensibility.Application.DTOs;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class UpdateWebhookCommand : IRequest<Result<WebhookSubscriptionDto>>
{
    public Guid TenantId { get; set; }
    public Guid WebhookId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public List<string> EventTypes { get; set; } = new();
    public bool IsEnabled { get; set; }
    public int MaxRetries { get; set; } = 3;
}

public class UpdateWebhookCommandHandler : IRequestHandler<UpdateWebhookCommand, Result<WebhookSubscriptionDto>>
{
    private readonly IWebhookSubscriptionRepository _repository;

    public UpdateWebhookCommandHandler(IWebhookSubscriptionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<WebhookSubscriptionDto>> Handle(UpdateWebhookCommand request, CancellationToken cancellationToken)
    {
        var webhook = await _repository.GetByIdAsync(request.WebhookId, cancellationToken);

        if (webhook == null)
            return Result.Failure<WebhookSubscriptionDto>("WebhookNotFound", "Webhook subscription not found");

        if (webhook.TenantId != request.TenantId)
            return Result.Failure<WebhookSubscriptionDto>("Unauthorized", "Webhook does not belong to this tenant");

        webhook.Name = request.Name;
        webhook.EndpointUrl = request.EndpointUrl;
        webhook.Secret = request.Secret;
        webhook.EventTypesJson = JsonSerializer.Serialize(request.EventTypes);
        webhook.IsEnabled = request.IsEnabled;
        webhook.MaxRetries = request.MaxRetries;

        await _repository.UpdateAsync(webhook, cancellationToken);

        var dto = new WebhookSubscriptionDto
        {
            Id = webhook.Id,
            Name = webhook.Name,
            EndpointUrl = webhook.EndpointUrl,
            EventTypesJson = webhook.EventTypesJson,
            IsEnabled = webhook.IsEnabled,
            MaxRetries = webhook.MaxRetries,
            CreatedAt = webhook.CreatedAt,
            LastDeliveryAt = webhook.LastDeliveryAt,
            LastDeliveryStatus = webhook.LastDeliveryStatus
        };

        return Result.Success(dto);
    }
}
