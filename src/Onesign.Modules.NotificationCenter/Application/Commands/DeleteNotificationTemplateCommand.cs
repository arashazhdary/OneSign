using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class DeleteNotificationTemplateCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid TemplateId { get; set; }
}
