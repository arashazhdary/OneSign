using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class CreateTemplateCommand : IRequest<Result<NotificationTemplateDto>>
{
    public Guid TenantId { get; set; }
    public string TemplateKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Locale { get; set; } = "en";
    public string SubjectTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
}
