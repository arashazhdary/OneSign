using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetEmailTemplatesQuery : IRequest<List<EmailTemplateDto>>
{
    public Guid TenantId { get; set; }
}
