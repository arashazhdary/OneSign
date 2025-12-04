using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateEmailTemplateCommand : IRequest<Result<EmailTemplateDto>>
{
    public Guid TenantId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string? HtmlBody { get; set; }
    public bool IsEnabled { get; set; } = true;
}
