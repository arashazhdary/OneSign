using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Queries;

public class GetNotificationTemplateDetailsQuery : IRequest<Result<NotificationTemplateDto>>
{
    public Guid TenantId { get; set; }
    public Guid TemplateId { get; set; }
}
