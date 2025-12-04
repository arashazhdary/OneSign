using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetEmailTemplateByTypeQuery : IRequest<EmailTemplateDto?>
{
    public Guid TenantId { get; set; }
    public string Type { get; set; } = string.Empty;
}
