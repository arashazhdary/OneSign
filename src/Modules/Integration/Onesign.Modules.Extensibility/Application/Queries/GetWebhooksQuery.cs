using MediatR;
using Onesign.Modules.Extensibility.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Queries;

public class GetWebhooksQuery : IRequest<Result<List<WebhookSubscriptionDto>>>
{
    public Guid TenantId { get; set; }
    public bool EnabledOnly { get; set; } = false;
}
