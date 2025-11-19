using MediatR;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class DeleteWebhookCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid WebhookId { get; set; }
}

public class DeleteWebhookCommandHandler : IRequestHandler<DeleteWebhookCommand, Result<bool>>
{
    private readonly IWebhookSubscriptionRepository _repository;

    public DeleteWebhookCommandHandler(IWebhookSubscriptionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteWebhookCommand request, CancellationToken cancellationToken)
    {
        var webhook = await _repository.GetByIdAsync(request.WebhookId, cancellationToken);

        if (webhook == null)
            return Result.Failure<bool>("WebhookNotFound", "Webhook subscription not found");

        if (webhook.TenantId != request.TenantId)
            return Result.Failure<bool>("Unauthorized", "Webhook does not belong to this tenant");

        await _repository.DeleteAsync(request.WebhookId, cancellationToken);

        return Result.Success(true);
    }
}
