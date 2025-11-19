using System.Text.Json;
using MediatR;
using Onesign.Modules.Extensibility.Application.Commands;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Handlers;

public class CreateWebhookCommandHandler : IRequestHandler<CreateWebhookCommand, Result<Guid>>
{
    private readonly IWebhookSubscriptionRepository _repository;

    public CreateWebhookCommandHandler(IWebhookSubscriptionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateWebhookCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure<Guid>("InvalidName", "Webhook name is required");

        if (string.IsNullOrWhiteSpace(request.EndpointUrl))
            return Result.Failure<Guid>("InvalidEndpointUrl", "Endpoint URL is required");

        var webhook = new WebhookSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            EndpointUrl = request.EndpointUrl,
            Secret = request.Secret,
            EventTypesJson = JsonSerializer.Serialize(request.EventTypes),
            IsEnabled = true,
            MaxRetries = 3,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(webhook, cancellationToken);

        return Result.Success(webhook.Id);
    }
}
