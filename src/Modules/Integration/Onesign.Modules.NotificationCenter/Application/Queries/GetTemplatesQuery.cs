using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Queries;

public class GetTemplatesQuery : IRequest<Result<List<NotificationTemplateDto>>>
{
    public Guid TenantId { get; set; }
}
