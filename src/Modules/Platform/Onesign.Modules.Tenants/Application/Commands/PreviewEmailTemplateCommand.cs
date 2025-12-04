using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class PreviewEmailTemplateCommand : IRequest<Result<EmailPreviewDto>>
{
    public Guid TenantId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Dictionary<string, string> Variables { get; set; } = new();
}

public class EmailPreviewDto
{
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
}
