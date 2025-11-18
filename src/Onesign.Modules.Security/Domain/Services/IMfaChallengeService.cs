using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Services;

public interface IMfaChallengeService
{
    Task<MfaChallenge> CreateChallengeAsync(
        Guid tenantUserId,
        MfaMethodType methodType,
        string deviceId,
        string ipAddress,
        CancellationToken cancellationToken = default);

    Task<bool> ValidateAndConsumeChallengeAsync(
        Guid challengeId,
        string code,
        CancellationToken cancellationToken = default);
}
