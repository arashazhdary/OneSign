using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services;

public interface ICopilotContextBuilder
{
    Task<CopilotContextDto> BuildContextAsync(Guid tenantId, ContextType contextType, Guid? contextId, CancellationToken cancellationToken = default);
}
