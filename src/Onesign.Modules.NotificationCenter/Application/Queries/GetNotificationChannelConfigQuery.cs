using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Queries;

public class GetNotificationChannelConfigQuery : IRequest<Result<List<NotificationChannelConfigDto>>>
{
    public Guid TenantId { get; set; }
    public string? Channel { get; set; }
}
