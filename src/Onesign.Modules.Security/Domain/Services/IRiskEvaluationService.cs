using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Services;

public interface IRiskEvaluationService
{
    Task<RiskLevel> EvaluateLoginRiskAsync(
        Guid tenantUserId,
        string deviceId,
        string ipAddress,
        string country,
        CancellationToken cancellationToken = default);

    Task RecordRiskEventAsync(
        Guid? tenantId,
        Guid? tenantUserId,
        RiskEventType eventType,
        RiskLevel riskLevel,
        string ipAddress,
        string country,
        string deviceId,
        string detailsJson,
        CancellationToken cancellationToken = default);
}
