using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.DTOs;

public class CopilotQueryRequest
{
    public string ScopeType { get; set; } = "Tenant";
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? ConversationId { get; set; }
    public ContextType ContextType { get; set; }
    public Guid? ContextId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Locale { get; set; } = "en";
}
