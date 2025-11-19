using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class UpdateNotificationTemplateCommand : IRequest<Result<NotificationTemplateDto>>
{
    public Guid TenantId { get; set; }
    public Guid TemplateId { get; set; }
    public string? Name { get; set; }
    public string? SubjectTemplate { get; set; }
    public string? BodyTemplate { get; set; }
    public bool? IsEnabled { get; set; }
}
