namespace Onesign.Modules.Security.Application.DTOs;

public class VerifyMfaRequest
{
    public Guid ChallengeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public bool RememberDevice { get; set; }
    public string? DeviceFingerprint { get; set; }
}
