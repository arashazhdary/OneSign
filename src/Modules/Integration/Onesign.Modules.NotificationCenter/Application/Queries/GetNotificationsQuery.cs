using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Queries;

public class GetNotificationsQuery : IRequest<Result<List<NotificationDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
}
