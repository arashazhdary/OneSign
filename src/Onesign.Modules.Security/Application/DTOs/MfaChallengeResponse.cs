namespace Onesign.Modules.Security.Application.DTOs;

public class MfaChallengeResponse
{
    public Guid ChallengeId { get; set; }
    public int MethodType { get; set; }
    public string? MaskedDestination { get; set; }
    public DateTime ExpiresAt { get; set; }
}
