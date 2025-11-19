using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Application.Services.ContextHandlers;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services;

public class CopilotContextBuilder : ICopilotContextBuilder
{
    private readonly IEnumerable<IContextHandler> _contextHandlers;
    private readonly ILogger<CopilotContextBuilder> _logger;

    public CopilotContextBuilder(
        IEnumerable<IContextHandler> contextHandlers,
        ILogger<CopilotContextBuilder> logger)
    {
        _contextHandlers = contextHandlers;
        _logger = logger;
    }

    public async Task<CopilotContextDto> BuildContextAsync(Guid tenantId, ContextType contextType, Guid? contextId, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Building context for tenant {TenantId}, type {ContextType}, id {ContextId}", tenantId, contextType, contextId);

        var handler = _contextHandlers.FirstOrDefault(h => h.SupportedContextType == contextType);

        if (handler == null)
        {
            _logger.LogWarning("No context handler found for context type {ContextType}", contextType);
            return new CopilotContextDto
            {
                Type = contextType,
                Data = new Dictionary<string, object?>()
            };
        }

        var data = await handler.GetContextDataAsync(tenantId, contextId, cancellationToken);

        return new CopilotContextDto
        {
            Type = contextType,
            Data = data
        };
    }
}
