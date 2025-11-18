using MediatR;

namespace Onesign.Modules.Security.Application.Commands;

public class VerifyMfaChallengeCommand : IRequest<bool>
{
    public Guid ChallengeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public bool RememberDevice { get; set; }
    public string? DeviceFingerprint { get; set; }
}
