using MediatR;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Application.Commands;

public class VerifyMfaChallengeCommandHandler : IRequestHandler<VerifyMfaChallengeCommand, bool>
{
    private readonly IMfaChallengeService _challengeService;
    private readonly IDeviceFingerprintService _deviceService;

    public VerifyMfaChallengeCommandHandler(
        IMfaChallengeService challengeService,
        IDeviceFingerprintService deviceService)
    {
        _challengeService = challengeService;
        _deviceService = deviceService;
    }

    public async Task<bool> Handle(VerifyMfaChallengeCommand request, CancellationToken cancellationToken)
    {
        var isValid = await _challengeService.VerifyChallengeAsync(
            request.ChallengeId,
            request.Code,
            cancellationToken
        );

        if (isValid && request.RememberDevice && !string.IsNullOrEmpty(request.DeviceFingerprint))
        {
            var challenge = await _challengeService.GetChallengeAsync(request.ChallengeId, cancellationToken);
            if (challenge != null)
            {
                await _deviceService.MarkAsTrustedAsync(
                    challenge.UserId,
                    challenge.TenantId,
                    request.DeviceFingerprint,
                    cancellationToken
                );
            }
        }

        return isValid;
    }
}
